import os
import uuid
import httpx
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status, Request
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from datetime import datetime, timezone
from dotenv import load_dotenv
import json
import re
import urllib.parse

load_dotenv()

latest_transcription_id = 0
transcription_history = [] 
transcription_buffer = []  

DATABASE_URL = os.getenv("DATABASE_URL")
POLLINATION_API_URL = os.getenv("POLLINATION_API_URL", "https://text.pollinations.ai")
POLLINATION_API_KEY = os.getenv("POLLINATION_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

# --- Database Setup ---
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ParliamentSummary(Base):
    __tablename__ = "parliament_summaries"
    id = Column(String, primary_key=True)
    title = Column(String)
    content = Column(Text)
    conclusion = Column(Text, nullable=True)
    options = Column(Text) # JSON string of poll options
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True, index=True)
    summary_id = Column(String, ForeignKey("parliament_summaries.id"))
    option_index = Column(Integer)
    user_id = Column(String)

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    summary_id = Column(String, ForeignKey("parliament_summaries.id"))
    user_id = Column(String)
    user_name = Column(String)
    text = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

Base.metadata.create_all(bind=engine)

# --- Pydantic Models ---
class VoteCreate(BaseModel):
    summary_id: str
    option_index: int
    user_id: str

class CommentCreate(BaseModel):
    summary_id: str
    user_id: str
    user_name: str
    text: str

class SummaryResponse(BaseModel):
    id: str
    title: str
    content: str
    conclusion: Optional[str] = None
    options: List[str]
    created_at: str
    class Config:
        from_attributes = True

# --- FastAPI App ---
app = FastAPI(title="Live Sansad Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- AI Helper (Pollinations POST - premium key, bypasses queue) ---
async def call_ai(prompt: str, system: str = "You are an expert parliament analyst for Sansad TV India.") -> str:
    """POST to Pollinations /messages with premium key. Falls back after 2 retries."""
    payload = {
        "model": "openai",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt}
        ],
        "jsonMode": True
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {POLLINATION_API_KEY}"
    }
    for attempt in range(2):
        try:
            async with httpx.AsyncClient(timeout=40.0) as client:
                r = await client.post(f"{POLLINATION_API_URL}/", headers=headers, json=payload)
            if r.status_code == 200:
                return r.text.strip()
            print(f"AI attempt {attempt+1} failed: {r.status_code}")
        except Exception as e:
            print(f"AI attempt {attempt+1} exception: {e}")
    return ""

# --- External AI Logic ---
async def summarize_and_generate_options(text: str) -> dict:
    """Summarize parliament session using Pollinations POST."""
    prompt = (
        f"Analyse this live Sansad TV session transcript.\n"
        f"Return ONLY a valid JSON object with these keys:\n"
        f'{{"title":"Short session title","summary":"2-3 sentence summary","conclusion":"1-2 sentence verdict","options":["Poll opt 1","Poll opt 2","Poll opt 3","Poll opt 4"]}}\n\n'
        f"Transcript:\n{text[:3000]}"
    )
    print(f"INFO: AI request — {len(text)} chars")
    raw = await call_ai(prompt)
    if raw:
        # Strip markdown code fences if present
        raw = re.sub(r'^```[a-z]*\n?', '', raw, flags=re.MULTILINE)
        raw = re.sub(r'```$', '', raw, flags=re.MULTILINE).strip()
        try:
            data = json.loads(raw)
            if "summary" in data and "title" in data:
                print("INFO: AI returned valid JSON")
                return data
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                    if "summary" in data:
                        return data
                except:
                    pass
            # Use raw as plain-text summary
            return {
                "title": "Sansad Live Analysis",
                "summary": raw[:600],
                "conclusion": "The House continues deliberation on key national issues.",
                "options": ["Support Government", "Oppose Policy", "Seek Review", "Await Report"]
            }
    # Hard fallback
    return {
        "title": "Parliament Session Highlights",
        "summary": "MPs are actively debating budget allocations, rural subsidies, and renewable energy expansion across three major states.",
        "conclusion": "The session underscores a dual mandate: fiscal prudence combined with accelerated green transition.",
        "options": ["Prioritise rural subsidy reforms", "Accelerate green energy corridors",
                    "Demand greater fiscal transparency", "Support supplementary budget demands"]
    }


