'use client';
import React from 'react';
import Image from 'next/image';
import { useStore } from '@/store/useStore';

const CLOTHING_CATEGORIES = [
  { id: '1', title: 'Simple Suits', image: '/categories/simple_suit.jpg' },
  { id: '2', title: 'Party Wear Suits', image: '/categories/party_wear.jpg' },
  { id: '3', title: 'Kurtis', image: '/categories/kurti.jpg' },
];

const JEWELRY_CATEGORIES = [
  { id: 'j1', title: 'Polki Sets', image: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j2', title: 'Diamond Chokers', image: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'j3', title: 'Temple Jewelry', image: 'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

export default function CollectionHeader() {
  const isJewelry = useStore((state) => state.isJewelry);
  const activeClothingCategory = useStore((state) => state.activeClothingCategory);
  const activeJewelryCategory = useStore((state) => state.activeJewelryCategory);
  
  const categories = isJewelry ? JEWELRY_CATEGORIES : CLOTHING_CATEGORIES;
  const activeCategory = isJewelry ? activeJewelryCategory : activeClothingCategory;
  
  const handleCategoryClick = (title: string) => {
    const isThisActive = activeCategory === title;
    const newValue = isThisActive ? 'All' : title;
    
    if (isJewelry) {
      useStore.getState().setActiveJewelryCategory(newValue);
    } else {
      useStore.getState().setActiveClothingCategory(newValue);
    }
  };

  const handleClear = () => {
    if (isJewelry) {
      useStore.getState().setActiveJewelryCategory('All');
    } else {
      useStore.getState().setActiveClothingCategory('All');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full pt-6 pb-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
      {/* Category Heading (Replacing Suit) */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <div className={`h-[1px] w-12 ${isJewelry ? 'bg-slate-700' : 'bg-[#E0A29C]/40'}`}></div>
        <h2 className={`font-painter text-3xl md:text-4xl ${isJewelry ? 'text-slate-200' : 'text-[#603D3D]'}`}>
          {isJewelry ? 'Jewels' : 'Suit'}
        </h2>
        <div className={`h-[1px] w-12 ${isJewelry ? 'bg-slate-700' : 'bg-[#E0A29C]/40'}`}></div>
      </div>

      <div className="flex justify-center gap-6 sm:gap-12 px-4 sm:px-8">
        {categories.map((category) => {
          const isThisActive = activeCategory === category.title;
          return (
            <div 
              key={category.id} 
              onClick={() => handleCategoryClick(category.title)}
              className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className={`relative rounded-full p-[2px] transition-all duration-500 w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] ${
                isThisActive 
                  ? isJewelry ? 'bg-gradient-to-tr from-[#CBA153] to-white scale-110 shadow-[0_0_15px_rgba(203,161,83,0.3)]' : 'bg-gradient-to-tr from-[#3B2F2F] to-[#1A1A1A] scale-110 shadow-md' 
                  : isJewelry ? 'bg-gradient-to-tr from-slate-700 to-slate-600 group-hover:scale-105' : 'bg-gradient-to-tr from-[#E0A29C]/30 to-[#E0A29C]/80 group-hover:scale-105'
              }`}>
                <div className={`w-full h-full rounded-full border flex items-center justify-center overflow-hidden relative ${isJewelry ? 'bg-[#050102] border-slate-800' : 'bg-[#F9F6F0] border-white'}`}>
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 ${isJewelry ? 'bg-white/5' : 'bg-[#E0A29C]/5'}`}></div>
                  <Image 
                    src={category.image}
                    alt={category.title}
                    fill
                    className={`object-cover transform transition-transform duration-700 ${isThisActive ? 'scale-110' : 'group-hover:scale-110'} ${isJewelry && !isThisActive ? 'grayscale-[0.5]' : ''}`}
                    sizes="60px"
                  />
                </div>
              </div>
              <span className={`font-royal uppercase tracking-[0.25em] text-[7px] sm:text-[8px] font-bold transition-colors duration-300 ${
                isThisActive 
                  ? 'text-[#CBA153]' 
                  : isJewelry ? 'text-slate-400 group-hover:text-slate-200' : 'text-[#3B2F2F]/70 group-hover:text-[#3B2F2F]'
              }`}>
                {category.title}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Subtle Clear Filter Button */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        activeCategory !== 'All' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        <button 
          onClick={handleClear}
          className={`px-4 py-1 rounded-b-lg text-[7px] uppercase tracking-[0.2em] font-sans transition-colors shadow-sm ${
            isJewelry 
              ? 'bg-[#1A1A1A] text-slate-300 hover:bg-[#CBA153] hover:text-black' 
              : 'bg-[#1A1A1A] text-[#F9F6F0] hover:bg-[#CBA153] hover:text-[#1A1A1A]'
          }`}
        >
          View All
        </button>
      </div>
    </div>
  );
}
