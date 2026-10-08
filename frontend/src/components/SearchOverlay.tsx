"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useAdminStore } from "@/store/useAdminStore";

// ── Separate Trending Engines per Mode ───────────────────────────
const KEY_CLOTH  = "raani_trend_cloth_v1";
const KEY_JEWEL  = "raani_trend_jewel_v1";
const MAX_ITEMS  = 6;

function recordSearch(term: string, isJewelry: boolean) {
  if (!term || term.trim().length < 2) return;
  try {
    const key = isJewelry ? KEY_JEWEL : KEY_CLOTH;
    const raw = localStorage.getItem(key);
    const existing: { term: string; count: number }[] = raw ? JSON.parse(raw) : [];
    const idx = existing.findIndex((t) => t.term.toLowerCase() === term.toLowerCase());
    if (idx > -1) existing[idx].count += 1;
    else existing.push({ term: term.trim(), count: 1 });
    existing.sort((a, b) => b.count - a.count);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, MAX_ITEMS)));
  } catch {}
}

// ── Component ─────────────────────────────────────────────────────
export default function SearchOverlay() {
  const { isSearchModalOpen, setSearchModalOpen, isJewelry } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { products, trendingSearchesClothing, trendingSearchesJewelry, searchSynonyms, getSignatureProducts, searchCollectionsClothing, searchCollectionsJewelry, searchSignatureClothing, searchSignatureJewelry, clothingCategories, jewelryCategories } = useAdminStore();
  const [query, setQuery]       = useState("");
  const [trending, setTrending] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef       = useRef<HTMLInputElement>(null);
  const scrollRef      = useRef<HTMLDivElement>(null);
  const searchTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSearchModalOpen || !scrollRef.current) return;
    
    let lenis: any;
    let rafId: number;
    
    import('lenis').then((LenisModule) => {
      const Lenis = LenisModule.default;
      lenis = new Lenis({
        wrapper: scrollRef.current!,
        content: scrollRef.current!.firstElementChild as HTMLElement,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.5,
      });

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, [isSearchModalOpen]);

  // Refresh trending whenever overlay opens OR mode changes
  useEffect(() => {
    try {
      const key = isJewelry ? KEY_JEWEL : KEY_CLOTH;
      const raw = localStorage.getItem(key);
      const real: { term: string; count: number }[] = raw ? JSON.parse(raw) : [];
      const defaults = isJewelry ? (trendingSearchesJewelry || []) : (trendingSearchesClothing || []);
      const realTerms = real.map((t) => t.term);
      setTrending([...realTerms, ...defaults.filter((d) => !realTerms.includes(d))].slice(0, MAX_ITEMS));
    } catch {
      setTrending(isJewelry ? (trendingSearchesJewelry || []) : (trendingSearchesClothing || []));
    }
  }, [isJewelry, isSearchModalOpen, trendingSearchesClothing, trendingSearchesJewelry]);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    } else {
      setQuery("");
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (query.trim().length >= 2) {
      searchTimer.current = setTimeout(() => {
        recordSearch(query.trim(), isJewelry);
        try {
          const key = isJewelry ? KEY_JEWEL : KEY_CLOTH;
          const raw = localStorage.getItem(key);
          const real: { term: string; count: number }[] = raw ? JSON.parse(raw) : [];
          const defaults = isJewelry ? (trendingSearchesJewelry || []) : (trendingSearchesClothing || []);
          const realTerms = real.map((t) => t.term);
          setTrending([...realTerms, ...defaults.filter((d) => !realTerms.includes(d))].slice(0, MAX_ITEMS));
        } catch {
          setTrending(isJewelry ? (trendingSearchesJewelry || []) : (trendingSearchesClothing || []));
        }
      }, 1200);
    }
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [query, isJewelry, trendingSearchesClothing, trendingSearchesJewelry]);

  const handleClose = () => setSearchModalOpen(false);

  const handleTrendingClick = (term: string) => {
    recordSearch(term, isJewelry);
    setQuery(term);
    inputRef.current?.focus();
  };

  // Process query for synonyms
  const processedQuery = searchSynonyms && searchSynonyms[query.trim().toLowerCase()] 
    ? searchSynonyms[query.trim().toLowerCase()] 
    : query.trim();

  // Search ALL products — show results split by cloth / jewel
  const allResults     = processedQuery.length > 0
    ? (products || []).filter((p) => {
        const q = processedQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q))) ||
        (p.description && p.description.toLowerCase().includes(q));
      })
    : [];
  const clothResults   = allResults.filter((p) => p.type === "clothing");
  const jewelResults   = allResults.filter((p) => p.type === "jewelry");
  const hasAny         = allResults.length > 0;

  // Colour helpers
  const dim    = isJewelry ? "text-slate-500"  : "text-[#3B2F2F]/45";
  const text   = isJewelry ? "text-slate-200"  : "text-[#1A1A1A]";
  const sub    = isJewelry ? "text-slate-500"  : "text-[#4A4A4A]";
  const border = isJewelry ? "border-white/15" : "border-[#3B2F2F]/15";

  const displayCollections = () => {
    const cats = isJewelry ? (jewelryCategories || []) : (clothingCategories || []);
    const ids = isJewelry ? searchCollectionsJewelry : searchCollectionsClothing;
    if (!ids || ids.length === 0) return cats.slice(0, 4);
    return ids.map(id => cats.find(c => c.id === id)).filter(Boolean).slice(0, 4);
  };

  const displaySignatures = () => {
    const ids = isJewelry ? searchSignatureJewelry : searchSignatureClothing;
    if (!ids || ids.length === 0) return (getSignatureProducts ? getSignatureProducts() : (products || []).slice(0, 4));
    return ids.map(id => products?.find(p => p.id === id || p.title === id)).filter(Boolean).slice(0, 4);
  };

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-[100] transform-gpu transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
      isSearchModalOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-4"
    }`}>

      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-3xl transition-colors duration-700 ${isJewelry ? "bg-[#050102]/87" : "bg-[#F9F6F0]/92"}`}
        onClick={handleClose}
      />

      {/* Close */}
      <button onClick={handleClose}
        className={`absolute top-6 right-6 md:top-8 md:right-10 w-11 h-11 flex items-center justify-center rounded-full z-20 transition-all active:scale-90 ${
          isJewelry ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-black/5 text-[#3B2F2F] hover:bg-black/10"
        }`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div className="relative z-10 flex flex-col h-full pt-14 md:pt-24 px-5 md:px-20 max-w-[1200px] mx-auto">

        {/* ── Input ── */}
        <div className={`w-full border-b pb-5 flex items-center gap-4 ${border}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-6 h-6 shrink-0 ${dim}`}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input ref={inputRef} type="text" value={query}
            onChange={(e) => { const v = e.target.value; startTransition(() => setQuery(v)); }}
            onKeyDown={(e) => { if (e.key === "Enter" && query.trim().length >= 2) recordSearch(query.trim(), isJewelry); }}
            placeholder={isJewelry ? "Search jewellery, sets, or collections..." : "Search clothing, collections, or styles..."}
            className={`w-full bg-transparent outline-none font-sans text-2xl md:text-[38px] font-light tracking-wide placeholder:opacity-25 transition-colors duration-700 ${
              isJewelry ? "text-slate-100 placeholder:text-slate-500" : "text-[#3B2F2F] placeholder:text-[#3B2F2F]"
            }`}
          />
          {query && (
            <button onClick={() => setQuery("")} className={`shrink-0 opacity-40 hover:opacity-80 transition-opacity ${isJewelry ? "text-slate-400" : "text-[#3B2F2F]"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* mode hint */}
        {!query && (
          <div className="flex items-center gap-2 mt-3 mb-1">
            <span className={`font-sans text-[9px] uppercase tracking-widest ${dim}`}>Searching across</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-sans border ${isJewelry ? "border-slate-700 text-slate-500" : "border-[#3B2F2F]/20 text-[#3B2F2F]/40"}`}>Clothing</span>
            <span className="text-[#CBA153] text-[9px]">+</span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-sans border border-[#CBA153]/40 text-[#CBA153]">Jewellery</span>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          .search-scroll-container::-webkit-scrollbar { display: none; }
        `}} />
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto mt-8 pb-24 search-scroll-container"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="w-full min-h-full flex flex-col relative">

            {/* ── DEFAULT: no query ── */}
            {!query && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

              {/* Trending — mode-aware */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-3.5 h-3.5 ${isJewelry ? "text-[#CBA153]" : "text-[#B8860B]"}`}>
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                  </svg>
                  <h3 className={`font-royal uppercase tracking-widest text-[10px] font-bold ${dim}`}>
                    {isJewelry ? "Trending in Jewellery" : "Trending in Clothing"}
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {trending.map((term, i) => (
                    <button key={term} onClick={() => handleTrendingClick(term)} className="text-left group flex items-center gap-4">
                      <span className={`font-sans text-[9px] w-4 text-right shrink-0 tabular-nums opacity-30 ${isJewelry ? "text-slate-400" : "text-[#3B2F2F]"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`h-[1px] w-5 transition-all duration-500 group-hover:w-9 ${isJewelry ? "bg-slate-700 group-hover:bg-[#CBA153]" : "bg-[#3B2F2F]/15 group-hover:bg-[#CBA153]"}`}/>
                      <span className={`font-sans text-base md:text-lg tracking-wide transition-colors ${isJewelry ? "text-slate-300 group-hover:text-white" : "text-[#3B2F2F]/75 group-hover:text-[#3B2F2F]"}`}>
                        {term}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Collections grid */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-3.5 h-3.5 ${isJewelry ? "text-[#CBA153]" : "text-[#B8860B]"}`}>
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  <h3 className={`font-royal uppercase tracking-widest text-[10px] font-bold ${dim}`}>Collections</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {displayCollections().map((col: any) => (
                    <div key={col.id} className="group relative aspect-[4/3] overflow-hidden cursor-pointer rounded-sm"
                      onClick={() => handleTrendingClick(col.title)}>
                      <img src={col.image} alt={col.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
                      <span className="absolute bottom-3 left-3 right-3 text-white font-royal text-[10px] tracking-widest uppercase">{col.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS: grouped ── */}
          {query && hasAny && (
            <div className="flex flex-col gap-10">

              {/* Clothing */}
              {clothResults.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-4 h-4 ${dim}`}>
                      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
                    </svg>
                    <h3 className={`font-royal uppercase tracking-widest text-[11px] ${dim}`}>Clothing</h3>
                    <span className={`text-[9px] font-sans opacity-40 ${isJewelry ? "text-slate-400" : "text-[#3B2F2F]"}`}>{clothResults.length} results</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
                    {clothResults.map((p) => (
                      <Link href={`/product/${p.id}`} key={p.id}
                        onClick={() => { recordSearch(query, false); handleClose(); }}
                        className="group flex flex-col">
                        <div className="aspect-[3/4] overflow-hidden mb-3 rounded-sm">
                          <img src={p.imageSrc} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"/>
                        </div>
                        <span className={`font-sans text-[9px] uppercase tracking-[0.2em] mb-1 ${isJewelry ? "text-[#CBA153]" : "text-[#B8860B]"}`}>{p.category}</span>
                        <h4 className={`font-royal text-sm leading-snug mb-1 ${text}`}>{p.title}</h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              {clothResults.length > 0 && jewelResults.length > 0 && (
                <div className="flex items-center gap-4 opacity-30">
                  <div className="flex-1 h-[1px] bg-[#CBA153]"/>
                  <span className="font-royal text-[9px] tracking-widest text-[#CBA153] uppercase shrink-0">Also in Jewellery</span>
                  <div className="flex-1 h-[1px] bg-[#CBA153]"/>
                </div>
              )}

              {/* Jewellery */}
              {jewelResults.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#CBA153]">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <h3 className="font-royal uppercase tracking-widest text-[11px] text-[#CBA153]">Jewellery</h3>
                    <span className={`text-[9px] font-sans opacity-40 ${isJewelry ? "text-slate-400" : "text-[#3B2F2F]"}`}>{jewelResults.length} results</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
                    {jewelResults.map((p) => (
                      <Link href={`/product/${p.id}`} key={p.id}
                        onClick={() => { recordSearch(query, true); handleClose(); }}
                        className="group flex flex-col">
                        <div className="aspect-[3/4] overflow-hidden mb-3 rounded-sm relative">
                          <img src={p.imageSrc} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"/>
                          <div className="absolute inset-0 bg-gradient-to-b from-[#CBA153]/5 to-transparent pointer-events-none"/>
                        </div>
                        <span className="font-sans text-[9px] uppercase tracking-[0.2em] mb-1 text-[#CBA153]">{p.category}</span>
                        <h4 className={`font-royal text-sm leading-snug mb-1 ${text}`}>{p.title}</h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── NO RESULTS ── */}
          {query && !hasAny && (
            <div className="flex flex-col h-full overflow-y-auto pb-20">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className={`font-painter text-5xl mb-4 ${isJewelry ? "text-slate-700" : "text-[#3B2F2F]/20"}`}>We couldn't find exactly that.</span>
                <p className={`font-sans text-xs uppercase tracking-widest mb-6 ${dim}`}>But you might love these signature pieces</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
                {displaySignatures().map((p: any) => (
                  <Link href={`/product/${p.id}`} key={p.id}
                    onClick={() => { handleClose(); }}
                    className="group flex flex-col">
                    <div className="aspect-[3/4] overflow-hidden mb-3 rounded-sm relative">
                      <img src={p.imageSrc} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"/>
                      {p.type === 'jewelry' && <div className="absolute inset-0 bg-gradient-to-b from-[#CBA153]/5 to-transparent pointer-events-none"/>}
                    </div>
                    <span className={`font-sans text-[9px] uppercase tracking-[0.2em] mb-1 ${p.type === 'jewelry' ? "text-[#CBA153]" : "text-[#B8860B]"}`}>{p.category}</span>
                    <h4 className={`font-royal text-sm leading-snug mb-1 ${text}`}>{p.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  );
}
