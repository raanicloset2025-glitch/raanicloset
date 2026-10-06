'use client';

import React, { useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryCarousel() {
  const isJewelry = useStore((state) => state.isJewelry);
  const activeClothingCategory = useStore((state) => state.activeClothingCategory);
  const activeJewelryCategory = useStore((state) => state.activeJewelryCategory);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use Zustand store categories & headings (admin-editable)
  const clothingCategories = useAdminStore((s) => s.clothingCategories);
  const jewelryCategories = useAdminStore((s) => s.jewelryCategories);
  const clothingCategoryHeading = useAdminStore((s) => s.clothingCategoryHeading);
  const jewelryCategoryHeading = useAdminStore((s) => s.jewelryCategoryHeading);

  const activeCategories = isJewelry ? jewelryCategories : clothingCategories;
  const categoryHeading = isJewelry ? (jewelryCategoryHeading || "Jewels") : (clothingCategoryHeading || "Suit");

  return (
    <div className="w-full pt-8 pb-4 transition-colors duration-1000">
      
      {/* --- ELEGANT ANIMATED HEADING (Fabric Paint & Golden Thread) --- */}
      <div key={isJewelry ? 'jewels-anim' : 'suit-anim'} className="relative w-full max-w-[500px] mx-auto flex items-center justify-center px-8 mb-8 mt-2">
        
        <style>{`
          /* 1. Golden Thread Left: Drawn from Left to Right (A to B) */
          .animate-thread-left {
            will-change: clip-path, opacity;
            transform: translateZ(0); /* Force GPU Layer */
            animation: thread-draw-left 1200ms cubic-bezier(0.33, 1, 0.68, 1) both;
          }
          @keyframes thread-draw-left {
            0% { clip-path: inset(0 100% 0 0); opacity: 0; }
            10% { opacity: 1; }
            100% { clip-path: inset(0 0 0 0); opacity: 1; }
          }

          /* 2. Fabric Paint Reveal: 100% GPU Dual-Transform Sliding Window */
          .animate-wipe-mask {
            display: inline-block;
            overflow: hidden;
            will-change: transform, opacity;
            animation: wipe-mask-reveal 1500ms cubic-bezier(0.33, 1, 0.68, 1) 800ms both;
          }
          @keyframes wipe-mask-reveal {
            0% { transform: translate3d(-101%, 0, 0); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translate3d(0%, 0, 0); opacity: 1; }
          }

          .animate-wipe-text {
            display: inline-block;
            will-change: transform;
            animation: wipe-text-reveal 1500ms cubic-bezier(0.33, 1, 0.68, 1) 800ms both;
          }
          @keyframes wipe-text-reveal {
            0% { transform: translate3d(101%, 3px, 0); }
            100% { transform: translate3d(0%, 0px, 0); }
          }

          /* 3. Golden Thread Right: Drawn from Text to Right edge (A to B) */
          .animate-thread-right {
            will-change: clip-path, opacity;
            transform: translateZ(0); /* Force GPU Layer */
            animation: thread-draw-right 1200ms cubic-bezier(0.33, 1, 0.68, 1) 1800ms both;
          }
          @keyframes thread-draw-right {
            0% { clip-path: inset(0 100% 0 0); opacity: 0; }
            10% { opacity: 1; }
            100% { clip-path: inset(0 0 0 0); opacity: 1; }
          }

          /* Continuous Ambient Flutter (Starts ONLY after sequence finishes) */
          .animate-fabric-flutter {
            display: inline-block;
            will-change: transform;
            animation: fabric-flutter 14s ease-in-out 3000ms infinite both;
            transform-origin: center bottom;
          }
          @keyframes fabric-flutter {
            0%, 100% { transform: translateY(0px) skewX(-0.5deg) skewY(0.5deg); }
            50% { transform: translateY(-2px) skewX(0.5deg) skewY(-0.5deg); }
          }
        `}</style>

        {/* Left Thread */}
        <div className={`flex-1 h-[1px] ${isJewelry ? 'bg-gradient-to-r from-transparent via-[#CBA153]/40 to-[#CBA153]/80' : 'bg-gradient-to-r from-transparent via-[#E0A29C]/40 to-[#E0A29C]/80'} animate-thread-left`}></div>
        
        {/* Fabric Paint Text (Dual-Transform Wipe) */}
        <div className="relative px-6 flex items-center justify-center">
          <div className="animate-wipe-mask">
            <div className="animate-wipe-text">
              <div className="animate-fabric-flutter">
                <h2 
                  className="font-painter text-[40px] md:text-[50px] leading-none inline-block pl-6 pr-6 py-4 transition-all duration-1000" 
                  style={{ 
                    backgroundImage: isJewelry ? "linear-gradient(to right, #F9F6F0, #D5B06D)" : "linear-gradient(to right, #2A1E1E, #603D3D)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                    WebkitBoxDecorationBreak: "clone",
                    boxDecorationBreak: "clone",
                    textShadow: isJewelry ? "0 2px 4px rgba(213,176,109,0.2), 0 1px 1px rgba(255,255,255,0.1)" : "0 2px 4px rgba(224,162,156,0.2), 0 1px 1px rgba(96,61,61,0.1)" 
                  }}
                >
                  {categoryHeading}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Right Thread */}
        <div className={`flex-1 h-[1px] ${isJewelry ? 'bg-gradient-to-l from-transparent via-[#CBA153]/40 to-[#CBA153]/80' : 'bg-gradient-to-l from-transparent via-[#E0A29C]/40 to-[#E0A29C]/80'} animate-thread-right`}></div>
      </div>

      {/* FOOLPROOF CENTERING LOGIC */}
      <div className="w-full flex justify-center">
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-8 px-4 sm:px-8 overflow-x-auto pb-4 scroll-smooth hide-scrollbar max-w-full"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none', 
            WebkitOverflowScrolling: 'touch',
            justifyContent: 'safe center',
          }}
        >
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          <AnimatePresence>
          {activeCategories.map((category) => {
          const isActive = isJewelry 
            ? activeJewelryCategory === category.title 
            : activeClothingCategory === category.title;
            
          return (
            <motion.div 
              key={category.id}
              layout
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={() => {
                if (isActive) {
                  isJewelry 
                    ? useStore.getState().setActiveJewelryCategory('All')
                    : useStore.getState().setActiveClothingCategory('All');
                } else {
                  isJewelry
                    ? useStore.getState().setActiveJewelryCategory(category.title)
                    : useStore.getState().setActiveClothingCategory(category.title);
                }
              }}
              className="snap-start flex flex-col items-center justify-center gap-3 group cursor-pointer shrink-0"
            >
              {/* The Medallion Circle */}
              <div className={`relative w-[76px] h-[76px] sm:w-[90px] sm:h-[90px] rounded-full p-[2px] transition-transform duration-500 group-hover:scale-105 group-active:scale-95 shadow-sm ${
                isActive 
                  ? (isJewelry ? 'bg-gradient-to-tr from-[#CBA153] to-[#DFB76C]' : 'bg-gradient-to-tr from-[#3B2F2F] to-[#1A1A1A]') 
                  : (isJewelry ? 'bg-gradient-to-tr from-[#CBA153]/20 via-[#CBA153]/40 to-[#0A0505]' : 'bg-gradient-to-tr from-[#E0A29C]/20 via-[#E0A29C]/80 to-[#F9F6F0]')
              }`}>
                {/* Inner Circle (The Image/Icon Container) */}
                <div className="w-full h-full bg-[#F9F6F0] rounded-full border border-white flex flex-col items-center justify-center overflow-hidden relative group-hover:border-[#E0A29C]/40 transition-colors">
                  
                  {/* Active Ring Glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-white/40 shadow-[inset_0_0_12px_rgba(255,255,255,0.5)]"></div>
                  )}

                  {/* Fallback pattern if no image */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(#E0A29C 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                  }}></div>
                  
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className={`object-cover w-full h-full transition-transform duration-700 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-90 group-hover:opacity-100'}`}
                    loading="lazy"
                  />
                  
                </div>
              </div>

              {/* Typography Label */}
              <span className={`font-royal uppercase tracking-[0.25em] text-[8px] sm:text-[9px] font-bold transition-colors duration-300 text-center w-full max-w-[90px] truncate ${
                isActive 
                  ? (isJewelry ? 'text-[#CBA153]' : 'text-[#1A1A1A]') 
                  : (isJewelry ? 'text-white/40 group-hover:text-white/70' : 'text-[#3B2F2F]/70 group-hover:text-[#3B2F2F]')
              }`}>
                {category.title}
              </span>
            </motion.div>
          );
        })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

