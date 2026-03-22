"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase'; // Hakikisha njia ya faili la supabase ipo sahihi

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Logic ya ku-login kwa kutumia Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        // Akifanikiwa, mpeleke kwenye Dashboard kuu
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setErrorMsg("Kuna tatizo limetokea. Jaribu tena.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Effects (Premium Dark Glassmorphism) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30 transform -rotate-6 hover:rotate-0 transition-transform">
              <span className="text-3xl text-white">🛡️</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Gari<span className="text-blue-500">Hub</span> Workspace</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Secure Admin Control Panel</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl">
          
          {errorMsg ? (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 flex items-start gap-3">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-400 text-sm font-medium leading-relaxed">{errorMsg}</p>
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Admin Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">📧</span>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  placeholder="admin@garihub.co.tz"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-[10px] font-bold text-blue-500 hover:text-blue-400">Forgot?</Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">🔒</span>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all uppercase tracking-widest text-xs mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Login to Workspace'}
            </button>
          </form>
        </div>

        {/* Footer Signature */}
        <div className="text-center mt-10">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Powered by B-Tech Group</p>
        </div>

      </div>
    </main>
  );
}