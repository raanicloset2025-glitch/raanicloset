"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useAdminStore } from "@/store/useAdminStore";

export default function BespokeBanner() {
  const isJewelry = useStore((state) => state.isJewelry);
  
  const [isMounted, setIsMounted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeJewelry = isMounted ? isJewelry : false;

  const bgImage = useAdminStore((s: any) => activeJewelry ? s.jewelryBespokeFallbackImage || s.jewelryBespokeBg : s.clothingBespokeFallbackImage || s.clothingBespokeBg);
  const videoSrc = useAdminStore((s: any) => activeJewelry ? s.jewelryBespokeVideo : s.clothingBespokeVideo);
    
  const eyebrow = useAdminStore((s: any) => s.bespokeEyebrow);
  const title = useAdminStore((s: any) => activeJewelry ? s.jewelryBespokeTitle : s.clothingBespokeTitle);
  const subtitle = useAdminStore((s: any) => activeJewelry ? s.jewelryBespokeSubtitle : s.clothingBespokeSubtitle);
  const btnText = useAdminStore((s: any) => s.bespokeButtonText);
  
  const accentColor = activeJewelry ? "text-slate-300" : "text-[#E0A29C]";
  const goldColor = activeJewelry ? "text-[#CBA153]" : "text-[#CBA153]";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsVideoPlaying(false);
    video.muted = true;
    video.defaultMuted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsVideoPlaying(true))
        .catch(() => setIsVideoPlaying(false));
    }
  }, [videoSrc]);

  return (
    <section id="bespoke-atelier" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 transition-colors duration-1000">
      <div className={`relative w-full h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden rounded-2xl group cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${activeJewelry ? 'shadow-black/60 border border-slate-800' : 'border border-transparent'}`}>
        
        {/* Background Image Setup */}
        <div className="absolute inset-0 bg-[#0A0A0A]">
          <div className={`absolute inset-0 z-10 transition-colors duration-1000 pointer-events-none ${activeJewelry ? 'bg-black/60' : 'bg-black/40'}`} />
          <img 
            src={bgImage} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
            loading="lazy"
            fetchPriority="low"
          />
          {videoSrc && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              suppressHydrationWarning
              poster="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'></svg>"
              onPlaying={() => setIsVideoPlaying(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out ${
                isVideoPlaying ? "opacity-90" : "opacity-0"
              } group-hover:scale-105 transition-transform duration-[2000ms]`}
            >
              <source src={videoSrc} type="video/webm" />
            </video>
          )}
        </div>

        {/* Content Content */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
          
          <div className="w-8 h-8 md:w-10 md:h-10 border border-[#CBA153]/40 rounded-full flex items-center justify-center mb-6">
            <span className="font-royal text-[#CBA153] text-[10px] tracking-widest">RC</span>
          </div>

          <h4 className={`font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase mb-3 drop-shadow-md transition-colors duration-1000 ${accentColor}`}>
            {eyebrow}
          </h4>
          
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#F9F6F0] mb-4 drop-shadow-xl" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
            {title}
          </h2>
          
          <p className="font-royal italic text-lg md:text-2xl text-[#E8E0D0]/90 mb-10 tracking-wide font-light">
            {subtitle}
          </p>
          
          <Link href="/bespoke" className={`group/btn relative px-8 py-3 overflow-hidden border transition-colors duration-500 flex items-center gap-3 rounded-full ${activeJewelry ? 'border-slate-500 hover:border-[#CBA153]' : 'border-[#CBA153]/50 hover:border-[#CBA153]'}`}>
            <div className="absolute inset-0 bg-[#CBA153] translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-0" />
            <span className="relative z-10 font-sans text-xs md:text-sm tracking-[0.2em] uppercase text-[#F9F6F0] group-hover/btn:text-[#1A1A1A] transition-colors duration-500">
              {btnText}
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 w-4 h-4 text-[#CBA153] group-hover/btn:text-[#1A1A1A] transition-colors duration-500 -rotate-45 group-hover/btn:rotate-0">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>

        </div>
      </div>
    </section>
  );
}


