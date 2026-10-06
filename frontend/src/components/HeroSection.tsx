'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const [isMobile, setIsMobile] = React.useState(true); // Default true for safer hydration
  const isJewelry = useStore((state) => state.isJewelry);

  const [adminStore, setAdminStore] = React.useState<any>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setAdminStore(useAdminStore.getState());
    
    // Fetch latest from server on mount
    useAdminStore.getState().fetchFromServer().then(() => {
      setAdminStore(useAdminStore.getState());
    });

    // Subscribe to store changes
    const unsub = useAdminStore.subscribe((state: any) => {
      setAdminStore(state);
    });
    return unsub;
  }, []);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch dynamic content from Admin Store based on active theme
  const bg = useAdminStore((s: any) => isJewelry ? s.jewelryHeroBg : s.clothingHeroBg);
  const line1 = useAdminStore((s: any) => isJewelry ? s.jewelryHeroLine1 : s.clothingHeroLine1);//isJewelry ? adminStore.jewelryHeroLine1 : adminStore.clothingHeroLine1;
  const cursive = useAdminStore((s: any) => isJewelry ? s.jewelryHeroCursive : s.clothingHeroCursive);//isJewelry ? adminStore.jewelryHeroCursive : adminStore.clothingHeroCursive;
  const line3 = useAdminStore((s: any) => isJewelry ? s.jewelryHeroLine3 : s.clothingHeroLine3);//isJewelry ? adminStore.jewelryHeroLine3 : adminStore.clothingHeroLine3;
  const subtext = useAdminStore((s: any) => isJewelry ? s.jewelryHeroSubtext : s.clothingHeroSubtext);//isJewelry ? adminStore.jewelryHeroSubtext : adminStore.clothingHeroSubtext;
  const btnText = useAdminStore((s: any) => isJewelry ? s.jewelryHeroButtonText : s.clothingHeroButtonText);//isJewelry ? adminStore.jewelryHeroButtonText : adminStore.clothingHeroButtonText;

  const videoSrc = useAdminStore((s: any) => isJewelry ? s.jewelryHeroVideo : s.clothingHeroVideo);//isJewelry ? adminStore.jewelryHeroVideo : adminStore.clothingHeroVideo;
  const posterSrc = useAdminStore((s: any) => isJewelry ? s.jewelryHeroFallbackImage : s.clothingHeroFallbackImage);//isJewelry ? adminStore.jewelryHeroFallbackImage : adminStore.clothingHeroFallbackImage;

  return (
    <div className="relative w-full h-[calc(100vh-85px)] shrink-0 flex items-center justify-center overflow-hidden transition-all duration-1000 bg-[#040102]">
      
      {/* --- HERO BACKGROUND (Optimized for LCP) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a0e14] via-[#040102] to-[#000000]">
        
        {videoSrc ? (
          <video
            key={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            suppressHydrationWarning
            poster={posterSrc || useAdminStore((s: any) => s.clothingHeroBg)}
            className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000"
          >
            <source
              src={videoSrc}
              type={videoSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
            />
          </video>
        ) : (
          <Image
            src={posterSrc || useAdminStore((s: any) => s.clothingHeroBg)}
            alt="Hero Background"
            fill
            priority
            sizes="100vw"
            quality={85}
            className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000"
          />
        )}

        {/* Deep gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0505]/40 via-transparent to-[#0a0505]/90 pointer-events-none"></div>
        
        {/* Vignette Overlay */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] pointer-events-none"></div>
      </div>

      {/* --- 3D ROTATING TYPOGRAPHY --- */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 text-center" style={{ perspective: '1200px' }}>
        
        <style>{`
          .transform-style-3d {
            transform-style: preserve-3d;
          }
          .rotate-in {
            opacity: 0.01;
            transform: rotateX(80deg) translateZ(-200px) translateY(50px);
            animation: rotate-in-anim 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          }
          @keyframes rotate-in-anim {
            0% {
              opacity: 0.01;
              transform: rotateX(80deg) translateZ(-200px) translateY(50px);
            }
            100% {
              opacity: 1;
              transform: rotateX(0deg) translateZ(0px) translateY(0px);
            }
          }
          
          @keyframes slow-drift {
            0% { transform: translate(0, 0) rotate(0deg) scale(1); }
            33% { transform: translate(20px, -30px) rotate(5deg) scale(1.05); }
            66% { transform: translate(-20px, 20px) rotate(-5deg) scale(0.95); }
            100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          }
          .animate-slow-drift {
            animation: slow-drift 25s ease-in-out infinite;
          }
          .animate-slow-drift-reverse {
            animation: slow-drift 30s ease-in-out infinite reverse;
          }
          
          .text-shimmer {
            background: linear-gradient(90deg, #c4a7a7 0%, #ffffff 50%, #c4a7a7 100%);
            background-size: 200% auto;
            color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            animation: shimmer 6s linear infinite;
          }
          @keyframes shimmer {
            to { background-position: 200% center; }
          }
        `}</style>

        {/* Line 1 */}
        {line1 && (
          <div className="transform-style-3d rotate-in" style={{ animationDelay: '200ms' }}>
            <h2 className="font-royal text-[14px] sm:text-[18px] md:text-[22px] tracking-[0.2em] text-[#d4c1c1] uppercase mb-4 sm:mb-6 font-light drop-shadow-lg">
              {line1}
            </h2>
          </div>
        )}

        {/* Line 2 (Painter Style) */}
        {cursive && (
          <div className="transform-style-3d rotate-in" style={{ animationDelay: '600ms' }}>
            <h1 className="font-painter text-[55px] sm:text-[80px] md:text-[110px] leading-tight text-shimmer drop-shadow-[0_4px_20px_rgba(255,255,255,0.15)] mb-4 sm:mb-6 px-4">
              {cursive}
            </h1>
          </div>
        )}

        {/* Line 3 */}
        {line3 && (
          <div className="transform-style-3d rotate-in" style={{ animationDelay: '1000ms' }}>
            <h2 className="font-royal text-[14px] sm:text-[18px] md:text-[22px] tracking-[0.2em] text-[#d4c1c1] uppercase font-light drop-shadow-lg">
              {line3}
            </h2>
          </div>
        )}

        {/* Line 4 (Subtext) */}
        <div className="transform-style-3d rotate-in" style={{ animationDelay: '1500ms' }}>
          <div className="mt-12 sm:mt-16 flex flex-col items-center gap-3">
            {subtext && (
              <p className="font-sans text-[10px] sm:text-[12px] tracking-[0.25em] text-[#c4a7a7]/80 uppercase mb-4 max-w-md text-center px-4 leading-relaxed">
                {subtext}
              </p>
            )}
            
            {/* Minimalist Vertical Line */}
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#c4a7a7]/60 to-transparent mb-6"></div>
            
            <button 
              onClick={() => {
                const element = document.getElementById('bespoke-atelier');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="group relative overflow-hidden rounded-full border border-[#c4a7a7]/30 bg-white/5 px-8 py-3 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-[#c4a7a7]/60"
            >
              <span className="font-royal text-[11px] sm:text-[13px] tracking-[0.2em] text-white uppercase relative z-10 transition-colors group-hover:text-[#F9F6F0]">
                {btnText === 'Bespoke Couture' ? 'Book Custom' : (btnText || 'Explore')}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

