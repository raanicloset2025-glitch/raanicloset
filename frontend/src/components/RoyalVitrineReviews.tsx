"use client";

import React, { useRef, useEffect, useState } from "react";
import { Star, Quote, Sparkles, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useAdminStore } from "@/store/useAdminStore";

interface ReviewItem {
  id: string;
  patron: string;
  city: string;
  role: string;
  bespokeOrder: string;
  date: string;
  rating: number;
  quote: string;
  testimony: string;
  monogram: string;
  profilePhoto?: string;
}

export default function RoyalVitrineReviews() {
  const isJewelry = useStore((state) => state.isJewelry);
  const jewelryReviews = useAdminStore((s: any) => s.jewelryReviews) || [];
  const clothingReviews = useAdminStore((s: any) => s.clothingReviews) || [];
  const reviewsEyebrow = useAdminStore((s: any) => s.reviewsEyebrow);
  const reviewsTitleNormal = useAdminStore((s: any) => s.reviewsTitleNormal);
  const reviewsTitleItalic = useAdminStore((s: any) => s.reviewsTitleItalic);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // removed duplicate displayReviews
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isDealt, setIsDealt] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const startX = useRef(0);
  const scrollLeftState = useRef(0);

  const reviews: ReviewItem[] = isJewelry ? jewelryReviews : clothingReviews;
  // Duplicate 3 times so it loops flawlessly without reaching the end quickly
  const displayReviews = [...reviews, ...reviews, ...reviews];

  // 1. Dealing Animation Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Fast deal when coming into focus
          setTimeout(() => setIsDealt(true), 150);
        } else {
          // Immediately pack up when scrolling away!
          setIsDealt(false);
          // Smoothly reset scroll so it looks natural
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          }
        }
      },
      // rootMargin "-25% 0px" means it packs up as soon as it leaves the middle 50% of the screen!
      { threshold: 0, rootMargin: "-25% 0px" } 
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  // 2. Auto-Scroll Infinite Marquee Engine
  useEffect(() => {
    if (!scrollRef.current) return;
    let animationFrameId: number;
    let lastTime = performance.now();

    const scroll = (time: number) => {
      if (!scrollRef.current) return;
      const deltaTime = time - lastTime;
      lastTime = time;

      // Only auto-scroll if dealt, not hovering, and not dragging
      if (isDealt && !isHovering && !isDragging) {
        // approx 1px per frame (60fps) -> 0.5 * 16ms = 8px? 
        // 1px per 16ms = 0.0625 px/ms
        scrollRef.current.scrollLeft += 0.04 * deltaTime; 
        
        // Infinite loop logic: since we have 3 sets, when we cross 1/3rd, we reset to 0
        const oneSetWidth = scrollRef.current.scrollWidth / 3;
        if (scrollRef.current.scrollLeft >= oneSetWidth * 2) {
          scrollRef.current.scrollLeft -= oneSetWidth;
        } else if (scrollRef.current.scrollLeft <= 0) {
           scrollRef.current.scrollLeft += oneSetWidth;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    // Wait for the "deal" animation to finish (e.g. 1500ms) before auto-scrolling
    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(scroll);
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDealt, isHovering, isDragging]);

  // 3. Drag / Swipe Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftState.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovering(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag sensitivity
    scrollRef.current.scrollLeft = scrollLeftState.current - walk;
  };

  // 4. Manual Arrow Scrolling
  const handleScrollLeft = () => {
    if (!scrollRef.current) return;
    setIsDragging(true); // Temporarily pause auto-scroll
    scrollRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    setTimeout(() => setIsDragging(false), 500); // Resume
  };

  const handleScrollRight = () => {
    if (!scrollRef.current) return;
    setIsDragging(true); // Temporarily pause auto-scroll
    scrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    setTimeout(() => setIsDragging(false), 500); // Resume
  };

  if (!mounted) return <div className="py-24" />;

  return (
    <section
      id="atelier-reviews"
      ref={containerRef}
      suppressHydrationWarning
      className={`relative w-full py-12 sm:py-16 px-0 sm:px-8 overflow-hidden transition-colors duration-1000 ${
        isJewelry ? "bg-[#050102] text-[#F9F6F0]" : "bg-[#F9F6F0] text-[#1A1A1A]"
      }`}
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* --- ATMOSPHERIC LIGHTING --- */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[500px] blur-[120px] transition-colors duration-1000 ${
          isJewelry ? "bg-[#E0A29C]/15" : "bg-[#CBA153]/10"
        }`}
      />

      {/* --- EDITORIAL MASTHEAD --- */}
      <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 relative z-10 px-4">
        <span className="inline-flex items-center gap-2 font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#CBA153] mb-4">
          <Sparkles className="w-3.5 h-3.5 opacity-80" />
          {reviewsEyebrow || 'The Patron Chronicles'}
          <Sparkles className="w-3.5 h-3.5 opacity-80" />
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl tracking-wide leading-[1.15] text-current mb-5">
          {reviewsTitleNormal || 'Voices of the'} <span className="italic font-light text-[#CBA153]">{reviewsTitleItalic || 'Royal Patrons'}</span>
        </h2>
        <div className="w-12 h-[1px] bg-[#CBA153]/40 mx-auto" />
      </div>

      {/* --- THE VITRINE REVIEWS DISPLAY (Tash Ke Patte Deck Animation) --- */}
      <div className="relative group/carousel z-10 w-full">
        {/* Navigation Arrows */}
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

        {/* Scroll Container */}
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="w-full overflow-x-auto pb-24 pt-12 hide-scrollbar relative"
        >
        {/* We use px-[10vw] to ensure the first card is centered nicely on load */}
        <div className="flex gap-6 sm:gap-8 w-max px-[10vw] sm:px-[20vw]">
          {displayReviews.map((review, idx) => {
            // "Tash Ke Patte" Animation Logic
            const isStacked = !isDealt;
            // Gap is 24px (sm: 32px). We approximate shift to pull all cards back to idx 0.
            const gapOffset = 32;

            return (
              <div
                key={`${review.id}-${idx}`}
                className={`
                  group relative w-[280px] sm:w-[340px] shrink-0
                  flex flex-col justify-between p-6 sm:p-8 rounded-2xl
                  transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  
                  /* Dynamic Glassmorphism Theme (Opaque White Glass) */
                  backdrop-blur-2xl text-[#1A1A1A]
                  ${isJewelry 
                    ? "bg-white/95 border border-white shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_white] hover:shadow-[0_15px_40px_rgba(203,161,83,0.25)]" 
                    : "bg-white/70 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.06),inset_0_1px_2px_white] hover:border-white hover:shadow-[0_15px_40px_rgba(203,161,83,0.15)]"
                  }
                  hover:-translate-y-2
                `}
                style={{
                  // The Deal Animation: Pull to 0 when stacked, fan out when dealt.
                  transform: isStacked
                    ? `translateX(calc(-100% * ${idx} - ${gapOffset}px * ${idx})) rotate(${idx * 4 - 15}deg)`
                    : "translateX(0) rotate(0deg)",
                  transitionDuration: "1200ms",
                  transitionDelay: isStacked ? "0ms" : `${idx * 120}ms`,
                  zIndex: displayReviews.length - idx, // Make sure first card is on top of the deck
                }}
              >
                {/* Specular Glaze */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/40 to-white/10 opacity-75 group-hover:opacity-100 transition-opacity duration-700"
                />

                {/* Card Header */}
                <div className="relative z-10 flex items-start justify-between mb-8">
                  {/* Monogram Seal */}
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-[#CBA153]/40 shadow-sm group-hover:border-[#CBA153] transition-all duration-500 bg-[#FAF8F5] overflow-hidden">
                    {review.profilePhoto ? (
                      <img src={review.profilePhoto} alt={review.patron} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif text-[11px] font-semibold tracking-wider text-[#CBA153]">
                        {review.monogram || review.patron.split(' ').filter(n => n.length > 0).slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 pt-1.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-[#CBA153] text-[#CBA153]"
                      />
                    ))}
                  </div>
                </div>

                {/* Card Body */}
                <div className="relative z-10 flex-grow flex flex-col justify-between">
                  <div>
                    <Quote className="w-5 h-5 text-[#CBA153]/50 mb-4 group-hover:text-[#CBA153]/80 transition-colors duration-500 rotate-180" />
                    
                    <h3 className="font-serif text-lg font-normal leading-snug tracking-wide text-current mb-4">
                      &ldquo;{review.quote}&rdquo;
                    </h3>

                    <p className="font-sans font-light text-[13px] leading-relaxed opacity-70 mb-8 tracking-wide">
                      {review.testimony}
                    </p>
                  </div>

                  {/* Bespoke Tag */}
                  <div className="mb-6 py-2 px-3 rounded-md border group-hover:border-[#CBA153]/30 transition-colors duration-500 shadow-sm bg-white/60 border-white">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#CBA153]" />
                      <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#CBA153]">
                        Commission:
                      </span>
                      <span className="font-sans text-[10px] opacity-80 truncate font-medium">
                        {review.bespokeOrder}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="relative z-10 pt-5 border-t border-[#CBA153]/10 flex items-center justify-between">
                  <div>
                    <p className="font-serif text-[13px] font-medium tracking-wide text-current">
                      {review.patron}
                    </p>
                    <p className="font-sans text-[10px] opacity-60 tracking-wider">
                      {review.city} &middot; <span className="text-[#CBA153] font-medium">{review.role}</span>
                    </p>
                  </div>
                  <span className="font-sans text-[9px] uppercase tracking-[0.18em] opacity-50">
                    {review.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
