"use client";

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import Image from 'next/image';
import ClientDiariesGallery from './ClientDiariesGallery';

export default function ClientDiaries() {
  const isJewelry = useStore((state) => state.isJewelry);
  
  // Read from Admin Store
  const clothingPhotos = useAdminStore((s: any) => s.clientDiariesClothing || []);
  const jewelryPhotos = useAdminStore((s: any) => s.clientDiariesJewelry || []);
  
  // Fallbacks if empty
  const defaultPhotos = [
    "/hero-suit.jpg", "/bespoke_bg.jpg", 
    "https://images.pexels.com/photos/1035683/pexels-photo-1035683.jpeg?auto=compress&cs=tinysrgb&w=800",
    "/hero-rose-pink.jpg"
  ];

  const allPhotos = isJewelry 
    ? (jewelryPhotos.length > 0 ? jewelryPhotos : defaultPhotos)
    : (clothingPhotos.length > 0 ? clothingPhotos : defaultPhotos);
    
  // Glimpse only takes the first 4 photos!
  const photos = allPhotos.slice(0, 4);
  
  // If we don't have at least 4 photos, we pad them (edge case)
  while(photos.length < 4) photos.push(defaultPhotos[photos.length]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [50, -50]);

  // Heading Styling
  const headingColor = isJewelry ? "text-[#EAEAEA]" : "text-[#1A0B16]";
  const bgColor = isJewelry ? "bg-[#050102]" : "bg-[#F9F6F0]";
  
  // White Glass Frame styles
  const glassFrame = isJewelry 
    ? "p-2 md:p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl"
    : "p-2 md:p-3 bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl";

  return (
    <>
      <section ref={sectionRef} className={`py-24 md:py-32 relative transition-colors duration-1000 ${bgColor} overflow-hidden`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          
          {/* Header */}
          <div className="text-center mb-16 md:mb-24 z-20 relative">
            <span className="inline-flex items-center gap-2 font-sans text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#CBA153] mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              The Living Archive
            </span>
            <h2 className={`text-4xl md:text-5xl lg:text-6xl ${headingColor} ${isJewelry ? 'font-serif tracking-widest uppercase font-light' : 'font-serif italic tracking-wide'}`}>
              Client Diaries
            </h2>
          </div>

          {/* Asymmetric Image Grid (NO TEXT, Framed in Glass) */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-20 md:mb-32">
            
            {/* Photo 1: Left Pillar */}
            <motion.div 
              style={{ y: y1 }}
              className={`w-full md:w-[35%] h-[50vh] md:h-[65vh] relative group ${glassFrame}`}
            >
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-[1.5s] z-10 pointer-events-none" />
                <Image src={photos[0]} alt="Client Diary 1" fill className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
              </div>
            </motion.div>

            {/* Center Column: Two Photos Stacked */}
            <motion.div 
              style={{ y: y2 }}
              className="w-full md:w-[25%] flex flex-col gap-6 md:gap-10 mt-10 md:mt-0"
            >
              {/* Photo 2 */}
              <div className={`w-full h-[35vh] md:h-[35vh] relative group ${glassFrame}`}>
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-[1.5s] z-10 pointer-events-none" />
                  <Image src={photos[1]} alt="Client Diary 2" fill className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-out object-top" />
                </div>
              </div>
              {/* Photo 3 */}
              <div className={`w-full h-[35vh] md:h-[35vh] relative group ${glassFrame}`}>
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-[1.5s] z-10 pointer-events-none" />
                  <Image src={photos[2]} alt="Client Diary 3" fill className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
                </div>
              </div>
            </motion.div>

            {/* Photo 4: Right Pillar */}
            <motion.div 
              style={{ y: y3 }}
              className={`w-full md:w-[35%] h-[50vh] md:h-[55vh] relative group md:mt-24 ${glassFrame}`}
            >
              <div className="relative w-full h-full overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-[1.5s] z-10 pointer-events-none" />
                <Image src={photos[3]} alt="Client Diary 4" fill className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
              </div>
            </motion.div>

          </div>

          {/* Explore Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center relative z-20"
          >
            <button 
              onClick={() => setIsGalleryOpen(true)}
              className={`relative overflow-hidden group px-10 py-4 border ${isJewelry ? 'border-[#333] text-white hover:border-[#CBA153]' : 'border-[#D4D4D4] text-[#1A0B16] hover:border-[#1A0B16]'} transition-colors duration-500`}
            >
              {/* Hover Glaze */}
              <div className={`absolute inset-0 w-full h-full ${isJewelry ? 'bg-white/5' : 'bg-black/5'} transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out`} />
              
              <span className="relative z-10 flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.25em] uppercase">
                Explore The Archives
                {/* Custom Deck of Cards / Stacked Monogram Icon */}
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
            </button>
          </motion.div>

        </div>
      </section>

      {/* Full Screen "Deck of Cards" Gallery Overlay */}
      <ClientDiariesGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} isJewelry={isJewelry} />
    </>
  );
}

