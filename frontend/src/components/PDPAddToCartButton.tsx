'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import { Bookmark } from 'lucide-react';

export default function PDPAddToCartButton({ product }: { product: any }) {
  const addToCart = useStore((state) => state.addToCart);
  const user = useStore((state) => state.user);
  const setAuthModalOpen = useStore((state) => state.setAuthModalOpen);
  const reserveText = useAdminStore((state: any) => state.reserveText) || 'Reserve';
  const [clicked, setClicked] = useState(false);

  const handleReserve = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.imageSrc,
      category: product.category || 'Clothing',
    });
    setClicked(true);
    setTimeout(() => setClicked(false), 2000);
  };

  const isJewelry = useStore((state) => state.isJewelry);
  const isJewelryProduct = product.type === "jewelry" || isJewelry;

  return (
    <button
      onClick={handleReserve}
      className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 border ${
        clicked
          ? 'border-[#CBA153] text-[#CBA153] bg-[#CBA153]/10'
          : isJewelryProduct
          ? 'border-white/30 hover:border-white text-slate-300 hover:text-white hover:bg-white/5'
          : 'border-[#1A1A1A]/30 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
      } font-sans text-[11px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap active:scale-[0.98] transition-all duration-300 ease-out`}
    >
      <Bookmark className={`h-3.5 w-3.5 ${clicked ? 'fill-[#CBA153]' : ''}`} />
      <span>{clicked ? 'Reserved!' : reserveText}</span>
    </button>
  );
}
