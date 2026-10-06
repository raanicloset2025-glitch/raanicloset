'use client';
// Force Cache Invalidation v2 - Search Lens Glare

import React from 'react';

export default function SearchIcon({ isJewelry, onClick }: { isJewelry: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`relative w-6 h-6 flex justify-center items-center group transition-transform duration-[400ms] hover:scale-110 active:scale-95`} 
      aria-label="Search"
    >
      <style>{`
        @keyframes lens-flare {
          0% { transform: translateX(-12px) rotate(30deg); opacity: 0; }
          10% { opacity: 1; }
          20% { transform: translateX(12px) rotate(30deg); opacity: 0; }
          100% { transform: translateX(12px) rotate(30deg); opacity: 0; }
        }
        .animate-lens-flare {
          animation: lens-flare 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
      
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 transition-colors duration-[1000ms] ${isJewelry ? 'text-slate-400 group-hover:text-slate-200' : 'text-[#3B2F2F]/60 group-hover:text-[#3B2F2F]'}`}>
        
        {/* The Magnifying Glass Circle */}
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />

        {/* The Lens Glare (clipped to the circle) */}
        <g clipPath="url(#lensClip)">
          <line 
            x1="11" y1="2" 
            x2="11" y2="20" 
            stroke="white" 
            strokeWidth="2.5" 
            className="animate-lens-flare mix-blend-overlay opacity-50"
            style={{ transformOrigin: '11px 11px' }}
          />
        </g>
        
        <defs>
          <clipPath id="lensClip">
            <circle cx="11" cy="11" r="7.5" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}
