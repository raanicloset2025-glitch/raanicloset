"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAdminStore } from '@/store/useAdminStore';

import Lenis from 'lenis';

interface GalleryProps {
  isOpen: boolean;
  onClose: () => void;
  isJewelry: boolean;
}

export default function ClientDiariesGallery({ isOpen, onClose, isJewelry }: GalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const clothingPhotos = useAdminStore((s: any) => s.clientDiariesClothing || []);
  const jewelryPhotos = useAdminStore((s: any) => s.clientDiariesJewelry || []);
  
  // Use a fallback if empty so we always see the beautiful animation
  const fallback = [
    "/hero-suit.jpg", "/bespoke_bg.jpg", 
    "https://images.pexels.com/photos/1035683/pexels-photo-1035683.jpeg?auto=compress&cs=tinysrgb&w=800",
    "/hero-rose-pink.jpg", "/hero-suit.jpg", "/bespoke_bg.jpg"
  ];
  
  const selectedPhotos = isJewelry ? jewelryPhotos : clothingPhotos;
  const photos = selectedPhotos.length > 0 ? selectedPhotos : fallback;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    
    // Desktop smooth scrolling inside the modal
    const lenis = new Lenis({
      wrapper: containerRef.current,
      content: containerRef.current.firstElementChild as HTMLElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isOpen]);

  const themeBg = isJewelry ? "bg-[#050102]/98" : "bg-[#F9F6F0]/98";
  const textColor = isJewelry ? "text-[#EAEAEA]" : "text-[#1A0B16]";
  
  const appleGlass = isJewelry 
    ? "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.6)]" 
    : "bg-white/60 backdrop-blur-2xl border border-white/40 shadow-[0_15px_30px_rgba(0,0,0,0.05)]";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed inset-0 z-[100] ${themeBg} overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain`}
          style={{ WebkitOverflowScrolling: 'touch' }}
          ref={containerRef}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Lenis Content Wrapper */}
          <div className="relative w-full min-h-full">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className={`fixed top-6 right-6 md:top-8 md:right-8 z-[110] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full ${appleGlass} ${textColor} hover:scale-110 hover:bg-black/10 transition-all`}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* Header Title */}
            <div className="fixed top-6 left-6 md:top-8 md:left-8 z-[110] pointer-events-none mix-blend-difference">
              <h2 className={`text-xl md:text-3xl ${textColor} ${isJewelry ? 'font-serif tracking-widest uppercase font-light' : 'font-serif italic tracking-wide'}`}>
                The Archives
              </h2>
              <p className={`text-[9px] md:text-xs tracking-[0.2em] uppercase mt-1 md:mt-2 opacity-70 ${textColor}`}>
                Timeless Echoes
              </p>
            </div>

            {/* Cinematic Masonry Grid */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-[20vh] pb-[20vh]">
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 sm:gap-8 lg:gap-12">
                {photos.map((src: string, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 15 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ 
                      duration: 1, 
                      ease: [0.16, 1, 0.3, 1],
                      delay: (i % 3) * 0.1 // Subtle stagger effect
                    }}
                    className={`inline-block w-full mb-6 sm:mb-8 lg:mb-12 relative overflow-hidden rounded-xl md:rounded-2xl transition-transform duration-700 hover:-translate-y-2 shadow-2xl ${isJewelry ? 'shadow-black/60' : 'shadow-black/10'}`}
                    style={{ perspective: "1000px", height: `${300 + (i % 4) * 100}px` }}
                  >
                    <Image 
                      src={src} 
                      alt={`Archive ${i}`} 
                      fill 
                      className="object-cover transform scale-100 hover:scale-105 transition-transform duration-[2s] ease-out" 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}
