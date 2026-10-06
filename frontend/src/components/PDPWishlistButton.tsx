'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { Heart } from 'lucide-react';

export default function PDPWishlistButton({ 
  id, 
  title, 
  price, 
  imageSrc, 
  category 
}: { 
  id: string, 
  title: string, 
  price: number, 
  imageSrc: string, 
  category: string 
}) {
  const wishlistItems = useStore((state) => state.wishlistItems);
  const user = useStore((state) => state.user);
  const setAuthModalOpen = useStore((state) => state.setAuthModalOpen);
  const isWishlisted = wishlistItems.some(item => item.id === id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (!user) {
          setAuthModalOpen(true);
          return;
        }
        useStore.getState().toggleWishlist({
          id,
          title,
          price,
          image: imageSrc,
          category: category.includes('Jewelry') ? 'Jewelry' : 'Clothing'
        });
      }}
      className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/40 backdrop-blur-md border border-[#CBA153]/30 shadow-2xl transition-all duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/60 hover:scale-[1.05] active:scale-[0.92] group overflow-hidden"
      aria-label={isWishlisted ? 'Remove from Trousseau' : 'Add to Trousseau'}
    >
      <Heart
        className={`h-5 w-5 relative z-10 transition-all duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isWishlisted ? 'fill-[#CBA153] text-[#CBA153] drop-shadow-[0_0_8px_rgba(203,161,83,0.5)] scale-110' : 'text-[#CBA153] fill-transparent group-hover:fill-[#CBA153]/30'
        }`}
        strokeWidth={1.5}
      />
    </button>
  );
}