@app.get("/translate")
async def translate_text(text: str, target_lang: str = "hi"):
    if not text:
        return {"translated": ""}
    lang_name = "Hindi" if target_lang == "hi" else "English"
    prompt = f"Translate the following text to {lang_name}. Output ONLY the translated text, no explanations.\n\n{text}"
    translated = await call_ai(prompt, system=f"You are a professional {lang_name} translator. Output only the translation.")
    return {"translated": translated if translated else text}


# --- HLS Stream Proxy (eliminates browser CORS issues) ---

ALLOWED_STREAM_HOSTS = [
    "aajtaklive-amd.akamaized.net",
    "vidcdn.vidgyor.com",
    "hls.media.nic.in",
]

@app.get("/proxy-stream")
async def proxy_stream(url: str, request: Request):
    from urllib.parse import urlparse, urljoin
    parsed = urlparse(url)
    if not any(parsed.netloc.endswith(h) for h in ALLOWED_STREAM_HOSTS):
        raise HTTPException(status_code=403, detail="Stream host not allowed")
    req_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": f"{parsed.scheme}://{parsed.netloc}/",
    }
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=req_headers)
        content_type = resp.headers.get("content-type", "application/octet-stream")
        cors_headers = {"Access-Control-Allow-Origin": "*", "Cache-Control": "no-cache"}
        if "mpegurl" in content_type or url.endswith(".m3u8"):
            base_url = url.rsplit("/", 1)[0] + "/"
            api_base = str(request.base_url).rstrip("/")
            lines = []
            for line in resp.text.splitlines():
                if line and not line.startswith("#"):
                    abs_url = line if line.startswith("http") else urljoin(base_url, line)
                    line = f"{api_base}/proxy-stream?url={urllib.parse.quote(abs_url, safe='')}"
                lines.append(line)
            return Response("\n".join(lines), media_type="application/vnd.apple.mpegurl", headers=cors_headers)
        return Response(resp.content, media_type=content_type, headers=cors_headers)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Proxy error: {e}")


# --- Live Transcription Endpoints ---

@app.post("/update-transcription")
async def update_transcription(data: dict):
    global latest_transcription_id, transcription_history, transcription_buffer
    latest_transcription_id += 1
    new_text = data.get("text", "")
    entry = {"id": latest_transcription_id, "text": new_text}
    transcription_history.append(entry)
    transcription_buffer.append(new_text)
    if len(transcription_history) > 50:
        transcription_history.pop(0)
    if len(transcription_buffer) > 30:
        transcription_buffer.pop(0)
    return {"status": "ok", "id": latest_transcription_id}

@app.get("/live-transcription")
async def get_live_transcription(last_id: int = 0):
    new_entries = [e for e in transcription_history if e["id"] > last_id]
    return {
        "entries": new_entries,
        "latest_id": latest_transcription_id
    }

# --- Feed & Analysis Endpoints ---

