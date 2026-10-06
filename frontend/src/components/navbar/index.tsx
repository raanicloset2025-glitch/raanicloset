"use client";
// Force Cache Invalidation: 3

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import WishlistIcon from "./WishlistIcon";
import HexagonPatchworkBag from "../HexagonPatchworkBag";
import AccountMenu from "../AccountMenu";

export default function Navbar() {
  const isJewelry = useStore((state) => state.isJewelry);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const openCart = useStore((state) => state.openCart);
  const cartItems = useStore((state) => state.cartItems);
  
  const clothingLogoUrl = useAdminStore((state: any) => state.clothingLogoUrl) || '/raani-logo-new.png';
  const jewelryLogoUrl = useAdminStore((state: any) => state.jewelryLogoUrl) || '/raani-logo-new.png';
  const clothingToggleName = useAdminStore((state: any) => state.clothingToggleName) || 'Boutique';
  const jewelryToggleName = useAdminStore((state: any) => state.jewelryToggleName) || 'Jewelry';
  const clothingLogoSubtext = useAdminStore((state: any) => state.clothingLogoSubtext) || 'Boutique';
  const jewelryLogoSubtext = useAdminStore((state: any) => state.jewelryLogoSubtext) || 'High Jewels';
  const brandName = useAdminStore((state: any) => state.brandName) || 'Raani Closet';
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  
  const typedTextRef = useRef<HTMLSpanElement>(null);
  const [searchPhase, setSearchPhase] = useState<'icon' | 'typing' | 'ctrlk'>('icon');
  const [isAnimating, setAnimating] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isSearchOpenRef = useRef(isSearchOpen);
  useEffect(() => {
    isSearchOpenRef.current = isSearchOpen;
  }, [isSearchOpen]);

  // Smooth Scroll Detection for Shrinking Navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // VSYNC-Locked Master Animation Loop (120Hz/144Hz Smooth Display Sync)
  useEffect(() => {
    let rafId: number;
    let startTime: number | null = null;
    let lastCharCount = -1;
    let lastPhase: 'icon' | 'typing' | 'ctrlk' = 'icon';

    const textToType = "Search";
    const charInterval = 120; // ms per character (Snappy but elegant)
    const typingDuration = textToType.length * charInterval; // 720ms

    const REST_DURATION = 4500;   // 4.5s gap (Faster idle)
    const EXPAND_DURATION = 1600; // 1.6s physical cinematic expansion
    const HOLD_SEARCH = 2000;     // 2.0s hold
    const HOLD_CTRLK = 2500;      // 2.5s hold

    const totalCycle = REST_DURATION + EXPAND_DURATION + typingDuration + HOLD_SEARCH + HOLD_CTRLK; // 11320ms

    const frameTick = (now: DOMHighResTimeStamp) => {
      if (startTime === null || isSearchOpenRef.current) {
        // Reset the animation timer while the search box is open, 
        // so it stays perfectly still and doesn't trigger 'Ctrl+K' when closing.
        startTime = now;
      }
      
      const elapsed = now - startTime;
      const t = elapsed % totalCycle;

      let nextPhase: 'icon' | 'typing' | 'ctrlk' = 'icon';
      let nextCharCount = 0;

      if (t < REST_DURATION) {
        // Phase 1: Collapsed resting icon (36px)
        nextPhase = 'icon';
        nextCharCount = 0;
      } else if (t < REST_DURATION + EXPAND_DURATION) {
        // Phase 2: Smooth expansion glide (36px -> 130px), no typing yet!
        nextPhase = 'typing';
        nextCharCount = 0;
      } else if (t < REST_DURATION + EXPAND_DURATION + typingDuration) {
        // Phase 3: Typing characters into the fully expanded 130px container
        nextPhase = 'typing';
        const progressInTyping = t - (REST_DURATION + EXPAND_DURATION);
        nextCharCount = Math.min(
          textToType.length,
          Math.floor(progressInTyping / charInterval) + 1
        );
      } else if (t < REST_DURATION + EXPAND_DURATION + typingDuration + HOLD_SEARCH) {
        // Phase 4: Hold full "Search" text
        nextPhase = 'typing';
        nextCharCount = textToType.length;
      } else {
        // Phase 5: Display "Ctrl+K"
        nextPhase = 'ctrlk';
        nextCharCount = textToType.length;
      }

      // Selective VSYNC commit: only update React state when a visual boundary changes
      if (nextPhase !== lastPhase) {
        lastPhase = nextPhase;
        setSearchPhase(nextPhase);
      }

      if (nextCharCount !== lastCharCount) {
        lastCharCount = nextCharCount;
        if (typedTextRef.current) {
          typedTextRef.current.textContent = textToType.slice(0, nextCharCount);
        }
      }

      rafId = requestAnimationFrame(frameTick);
    };

    rafId = requestAnimationFrame(frameTick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  // Global Ctrl+K Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        useStore.getState().setSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        useStore.getState().setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleToggle = () => {
    toggleTheme();
    setWaveKey(prev => prev + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1500);
  };

  const triggerPulse = () => {
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 800);
  };

  // The Luxurious Psychological Backgrounds
  // Removed imperative document.body.style.background mutations to prevent layout conflicts on PDPs.

  return (
    <>
      {/* Absolute Master Backgrounds for seamless transition without flickering */}
      <div className={`fixed inset-0 z-[-50] pointer-events-none transform-gpu transition-opacity duration-[1000ms] ease-in-out bg-[#F9F6F0] ${!isJewelry ? 'opacity-100' : 'opacity-0'}`}></div>
      <div 
        className={`fixed inset-0 z-[-50] pointer-events-none transform-gpu transition-opacity duration-[1000ms] ease-in-out ${isJewelry ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(circle at 50% 20%, #1A090D 0%, #0D0406 55%, #050102 100%)' }}
      ></div>

      <nav className={`fixed top-0 left-0 transform-gpu w-full z-50 transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isJewelry ? 'bg-[#050102]/70 border-b border-[#1A090D] shadow-[0_4px_30px_rgba(0,0,0,0.8)]' : 'bg-[#F9F6F0]/90 border-b border-[#E0A29C]/20 shadow-sm'} backdrop-blur-md`}>
        <div className={`max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between transition-[height] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isScrolled ? 'h-[60px]' : 'h-[85px]'}`}>
          
          {/* Left: The Dynamic Logo Area */}
          <Link href="/" className={`flex items-center group relative w-[220px] lg:w-[260px] xl:w-[350px] shrink-0 transition-[height,transform] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-left ${isScrolled ? 'h-[45px] scale-[0.85]' : 'h-[65px] scale-100'}`}>
            
                <style>{`
                @keyframes ink-sweep {
                  0% { clip-path: polygon(0 0, 0 100%, 0 100%, 0 0); }
                  100% { clip-path: polygon(0 0, 0 100%, 100% 100%, 100% 0); }
                }
                .animate-ink-sweep {
                  animation: ink-sweep 2.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                @keyframes jewel-reveal {
                  0%   { clip-path: polygon(0 0, 0 100%, 0 100%, 0 0); filter: brightness(3) saturate(0); }
                  40%  { filter: brightness(2.5) saturate(0.3); }
                  70%  { clip-path: polygon(0 0, 0 100%, 100% 100%, 100% 0); filter: brightness(1.8) saturate(0.7); }
                  100% { clip-path: polygon(0 0, 0 100%, 100% 100%, 100% 0); filter: brightness(1) saturate(1); }
                }
                .animate-jewel-reveal {
                  animation: jewel-reveal 2.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                @keyframes golden-breathe {
                  0%, 100% { text-shadow: 0 0 12px rgba(255,200,50,0.7), 0 0 28px rgba(212,160,20,0.5), 0 0 55px rgba(180,120,0,0.3), 0 2px 4px rgba(0,0,0,0.8); }
                  50%       { text-shadow: 0 0 20px rgba(255,220,80,1), 0 0 45px rgba(212,170,30,0.75), 0 0 90px rgba(200,140,0,0.5), 0 2px 4px rgba(0,0,0,0.8); }
                }
                .animate-golden-breathe {
                  animation: golden-breathe 3s ease-in-out infinite;
                }
                @keyframes prism-glint {
                  0% { transform: translateX(-150%) skewX(-25deg); }
                  20% { transform: translateX(250%) skewX(-25deg); }
                  100% { transform: translateX(250%) skewX(-25deg); }
                }
                .animate-prism-glint {
                  animation: prism-glint 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
              `}</style>
              
              {/* The Clothing Logo (Image + Typography) */}
              <div className={`absolute inset-0 flex items-center space-x-3 xl:space-x-4 transition-[opacity,transform] ${isJewelry ? 'opacity-0 -translate-y-4 scale-95 pointer-events-none duration-[400ms] ease-in' : 'opacity-100 translate-y-0 scale-100 duration-[1000ms] delay-[200ms] ease-out'}`}>
                <div className="relative h-[45px] xl:h-[65px] w-[50px] xl:w-[70px] flex items-center justify-center shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <Image 
                    src={clothingLogoUrl} 
                    alt="Raani Closet Boutique Logo" 
                    fill 
                    sizes="(max-width: 1280px) 50px, 70px"
                    className="object-contain mix-blend-multiply origin-left" 
                    priority
                  />
                </div>
                <div className="flex flex-col justify-center relative flex-1 min-w-0">
                  <span className={`font-painter text-[26px] xl:text-[38px] bg-gradient-to-r from-[#2A1E1E] to-[#603D3D] text-transparent bg-clip-text leading-normal tracking-wide antialiased whitespace-nowrap py-2 pr-4 ${!isJewelry ? 'animate-ink-sweep' : ''}`} style={{ textShadow: "0 2px 6px rgba(224,162,156,0.25)"}}>
                    {brandName}&nbsp;
                  </span>
                  <span className="font-royal text-[10px] xl:text-[12px] tracking-[0.3em] text-[#E0A29C] font-bold uppercase drop-shadow-sm -mt-2">{clothingLogoSubtext}</span>
                </div>
              </div>
  
              {/* The Jewelry Logo (Diamond + 20-AI Physics Typography) */}
              <div className={`absolute inset-0 flex items-center space-x-2 xl:space-x-4 transition-[opacity,transform] ${!isJewelry ? 'opacity-0 translate-y-4 scale-95 pointer-events-none duration-[400ms] ease-in' : 'opacity-100 translate-y-0 scale-100 duration-[1000ms] delay-[200ms] ease-out'}`}>
                <div className="relative h-[45px] xl:h-[65px] w-[50px] xl:w-[70px] flex items-center justify-center shrink-0 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] group-hover:scale-105 transition-transform duration-500">
                  <Image 
                    src={jewelryLogoUrl} 
                    alt="Raani Closet High Jewels Logo" 
                    fill
                    sizes="(max-width: 1280px) 50px, 70px"
                    className="object-contain origin-left brightness-0 invert" 
                    priority
                  />
                  {/* Subtle sparkle */}
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-90"></div>
                </div>
                <div className="flex flex-col justify-center relative flex-1 group/jewel min-w-0">
                  <span
                    className="font-painter text-[22px] xl:text-[36px] tracking-wide antialiased whitespace-nowrap relative leading-normal py-2 pr-4"
                    style={{ color: '#E8E0D0' }}
                  >
                    {brandName}&nbsp;
                    {/* The Chromatic Aberration Glint */}
                    <span className="absolute inset-0 w-[40px] animate-prism-glint bg-gradient-to-r from-transparent via-cyan-200/50 via-white via-fuchsia-200/50 to-transparent mix-blend-color-dodge pointer-events-none"></span>
                  </span>
                  <span className="font-royal italic text-[9px] xl:text-[11px] tracking-[0.25em] text-slate-300/95 uppercase backdrop-blur-[1px] -mt-2" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9)"}}>{jewelryLogoSubtext}</span>
                </div>
              </div>
            </Link>

          {/* Center: The Ultimate Clean Toggle (Hand-Painted Text) */}
          <div className="hidden xl:flex items-center space-x-6 shrink-0">

            <span 
              onClick={() => { if (isJewelry) handleToggle(); }}
              className={`font-royal italic text-[18px] tracking-widest cursor-pointer transition-colors duration-[1000ms] ease-in-out ${!isJewelry ? 'text-[#3B2F2F] font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {clothingToggleName}
            </span>
            
            {/* THE MASTERPIECE TOGGLE BUTTON (10-AI Luxury Edition) */}
              <button 
                onClick={handleToggle}
                aria-label="Toggle between Clothing and Jewelry"
                className={`relative flex items-center w-[64px] h-[26px] rounded-full transform-gpu p-[3px] transition-[background-color,border-color,box-shadow,transform] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden cursor-pointer ${
                  isJewelry 
                    ? 'bg-slate-900 border border-slate-700/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]' 
                    : 'bg-[#F9F6F0] border border-[#E0A29C]/40 shadow-[inset_0_2px_6px_rgba(224,162,156,0.2)]'
                }`}
              >
                {/* The Velvet Glide Slider Thumb */}
                <div 
                  className={`absolute h-[20px] w-[20px] rounded-full z-10 transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-center ${
                    isJewelry 
                      ? 'translate-x-[36px] bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_1px_6px_rgba(255,255,255,0.4)]' 
                      : 'translate-x-0 bg-gradient-to-br from-[#ffffff] to-[#fff0f4] shadow-[0_2px_5px_rgba(224,162,156,0.5)]'
                  }`}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Elegant Hanger Icon (Clothing) */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="#E0A29C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" 
                      className={`absolute w-[12px] h-[12px] transition-[opacity,transform,color,background-color,border-color,box-shadow] duration-[600ms] ease-in-out ${isJewelry ? 'opacity-0 scale-50 -rotate-45' : 'opacity-100 scale-100 rotate-0'}`}
                    >
                      <path d="M12 2C10.3 2 9 3.3 9 5c0 1.7 1.3 3 3 3" />
                      <path d="M12 8L22 14v2H2v-2L12 8z" />
                    </svg>
                    
                    {/* Precise Cut Diamond Icon (Jewelry) */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" 
                      className={`absolute w-[12px] h-[12px] transition-[opacity,transform,color,background-color,border-color,box-shadow] duration-[600ms] ease-in-out ${!isJewelry ? 'opacity-0 scale-50 rotate-45' : 'opacity-100 scale-100 rotate-0'}`}
                    >
                       <path d="M6 3h12l4 6-10 12L2 9l4-6z"/>
                       <path d="M2 9h20"/>
                       <path d="M12 21V9"/>
                       <path d="M6 3l6 6"/>
                       <path d="M18 3l-6 6"/>
                    </svg>
                  </div>
                </div>
              </button>

            <span 
              onClick={() => { if (!isJewelry) handleToggle(); }}
              className={`font-royal italic text-[18px] tracking-widest cursor-pointer transition-colors duration-[1000ms] ease-in-out ${isJewelry ? 'text-slate-100 font-semibold' : 'text-[#3B2F2F]/90 hover:text-[#3B2F2F]'}`}
            >
              {jewelryToggleName}
            </span>
          </div>

          {/* Right: The Morphing Icons */}
          <div className="flex items-center space-x-8 opacity-90">
            <style>{`
              @keyframes specular-sweep {
                0% { transform: translate3d(-150%, 0, 0) skewX(-20deg); opacity: 0; }
                20% { opacity: 1; }
                70% { opacity: 0.85; }
                100% { transform: translate3d(350%, 0, 0) skewX(-20deg); opacity: 0; }
              }
              .animate-specular-glint {
                will-change: transform, opacity;
                backface-visibility: hidden;
                animation: specular-sweep 1600ms cubic-bezier(0.4, 0, 0.2, 1) 600ms forwards;
              }
            `}</style>

            {/* The Animated Inline Search Input (Cinematic Obsidian Awakening) */}
            <div 
              onClick={() => {
                useStore.getState().setSearchModalOpen(true);
              }}
              className={`relative flex items-center h-[36px] rounded-full transition-all ease-[cubic-bezier(0.22,1,0.36,1)] group overflow-hidden transform-gpu will-change-[width] [contain:layout_paint] ${
                isSearchOpen 
                  ? `w-[280px] duration-[1200ms] cursor-text` 
                  : searchPhase === 'icon' 
                    ? `w-[36px] duration-[800ms] cursor-pointer hover:scale-105` 
                    : `w-[150px] duration-[1600ms] cursor-pointer`
              }`}
              style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
              aria-label="Search"
            >
              {/* Layer 1: GPU-Accelerated Visual Backdrop (Fades opacity, zero layout paint cost) */}
              <div 
                className={`absolute inset-0 rounded-full transition-opacity duration-[800ms] pointer-events-none ${
                  searchPhase === 'icon' && !isSearchOpen
                    ? 'opacity-0'
                    : isJewelry 
                      ? 'opacity-100 bg-[#080E14] border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.9),0_20px_35px_-8px_rgba(0,0,0,0.95),0_0_20px_rgba(255,255,255,0.05)]' 
                      : 'opacity-100 bg-white border border-[#E0A29C]/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_4px_rgba(59,47,47,0.04),0_10px_25px_-4px_rgba(224,162,156,0.25)]'
                }`} 
              />

              {/* Layer 2: The Trailing Specular Kicker Glint (Cinematic Flare) */}
              {(!isSearchOpen && searchPhase !== 'icon') && (
                <div 
                  key={isJewelry ? 'jewelry-glint' : 'clothing-glint'}
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-full z-10"
                >
                  <div className="absolute top-0 bottom-0 -left-12 w-24 animate-specular-glint mix-blend-screen">
                    <div className="absolute inset-0 blur-[6px] opacity-40 bg-gradient-to-r from-transparent via-amber-100/50 to-transparent" />
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
                  </div>
                </div>
              )}

              {/* Icon Container */}
              <div 
                className={`absolute flex items-center justify-center transition-[opacity,transform,color,background-color,border-color,box-shadow] duration-[1600ms] ease-in-out transform-gpu z-10 ${
                  isSearchOpen 
                    ? 'left-3 translate-x-0 w-[14px] h-[14px] opacity-40 scale-90 pointer-events-none' 
                    : searchPhase === 'icon' 
                      ? 'left-1/2 -translate-x-1/2 w-5 h-5 opacity-100 scale-100' 
                      : 'left-3 translate-x-0 w-[16px] h-[16px] opacity-100 scale-100'
                }`}
                style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', willChange: 'transform, opacity, left' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={`absolute inset-0 transition-colors duration-[1000ms] ease-in-out text-[#1A0B16] ${isJewelry ? 'opacity-0 scale-75 rotate-45' : 'opacity-100 scale-100 rotate-0'}`}>
                  <circle cx="11" cy="11" r="6" />
                  <path d="M10 5h2" />
                  <path d="M11 4v1" />
                  <path d="M15.5 15.5L20 20" />
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={`absolute inset-0 transition-colors duration-[1000ms] ease-in-out text-slate-100 ${!isJewelry ? 'opacity-0 scale-75 -rotate-45' : 'opacity-100 scale-100 rotate-0'}`}>
                  <circle cx="10" cy="10" r="5" />
                  <path d="M14 14l4 4" strokeWidth="2" />
                  <path d="M17 19l2-2" />
                  <path d="M11 5v2m-1-1h2" strokeWidth="0.8" />
                </svg>
              </div>

              {/* Text Animation Container (Hidden when Search is Open) */}
              <div 
                className={`absolute inset-y-0 left-9 right-3 overflow-hidden pointer-events-none transition-opacity duration-[800ms] transform-gpu ${
                  (searchPhase === 'icon' || isSearchOpen) ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
              >
                {/* Search in Painter style (TYPING ANIMATION VIA REF) */}
                <div className={`absolute inset-0 flex items-center transition-[transform,opacity] duration-[300ms] transform ease-in-out ${
                  searchPhase === 'typing' ? 'translate-y-0 opacity-100' : 
                  searchPhase === 'ctrlk' ? '-translate-y-2 opacity-0 scale-[0.98]' : 'translate-y-2 opacity-0 scale-[0.98]'
                }`}>
                  <span 
                    ref={typedTextRef}
                    aria-hidden="true"
                    className={`font-painter text-[24px] leading-tight mt-0.5 ${isJewelry ? 'text-slate-100 drop-shadow-sm' : 'text-[#201017]'} antialiased`}
                    style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
                  />
                </div>
                {/* Ctrl + K Text */}
                <div className={`absolute inset-0 flex items-center transition-[transform,opacity] duration-[300ms] transform ease-in-out ${
                  searchPhase === 'ctrlk' ? 'translate-y-0 opacity-100 delay-[50ms]' : 
                  searchPhase === 'typing' ? 'translate-y-2 opacity-0 delay-[0ms]' : '-translate-y-2 opacity-0 delay-[0ms]'
                }`}>
                  <span 
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-sans font-bold tracking-wider uppercase border ${
                      isJewelry 
                        ? 'bg-white/10 text-slate-200 border-white/15' 
                        : 'bg-[#1A0B16]/5 text-[#1A0B16]/75 border-[#1A0B16]/10 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                    }`}
                  >
                    Ctrl+K
                  </span>
                </div>
              </div>

              {/* Actual Input Field (Visible when Search is Open) */}
              <div 
                className={`absolute left-9 right-10 h-full flex items-center transition-opacity duration-[800ms] delay-200 transform-gpu ${
                  isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                 <input 
                    id="navbar-search"
                    className={`w-full h-full bg-transparent outline-none text-sm font-royal italic placeholder-opacity-50 ${isJewelry ? 'text-slate-100 placeholder-slate-400' : 'text-[#1A0B16] placeholder-[#1A0B16]/40'}`}
                    placeholder="Discover masterpieces..."
                 />
              </div>
              
              {/* Close Button */}
              <div 
                className={`absolute right-3 flex items-center justify-center w-5 h-5 transition-[background-color,border-color,box-shadow,transform] duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu ${
                  isSearchOpen ? 'opacity-100 scale-100 rotate-0 pointer-events-auto cursor-pointer hover:scale-110 hover:text-red-400' : 'opacity-0 scale-75 -rotate-45 pointer-events-none'
                }`}
                onClick={(e) => { e.stopPropagation(); setIsSearchOpen(false); }}
              >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isJewelry ? 'text-slate-300' : 'text-[#1A0B16]/60'}><path d="M18 6L6 18M6 6l12 12"/></svg>
              </div>

            </div>
            
            {/* Account (Dropdown) */}
            <AccountMenu isMobile={false} isJewelry={isJewelry} />

            {/* Wishlist (Liquid Fill Animation) */}
            <WishlistIcon isJewelry={isJewelry} />
            
            {/* Bag */}
            <HexagonPatchworkBag 
              isJewelry={isJewelry} 
              onClick={() => {
                triggerPulse();
                openCart();
              }} 
              cartPulse={cartPulse}
              cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            />
            
          </div>

        </div>
      </nav>
    </>
  );
}









