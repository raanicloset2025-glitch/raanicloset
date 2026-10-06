'use client';
import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import Link from 'next/link';

export default function ProductGrid({ isHomePage = false }: { isHomePage?: boolean }) {
  const isJewelry = useStore((state) => state.isJewelry);
  const activeClothingCategory = useStore((state) => state.activeClothingCategory);
  const activeJewelryCategory = useStore((state) => state.activeJewelryCategory);
  const allStoreProducts = useAdminStore((state) => state.products);

  const activeCategory = isJewelry ? activeJewelryCategory : activeClothingCategory;

  // On the homepage: always show the 4 most recently starred products (Signature Collection)
  // On collection pages: filter by type + active category
  const filteredProducts = useMemo(() => {
    const typeProducts = allStoreProducts.filter((p) => p.type === (isJewelry ? 'jewelry' : 'clothing'));
    
    if (isHomePage) {
      if (activeCategory === 'All') {
        const starred = allStoreProducts
          .filter((p) => p.isStarred && p.type === (isJewelry ? 'jewelry' : 'clothing'))
          .sort((a, b) => (b.starredAt ?? 0) - (a.starredAt ?? 0));
          
        return starred.slice(0, 4);
      } else {
        // Category clicked on homepage: show products featured for THIS category (max 4)
        const categoryProducts = typeProducts.filter((p) => p.category === activeCategory);
        const featuredInCategory = categoryProducts
          .filter((p) => p.isCategoryFeatured)
          .sort((a, b) => (a.categoryFeaturedAt ?? 0) - (b.categoryFeaturedAt ?? 0));

        return (featuredInCategory.length > 0 ? featuredInCategory : categoryProducts).slice(0, 4);
      }
    }
    
    // Collection pages
    if (activeCategory === 'All') return typeProducts;
    return typeProducts.filter((p) => p.category === activeCategory);
  }, [allStoreProducts, isHomePage, isJewelry, activeCategory]);




  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[800px]">
      <div className="flex flex-col items-center mb-10">
        <h2 className={`text-2xl md:text-3xl font-serif tracking-tight mb-2 ${isJewelry ? 'text-slate-200' : 'text-[#1A1A1A]'}`}>
          {isHomePage 
            ? (activeCategory === "All" ? 'Signature Collection' : activeCategory) 
            : (activeCategory === "All" ? "All Products" : activeCategory)}
        </h2>
        <div className={`w-12 h-[1px] mb-4 ${isJewelry ? 'bg-[#CBA153]' : 'bg-[#CBA153]'}`}></div>
        
        {/* AI UX Architecture: Explicit Clear Filter Affordance */}
        {activeCategory !== "All" && (
          <button 
            onClick={() => isJewelry ? useStore.getState().setActiveJewelryCategory('All') : useStore.getState().setActiveClothingCategory('All')}
            className={`text-xs font-sans tracking-[0.15em] uppercase transition-colors border-b pb-0.5 ${
              isJewelry 
                ? 'text-slate-400 hover:text-slate-200 border-slate-700 hover:border-slate-400' 
                : 'text-[#603D3D] hover:text-[#2A1E1E] border-[#603D3D]/30 hover:border-[#2A1E1E]'
            }`}
          >
            &times; View Signature Collection
          </button>
        )}
      </div>
      
      {/* Product Grid with simple fade animation */}
      {filteredProducts.length > 0 ? (
        <div 
          key={activeCategory} 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              category={product.category}
              imageSrc={product.imageSrc}
              sizes={[{ id: 's1', label: 'M', price: 0, stock: 1 }]}
            />
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center py-20 text-center opacity-60">
          <p className="font-serif text-lg tracking-wide mb-2">Curating Masterpieces</p>
          <p className="font-sans text-xs tracking-[0.1em] uppercase">No signature items featured at the moment.</p>
        </div>
      )}

      {/* --- EXQUISITE 'EXPLORE COLLECTION' BUTTONS --- */}
      {isHomePage && (
        <div className="mt-20 flex justify-center w-full pb-8">
          {isJewelry ? (
            /* JEWELRY BUTTON: Soft Ivory Neumorphic with 3D Latkan Image */
            <Link 
              href="/collection" 
              className="group relative flex items-center gap-6 cursor-pointer py-4 px-8 rounded-2xl bg-[#FDFBF7] shadow-[2px_6px_20px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] border border-[#E8E2D5] transition-all duration-700 hover:shadow-[4px_10px_25px_rgba(203,161,83,0.15)] hover:-translate-y-1"
            >
              {/* Photorealistic 3D Latkan Icon */}
              <div className="relative w-12 h-12 flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700 origin-top mix-blend-multiply">
                <img 
                  src="/icons/icon_latkan.jpg" 
                  alt="High Jewels" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Stacked Serif Text */}
              <div className="flex flex-col text-left">
                <span className="font-serif text-[13px] md:text-[15px] uppercase tracking-[0.2em] text-[#1A1A1A] leading-tight group-hover:text-[#CBA153] transition-colors duration-500">
                  Explore Full
                </span>
                <span className="font-serif text-[13px] md:text-[15px] uppercase tracking-[0.2em] text-[#1A1A1A] leading-tight group-hover:text-[#CBA153] transition-colors duration-500">
                  Collection
                </span>
              </div>
            </Link>
          ) : (
            /* CLOTHING BUTTON: Champagne Gold with 3D Flowing Dupatta Image */
            <Link 
              href="/collection" 
              className="group relative flex items-center gap-6 cursor-pointer py-4 px-8 rounded-2xl bg-gradient-to-br from-[#E2D2B3] to-[#D4C3A3] shadow-[0_8px_20px_rgba(212,195,163,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#CBA153]/20 transition-all duration-700 hover:shadow-[0_12px_25px_rgba(212,195,163,0.5)] hover:-translate-y-1 overflow-hidden"
            >
              {/* Subtle shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] skew-x-12" />

              {/* Photorealistic 3D Flowing Dupatta Icon */}
              <div className="relative w-12 h-12 flex items-center justify-center transform group-hover:scale-110 group-hover:translate-x-1 transition-transform duration-700 z-10 mix-blend-multiply">
                <img 
                  src="/icons/icon_dupatta.jpg" 
                  alt="The Atelier" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Stacked Serif Text */}
              <div className="flex flex-col text-left z-10">
                <span className="font-serif text-[13px] md:text-[15px] uppercase tracking-[0.2em] text-[#4A3B2C] leading-tight">
                  Explore Full
                </span>
                <span className="font-serif text-[13px] md:text-[15px] uppercase tracking-[0.2em] text-[#4A3B2C] leading-tight">
                  Collection
                </span>
              </div>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
