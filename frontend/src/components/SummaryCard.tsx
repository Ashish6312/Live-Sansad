'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Share2, ThumbsUp, ThumbsDown, MoreHorizontal, 
  Calendar, Activity, TrendingUp, Sparkles, Send, ChevronDown, ChevronUp 
} from 'lucide-react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface SummaryCardProps {
  summary: {
    id: string;
    title: string;
    content: string;
    conclusion?: string;
    options: string[];
    created_at: string;
  };
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  const { data: session } = useSession();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [consensusResult, setConsensusResult] = useState<string | null>(null);
  const [consensusLoading, setConsensusLoading] = useState(false);
  const [userVoteType, setUserVoteType] = useState<'up' | 'down' | null>(null);
  const [localUpvotes, setLocalUpvotes] = useState(0);
  const [localDownvotes, setLocalDownvotes] = useState(0);

  useEffect(() => {
    fetchVotes();
    fetchComments();

    // Make the room update in real-time
    const interval = setInterval(() => {
      fetchVotes();
      fetchComments();
    }, 5000);

    return () => clearInterval(interval);
  }, [summary.id]);

  const fetchVotes = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/votes/${summary.id}`);
      setVotes(res.data);
    } catch (err) { /* silent */ }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/comments/${summary.id}`);
      setComments(res.data);
    } catch (err) { /* silent */ }
  };

  const fetchConsensus = async () => {
    setConsensusLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/analyze-consensus/${summary.id}`);
      setConsensusResult(res.data.result);
    } catch (err) { console.error(err); }
    setConsensusLoading(false);
  };

  const handleVote = async (index: number) => {
    const userId = (session?.user as any)?.id || session?.user?.email || `guest-${Math.random().toString(36).substring(7)}`;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/vote`, {
        summary_id: summary.id,
        option_index: index,
        user_id: userId
      });
      setSelectedOption(index);
      await fetchVotes();
    } catch (err) { console.error("Vote error:", err); }
  };

  const handleUpDown = (type: 'up' | 'down') => {
    if (userVoteType === type) return; // already voted this way
    if (type === 'up') {
      setLocalUpvotes(prev => prev + 1);
      if (userVoteType === 'down') setLocalDownvotes(prev => Math.max(0, prev - 1));
    } else {
      setLocalDownvotes(prev => prev + 1);
      if (userVoteType === 'up') setLocalUpvotes(prev => Math.max(0, prev - 1));
    }
    setUserVoteType(type);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const userName = session?.user?.name || 'Anonymous';
    const userId = (session?.user as any)?.id || session?.user?.email || 'anon';
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/comment`, {
        summary_id: summary.id,
        user_id: userId,
        user_name: userName,
        text: commentText
      });
      setCommentText('');
      await fetchComments();
    } catch (err) { console.error(err); }
  };

  const totalVotesCount = Object.values(votes).reduce((a, b) => a + b, 0);
  const leadingOptionIndex = Object.entries(votes).length > 0 
    ? parseInt(Object.entries(votes).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0])
    : null;

  return (
    <div className="glass rounded-[2rem] overflow-hidden mb-10 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] transition-all hover:border-primary/30 hover:shadow-[0_0_60px_rgba(255,215,0,0.08)] bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
      <div className="p-6 md:p-8">
        {/* ── HEADER ── */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-black mb-1 block">
              Summarization
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold leading-tight">{summary.title}</h2>
            <div className="flex items-center gap-2 mt-2 text-white/40 text-xs font-bold">
              <Calendar className="w-3 h-3 text-primary" />
              {new Date(summary.created_at).toLocaleString()}
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* ── CORE SUMMARY ── */}
        <div className="mb-6">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <Activity className="w-3 h-3 text-primary" /> Core Summary
          </h3>
          <p className="text-white/80 leading-relaxed text-sm md:text-base bg-white/5 p-5 rounded-2xl border border-white/5 italic">
            &ldquo;{summary.content}&rdquo;
          </p>
        </div>

        {/* ── CONCLUSION ── */}
        {summary.conclusion && (
          <div className="mb-8">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Conclusion
            </h3>
            <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
              <p className="text-white/90 text-sm font-semibold leading-relaxed relative z-10">
                {summary.conclusion}
              </p>
            </div>
          </div>
        )}

        {/* ── UP / DOWN VOTE ── */}
        <div className="flex items-center gap-4 mb-8 bg-white/5 rounded-2xl p-4 border border-white/5">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">Rate this insight</span>
          <div className="flex items-center gap-3 ml-auto">
            <button 
              onClick={() => handleUpDown('up')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all active:scale-90 ${
                userVoteType === 'up' 
                  ? 'bg-green-500/20 border-green-500/40 text-green-400' 
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-green-400 hover:border-green-500/30'
              }`}
            >
              <ChevronUp className="w-4 h-4" />
              <span className="text-xs font-black">{localUpvotes}</span>
            </button>
            <button 
              onClick={() => handleUpDown('down')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all active:scale-90 ${
                userVoteType === 'down' 
                  ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/30'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
              <span className="text-xs font-black">{localDownvotes}</span>
            </button>
          </div>
        </div>

        {/* ── POLL SECTION ── */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30">Public Consensus Poll</h3>
            {totalVotesCount > 0 && (
              <span className="text-[10px] text-primary font-black">{totalVotesCount} voted</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.options.map((option, idx) => {
              const voteCount = votes[idx] || 0;
              const percentage = totalVotesCount > 0 ? (voteCount / totalVotesCount) * 100 : 0;
              const isLeading = leadingOptionIndex === idx && totalVotesCount > 0;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleVote(idx)}
                  className={`w-full relative h-14 rounded-2xl overflow-hidden group transition-all active:scale-[0.97] border ${
                    selectedOption === idx 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                      : isLeading 
                        ? 'border-primary/30 bg-primary/5' 
                        : 'bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <div 
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out ${isLeading ? 'bg-primary/25' : 'bg-white/10'}`}
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex justify-between items-center px-4 h-full">
                    <span className={`text-xs font-bold ${selectedOption === idx ? 'text-primary' : isLeading ? 'text-primary/80' : 'text-white/80'}`}>
                      {option}
                    </span>
                    {totalVotesCount > 0 && (
                      <span className={`text-[10px] font-black ${isLeading ? 'text-primary' : 'text-white/60'}`}>
                        {Math.round(percentage)}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PROPER RESULT (AI Consensus Analysis) ── */}
        <div className="mb-8 p-5 rounded-3xl border border-dashed border-white/10 relative overflow-hidden group bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                Proper Result <Activity className="w-2 h-2 text-primary animate-pulse" />
              </h4>
              {consensusResult ? (
                <p className="text-sm text-white/90 leading-relaxed font-semibold">{consensusResult}</p>
              ) : (
                <div>
                  <p className="text-xs text-white/40 mb-3">
                    Vote on the poll above and leave comments below. The AI will analyze all votes and comments to produce a <span className="text-primary font-bold">Proper Result</span>.
                  </p>
                  <button 
                    onClick={fetchConsensus}
                    disabled={consensusLoading}
                    className="text-[10px] text-black bg-primary hover:bg-primary/90 font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {consensusLoading ? (
                      <><Activity className="w-3 h-3 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="w-3 h-3" /> Generate Proper Result</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ACTION BAR ── */}
        <div className="flex items-center gap-6 border-t border-white/5 pt-6">
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">
              {comments.length > 0 ? `${comments.length} ` : ''}Comments
            </span>
          </button>
          <button 
            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Share</span>
          </button>
        </div>

        {/* ── COMMENTS SECTION ── */}
        {showComments && (
          <div className="mt-6 space-y-4 border-t border-white/5 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Comment Input */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Share your opinion on this insight..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-white/20 transition-colors"
              />
              <button 
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="bg-primary hover:bg-primary/90 text-black px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-3 h-3" /> Post
              </button>
            </div>

            {/* Comment List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((c, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 relative group hover:border-white/10 transition-colors">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <ThumbsUp className="w-3.5 h-3.5 text-white/20 hover:text-green-400 cursor-pointer transition-colors" />
                    <ThumbsDown className="w-3.5 h-3.5 text-white/20 hover:text-red-400 cursor-pointer transition-colors" />
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{c.user_name}</span>
                    <span className="text-[9px] text-white/20 font-bold">
                      {new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{c.text}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-white/20 text-xs font-bold py-8 uppercase tracking-widest">
                  No comments yet. Be the first to share your opinion!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
