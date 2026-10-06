'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';

const CLOTHING_CARDS = [
  { id: 1, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: '/bespoke_bg.jpg', title: 'The Royal Drape', no: 'NÂº 01' },
  { id: 2, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: '/hero-suit.jpg', title: 'Mastercraft Zardozi', no: 'NÂº 02' },
  { id: 3, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: '/hero-rose-pink.jpg', title: 'Heirloom Trousseau', no: 'NÂº 03' },
  { id: 4, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/1113554/pexels-photo-1113554.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'The Loom Heritage', no: 'NÂº 04' },
];

const JEWELRY_CARDS = [
  { id: 1, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Polki Diamonds', no: 'JÂº 01' },
  { id: 2, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Ruby Choker', no: 'JÂº 02' },
  { id: 3, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Emerald Cascade', no: 'JÂº 03' },
  { id: 4, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Kundan Heritage', no: 'JÂº 04' },
];

export default function VideoCarousel() {
  const isJewelry = useStore((state) => state.isJewelry);
  const jewelryVideos = useAdminStore((s: any) => s.jewelryVideos) || [];
  const clothingVideos = useAdminStore((s: any) => s.clothingVideos) || [];
  const videoCarouselEyebrow = useAdminStore((s: any) => s.videoCarouselEyebrow);
  const jewelryVideoHeading = useAdminStore((s: any) => s.jewelryVideoHeading);
  const clothingVideoHeading = useAdminStore((s: any) => s.clothingVideoHeading);
  
  const cards = isJewelry ? jewelryVideos : clothingVideos;
  
  const [activeIndex, setActiveIndex] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Drag state
  const startX = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const draggedRef = useRef(false);

  useEffect(() => { setIsPlaying(false); }, [activeIndex, isJewelry]);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNext = () => setActiveIndex((prev) => Math.min(prev + 1, cards.length - 1));
  const handlePrev = () => setActiveIndex((prev) => Math.max(prev - 1, 0));

  // Global Container Swipe Logic
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    draggedRef.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.pageX;
    startX.current = clientX;
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.pageX;
    if (Math.abs(clientX - startX.current) > 10) {
      draggedRef.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // For touch end, clientX is not in touches[0], it's in changedTouches
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).pageX;
    const diff = clientX - startX.current;

    if (diff > 50) handlePrev();
    else if (diff < -50) handleNext();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const wheelTimeout = useRef<any>(null);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelTimeout.current) return;
    if (Math.abs(e.deltaX) > 20) {
      if (e.deltaX > 0) handleNext();
      else handlePrev();
      wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 500);
    }
  };

  const bgColor = isJewelry ? 'bg-[#050102]' : 'bg-[#F9F6F0]';
  const textColor = isJewelry ? 'text-[#CBA153]' : 'text-[#CBA153]';
  const headingColor = isJewelry ? 'text-[#F9F6F0]' : 'text-[#1A1A1A]';

  return (
    <section 
      className={`relative w-full py-24 md:py-32 ${bgColor} overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000`}
      onWheel={handleWheel}
    >
      
      {/* Title */}
      <div className="text-center mb-16 md:mb-20 z-20 px-4">
        <span className="inline-flex items-center gap-2 font-sans text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#CBA153] mb-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          {videoCarouselEyebrow || 'Cinematic Archives'}
        </span>
        <h2 className={`font-serif text-3xl md:text-5xl lg:text-6xl ${headingColor} tracking-wide leading-[1.15]`}>
          {isJewelry ? (jewelryVideoHeading || 'The High Jewels') : (clothingVideoHeading || 'The Living Atelier')}
        </h2>
        <div className="w-12 h-[1px] bg-[#CBA153]/40 mx-auto mt-6" />
      </div>

      {/* Carousel Container */}
      <div className="relative w-full max-w-[1600px] h-[480px] md:h-[620px] flex items-center justify-center perspective-[1200px]">
        {cards.map((card: any, index: number) => {
          const isActive = index === activeIndex;
          const isLeft = index < activeIndex;
          const isRight = index > activeIndex;
          const distance = Math.abs(activeIndex - index);
          
          let rotateY = 0;
          let scale = 1;
          let translateX = 0;
          let zIndex = 10 - distance;
          let opacity = 1;

          if (isActive) {
            rotateY = 0;
            scale = 1;
            translateX = 0;
          } else if (isLeft) {
            rotateY = 25; 
            scale = 0.88;
            translateX = -90 * distance; 
            opacity = distance > 2 ? 0 : 0.6;
          } else if (isRight) {
            rotateY = -25;
            scale = 0.88;
            translateX = 90 * distance;
            opacity = distance > 2 ? 0 : 0.6;
          }

          // More squished translation for mobile
          const mobileTranslateX = isLeft ? -80 * distance : (isRight ? 80 * distance : 0);

          // Curved White Glassmorphism Theme
          const glassBg = isJewelry ? 'bg-white/10' : 'bg-white/50';
          const glassBorder = isJewelry ? 'border-white/20' : 'border-white/80';
          const glassShadow = isJewelry 
            ? 'shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)]' 
            : 'shadow-[0_20px_50px_rgba(0,0,0,0.08),inset_0_1px_2px_white]';

          return (
            <motion.div
              key={card.id}
              className={`absolute top-0 w-[260px] md:w-[340px] h-[460px] md:h-[600px] cursor-pointer rounded-3xl border ${glassBorder} ${glassBg} backdrop-blur-xl ${glassShadow} p-3`}
              style={{ transformStyle: 'preserve-3d' }}
              initial={false}
              animate={{
                rotateY,
                scale,
                x: isMounted && isMobile ? `${mobileTranslateX}%` : `${translateX}%`,
                zIndex,
                opacity
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.8 }}
              
              /* TRUE GESTURE DRAGGING */
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25} // Physical bounce feedback during drag!
              onDragEnd={(e, { offset }) => {
                const swipe = offset.x;
                if (swipe < -40) handleNext();
                else if (swipe > 40) handlePrev();
              }}
              onClick={() => setActiveIndex(index)}
            >
              {/* Dimmer overlay for non-active cards (Applied over the whole glass) */}
              <div 
                className={`absolute inset-0 z-20 pointer-events-none rounded-3xl transition-all duration-700 bg-black ${
                  isActive ? 'opacity-0' : 'opacity-20'
                }`} 
              />

              {/* Media Content Inside Bezel */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/20 shadow-inner">
                {/* Poster Layer */}
                <img 
                  src={card.poster} 
                  alt={card.title}
                  draggable={false}
                  className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${
                    isActive ? 'opacity-0' : 'opacity-100'
                  }`}
                />

                {/* Video plays continuously in background, just fades in smoothly without mounting delays */}
                <video
                  src={card.video}
                  draggable={false}
                  className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                
                {/* Minimalist Top/Bottom Vignette to enhance cinematic feel */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60 opacity-60"></div>
                
                {/* Minimal Numbering Watermark */}
                <div className={`absolute bottom-4 left-4 z-30 transition-all duration-700 ${isActive ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                  <span className="font-serif italic text-sm tracking-widest text-white/90 drop-shadow-md">
                    {card.no}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Flat Metadata below the Carousel */}
      <div className="mt-12 md:mt-16 text-center h-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <h4 className={`font-serif text-2xl md:text-3xl ${headingColor} tracking-wide mb-3`}>
              {cards[activeIndex]?.title}
            </h4>
            <span className={`font-sans text-[10px] uppercase tracking-[0.3em] ${textColor}`}>
              Chapter &mdash; {cards[activeIndex]?.no.replace('NÂº ', '').replace('JÂº ', '')}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
}
