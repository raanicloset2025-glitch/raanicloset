'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import WishlistIcon from '@/components/navbar/WishlistIcon';
import HexagonPatchworkBag from '@/components/HexagonPatchworkBag';

export default function PDPMasthead() {
  const router = useRouter();
  const setIsTransitioning = useStore((state) => state.setIsTransitioning);
  const openCart = useStore((state) => state.openCart);
  const cartItems = useStore((state) => state.cartItems);
  const isJewelry = useStore((state) => state.isJewelry);
  const setSearchModalOpen = useStore((state) => state.setSearchModalOpen);
  const [cartPulse, setCartPulse] = useState(false);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
      router.back();
    }, 1000);
  };

  const textClass = isJewelry ? "text-slate-400 hover:text-white" : "text-[#1A1A1A]/70 hover:text-[#CBA153]";

  return (
    <nav className="absolute top-0 w-full grid grid-cols-3 items-center px-6 md:px-16 py-8 z-50">
      <div className="flex justify-start">
        <button onClick={handleBack} className={`font-sans text-xs tracking-[0.3em] uppercase ${textClass} transition-colors bg-transparent border-none cursor-pointer`}>
          &#8592; Back to Shop
        </button>
      </div>
      <div className="flex justify-center">
        <span className="font-painter text-3xl md:text-4xl text-[#CBA153] tracking-wide drop-shadow-sm">
          Raani Closet
        </span>
      </div>
      <div className="flex justify-end items-center gap-6">
        <button onClick={() => setSearchModalOpen(true)} className={`${textClass} transition-colors hover:scale-110 active:scale-95 duration-300`} aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
        
        <div className={`${textClass} transition-colors relative flex items-center justify-center`}>
          <WishlistIcon isJewelry={isJewelry} />
        </div>
        
        <div className={`${textClass} transition-colors relative flex items-center justify-center -ml-2`}>
          <HexagonPatchworkBag 
            isJewelry={isJewelry} 
            onClick={() => {
              setCartPulse(true);
              setTimeout(() => setCartPulse(false), 300);
              openCart();
            }} 
            cartPulse={cartPulse}
            cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          />
        </div>
      </div>
    </nav>
  );
}