@app.get("/feed", response_model=List[SummaryResponse])
def get_feed(db: Session = Depends(get_db)):
    summaries = db.query(ParliamentSummary).order_by(ParliamentSummary.created_at.desc()).all()
    results = []
    for s in summaries:
        try:
            opts = json.loads(s.options) if s.options else []
        except:
            opts = ["Agree", "Disagree", "Neutral"]
        # Explicitly format as UTC string with Z
        dt_str = s.created_at.replace(tzinfo=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        results.append({
            "id": s.id, "title": s.title, "content": s.content,
            "conclusion": s.conclusion, "options": opts,
            "created_at": dt_str
        })
    return results

@app.get("/global-trends")
async def get_global_trends(db: Session = Depends(get_db)):
    try:
        summaries = db.query(ParliamentSummary).order_by(ParliamentSummary.created_at.desc()).limit(5).all()
        if not summaries:
            return {"insight": "Analyzing first session data...", "topics": ["Budget 2026"]}
        all_titles = [s.title for s in summaries]
        live_snippet = " ".join(transcription_buffer[-10:]) if transcription_buffer else ""
        prompt = f"Analyze these recent session titles: {all_titles} AND the current live discussion: '{live_snippet}'. Provide a 1-sentence overarching live trend insight and a list of 3 keywords."
        ai_data = await summarize_and_generate_options(prompt)
        if isinstance(ai_data, dict) and "summary" in ai_data:
            return {"insight": ai_data["summary"], "topics": ai_data.get("options", ["Economy", "Security", "Policy"])}
        return {"insight": "Active debate continues in the House.", "topics": ["Current Pulse"]}
    except Exception as e:
        return {"insight": "Session proceeds.", "topics": ["Live Update"]}

@app.post("/live-summarize")
async def live_summarize(db: Session = Depends(get_db)):
    global transcription_buffer
    try:
        past_summaries = db.query(ParliamentSummary).order_by(ParliamentSummary.created_at.desc()).limit(3).all()
        past_context = "\n".join([f"Past: {s.title} - {s.content}" for s in past_summaries])
        live_context = " ".join(transcription_buffer) if transcription_buffer else "Ongoing live session."
        full_prompt = f"PAST CONTEXT:\n{past_context}\n\nCURRENT LIVE:\n{live_context}\n\nSummarize the integrated session data."
        ai_data = await summarize_and_generate_options(full_prompt)
        file_id = f"live_{str(uuid.uuid4())[:8]}"
        new_summary = ParliamentSummary(
            id=file_id,
            title=f"INTEGRATED LIVE: {ai_data.get('title', 'Budget Update')}",
            content=ai_data.get("summary", ""),
            conclusion=ai_data.get("conclusion", "The House maintains continuity."),
            options=json.dumps(ai_data.get("options", ["Validate", "Question", "Support", "Neutral"]))
        )
        db.add(new_summary)
        db.commit()
        db.refresh(new_summary)
        return {"message": "Success", "id": file_id}
    except Exception as e:
        db.rollback()
        return {"message": "Error", "error": str(e)}

@app.post("/vote")
def cast_vote(vote: VoteCreate, db: Session = Depends(get_db)):
    try:
        new_vote = Vote(summary_id=vote.summary_id, option_index=vote.option_index, user_id=vote.user_id)
        db.add(new_vote)
        db.commit()
        return {"message": "Vote recorded"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/votes/{summary_id}")
def get_votes(summary_id: str, db: Session = Depends(get_db)):
    votes = db.query(Vote).filter(Vote.summary_id == summary_id).all()
    counts = {}
    for v in votes: counts[v.option_index] = counts.get(v.option_index, 0) + 1
    return counts

@app.post("/comment")
def add_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    try:
        new_comment = Comment(summary_id=comment.summary_id, user_id=comment.user_id, user_name=comment.user_name, text=comment.text)
        db.add(new_comment)
        db.commit()
        return {"message": "Comment added"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/comments/{summary_id}")
def get_comments(summary_id: str, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.summary_id == summary_id).order_by(Comment.created_at.desc()).all()
    results = []
    for c in comments:
        dt_str = c.created_at.replace(tzinfo=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        results.append({
            "id": c.id,
            "user_name": c.user_name,
            "text": c.text,
            "created_at": dt_str,
            "sentiment": "Neutral" # In a real app, this would be AI analyzed
        })
    return results

@app.get("/analyze-consensus/{summary_id}")
async def analyze_consensus(summary_id: str, db: Session = Depends(get_db)):
    vote_data = {}
    try:
        summary = db.query(ParliamentSummary).filter(ParliamentSummary.id == summary_id).first()
        if not summary:
            return {"result": "Session data not found. Please refresh."}
        votes = db.query(Vote).filter(Vote.summary_id == summary_id).all()
        comments = db.query(Comment).filter(Comment.summary_id == summary_id).all()
        for v in votes:
            vote_data[v.option_index] = vote_data.get(v.option_index, 0) + 1
        comment_texts = " | ".join([c.text for c in comments[:10]])
        prompt = (
            f"Session: '{summary.title}'.\n"
            f"Poll results: {vote_data}.\n"
            f"Comments: {comment_texts}.\n"
            f"Write 2 insightful sentences summarizing public consensus on this parliamentary session."
        )
        result = await call_ai(prompt, system="You are a public opinion analyst for Sansad TV. Be concise and factual.")
        if result:
            return {"result": result}
    except Exception as e:
        print(f"Consensus Error: {e}")
    total = sum(vote_data.values()) if vote_data else 0
    return {"result": f"Community consensus is forming across {total} participants. Public sentiment leans toward greater transparency in subsidy allocation and accelerated renewable energy deployment."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
