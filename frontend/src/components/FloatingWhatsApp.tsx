"use client";

import React, { useState, useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";

export default function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const adminWhatsapp = useAdminStore((state: any) => state.whatsappNumber) || "919876543210";

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    const message = encodeURIComponent("Hello Raani Closet, I would like to speak with a Bespoke Concierge.");
    const phone = adminWhatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <div 
      className={`fixed bottom-28 md:bottom-8 right-4 md:right-8 z-[90] flex items-center gap-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {/* Tooltip / Microcopy */}
      <div 
        className={`hidden md:block absolute right-full mr-4 bg-[#0A0908]/90 backdrop-blur-md border border-[#CBA153]/30 px-4 py-2 rounded-sm whitespace-nowrap transition-all duration-500 ease-out ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        <span className="text-[#F9F6F0] font-sans text-xs tracking-widest uppercase">Bespoke Concierge</span>
      </div>

      {/* Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group w-14 h-14 flex items-center justify-center rounded-full bg-[#050102]/85 backdrop-blur-md border border-[#CBA153]/30 shadow-[0_4px_30px_rgba(203,161,83,0.15)] transition-all duration-500 hover:scale-[1.04] hover:shadow-[0_8px_40px_rgba(203,161,83,0.3)] hover:border-[#CBA153]/60 active:scale-95"
        aria-label="Contact Bespoke Concierge"
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-[#CBA153]/0 group-hover:bg-[#CBA153]/10 transition-colors duration-500"></div>
        
        {/* Monochromatic Gold WhatsApp SVG */}
        <svg 
          width="26" 
          height="26" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#CBA153" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="relative z-10 transition-transform duration-500 group-hover:scale-110"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </button>
    </div>
  );
}
