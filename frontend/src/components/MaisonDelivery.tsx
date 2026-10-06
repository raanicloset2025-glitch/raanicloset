"use client";

import React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function MaisonDelivery() {
  return (
    <div className="relative w-full h-24 sm:h-32 bg-[#020101] border-y border-[#CBA153]/10 overflow-hidden flex items-center justify-center">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-full bg-gradient-to-r from-transparent via-[#CBA153]/5 to-transparent blur-xl pointer-events-none" />

      {/* The Background Faint Text (Before the car passes) */}
      <div className="absolute text-center whitespace-nowrap opacity-10">
        <span className="font-sans text-[10px] sm:text-xs tracking-[0.4em] uppercase text-[#CBA153]">
          <ShieldCheck className="inline-block w-3.5 h-3.5 mr-2 mb-0.5" />
          Complimentary Global Vault Delivery &bull; Heritage Packaging
          <Sparkles className="inline-block w-3 h-3 ml-2 mb-0.5" />
        </span>
      </div>

      {/* The Animated Car and Trail Container */}
      <div className="absolute top-0 bottom-0 left-0 w-[200vw] sm:w-[150vw] animate-car-ride flex items-center">
        
        {/* The Golden Trail (Smoke / Soot) */}
        <div className="h-[1px] w-[50vw] bg-gradient-to-r from-transparent via-[#CBA153]/50 to-[#CBA153] shadow-[0_0_15px_rgba(203,161,83,0.8)] relative">
          
          {/* The Revealed Text inside the smoke trail */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 whitespace-nowrap flex items-center gap-4">
             <span className="font-sans text-[10px] sm:text-xs tracking-[0.4em] uppercase text-[#F9F6F0] drop-shadow-[0_0_8px_rgba(203,161,83,0.8)]">
                <ShieldCheck className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 text-[#CBA153]" />
                Complimentary Global Vault Delivery &bull; Heritage Packaging
                <Sparkles className="inline-block w-3 h-3 ml-2 mb-0.5 text-[#CBA153]" />
             </span>
          </div>

        </div>

        {/* The Vintage Royal Car Icon */}
        <div className="relative text-[#CBA153] drop-shadow-[0_0_12px_rgba(203,161,83,0.9)] animate-car-bounce -ml-2">
          {/* A bespoke minimal Vintage Rolls Royce / Bentley SVG */}
          <svg width="64" height="48" viewBox="0 0 80 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Rear Wheel */}
            <circle cx="20" cy="38" r="6" />
            <circle cx="20" cy="38" r="2" fill="currentColor" />
            
            {/* Front Wheel */}
            <circle cx="60" cy="38" r="6" />
            <circle cx="60" cy="38" r="2" fill="currentColor" />

            {/* Chassis */}
            <path d="M10 38 L 70 38" />

            {/* Front Grille & Hood */}
            <path d="M70 38 L 70 24 L 66 22 L 48 22" />

            {/* Windshield */}
            <path d="M48 22 L 42 12 L 28 12" />

            {/* Roof & Rear Sweep */}
            <path d="M28 12 L 20 14 C 14 18, 10 26, 10 38" />

            {/* Side Window/Door line */}
            <path d="M42 22 L 28 22" />
            <path d="M34 12 L 34 22" />

            {/* Headlight glow */}
            <circle cx="68" cy="24" r="2" fill="currentColor" />
            <path d="M72 24 L 80 24" stroke="currentColor" strokeWidth="1" className="opacity-50" />
            <path d="M70 22 L 78 20" stroke="currentColor" strokeWidth="1" className="opacity-30" />
            <path d="M70 26 L 78 28" stroke="currentColor" strokeWidth="1" className="opacity-30" />
          </svg>
        </div>

      </div>

      <style>{`
        @keyframes carRide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
        
        @keyframes carBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-1px) rotate(0.5deg); }
        }

        .animate-car-ride {
          animation: carRide 16s linear infinite;
        }

        .animate-car-bounce {
          animation: carBounce 0.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
