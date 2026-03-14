'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { LogIn, LogOut, User, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 h-16 flex items-center px-6 md:px-12 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="text-white w-5 h-5 fill-white" />
        </div>
        <span className="font-bold text-xl tracking-tight hidden md:inline-block">
          Live <span className="gradient-text">Sansad</span>
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium">{session.user?.name}</span>
              <span className="text-[10px] text-white/50">{session.user?.email}</span>
            </div>
            <img 
              src={session.user?.image || ''} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border border-white/20 shadow-lg"
            />
            <button 
              onClick={() => signOut()}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/70"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => signIn('google')}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-semibold hover:bg-white/90 transition-all shadow-xl active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </button>
        )}
      </div>
    </nav>
  );
}
