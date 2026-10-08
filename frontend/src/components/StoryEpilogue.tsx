'use client';
import { useAdminStore } from '@/store/useAdminStore';
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';

export default function StoryEpilogue() {
  const isJewelry = useStore((state) => state.isJewelry);
  const showStoryEpilogue = useAdminStore((s: any) => s.showStoryEpilogue);
  const aboutUsText = useAdminStore((s: any) => s.aboutUsText);
  const aboutUsTitle = useAdminStore((s: any) => s.aboutUsTitle);
  const aboutUsSubtitle = useAdminStore((s: any) => s.aboutUsSubtitle);

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (sectionRef.current) observer.unobserve(sectionRef.current);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  if (showStoryEpilogue === false) return null;

  return (
    <section 
      ref={sectionRef}
      className={`relative w-full py-24 sm:py-32 flex flex-col items-center justify-center px-6 text-center overflow-hidden transition-colors duration-1000 ${isJewelry ? 'bg-[#050102]' : 'bg-[#F9F6F0]'}`}
    >
      <style>{`
        .wipe-signature {
          clip-path: inset(0 100% 0 0);
          transition: clip-path 2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .wipe-signature.animate {
          clip-path: inset(0 0 0 0);
        }
      `}</style>

      {/* Subtle top divider - The Golden Thread */}
      <div 
        className={`w-[1px] bg-gradient-to-b from-transparent ${isJewelry ? 'via-[#D5B06D]/30' : 'via-[#CBA153]/40'} to-transparent mb-10 origin-top transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? 'scale-y-100 h-16 sm:h-24 opacity-100' : 'scale-y-0 h-16 sm:h-24 opacity-0'}`}
      ></div>

      {/* Philosophy Text - The Breath */}
      <div 
        className={`max-w-3xl mx-auto transition-all duration-1000 delay-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <h3 className={`font-serif text-[18px] sm:text-[24px] md:text-[28px] leading-[1.8] tracking-[0.05em] ${isJewelry ? 'text-[#EAEAEA]' : 'text-[#2A1E1E]'}`}>
          {aboutUsText || "Preserving the royal heritage of Indian craftsmanship. Every piece is an act of devotion, meticulously created by master artisans."}
        </h3>
      </div>

      {/* Signature - The Ink Reveal */}
      <div className="mt-8 sm:mt-12 flex flex-col items-center gap-2">
        <span 
          className={`wipe-signature inline-block font-painter text-[36px] sm:text-[46px] tracking-wide ${isJewelry ? 'text-[#D5B06D]' : ''} ${isVisible ? 'animate' : ''}`}
          style={!isJewelry ? { 
            backgroundImage: "linear-gradient(to right, #2A1E1E, #603D3D)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            transitionDelay: '1200ms'
          } : { transitionDelay: '1200ms' }}
        >
          {aboutUsTitle || "Our Heritage"}
        </span>
        <span 
          className={`font-sans text-[8px] sm:text-[9px] uppercase tracking-[0.4em] ${isJewelry ? 'text-[#D5B06D]/50' : 'text-[#603D3D]/50'} mt-2 transition-all duration-1000 delay-[1800ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          {aboutUsSubtitle || "Raani Closet Atelier"}
        </span>
      </div>

    </section>
  );
}

