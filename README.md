# Live Sansad | Opinion Summarization Tool

A premium web application to summarize live parliament sessions and engage users through polls and discussions.

## Tech Stack
- **Frontend**: Next.js 14+, Tailwind CSS, Framer Motion, Axios, NextAuth (Google OAuth).
- **Backend**: FastAPI (Python), SQLAlchemy, Pollination AI (Summarization), httpx.
- **AI Integration**: Pollination AI for text summarization and poll option generation.

## Features
- **Video/Audio Summarization**: Upload parliament feeds to get AI-powered summaries.
- **Interactive Polls**: View automated opinion choices and vote live.
- **Opinion Threads**: Comment and share your thoughts on each summary.
- **Google OAuth**: Secure sign-in for voting and commenting.
- **Responsive Design**: Optimized for mobile, tablet, and desktop.

## Setup Instructions

### Backend (FastAPI)
1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your environment variables in `.env` (Google Client ID/Secret).
4. Run the server:
   ```bash
   python main.py
   ```

### Frontend (Next.js)
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in `.env.local` (Google Client ID/Secret, NextAuth Secret).
4. Run the development server:
   ```bash
   npm run dev
   ```

## Workflow
1. **Upload**: User uploads a video/audio of a parliament session.
2. **Process**: Backend converts speech to text and sends it to Pollination AI.
3. **Summarize**: AI returns a title, a concise summary, and 4 vote-ready options.
4. **Engage**: Users vote on the options and discuss in the comment section.
