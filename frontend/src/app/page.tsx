'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowRight, BookOpen, Activity, Globe, Shield, Scale, BrainCircuit, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30 scroll-smooth">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black z-10"></div>
          <img 
            src="/img/parliament_hero.png" 
            alt="Indian Parliament" 
            className="w-full h-full object-cover object-center opacity-40 scale-105 animate-[slow-pan_20s_ease-in-out_infinite_alternate]"
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 mb-6 bg-white/5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-700">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Democracy, Decoded</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            The Voice of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#FFA07A] to-primary text-glow drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]">
              1.4 Billion People
            </span>
          </h1>
          
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            Live Sansad uses Neural Transcription and Pollination AI to transform live parliamentary debates into actionable insights, real-time public consensus, and transparent laws.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <Link 
              href="/live" 
              className="bg-primary hover:bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-[0_0_40px_rgba(255,215,0,0.3)] hover:shadow-white/20 flex items-center justify-center gap-3 group"
            >
              Enter Live Dashboard 
              <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <a 
              href="#about" 
              className="glass hover:bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 backdrop-blur-md"
            >
              Learn the Law
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* About the Parliament Section */}
      <section id="about" className="py-24 px-6 lg:px-12 relative">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-xs text-primary font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
              <Globe className="w-4 h-4" /> Legislative Framework
            </h2>
            <h3 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              The Engine of <br />Indian Democracy
            </h3>
            <p className="text-white/60 mb-8 leading-relaxed text-lg">
              The Parliament of India (Sansad) is the supreme legislative body, comprising the President and two Houses: The <span className="text-white font-bold">Rajya Sabha</span> (Council of States) and the <span className="text-white font-bold">Lok Sabha</span> (House of the People). It is where laws are debated, budgets are approved, and the future of the nation is shaped.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-3xl border border-white/10 hover:border-primary/30 transition-colors group">
                <Users className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold mb-2">Lok Sabha</h4>
                <p className="text-white/50 text-sm">Directly elected by the people, primarily responsible for the national budget and representing public will.</p>
              </div>
              <div className="glass p-6 rounded-3xl border border-white/10 hover:border-primary/30 transition-colors group">
                <Shield className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold mb-2">Rajya Sabha</h4>
                <p className="text-white/50 text-sm">Representing the States & Union Territories, ensuring legislative balance and reviewing laws.</p>
              </div>
            </div>
          </div>
          <div className="relative group perspective">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-blue-500/10 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
            <img 
              src="/img/constitution.png" 
              alt="Constitution of India" 
              className="relative w-full rounded-3xl glass border border-white/20 shadow-[-10px_20px_30px_rgba(0,0,0,0.5)] transform transition-transform duration-700 group-hover:rotate-y-2 group-hover:rotate-x-2"
            />
          </div>
        </div>
      </section>

      {/* Laws & Policies Section */}
      <section className="py-24 px-6 lg:px-12 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-xs text-primary font-black uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-3">
              <Scale className="w-4 h-4" /> Policy Making
            </h2>
            <h3 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              How a Bill Becomes a Law
            </h3>
            <p className="text-white/50 text-lg leading-relaxed">
              Understanding the legislative process is crucial for every citizen. A bill goes through multiple stages of reading, debating, and voting before receiving the President's assent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[60px] left-[10%] w-[80%] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            
            {[
              { title: "First Reading", num: "01", desc: "Introduction of the bill in either House. The bill is published in the Gazette of India." },
              { title: "Discussion & Committees", num: "02", desc: "General discussion takes place. Often, bills are referred to Standing Committees for deep scrutiny." },
              { title: "Final Assent", num: "03", desc: "After passing both Houses, the President gives assent, making the bill an Act of Parliament." }
            ].map((step, idx) => (
              <div key={idx} className="glass p-8 rounded-[2rem] border border-white/10 hover:-translate-y-2 transition-transform duration-500 relative z-10 bg-black/60 shadow-xl backdrop-blur-2xl">
                <div className="text-[80px] font-black text-white/[0.03] leading-none absolute top-4 right-6 pointer-events-none">
                  {step.num}
                </div>
                <BookOpen className="w-12 h-12 text-primary mb-6" />
                <h4 className="text-2xl font-bold mb-3">{step.title}</h4>
                <p className="text-white/50 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Integration Section */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/30 to-primary/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
            <img 
              src="/img/ai_analysis.png" 
              alt="AI Data Analysis" 
              className="relative w-full rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-700 lg:group-hover:-rotate-2"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-xs text-primary font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
              <BrainCircuit className="w-4 h-4" /> Live Sansad Technology
            </h2>
            <h3 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Bridging the Gap <br />with Artificial Intelligence
            </h3>
            <p className="text-white/60 mb-8 leading-relaxed text-lg">
              Parliamentary sessions are long, complex, and overwhelmingly multilingual. We built this platform to bring extreme transparency and instant summarization to the public.
            </p>
            <ul className="space-y-6">
              {[
                { title: "Neural Transcription Engine", desc: "Listens to live streams and converts speech to text with 98% audio precision in real-time." },
                { title: "Pollination AI Summarization", desc: "Extracts large transcripts, removes political noise, and creates an unbiased 3-sentence core summary." },
                { title: "Sentiment & Consensus", desc: "Generates objective polls mid-debate. Anyone can vote. The AI analyzes the winning vote to generate a 'Proper Result' policy." }
              ].map((feature, idx) => (
                <li key={idx} className="flex gap-4 group">
                  <div className="mt-1 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold shadow-inner group-hover:bg-primary group-hover:text-black transition-colors">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">{feature.title}</h5>
                    <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-24 px-6 lg:px-12 border-t border-white/10 bg-gradient-to-b from-transparent to-primary/10 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to participate in <span className="gradient-text">Democracy?</span></h2>
          <p className="text-white/50 mb-10 text-lg">Watch the live stream, read the AI digests, cast your vote, and shape the consensus.</p>
          <Link 
            href="/live" 
            className="inline-flex bg-white hover:bg-primary text-black px-10 py-5 rounded-full font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_40px_rgba(255,215,0,0.3)] items-center gap-3"
          >
            Launch Live Dashboard 
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="mt-20 text-white/30 text-xs font-bold uppercase tracking-widest flex flex-col md:flex-row justify-center gap-6">
          <span>© 2026 Live Sansad AI</span>
          <span className="hidden md:inline">•</span>
          <span>Powered by Pollination AI</span>
          <span className="hidden md:inline">•</span>
          <span>Built for absolute transparency</span>
        </div>
      </footer>
    </main>
  );
}
