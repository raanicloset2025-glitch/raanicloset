"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ClientDiariesGallery from './ClientDiariesGallery';

export default function ClientDiaries() {
  const isJewelry = useStore((state) => state.isJewelry);
  
  const clothingPhotos = useAdminStore((s: any) => s.clientDiariesClothing) || [];
  const jewelryPhotos = useAdminStore((s: any) => s.clientDiariesJewelry) || [];
  
  const defaultPhotos = [
    "/hero-suit.jpg", "/bespoke_bg.jpg", 
    "https://images.pexels.com/photos/1035683/pexels-photo-1035683.jpeg?auto=compress&cs=tinysrgb&w=800",
    "/hero-rose-pink.jpg"
  ];

  const allPhotos = isJewelry 
    ? (jewelryPhotos.length > 0 ? jewelryPhotos : defaultPhotos)
    : (clothingPhotos.length > 0 ? clothingPhotos : defaultPhotos);
    
  const displayPhotos = [...allPhotos, ...allPhotos, ...allPhotos];

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isDealt, setIsDealt] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const startX = useRef(0);
  const scrollLeftState = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsDealt(true), 150);
        } else {
          setIsDealt(false);
          if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
      },
      { threshold: 0, rootMargin: "-25% 0px" } 
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    let animationFrameId: number;
    let lastTime = performance.now();

    const scroll = (time: number) => {
      if (!scrollRef.current) return;
      const deltaTime = time - lastTime;
      lastTime = time;

      if (isDealt && !isHovering && !isDragging) {
        scrollRef.current.scrollLeft += 0.04 * deltaTime; 
        
        const oneSetWidth = scrollRef.current.scrollWidth / 3;
        if (scrollRef.current.scrollLeft >= oneSetWidth * 2) {
          scrollRef.current.scrollLeft -= oneSetWidth;
        } else if (scrollRef.current.scrollLeft <= 0) {
           scrollRef.current.scrollLeft += oneSetWidth;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isDealt, isHovering, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeftState.current = scrollRef.current?.scrollLeft || 0;
  };
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDragging(false);
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeftState.current - walk;
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const handleScrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const headingColor = isJewelry ? "text-[#EAEAEA]" : "text-[#1A0B16]";
  const bgColor = isJewelry ? "bg-[#050102]" : "bg-[#F9F6F0]";
  
  return (
    <>
      <section ref={containerRef} className={`py-24 md:py-32 relative transition-colors duration-1000 ${bgColor} overflow-hidden`}>
        
        <div className="text-center mb-16 md:mb-24 z-20 relative px-4">
          <span className="inline-flex items-center gap-2 font-sans text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#CBA153] mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            The Living Archive
          </span>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl ${headingColor} ${isJewelry ? 'font-serif tracking-widest uppercase font-light' : 'font-serif italic tracking-wide'}`}>
            Client Diaries
          </h2>
          <div className="w-12 h-[1px] bg-[#CBA153]/40 mx-auto mt-6" />
        </div>

        <div className="relative group/carousel z-10 w-full mb-12">
          <button
            onClick={handleScrollLeft}
            className={`absolute left-2 sm:left-6 top-[40%] sm:top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full border shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-105 ${
              isJewelry 
                ? "bg-[#050102]/80 border-[#CBA153]/30 text-[#CBA153] hover:bg-[#1A1A1A]" 
                : "bg-white/90 border-[#CBA153]/30 text-[#CBA153] hover:bg-white"
            }`}
          >
            <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={handleScrollRight}
            className={`absolute right-2 sm:right-6 top-[40%] sm:top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full border shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-105 ${
              isJewelry 
                ? "bg-[#050102]/80 border-[#CBA153]/30 text-[#CBA153] hover:bg-[#1A1A1A]" 
                : "bg-white/90 border-[#CBA153]/30 text-[#CBA153] hover:bg-white"
            }`}
          >
            <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>

          <div 
            ref={scrollRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="w-full overflow-x-auto pb-24 pt-12 hide-scrollbar relative"
          >
            <div className="flex gap-6 sm:gap-8 w-max px-[10vw] sm:px-[20vw]">
              {displayPhotos.map((photoSrc: string, idx: number) => {
                const isStacked = !isDealt;
                const gapOffset = 32;

                return (
                  <div
                    key={`photo-${idx}`}
                    className={`
                      group relative w-[280px] sm:w-[340px] h-[400px] sm:h-[480px] shrink-0
                      flex flex-col justify-between p-2 sm:p-3 rounded-2xl
                      transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      
                      backdrop-blur-2xl text-[#1A1A1A]
                      ${isJewelry 
                        ? "bg-white/5 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_40px_rgba(203,161,83,0.25)]" 
                        : "bg-white/40 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-white hover:shadow-[0_15px_40px_rgba(203,161,83,0.15)]"
                      }
                      hover:-translate-y-2
                    `}
                    style={{
                      transform: isStacked
                        ? `translateX(calc(-100% * ${idx} - ${gapOffset}px * ${idx})) rotate(${idx * 4 - 15}deg)`
                        : "translateX(0) rotate(0deg)",
                      transitionDuration: "1200ms",
                      transitionDelay: isStacked ? "0ms" : `${idx * 120}ms`,
                      zIndex: displayPhotos.length - idx,
                    }}
                  >
                    <div className="relative w-full h-full overflow-hidden rounded-xl">
                      <Image src={photoSrc} alt={`Client Diary ${idx}`} fill className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center relative z-20">
          <button 
            onClick={() => setIsGalleryOpen(true)}
            className={`relative overflow-hidden group px-10 py-4 border ${isJewelry ? 'border-[#333] text-white hover:border-[#CBA153]' : 'border-[#D4D4D4] text-[#1A0B16] hover:border-[#1A0B16]'} transition-colors duration-500`}
          >
            <div className={`absolute inset-0 w-full h-full ${isJewelry ? 'bg-white/5' : 'bg-black/5'} transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out`} />
            <span className="relative z-10 flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.25em] uppercase">
              Explore The Archives
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
          </button>
        </div>

      </section>

      <ClientDiariesGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} isJewelry={isJewelry} />
    </>
  );
}
