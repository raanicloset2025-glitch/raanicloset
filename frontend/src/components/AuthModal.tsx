"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabaseClient';

export default function AuthModal() {
  const isAuthModalOpen = useStore((state) => state.isAuthModalOpen);
  const setAuthModalOpen = useStore((state) => state.setAuthModalOpen);
  const isJewelry = useStore((state) => state.isJewelry);
  
  const [step, setStep] = useState<'email' | 'otp' | 'google-loading'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isAuthModalOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
      });
      if (error) {
        alert("Error sending OTP: " + error.message);
      } else {
        setStep('otp');
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 6) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      
      if (error) {
        alert("Invalid OTP: " + error.message);
      } else if (data.user) {
        setAuthModalOpen(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setStep('google-loading');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) {
      alert("Google Login Error: " + error.message);
      setStep('email');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={() => setAuthModalOpen(false)}
      ></div>

      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-md p-8 md:p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform transition-all duration-500 overflow-hidden ${
          isJewelry 
            ? 'bg-[#0A0507]/90 border border-slate-700/50 text-[#E8E0D0]' 
            : 'bg-white/90 border border-[#E0A29C]/30 text-[#1A1A1A] shadow-[0_30px_60px_rgba(203,161,83,0.15)]'
        } backdrop-blur-xl`}
      >
        <button 
          type="button"
          onClick={() => setAuthModalOpen(false)}
          className={`absolute top-6 right-6 z-50 p-2 rounded-full transition-colors ${
            isJewelry ? 'hover:bg-white/10' : 'hover:bg-black/5'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {step === 'google-loading' ? (
           <div className="flex flex-col items-center justify-center py-10">
             <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${isJewelry ? 'border-[#CBA153]' : 'border-[#1A1A1A]'}`}></div>
             <p className={`mt-6 font-sans text-sm tracking-widest uppercase ${isJewelry ? 'text-slate-400' : 'text-[#603D3D]'}`}>
               Connecting to Google...
             </p>
           </div>
        ) : step === 'otp' ? (
          <>
            <div className="text-center mb-8">
              <h2 className="font-painter text-4xl mb-2 text-[#CBA153] drop-shadow-sm">Verify</h2>
              <p className={`font-sans text-[10px] uppercase tracking-[0.2em] ${isJewelry ? 'text-slate-400' : 'text-[#603D3D]'}`}>
                Enter the code sent to {email}
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
              <div className="relative">
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-Digit OTP"
                  className={`w-full h-12 px-4 border-b bg-transparent outline-none font-sans text-center text-lg tracking-[0.5em] transition-colors ${
                    isJewelry 
                      ? 'border-slate-700 focus:border-[#CBA153] text-[#E8E0D0] placeholder-slate-600' 
                      : 'border-[#E0A29C]/30 focus:border-[#CBA153] text-[#1A1A1A] placeholder-[#3B2F2F]/40'
                  }`}
                />
              </div>

              <button 
                type="submit"
                className={`w-full h-12 flex items-center justify-center font-sans text-[10px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 ${
                  isJewelry 
                    ? 'bg-slate-800 hover:bg-slate-700 text-[#CBA153]' 
                    : 'bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#FDFBF7]'
                }`}
              >
                Verify & Enter
              </button>
            </form>
            
            <div className="mt-6 flex flex-col gap-4">
              <button 
                type="button"
                onClick={handleEmailSubmit}
                className={`w-full text-center font-sans text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  isJewelry ? 'text-slate-400 hover:text-white' : 'text-[#603D3D] hover:text-black'
                }`}
              >
                Resend OTP
              </button>
              <button 
                type="button"
                onClick={() => setStep('email')}
                className={`w-full text-center font-sans text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  isJewelry ? 'text-slate-400 hover:text-white' : 'text-[#603D3D] hover:text-black'
                }`}
              >
                ← Back to Email
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="font-painter text-4xl mb-2 text-[#CBA153] drop-shadow-sm">Welcome</h2>
              <p className={`font-sans text-[10px] uppercase tracking-[0.2em] ${isJewelry ? 'text-slate-400' : 'text-[#603D3D]'}`}>
                Log in to access your private atelier
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6">
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className={`w-full h-12 px-4 border-b bg-transparent outline-none font-sans text-sm tracking-wide transition-colors ${
                    isJewelry 
                      ? 'border-slate-700 focus:border-[#CBA153] text-[#E8E0D0] placeholder-slate-600' 
                      : 'border-[#E0A29C]/30 focus:border-[#CBA153] text-[#1A1A1A] placeholder-[#3B2F2F]/40'
                  }`}
                />
              </div>

              <button 
                type="submit"
                className={`w-full h-12 flex items-center justify-center font-sans text-[10px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 ${
                  isJewelry 
                    ? 'bg-slate-800 hover:bg-slate-700 text-[#CBA153]' 
                    : 'bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#FDFBF7]'
                }`}
              >
                Continue with Email
              </button>
            </form>

            <div className="flex items-center gap-4 my-8">
              <div className={`flex-1 h-[1px] ${isJewelry ? 'bg-slate-700/50' : 'bg-[#E0A29C]/20'}`}></div>
              <span className={`font-sans text-[10px] uppercase tracking-[0.2em] ${isJewelry ? 'text-slate-500' : 'text-[#3B2F2F]/40'}`}>Or</span>
              <div className={`flex-1 h-[1px] ${isJewelry ? 'bg-slate-700/50' : 'bg-[#E0A29C]/20'}`}></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className={`w-full h-12 flex items-center justify-center gap-3 font-sans text-[10px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 border ${
                isJewelry 
                  ? 'border-slate-700 hover:bg-white/5 text-[#E8E0D0]' 
                  : 'border-[#E0A29C]/30 hover:bg-black/5 text-[#1A1A1A]'
              }`}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
