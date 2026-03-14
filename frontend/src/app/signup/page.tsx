'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Signup failed");
      } else {
        // Automatically sign in the user
        const loginRes = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (loginRes?.error) {
          setError("Account created but auto-login failed. Please log in manually.");
        } else {
          router.push('/live');
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative">
      <Navbar />
      
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[150px] rounded-full point-events-none -z-10 animate-pulse duration-10000" />
      
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        <div className="w-full max-w-md glass rounded-[2rem] p-8 mt-12 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent z-[-1]" />
          
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Zap className="text-white w-6 h-6 fill-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight">Join Live Sansad</h1>
          <p className="text-white/50 text-center text-sm mb-8">Create your account to cast your vote on real-time laws.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1 block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                placeholder="Ravi Kumar"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                placeholder="citizen@india.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-semibold text-center mt-2 bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-white hover:to-white hover:text-blue-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? 'Creating Account...' : <><UserPlus className="w-4 h-4 ml-[-4px]" /> Create Account</>}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/30 font-bold uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/live' })}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
               <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.549L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.25028 6.609L5.27028 9.724C6.21528 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
               <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L20.105 21.215C22.455 19.05 23.49 15.935 23.49 12.275Z" fill="#4285F4"/>
               <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.23999 6.58984C0.434987 8.19984 0 9.99984 0 11.9998C0 13.9998 0.434987 15.7998 1.24499 17.4098L5.26498 14.2949Z" fill="#FBBC05"/>
               <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 20.1104 21.215L16.0854 18.1001C14.9254 18.875 13.5654 19.25 12.0004 19.25C8.8704 19.25 6.21537 17.14 5.26537 14.275L1.24037 17.39C3.25537 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/>
            </svg>
            Sign up with Google
          </button>

          <p className="text-center text-white/50 text-sm mt-8">
            Already registered?{' '}
            <Link href="/login" className="text-blue-400 hover:text-white font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
