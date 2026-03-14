'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SummaryCard from '@/components/SummaryCard';
import UploadZone from '@/components/UploadZone';
import LivePlayer from '@/components/LivePlayer';
import axios from 'axios';
import { Loader2, TrendingUp, Users, Activity } from 'lucide-react';

export default function Home() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [globalInsight, setGlobalInsight] = useState<string>('');
  const [activeChannel, setActiveChannel] = useState(0);

  const API = process.env.NEXT_PUBLIC_API_URL;
  const channels = [
    { title: 'Aaj Tak', category: 'News', thumbnail: '/img/aajtak.png', url: `${API}/proxy-stream?url=${encodeURIComponent('https://aajtaklive-amd.akamaized.net/hls/live/2014416/aajtak/aajtaklive/live_720p/chunks.m3u8')}` },
    { title: 'News 24', category: 'News', thumbnail: '/img/news24.png', url: `${API}/proxy-stream?url=${encodeURIComponent('https://vidcdn.vidgyor.com/news24-origin/liveabr/playlist.m3u8')}` },
    { title: 'Sansad TV', category: 'Parliament', thumbnail: '/img/sansadtv.png', url: `${API}/proxy-stream?url=${encodeURIComponent('https://hls.media.nic.in/live/rstv-360p/index.m3u8')}` },
  ];


  const fetchFeed = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/feed`);
      setSummaries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/global-trends`);
      setTrendingTopics(res.data.topics || []);
      setGlobalInsight(res.data.insight || '');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchTrends();
    const feedInterval = setInterval(fetchFeed, 10000);
    const trendInterval = setInterval(fetchTrends, 20000);
    return () => {
      clearInterval(feedInterval);
      clearInterval(trendInterval);
    };
  }, []);

  return (
    <main className="pt-24 pb-12 px-4 md:px-0 scroll-smooth">
      <Navbar />
      
      <div className="max-w-5xl mx-auto">
        {/* HERO + LIVE PLAYER - Always visible at top */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Unlocking <span className="gradient-text text-glow">Sansad</span> <br />
            Opinions with AI
          </h1>
          <p className="text-white/50 text-lg max-w-xl mb-8">
            Summarizing live parliament sessions into actionable insights and public opinion polls using Pollination AI.
          </p>

          {/* CHANNEL SWITCHER */}
          <div className="flex gap-3 mb-4">
            {channels.map((ch, i) => (
              <button
                key={i}
                onClick={() => setActiveChannel(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all active:scale-95 ${
                  activeChannel === i
                    ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <img src={ch.thumbnail} alt={ch.title} className="w-5 h-5 rounded-full object-cover" />
                {ch.title}
              </button>
            ))}
          </div>

          {/* LIVE PLAYER - Full width, always visible */}
          <LivePlayer 
            key={activeChannel}
            title={channels[activeChannel].title}
            category={channels[activeChannel].category}
            thumbnail={channels[activeChannel].thumbnail}
            url={channels[activeChannel].url}
          />
        </div>

        {/* TWO COLUMN: Feed + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          {/* Left Column: Main Feed */}
          <div id="insights-feed" className="lg:col-span-8 min-h-[600px]">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
              <UploadZone onSuccess={fetchFeed} />
            </div>

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              <div className="flex flex-col gap-4 mb-8 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/20 rounded border border-primary/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                      <span className="text-[8px] font-bold text-primary uppercase">Live Scanner Active</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="text-primary w-5 h-5 animate-pulse" />
                  <h2 className="text-xl font-bold">Trending Intelligence</h2>
                  <span className="ml-auto text-[8px] bg-white/10 px-2 py-0.5 rounded border border-white/20 text-white/40 uppercase font-black tracking-tighter">Multilingual Sync</span>
                </div>
                <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest -mt-2">Supports English & Hindi source text. Use toggles below to translate analysis.</p>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mt-2">
                  <p className="text-sm text-white/90 italic leading-relaxed font-medium">
                    {globalInsight || "AI is scanning live parliamentary data for overarching trends..."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {trendingTopics.length > 0 ? trendingTopics.map((topic, i) => (
                    <span key={i} className="text-[10px] px-3 py-1.5 bg-primary/10 text-primary rounded-full font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all cursor-default">
                      #{topic.replace('#', '')}
                    </span>
                  )) : (
                    <span className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">Aggregating live metadata...</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <TrendingUp className="text-accent w-5 h-5" />
                    <h2 className="text-xl font-bold uppercase tracking-tight">Recent Live Insights</h2>
                 </div>
                 {loading && <Loader2 className="w-4 h-4 text-white/20 animate-spin" />}
              </div>

              <div className="space-y-8 min-h-[400px] relative">
                <div className="absolute -inset-4 bg-primary/5 blur-3xl -z-10 rounded-[100px]" />
                {summaries.length > 0 ? (
                  summaries.map((summary, idx) => (
                    <div key={summary.id} className="animate-in fade-in slide-in-from-bottom-10 duration-1000 z-10 relative" style={{ animationDelay: `${idx * 150}ms` }}>
                      <SummaryCard summary={summary} />
                    </div>
                  ))
                ) : !loading ? (
                  <div className="glass rounded-3xl p-12 text-center border-dashed border-white/10">
                    <p className="text-white/30 italic">No sessions summarized yet. Upload a video or run live analysis to start.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right Column: Stats Sidebar */}
          <div className="lg:col-span-4 space-y-6 hidden lg:block">
            <div className="glass rounded-3xl p-6 border border-white/10 sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="text-accent w-4 h-4" />
                Impact Analytics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/40 text-xs">Total Participations</p>
                    <p className="text-2xl font-bold">84.2K</p>
                  </div>
                  <Users className="text-white/20 w-8 h-8" />
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[70%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

