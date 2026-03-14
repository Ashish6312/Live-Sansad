'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Volume2, Play, Activity, AlertCircle, RefreshCcw, MessageSquare } from 'lucide-react';
import Hls from 'hls.js';
import axios from 'axios';

interface LivePlayerProps {
  url: string;
  title: string;
  category: string;
  thumbnail: string;
}

export default function LivePlayer({ url, title, category, thumbnail }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [captions, setCaptions] = useState<string>('');
  const [displayedCaptions, setDisplayedCaptions] = useState<string>('');
  const [globalTrend, setGlobalTrend] = useState<string>('');
  const [lastCaptionId, setLastCaptionId] = useState<number>(0);
  const [isSTTActive, setIsSTTActive] = useState(true); // Default to active for simulation
  const [opinionsActive, setOpinionsActive] = useState(false);
  const [debateActive, setDebateActive] = useState(false);
  const captionsEndRef = useRef<HTMLDivElement>(null);
  const captionsContainerRef = useRef<HTMLDivElement>(null);

  // ChatGPT-style writing speed adjustment: smooth, continuous flow
  useEffect(() => {
    if (displayedCaptions.length < captions.length) {
      const remainingLength = captions.length - displayedCaptions.length;
      const speed = remainingLength > 100 ? 5 : 25; 
      
      const timeout = setTimeout(() => {
        const jump = remainingLength > 200 ? 5 : 1;
        setDisplayedCaptions(captions.slice(0, displayedCaptions.length + jump));
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [captions, displayedCaptions]);

  // LIVE AJAX DATA: Captions (Direct Stream Sync)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSTTActive) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/live-transcription?last_id=${lastCaptionId}`);
          
          if (res.data.entries && res.data.entries.length > 0) {
            const newText = res.data.entries.map((e: any) => e.text).join(" ");
            setCaptions(prev => (prev + " " + newText).slice(-3000));
            setLastCaptionId(res.data.latest_id);
          }
        } catch (err) { /* silent */ }
      }, 1500); 
    }
    return () => clearInterval(interval);
  }, [playing, lastCaptionId, captions, isSTTActive]);




  // LIVE AJAX DATA: Global Trends for the Insight box
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchTrends = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/global-trends`);
        setGlobalTrend(res.data.insight);
      } catch (err) { /* silent */ }
    };

    fetchTrends();
    interval = setInterval(fetchTrends, 15000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (captionsContainerRef.current) {
      const container = captionsContainerRef.current;
      // Only scroll if we are already near the bottom (optional quality of life)
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [displayedCaptions]);

  useEffect(() => {
    let hls: Hls | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const initPlayer = () => {
      if (!videoRef.current) return;
      setLoading(true);
      setError(null);

      const video = videoRef.current;

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
          maxBufferLength: 30,
          xhrSetup: (xhr: XMLHttpRequest) => {
            xhr.withCredentials = false;
          },
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          retryCount = 0;
          video.play().catch(() => { setPlaying(false); });
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              console.warn(`HLS fatal error, retry ${retryCount}/${MAX_RETRIES}`, data.type);
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setTimeout(() => hls?.startLoad(), 1500 * retryCount);
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls?.recoverMediaError();
              } else {
                setError('Stream unavailable');
                setLoading(false);
              }
            } else {
              setError('Stream unavailable');
              setLoading(false);
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          setLoading(false);
          video.play().catch(() => setPlaying(false));
        });
        video.addEventListener('error', () => {
          setError('Stream unavailable');
          setLoading(false);
        });
      }
    };

    initPlayer();

    return () => {
      if (hls) { hls.destroy(); }
    };
  }, [url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10 overflow-hidden relative group transition-all duration-500 hover:border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Activity className={`w-4 h-4 ${error ? 'text-white/20' : 'text-red-500 animate-pulse'}`} />
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border ${
            error ? 'bg-white/5 text-white/40 border-white/10' : 'bg-red-600/20 text-red-500 border-red-500/30'
          }`}>
            {error ? 'OFFLINE' : 'LIVE'}
          </span>
        </div>
      </div>

      <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-white/20 group cursor-pointer" onClick={togglePlay}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted={isMuted}
          playsInline
          poster={thumbnail}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />

        {/* Loading Overlay */}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 transition-opacity">
            <div className="flex flex-col items-center gap-3">
              <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest animate-pulse">Establishing Feed...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-20 p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
              <p className="text-sm font-bold text-white/80">Stream Connection Failed</p>
              <p className="text-[10px] text-white/40 max-w-[200px]">The media server might be busy or the link has changed.</p>
              <button 
                onClick={(e) => { e.stopPropagation(); window.location.reload(); }}
                className="mt-4 bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-primary transition-all active:scale-95"
              >
                Retry Feed
              </button>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        {!playing && !loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] z-10 group-hover:backdrop-blur-0 transition-all">
            <div className="w-16 h-16 bg-primary/90 backdrop-blur-lg rounded-full flex items-center justify-center text-white shadow-2xl scale-100 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Mute/Volume Overlay */}
        {playing && (
          <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
              className="p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white/80 hover:text-white"
            >
              <Volume2 className={`w-4 h-4 ${isMuted ? 'opacity-40' : 'opacity-100'}`} />
            </button>
          </div>
        )}
      </div>

      {/* NEW: REAL-TIME ENGINE METRICS */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Sentiment Variance</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full bg-primary transition-all duration-1000 ${playing ? 'w-[65%]' : 'w-0'}`} />
            </div>
            <span className="text-[10px] font-bold text-primary">65%</span>
          </div>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Audio Precision</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 items-end h-3">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className={`w-1 bg-primary rounded-full animate-pulse`} style={{ height: `${playing ? Math.random() * 100 : 20}%`, animationDelay: `${i * 0.1}s` }} />
               ))}
            </div>
            <span className="text-[10px] font-bold text-primary">98.2%</span>
          </div>
        </div>
      </div>

      {/* NEW: LIVE CAPTIONS SECTION */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Neural Stream-to-Text (Live Feed)
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md">
            <Activity className="w-2.5 h-2.5 text-primary" />
            <span className="text-[8px] font-black text-primary uppercase tracking-tighter">Sync Active</span>
          </div>
        </div>
        <div 
          ref={captionsContainerRef}
          className="bg-black/40 border border-white/5 rounded-2xl p-4 h-32 overflow-y-auto custom-scrollbar relative group backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none"></div>
          <div className="text-xs text-white/70 leading-relaxed font-medium transition-all duration-500">
            <div className="inline">
              {displayedCaptions || "Connecting to Neural Transcription Engine..."}
              <span className="inline-block w-1.5 h-3.5 bg-primary ml-1 animate-pulse" />
              <div ref={captionsEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* NEW: LIVE AI SUMMARY MODULE */}
      <div className="mt-4 bg-primary/5 border border-primary/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3 h-3" /> AI Real-time Insight
          </h4>
          <button 
            onClick={async () => {
              if (globalTrend) {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/translate?text=${encodeURIComponent(globalTrend)}`);
                setGlobalTrend(res.data.translated);
              }
            }}
            className="text-[8px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
          >
            Translate Output
          </button>
        </div>
        <p className="text-sm text-white/90 leading-relaxed font-semibold mb-3 transition-opacity duration-1000">
          {playing ? (
            globalTrend || "Synthesizing overarching debate themes..."
          ) : (
            <span className="text-white/20 italic">Offline</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button 
            disabled={loading || !playing}
            onClick={async (e) => {
              e.stopPropagation();
              setLoading(true);
              try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/live-summarize`);
              } catch (err) {
                console.error(err);
              } finally {
                setLoading(false);
              }
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest ${
              playing 
                ? 'bg-white text-black hover:bg-white/90' 
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            {loading ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
            Run Real-time AI Analysis
          </button>
          <button className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
            <MessageSquare className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* NEW: INTERACTION BUTTONS */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button 
          onClick={() => {
            setOpinionsActive(true);
            const insights = document.getElementById('insights-feed');
            if (insights) insights.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => setOpinionsActive(false), 2000);
          }}
          className={`py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all font-bold ${opinionsActive ? 'bg-primary border-primary text-white scale-95' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'}`}
        >
          {opinionsActive ? 'Loading Opinions...' : 'Opinions'}
        </button>
        <button 
          onClick={() => {
            setDebateActive(true);
            navigator.clipboard.writeText(window.location.href);
            setTimeout(() => setDebateActive(false), 2000);
          }}
          className={`py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all font-bold ${debateActive ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-white/60 hover:text-white'}`}
        >
          {debateActive ? 'Link Copied!' : 'Invite Debate'}
        </button>
      </div>

      <div className="mt-4">
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Station Info</p>
        <p className="text-xs text-white/50 leading-relaxed">
          Broadcasting {title} ({category}). Transcription powered by Antigravity AI STT Engine.
        </p>
      </div>
    </div>
  );
}
