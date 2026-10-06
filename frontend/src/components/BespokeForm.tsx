"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { useStore } from "@/store/useStore";

export default function BespokeForm() {
  const whatsappNumber = useAdminStore((s: any) => s.whatsappNumber) || "919876543210";
  const jewelryBespokeFallbackImage = useAdminStore((s: any) => s.jewelryBespokeFallbackImage);
  const jewelryBespokeBg = useAdminStore((s: any) => s.jewelryBespokeBg);
  const clothingBespokeFallbackImage = useAdminStore((s: any) => s.clothingBespokeFallbackImage);
  const clothingBespokeBg = useAdminStore((s: any) => s.clothingBespokeBg);
  const jewelryBespokeVideo = useAdminStore((s: any) => s.jewelryBespokeVideo);
  const clothingBespokeVideo = useAdminStore((s: any) => s.clothingBespokeVideo);
  const jewelryBespokeTitle = useAdminStore((s: any) => s.jewelryBespokeTitle);
  const clothingBespokeTitle = useAdminStore((s: any) => s.clothingBespokeTitle);
  const jewelryBespokeSubtitle = useAdminStore((s: any) => s.jewelryBespokeSubtitle);
  const clothingBespokeSubtitle = useAdminStore((s: any) => s.clothingBespokeSubtitle);

  const isJewelry = useStore((state) => state.isJewelry);

  const bgImage = isJewelry ? jewelryBespokeFallbackImage || jewelryBespokeBg : clothingBespokeFallbackImage || clothingBespokeBg;
  const videoSrc = isJewelry ? jewelryBespokeVideo : clothingBespokeVideo;
  const title = isJewelry ? jewelryBespokeTitle : clothingBespokeTitle;
  const subtitle = isJewelry ? jewelryBespokeSubtitle : clothingBespokeSubtitle;

  const [formData, setFormData] = useState({
    name: "",
    occasion: "",
    category: "",
    details: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneNumber = whatsappNumber.replace(/\D/g, ""); 
    
    const message = `Hello Raani Closet Atelier! ??\n\nI would like to commission a custom design.\n\n*Name:* ${formData.name}\n*Occasion:* ${formData.occasion}\n*Category:* ${formData.category}\n*Details:* ${formData.details}\n\nPlease let me know the next steps for consultation.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-85px)] flex flex-col md:flex-row">
      
      {/* Left Side: Cinematic Presentation */}
      <div className="w-full md:w-1/2 relative flex flex-col items-center justify-center p-12 bg-[#0A0A0A] text-[#F9F6F0] overflow-hidden">
        {/* Subtle gradient to ensure text readability but keep image vibrant */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        {bgImage && !videoSrc && (
          <img 
            src={bgImage} 
            alt={title || "Bespoke Tailoring"} 
            className="absolute inset-0 w-full h-full object-cover opacity-90 z-0"
          />
        )}
        
        {videoSrc && (
          <video 
            src={videoSrc}
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-90 z-0"
          />
        )}
        
        <div className="relative z-20 text-center max-w-md">
          <div className="w-12 h-12 border border-[#CBA153]/40 rounded-full flex items-center justify-center mx-auto mb-8 bg-black/20 backdrop-blur-sm">
            <span className="font-royal text-[#CBA153] text-sm tracking-widest">RC</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight drop-shadow-xl">
            {title || "The Atelier Experience"}
          </h1>
          <p className="font-royal italic text-lg md:text-xl text-[#E8E0D0]/80 mb-8 font-light">
            {subtitle || "Where your imagination meets our master craftsmanship."}
          </p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#CBA153]/50 to-transparent mx-auto"></div>
        </div>
      </div>

      {/* Right Side: Consultation Form */}
      <div className="w-full md:w-1/2 bg-[#F9F6F0] p-8 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="font-sans text-xs tracking-[0.3em] uppercase text-[#E0A29C] mb-3">Begin Your Journey</h2>
          <h3 className="font-serif text-3xl text-[#1A1A1A] mb-8">Commission Your Design</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name */}
            <div className="group relative">
              <label htmlFor="name" className="block font-sans text-[10px] tracking-[0.15em] uppercase text-[#1A1A1A]/60 mb-2">Your Name</label>
              <input 
                type="text" 
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-2 text-[#1A1A1A] font-royal italic focus:outline-none focus:border-[#CBA153] transition-colors"
                placeholder="e.g. Maharani Devika"
              />
            </div>

            {/* Occasion */}
            <div className="group relative">
              <label htmlFor="occasion" className="block font-sans text-[10px] tracking-[0.15em] uppercase text-[#1A1A1A]/60 mb-2">The Occasion</label>
              <input 
                type="text" 
                id="occasion"
                name="occasion"
                required
                value={formData.occasion}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-2 text-[#1A1A1A] font-royal italic focus:outline-none focus:border-[#CBA153] transition-colors"
                placeholder="e.g. Wedding, Gala, Festival"
              />
            </div>

            {/* Category Select */}
            <div className="group relative">
              <label htmlFor="category" className="block font-sans text-[10px] tracking-[0.15em] uppercase text-[#1A1A1A]/60 mb-2">Garment Type</label>
              <select 
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-2 text-[#1A1A1A] font-royal italic focus:outline-none focus:border-[#CBA153] transition-colors appearance-none cursor-pointer"
              >
                <option value="" disabled>Select an option</option>
                <option value="Bridal Lehenga">Bridal Lehenga</option>
                <option value="Party Wear Suit">Party Wear Suit</option>
                <option value="Anarkali">Anarkali</option>
                <option value="Custom Kurti">Custom Kurti</option>
                <option value="Other">Other (Specify in details)</option>
              </select>
            </div>

            {/* Details */}
            <div className="group relative">
              <label htmlFor="details" className="block font-sans text-[10px] tracking-[0.15em] uppercase text-[#1A1A1A]/60 mb-2">Design Details & Requirements</label>
              <textarea 
                id="details"
                name="details"
                required
                rows={4}
                value={formData.details}
                onChange={handleChange}
                className="w-full bg-transparent border border-[#1A1A1A]/20 rounded-sm p-3 text-[#1A1A1A] font-royal italic focus:outline-none focus:border-[#CBA153] transition-colors resize-none"
                placeholder="Tell us about your dream outfit... colors, fabrics, specific embroidery?"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full group/btn relative px-8 py-4 mt-4 overflow-hidden border border-[#1A1A1A] bg-transparent transition-colors duration-500 flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-[#1A1A1A] translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-0" />
              <span className="relative z-10 font-sans text-xs tracking-[0.2em] uppercase text-[#1A1A1A] group-hover/btn:text-[#F9F6F0] transition-colors duration-500">
                Continue to WhatsApp
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 w-4 h-4 text-[#1A1A1A] group-hover/btn:text-[#F9F6F0] transition-colors duration-500">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            <p className="text-center font-sans text-[9px] tracking-wider uppercase text-[#1A1A1A]/40 mt-4">
              Our master artisans will respond within 24 hours.
            </p>
            
          </form>
        </div>
      </div>
      
    </div>
  );
}
