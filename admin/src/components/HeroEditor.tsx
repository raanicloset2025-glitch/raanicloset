"use client";

import React, { useState } from "react";
import ImageUploadGroup from "./ImageUploadGroup";
import VideoUploadGroup from "./VideoUploadGroup";
import { useAdminStore } from "@/store/useAdminStore";

export default function HeroEditor() {
    const [store, setStore] = React.useState<any>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setStore(useAdminStore.getState());
    
    useAdminStore.getState().fetchFromServer?.().then(() => {
      setStore(useAdminStore.getState());
    });

    const unsub = useAdminStore.subscribe((state: any) => {
      setStore(state);
    });
    return unsub;
  }, []);

  const [activeMode, setActiveMode] = useState<"clothing" | "jewelry">("clothing");
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">("desktop");

  const current = activeMode === "clothing" ? {
    videoVp9: store.clothingHeroVideo || "",
    imageAvif: store.clothingHeroFallbackImage || "",
    line1: store.clothingHeroLine1 || "Where Elegance",
    cursive: store.clothingHeroCursive || "Meets Tradition",
    line3: store.clothingHeroLine3 || "Royal Heritage Collection",
    btnText: store.clothingHeroButtonText || "Book Custom",
  } : {
    videoVp9: store.jewelryHeroVideo || "",
    imageAvif: store.jewelryHeroFallbackImage || "",
    line1: store.jewelryHeroLine1 || "High Jewels",
    cursive: store.jewelryHeroCursive || "The Art of Adornment",
    line3: store.jewelryHeroLine3 || "Imperial Vault Edition",
    btnText: store.jewelryHeroButtonText || "Explore Vault",
  };

  const updateField = (field: string, value: string) => {
    if (activeMode === "clothing") {
      if (field === 'videoVp9') store.setClothingHeroVideo(value);
      if (field === 'imageAvif') store.setClothingHeroFallbackImage(value);
      if (field === 'line1') store.setClothingHeroLine1(value);
      if (field === 'cursive') store.setClothingHeroCursive(value);
      if (field === 'line3') store.setClothingHeroLine3(value);
      if (field === 'btnText') store.setClothingHeroButtonText(value);
    } else {
      if (field === 'videoVp9') store.setJewelryHeroVideo(value);
      if (field === 'imageAvif') store.setJewelryHeroFallbackImage(value);
      if (field === 'line1') store.setJewelryHeroLine1(value);
      if (field === 'cursive') store.setJewelryHeroCursive(value);
      if (field === 'line3') store.setJewelryHeroLine3(value);
      if (field === 'btnText') store.setJewelryHeroButtonText(value);
    }
  };

  const publishChanges = async () => {
    try {
      // Use the entire global store state to publish seamlessly
      const stateObj = store as any;
      const payload = Object.fromEntries(
        Object.entries(stateObj).filter(([_, v]) => typeof v !== 'function')
      );
      
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if(res.ok) alert("Hero Changes Published to Live Website!");
      else alert("Failed to publish.");
    } catch (e) {
      console.error(e);
      alert("Error connecting to frontend API.");
    }
  };
  if (!mounted || !store.setBrandName) return null;
    <div className="flex-1 flex flex-col h-full bg-[#080808] text-neutral-200 selection:bg-[#CBA153]/30 overflow-y-auto font-sans">
      
      {/* ── TOP ATELIER BAR ── */}
      <header className="h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-serif text-sm tracking-[0.3em] uppercase text-neutral-100 font-light">
            RAANI
          </span>
          <span className="h-3 w-[1px] bg-neutral-800" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono px-2 py-0.5 rounded border border-[#CBA153]/30 bg-[#CBA153]/5 text-[#CBA153]">
            HERO CANVAS
          </span>
        </div>

        {/* Central Mode Switcher */}
        <div className="inline-flex p-1 rounded-full bg-neutral-900 border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveMode("clothing")}
            className={`px-5 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-300 ${
              activeMode === "clothing"
                ? "bg-neutral-800 text-[#CBA153] shadow-sm border border-[#CBA153]/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Clothing
          </button>
          <button
            onClick={() => setActiveMode("jewelry")}
            className={`px-5 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-300 ${
              activeMode === "jewelry"
                ? "bg-neutral-800 text-[#CBA153] shadow-sm border border-[#CBA153]/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Jewelry
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open("http://localhost:3000/?preview=true", "_blank")}
            className="px-4 py-1.5 rounded-full border border-neutral-800 text-[10px] tracking-[0.2em] uppercase text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
          >
            Storefront
          </button>
        </div>
      </header>

      {/* ── WORKSPACE BODY ── */}
      <main className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT PANE: LIVE CINEMATIC STAGE (Col 7) ── */}
        <section className="lg:col-span-7 sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-neutral-400">
                Live Reactive Viewport
              </span>
            </div>

            <div className="flex items-center gap-1 bg-neutral-900 border border-white/5 p-0.5 rounded-lg text-neutral-400">
              <button
                onClick={() => setDevicePreview("desktop")}
                className={`px-2.5 py-1 rounded text-[9px] tracking-wider uppercase transition-colors ${
                  devicePreview === "desktop" ? "bg-neutral-800 text-white" : "hover:text-white"
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setDevicePreview("mobile")}
                className={`px-2.5 py-1 rounded text-[9px] tracking-wider uppercase transition-colors ${
                  devicePreview === "mobile" ? "bg-neutral-800 text-white" : "hover:text-white"
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          <div
            className={`mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] bg-[#040102] transition-all duration-500 relative flex items-center justify-center ${
              devicePreview === "mobile" ? "max-w-[360px] aspect-[9/16]" : "w-full aspect-[16/10]"
            }`}
          >
            {/* Background Media */}
            {current.imageAvif && !current.videoVp9 && (
              <img
                src={current.imageAvif}
                alt="Fallback Background"
                className="absolute inset-0 w-full h-full object-cover filter brightness-75"
              />
            )}
            
            {current.videoVp9 && (
              <video
                key={current.videoVp9}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover filter brightness-75"
              >
                <source src={current.videoVp9} type="video/webm" />
              </video>
            )}

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />
            <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] pointer-events-none" />

            {/* Typography Stack */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
              {current.line1 && (
                <h3 className="font-serif text-[11px] sm:text-xs tracking-[0.28em] text-[#d4c1c1] uppercase font-light drop-shadow-md">
                  {current.line1}
                </h3>
              )}
              {current.cursive && (
                <h1 className="font-serif italic text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#d9bebe] via-white to-[#d9bebe] my-3 drop-shadow-[0_4px_16px_rgba(255,255,255,0.18)]">
                  {current.cursive}
                </h1>
              )}
              {current.line3 && (
                <p className="font-sans text-[10px] sm:text-[11px] tracking-[0.22em] text-[#c4a7a7]/80 uppercase leading-relaxed max-w-sm mt-1">
                  {current.line3}
                </p>
              )}

              <div className="w-[1px] h-8 bg-gradient-to-b from-[#c4a7a7]/60 to-transparent my-4" />

              <div className="px-6 py-2 rounded-full border border-[#c4a7a7]/40 bg-white/5 backdrop-blur-md">
                <span className="font-serif text-[10px] sm:text-[11px] tracking-[0.25em] text-white uppercase font-light">
                  {current.btnText || "Explore"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANE: CURATOR INSPECTOR DECK (Col 5) ── */}
        <section className="lg:col-span-5 space-y-6">
          
          <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs tracking-[0.25em] uppercase font-serif text-neutral-100">
                1. Cinematic Media
              </h2>
            </div>

            <VideoUploadGroup 
              label="VP9 Background Video"
              value={current.videoVp9}
              onChange={(v) => updateField('videoVp9', v)}
            />
            
            <ImageUploadGroup 
              label="AVIF Poster (Fallback)"
              value={current.imageAvif}
              fallbackImage=""
              darkIcon={true}
              onChange={(v) => updateField('imageAvif', v)}
            />
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-xl space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h2 className="text-xs tracking-[0.25em] uppercase font-serif text-neutral-100">
                2. Narrative Typography
              </h2>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] tracking-[0.22em] uppercase text-neutral-400 font-medium">Line 1: Main Title</label>
              <input type="text" value={current.line1} onChange={(e) => updateField("line1", e.target.value)} className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-serif tracking-[0.18em] uppercase text-neutral-100 focus:border-[#CBA153] focus:ring-1 focus:ring-[#CBA153]/30 transition-all outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] tracking-[0.22em] uppercase text-neutral-400 font-medium">Line 2: Cursive Subtitle</label>
              <input type="text" value={current.cursive} onChange={(e) => updateField("cursive", e.target.value)} className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl px-4 py-3 text-base italic font-serif text-[#F4D6D2] focus:border-[#CBA153] focus:ring-1 focus:ring-[#CBA153]/30 transition-all outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] tracking-[0.22em] uppercase text-neutral-400 font-medium">Line 3: Description</label>
              <textarea rows={3} value={current.line3} onChange={(e) => updateField("line3", e.target.value)} className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl px-4 py-3 text-xs leading-relaxed text-neutral-300 focus:border-[#CBA153] focus:ring-1 focus:ring-[#CBA153]/30 transition-all resize-none outline-none" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-xl space-y-4">
            <div className="border-b border-white/5 pb-3">
              <h2 className="text-xs tracking-[0.25em] uppercase font-serif text-neutral-100">
                3. Call to Action
              </h2>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] tracking-[0.22em] uppercase text-neutral-400 font-medium">Button Text</label>
              <input type="text" value={current.btnText} onChange={(e) => updateField("btnText", e.target.value)} className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl px-4 py-3 text-xs tracking-[0.2em] uppercase text-neutral-100 focus:border-[#CBA153] focus:ring-1 focus:ring-[#CBA153]/30 transition-all outline-none" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
