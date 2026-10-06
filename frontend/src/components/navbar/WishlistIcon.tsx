'use client';
// Force Cache Invalidation v4 - Oceanic Tide Physics

import React, { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

export default function WishlistIcon({ isJewelry }: { isJewelry: boolean }) {
  const wishlistItems = useStore((state) => state.wishlistItems);
  const wishlistCount = wishlistItems.length;
  const isFilled = wishlistCount > 0;
  
  const [isJiggling, setIsJiggling] = useState(false);
  const [fillComplete, setFillComplete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const clipId = useId();

  const setAuthModalOpen = useStore((state) => state.setAuthModalOpen);
  const user = useStore((state) => state.user);

  // Trigger the elastic energy transfer exactly when the fill completes
  useEffect(() => {
    if (isFilled && !fillComplete) {
      const timer = setTimeout(() => {
        setFillComplete(true);
        setIsJiggling(true);
        setTimeout(() => setIsJiggling(false), 500); // Quick swell lasts 500ms
      }, 800); // 0.8s fast fill duration
      return () => clearTimeout(timer);
    } else if (!isFilled) {
      setFillComplete(false);
    }
  }, [isFilled, fillComplete]);

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  return (
    <Link href="/trousseau" passHref onClick={handleClick}>
      <button 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-5 h-5 group ${isJiggling ? 'animate-tide-swell' : 'hover:scale-[1.08] active:scale-[0.95]'} transition-transform duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]`} 
        aria-label="Wishlist, The Trousseau"
      >
        {wishlistCount > 0 && (
          <div className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#CBA153] text-[#1A1A1A] text-[9px] font-sans font-bold flex items-center justify-center rounded-full z-10 border border-[#F9F6F0]">
            {wishlistCount}
          </div>
        )}
        <style>{`
        /* Deep Ocean Gravity Waves (Slow, rolling, rhythmic) */
        @keyframes ocean-front {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-32px, 0, 0); }
        }
        @keyframes ocean-back {
          0% { transform: translate3d(-16px, 0, 0); }
          100% { transform: translate3d(-48px, 0, 0); }
        }
        .liquid-wave-front {
          animation: ocean-front 1.5s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .liquid-wave-back {
          animation: ocean-back 2.2s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .liquid-fill-group {
          will-change: transform;
          backface-visibility: hidden;
        }
        /* Quick Swell */
        @keyframes tide-swell {
          0% { transform: scale(1); }
          40% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .animate-tide-swell {
          animation: tide-swell 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        /* Looping Hover Fill */
        @keyframes tide-rise-fall {
          0% { transform: translate3d(0, 4px, 0); }
          40% { transform: translate3d(0, -6px, 0); }
          60% { transform: translate3d(0, -6px, 0); }
          100% { transform: translate3d(0, 4px, 0); }
        }
        .animate-tide-loop {
          animation: tide-rise-fall 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
      
      <svg viewBox="0 0 24 24" shapeRendering="geometricPrecision" className="absolute inset-0 w-full h-full">
        <defs>
          <clipPath id={clipId}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </clipPath>
        </defs>

        {/* Empty Outline */}
        <path 
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`transition-colors duration-[1000ms] ${isJewelry ? 'text-slate-300' : 'text-[#3B2F2F]'}`}
        />

        {/* Water Fill Group */}
        <g clipPath={`url(#${clipId})`}>
          {/* Vertical Translation: Math model of a slow rising tide (ease-out curve, zero bounce) */}
          <g 
            className={`liquid-fill-group ${(!isFilled && isHovered) ? 'animate-tide-loop' : ''}`}
            style={
              (!isFilled && isHovered) 
                ? {} // Let the CSS animation control the transform
                : {
                    transform: isFilled ? (fillComplete ? 'translate3d(0, -6px, 0)' : 'translate3d(0, -3px, 0)') : 'translate3d(0, 4px, 0)',
                    transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }
            }
          >
            {/* Layer 1: Back Wave - Deep Burgundy Tide (#7A1521) - High Amplitude (Q 8 5) for deep ocean feel */}
            <path 
              d="M 0 12 Q 8 5 16 12 T 32 12 T 48 12 T 64 12 T 80 12 T 96 12 V 48 H 0 Z" 
              fill="#7A1521" 
              opacity="0.80"
              shapeRendering="geometricPrecision"
              className="liquid-wave-back"
            />

            {/* Layer 2: Front Wave - Deep Crimson Tide (#A31F2E) - Out of phase, smooth rolling (Q 8 6) */}
            <path 
              d="M 0 14 Q 8 6 16 14 T 32 14 T 48 14 T 64 14 T 80 14 T 96 14 V 48 H 0 Z" 
              fill="#A31F2E" 
              opacity="0.95"
              shapeRendering="geometricPrecision"
              className="liquid-wave-front"
            />
          </g>
        </g>
      </svg>
    </button>
    </Link>
  );
}
