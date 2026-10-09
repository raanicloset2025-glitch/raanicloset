"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';

const InstallAppButton = dynamic(() => import("@/components/InstallAppButton"), { ssr: false });

const ALLOWED_ADMINS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'raanicloset2025@gmail.com'
)
  .split(',')
  .map((e) => e.trim().toLowerCase());

function isAllowedAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ALLOWED_ADMINS.includes(email.trim().toLowerCase());
}

export default function LoginPage() {
  const router = useRouter();
  const inFlightRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'email' | 'otp' | 'google-loading'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Parse errors from OAuth redirect or route guards on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      const errDesc = params.get('error_description');
      if (err === 'unauthorized') {
        setErrorMsg("Access Denied: You are not authorized to access the Admin Panel.");
      } else if (errDesc || err) {
        const rawMsg = errDesc || err || '';
        setErrorMsg(decodeURIComponent(rawMsg.replace(/\+/g, ' ')));
      }
      // Clean up error query parameters from URL so refreshes don't persist error
      if (err || errDesc) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Cooldown timer using setTimeout to avoid interval leaks
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const verifyAdminStatus = async (session: any) => {
    const userEmail = session?.user?.email?.toLowerCase()?.trim();
    if (!userEmail || !isAllowedAdmin(userEmail)) {
      await supabase.auth.signOut();
      setErrorMsg("Access Denied: You are not authorized to access the Admin Panel.");
      setStep('email');
      setLoading(false);
      return false;
    }
    return true;
  };

  // Check if logged in via Supabase
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (session) {
          const isAdmin = await verifyAdminStatus(session);
          if (isAdmin) router.push("/");
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[Login] Session check error:", err);
        setLoading(false);
      });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const isAdmin = await verifyAdminStatus(session);
        if (isAdmin) {
          if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          router.push("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlightRef.current || authLoading) return;

    const cleanEmail = email.trim().toLowerCase();
    setEmail(cleanEmail);

    if (!cleanEmail || resendCooldown > 0) return;

    setErrorMsg("");

    if (!isAllowedAdmin(cleanEmail)) {
      setErrorMsg("Access Denied: You are not authorized to access the Admin Panel.");
      return;
    }

    inFlightRef.current = true;
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("rate") || msg.includes("too many")) {
          setErrorMsg("Too many requests. Please wait a moment before trying again.");
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setResendCooldown(60); // 60 seconds cooldown
        setStep('otp');
      }
    } catch (err: any) {
      console.error("[Login] OTP request failed:", err);
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("rate") || msg.includes("too many")) {
        setErrorMsg("Too many requests. Please wait a moment before trying again.");
      } else {
        setErrorMsg(err?.message || "Failed to send verification code. Please check your network connection.");
      }
    } finally {
      inFlightRef.current = false;
      setAuthLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlightRef.current || authLoading) return;

    const cleanOtp = otp.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanOtp.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }

    setErrorMsg("");
    inFlightRef.current = true;
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanOtp,
        type: 'email',
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("expired") || msg.includes("invalid") || msg.includes("token")) {
          setErrorMsg("Invalid or expired verification code. Please try again.");
        } else if (msg.includes("rate") || msg.includes("too many")) {
          setErrorMsg("Too many attempts. Please wait a moment before trying again.");
        } else {
          setErrorMsg(error.message);
        }
        setOtp(""); // Auto-clear OTP so admin can re-enter fresh code
      } else if (data?.session || data?.user) {
        const isAdmin = await verifyAdminStatus(data.session);
        if (isAdmin) router.push("/");
      } else {
        setErrorMsg("Verification failed. Please try again.");
        setOtp("");
      }
    } catch (err: any) {
      console.error("[Login] OTP verification failed:", err);
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("expired") || msg.includes("invalid") || msg.includes("token")) {
        setErrorMsg("Invalid or expired verification code. Please try again.");
      } else if (msg.includes("rate") || msg.includes("too many")) {
        setErrorMsg("Too many attempts. Please wait a moment before trying again.");
      } else {
        setErrorMsg(err?.message || "Verification failed. Please check your network connection.");
      }
      setOtp("");
    } finally {
      inFlightRef.current = false;
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (inFlightRef.current || authLoading) return;
    setErrorMsg("");
    inFlightRef.current = true;
    setAuthLoading(true);
    setStep('google-loading');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setStep('email');
      }
    } catch (err: any) {
      console.error("[Login] Google OAuth failed:", err);
      setErrorMsg(err?.message || "Google sign-in initialization failed. Please try again.");
      setStep('email');
    } finally {
      inFlightRef.current = false;
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050102]">
        <Loader2 className="w-8 h-8 animate-spin text-[#CBA153]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050102] relative overflow-hidden px-4">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#CBA153] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-9 h-9 border border-[#CBA153]/30 flex items-center justify-center rotate-45">
              <div className="w-3 h-3 bg-[#CBA153]/20 border border-[#CBA153]/40" />
            </div>
            <h1 className="text-xl font-serif text-[#F9F6F0] tracking-[0.4em] uppercase">Raani Closet</h1>
            <p className="text-[8px] text-[#CBA153] tracking-[0.5em] uppercase">Atelier Command</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#08050a] border border-white/[0.07] shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#CBA153]/50 to-transparent" />

          <div className="p-8 md:p-10">
            {errorMsg && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded text-center">
                <p className="text-[10px] text-red-400 font-sans tracking-widest uppercase">{errorMsg}</p>
              </div>
            )}
            
            {step === 'google-loading' ? (
               <div className="flex flex-col items-center justify-center py-10">
                 <Loader2 className="w-8 h-8 animate-spin text-[#CBA153]" />
                 <p className="mt-6 font-sans text-[9px] tracking-[0.25em] uppercase text-[#F9F6F0]/70">
                   Connecting to Google...
                 </p>
               </div>
            ) : step === 'otp' ? (
              <>
                <div className="flex flex-col items-center gap-3 mb-8 text-center">
                  <div>
                    <p className="text-[10px] text-[#F9F6F0] tracking-[0.2em] uppercase font-medium">Verify</p>
                    <p className="text-[9px] text-[#555] tracking-wide mt-1">Enter the code sent to {email}</p>
                  </div>
                </div>

                <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    disabled={authLoading}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-DIGIT OTP"
                    className="w-full h-12 px-4 bg-[#050102] border border-white/[0.08] focus:border-[#CBA153]/50 outline-none font-sans text-center text-lg tracking-[0.5em] text-[#F9F6F0] placeholder-white/20 transition-colors disabled:opacity-50"
                  />

                  <button 
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#CBA153]/10 border border-[#CBA153]/30 hover:bg-[#CBA153]/20 text-[#CBA153] py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Enter"}
                  </button>
                </form>
                
                <div className="mt-6 flex flex-col gap-4">
                  <button 
                    type="button"
                    onClick={handleEmailSubmit}
                    disabled={authLoading || resendCooldown > 0}
                    className="w-full text-center font-sans text-[9px] uppercase tracking-[0.2em] text-[#555] hover:text-[#CBA153] transition-colors disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : authLoading ? "Sending..." : "Resend OTP"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!authLoading) {
                        setErrorMsg("");
                        setOtp("");
                        setStep('email');
                      }
                    }}
                    disabled={authLoading}
                    className="w-full text-center font-sans text-[9px] uppercase tracking-[0.2em] text-[#555] hover:text-white transition-colors disabled:opacity-50"
                  >
                    ← Back to Email
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3 mb-8 text-center">
                  <div>
                    <p className="text-[10px] text-[#F9F6F0] tracking-[0.2em] uppercase font-medium">Secure Access</p>
                    <p className="text-[9px] text-[#555] tracking-wide mt-1">Authorized personnel only</p>
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                  <input 
                    type="email" 
                    required
                    disabled={authLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full h-12 px-4 bg-[#050102] border border-white/[0.08] focus:border-[#CBA153]/50 outline-none font-sans text-sm tracking-wide text-[#F9F6F0] placeholder-white/20 transition-colors text-center disabled:opacity-50"
                  />

                  <button 
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#CBA153]/10 border border-[#CBA153]/30 hover:bg-[#CBA153]/20 text-[#CBA153] py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue with Email"}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-[1px] bg-white/[0.08]"></div>
                  <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#555]">Or</span>
                  <div className="flex-1 h-[1px] bg-white/[0.08]"></div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  disabled={authLoading}
                  className="w-full bg-[#050102] border border-white/[0.08] hover:border-[#CBA153]/50 text-[#F9F6F0] hover:text-[#CBA153] py-3.5 text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  <svg className="w-4 h-4 text-current transition-colors" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Connect with Google</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <InstallAppButton className="w-full py-3 text-[9px] tracking-[0.2em] uppercase border border-white/10 text-[#444] hover:border-[#CBA153]/30 hover:text-[#CBA153] transition-all duration-300" />
        </div>

        <p className="mt-8 text-center text-[#1a1a1a] text-[9px] uppercase tracking-[0.2em]">
          Ac {new Date().getFullYear()} Maison Raani. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
