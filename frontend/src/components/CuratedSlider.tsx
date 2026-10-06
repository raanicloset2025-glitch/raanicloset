"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

interface ProductItem {
  id: string;
  title: string;
  category: string;
  imageSrc: string;
  price: number;
}

export default function CuratedSlider({ items }: { items: ProductItem[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Scroll by 50% of the container width to show the next item
      const scrollAmount = 350; // Width of card + gap 
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      // Delay checking scroll state slightly to allow animation
      setTimeout(checkScroll, 400);
    }
  };

  return (
    <div className="relative w-full max-w-[900px] mx-auto flex items-center group/slider">
      
      {/* Left Arrow */}
      <button 
        onClick={() => scroll('left')}
        className={`absolute -left-8 md:-left-16 z-20 p-4 text-[#B8860B]/70 hover:text-[#B8860B] transition-all duration-500 hover:scale-110 ` + (canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        aria-label="Previous items"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Track */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex w-full gap-8 md:gap-12 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth py-12 -my-12 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, index) => (
          <Link 
            key={item.id} 
            href={'/product/' + item.id} 
            className="w-[70vw] md:w-[280px] lg:w-[320px] flex-shrink-0 snap-center group cursor-pointer flex flex-col items-center hover:-translate-y-2 transition-transform duration-500"
          >
            {/* Glassmorphic Image Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-[0_20px_40px_rgba(203,161,83,0.15)] group-hover:shadow-[0_35px_60px_rgba(203,161,83,0.25)] border border-[#CBA153]/20 bg-white/40 backdrop-blur-md mb-6 transition-all duration-500">
              {/* Frosted Glass Overlay Wash */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] group-hover:backdrop-blur-none transition-all duration-700 z-10 pointer-events-none opacity-100 group-hover:opacity-0" />
              
              <img 
                src={item.imageSrc} 
                alt={item.title} 
                className="w-full h-full object-cover object-center transform group-hover:scale-[1.05] transition-transform duration-[6s] ease-out"
              />
              {/* Subtle Inner Frame on Hover */}
              <div className="absolute inset-0 border border-[#CBA153]/0 group-hover:border-[#CBA153]/40 transition-colors duration-700 m-3 rounded-lg pointer-events-none z-20" />
            </div>

            {/* Museum Plaque Details */}
            <div className="text-center w-full px-4 border-t border-[#CBA153]/20 pt-5 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
              <h4 className="font-royal text-lg text-[#1A1A1A] tracking-wider mb-1 uppercase font-medium">
                {item.title}
              </h4>
              <p className="font-sans text-[9px] tracking-[0.25em] text-[#B8860B] uppercase mb-2">
                {item.category}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Right Arrow */}
      <button 
        onClick={() => scroll('right')}
        className={`absolute -right-8 md:-right-16 z-20 p-4 text-[#B8860B]/70 hover:text-[#B8860B] transition-all duration-500 hover:scale-110 ` + (canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        aria-label="Next items"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

    </div>
  );
}
