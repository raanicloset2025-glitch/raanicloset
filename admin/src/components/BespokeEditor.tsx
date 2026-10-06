"use client";

import React, { useState } from "react";
import ImageUploadGroup from "./ImageUploadGroup";
import VideoUploadGroup from "./VideoUploadGroup";
import { useAdminStore } from "@/store/useAdminStore";

export default function BespokeEditor() {
  const [activeMode, setActiveMode] = useState<"clothing" | "jewelry">("clothing");
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">("desktop");

  const store = useAdminStore();

  const current = {
    videoVp9: activeMode === 'clothing' ? store.clothingBespokeVideo : store.jewelryBespokeVideo,
    imageAvif: activeMode === 'clothing' ? store.clothingBespokeFallbackImage || store.clothingBespokeBg : store.jewelryBespokeFallbackImage || store.jewelryBespokeBg,
    eyebrow: store.bespokeEyebrow,
    title: activeMode === 'clothing' ? store.clothingBespokeTitle : store.jewelryBespokeTitle,
    subtitle: activeMode === 'clothing' ? store.clothingBespokeSubtitle : store.jewelryBespokeSubtitle,
    btnText: store.bespokeButtonText,
  };

  const updateField = (field: string, value: string) => {
    if (field === 'eyebrow') store.setBespokeEyebrow(value);
    if (field === 'btnText') store.setBespokeButtonText(value);

    if (activeMode === 'clothing') {
      if (field === 'videoVp9') store.setClothingBespokeVideo(value);
      if (field === 'imageAvif') store.setClothingBespokeFallbackImage(value);
      if (field === 'title') store.setClothingBespokeTitle(value);
      if (field === 'subtitle') store.setClothingBespokeSubtitle(value);
    } else {
      if (field === 'videoVp9') store.setJewelryBespokeVideo(value);
      if (field === 'imageAvif') store.setJewelryBespokeFallbackImage(value);
      if (field === 'title') store.setJewelryBespokeTitle(value);
      if (field === 'subtitle') store.setJewelryBespokeSubtitle(value);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080808] text-neutral-200 selection:bg-[#CBA153]/30 overflow-y-auto font-sans">
      <header className="h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-serif text-sm tracking-[0.3em] uppercase text-neutral-100 font-light">RAANI</span>
          <span className="h-3 w-[1px] bg-neutral-800" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono px-2 py-0.5 rounded border border-[#CBA153]/30 bg-[#CBA153]/5 text-[#CBA153]">
            BESPOKE ATELIER
          </span>
        </div>
        <div className="inline-flex p-1 rounded-full bg-neutral-900 border border-white/10 shadow-inner">
          <button onClick={() => setActiveMode("clothing")} className={`px-5 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-300 ${activeMode === "clothing" ? "bg-neutral-800 text-[#CBA153] shadow-sm border border-[#CBA153]/30" : "text-neutral-400 hover:text-neutral-200"}`}>
            Clothing
          </button>
          <button onClick={() => setActiveMode("jewelry")} className={`px-5 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-300 ${activeMode === "jewelry" ? "bg-neutral-800 text-[#CBA153] shadow-sm border border-[#CBA153]/30" : "text-neutral-400 hover:text-neutral-200"}`}>
            Jewelry
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.open("http://localhost:3000/?preview=true#bespoke-atelier", "_blank")} className="px-4 py-1.5 rounded-full border border-neutral-800 text-[10px] tracking-[0.2em] uppercase text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors">
            Storefront
          </button>
          {/* Note: Publish button is handled globally in Admin Layout, but kept here for aesthetics if needed, though it does nothing now since state is synced */}
        </div>
      </header>

      <main className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-7 sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-neutral-400">Live Reactive Viewport</span>
            </div>
            <div className="flex items-center gap-1 bg-neutral-900 border border-white/5 p-0.5 rounded-lg text-neutral-400">
              <button onClick={() => setDevicePreview("desktop")} className={`px-2.5 py-1 rounded text-[9px] tracking-wider uppercase transition-colors ${devicePreview === "desktop" ? "bg-neutral-800 text-white" : "hover:text-white"}`}>Desktop</button>
              <button onClick={() => setDevicePreview("mobile")} className={`px-2.5 py-1 rounded text-[9px] tracking-wider uppercase transition-colors ${devicePreview === "mobile" ? "bg-neutral-800 text-white" : "hover:text-white"}`}>Mobile</button>
            </div>
          </div>

          <div className={`mx-auto rounded-2xl overflow-hidden border shadow-[0_30px_70px_rgba(0,0,0,0.9)] transition-all duration-500 relative flex items-center justify-center ${activeMode === "jewelry" ? "border-slate-800" : "border-white/10"} ${devicePreview === "mobile" ? "max-w-[360px] aspect-[9/16]" : "w-full aspect-[16/9]"}`}>
            <div className="absolute inset-0 bg-[#0A0A0A]">
              {current.imageAvif && !current.videoVp9 && <img src={current.imageAvif} alt="BG" className="absolute inset-0 w-full h-full object-cover opacity-90" />}
              {current.videoVp9 && (
                <video key={current.videoVp9} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-90">
                  <source src={current.videoVp9} type="video/webm" />
                </video>
              )}
              <div className={`absolute inset-0 pointer-events-none ${activeMode === "jewelry" ? "bg-black/60" : "bg-black/40"}`} />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
              <div className="w-8 h-8 border border-[#CBA153]/40 rounded-full flex items-center justify-center mb-4">
                <span className="text-[#CBA153] text-[10px] tracking-widest font-serif">RC</span>
              </div>
              <p className={`text-[10px] tracking-[0.3em] uppercase mb-2 font-sans ${activeMode === "jewelry" ? "text-slate-300" : "text-[#E0A29C]"}`}>{current.eyebrow}</p>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#F9F6F0] mb-3" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{current.title}</h2>
              <p className="font-serif italic text-base sm:text-xl text-[#E8E0D0]/90 mb-6 tracking-wide font-light">{current.subtitle}</p>
              <div className={`px-7 py-2.5 rounded-full border flex items-center gap-2 ${activeMode === "jewelry" ? "border-slate-500" : "border-[#CBA153]/50"}`}>
                <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#F9F6F0]">{current.btnText}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-[#CBA153] -rotate-45"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs tracking-[0.25em] uppercase font-serif text-neutral-100">1. Atelier Media</h2>
              <span className={`text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border ${activeMode === "clothing" ? "border-[#E0A29C]/30 text-[#E0A29C]" : "border-slate-500/30 text-slate-400"}`}>{activeMode}</span>
            </div>
            <VideoUploadGroup label="VP9 Background Video" value={current.videoVp9} onChange={(v) => updateField("videoVp9", v)} />
            <ImageUploadGroup label="AVIF Poster (Fallback)" value={current.imageAvif} fallbackImage="" darkIcon={true} onChange={(v) => updateField("imageAvif", v)} />
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-xl space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h2 className="text-xs tracking-[0.25em] uppercase font-serif text-neutral-100">2. Narrative Typography</h2>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] tracking-[0.22em] uppercase text-neutral-400 font-medium">Eyebrow Tag</label>
              <input type="text" value={current.eyebrow} onChange={(e) => updateField("eyebrow", e.target.value)} className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl px-4 py-3 text-xs tracking-[0.28em] uppercase text-[#CBA153] focus:border-[#CBA153] focus:ring-1 focus:ring-[#CBA153]/30 transition-all outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] tracking-[0.22em] uppercase text-neutral-400 font-medium">Main Headline</label>
              <input type="text" value={current.title} onChange={(e) => updateField("title", e.target.value)} className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl px-4 py-3 text-base font-serif text-neutral-100 focus:border-[#CBA153] focus:ring-1 focus:ring-[#CBA153]/30 transition-all outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] tracking-[0.22em] uppercase text-neutral-400 font-medium">Italic Subtitle</label>
              <input type="text" value={current.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl px-4 py-3 text-sm italic font-serif text-[#E8E0D0] focus:border-[#CBA153] focus:ring-1 focus:ring-[#CBA153]/30 transition-all outline-none" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-xl space-y-4">
            <div className="border-b border-white/5 pb-3">
              <h2 className="text-xs tracking-[0.25em] uppercase font-serif text-neutral-100">3. Call to Action</h2>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] tracking-[0.22em] uppercase text-neutral-400 font-medium">Button Text</label>
              <input type="text" value={current.btnText} onChange={(e) => updateField("btnText", e.target.value)} className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl px-4 py-3 text-xs tracking-[0.2em] uppercase text-neutral-100 focus:border-[#CBA153] focus:ring-1 focus:ring-[#CBA153]/30 transition-all outline-none" />
            </div>
            <p className="text-[9px] text-neutral-500 tracking-wide">Eyebrow and Button Text apply to both Clothing and Jewelry modes.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
