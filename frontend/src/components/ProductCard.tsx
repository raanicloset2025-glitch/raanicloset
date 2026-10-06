'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { Heart, Plus, X, Bookmark, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';
import WhatsAppCheckoutModal from './WhatsAppCheckoutModal';

interface SizeOption {
  id: string;
  label: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface ProductCardProps {
  id: string;
  title: string;
  category: string;
  imageSrc: string;
  sizes: SizeOption[];
}

export default function ProductCard({ id, title, category, imageSrc, sizes }: ProductCardProps) {
  const router = useRouter();
  const setIsTransitioning = useStore((state) => state.setIsTransitioning);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const wishlistItems = useStore((state) => state.wishlistItems);
  const isWishlisted = wishlistItems.some(item => item.id === id);

  // Use the first available size automatically
  const defaultSize = sizes.find(s => s.stock > 0) || sizes[0];
  const reserveText = useAdminStore((state: any) => state.reserveText) || 'Reserve';
  const askStylistText = useAdminStore((state: any) => state.askStylistText) || 'Ask Stylist';

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        router.push(`/product/${id}`);
      }, 1000);
    });
  };

  return (
    <div className="group relative flex flex-col w-full bg-white/40 backdrop-blur-md rounded-2xl shadow-[0_15px_40px_rgba(203,161,83,0.08)] border border-white/60 font-sans cursor-pointer hover:shadow-[0_25px_50px_rgba(203,161,83,0.15)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1">

      {/* Image Vitrine */}
      <div onClick={handleNavigate} className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl block border-b border-white/40">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16, 1, 0.3, 1)] group-hover:scale-105"
          priority={false}
          loading="lazy"
        />
        
        {/* Inner Glaze */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Top-Right: Wishlist Heart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            startTransition(() => {
              const user = useStore.getState().user;
              if (!user) {
                useStore.getState().setAuthModalOpen(true);
                return;
              }
              useStore.getState().toggleWishlist({
                id,
                title,
                price: defaultSize?.price || 0,
                image: imageSrc,
                category: category.includes('Jewelry') ? 'Jewelry' : 'Clothing'
              });
            });
          }}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm transition-transform hover:scale-110 hover:bg-white/90 active:scale-95"
          aria-label={isWishlisted ? "Remove from Trousseau" : "Add to Trousseau"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? 'fill-[#CBA153] text-[#CBA153]' : 'text-[#3B2F2F]/60 group-hover:text-[#CBA153]'
            }`}
          />
        </button>

        {/* Bottom-Right: Floating Plus */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            startTransition(() => {
              setIsDrawerOpen(true);
            });
          }}
          className={`absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A1A]/80 backdrop-blur-md text-[#F9F6F0] shadow-md border border-[#1A1A1A]/40 transition-all duration-300 hover:bg-black hover:scale-110 active:scale-95 ${isDrawerOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
          aria-label="Quick Add"
        >
          <Plus className="h-5 w-5 stroke-[1.5] text-[#CBA153]" />
        </button>

        {/* Bottom Drawer ?" BAG + BUY */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-xl border-t border-white/60 px-4 pt-4 pb-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 ${
            isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Close button */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#3B2F2F]">
              {title}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startTransition(() => {
                  setIsDrawerOpen(false);
                });
              }}
              className="p-1 text-[#3B2F2F]/50 hover:text-[#3B2F2F] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startTransition(() => {
                  const user = useStore.getState().user;
                  if (!user) {
                    useStore.getState().setAuthModalOpen(true);
                    return;
                  }
                  useStore.getState().addToCart({
                    id,
                    title,
                    price: defaultSize?.price || 0,
                    image: imageSrc,
                    category: category.includes('Jewelry') ? 'Jewelry' : 'Clothing'
                  });
                  setIsDrawerOpen(false);
                });
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#1A1A1A]/20 bg-white/50 hover:bg-white text-[#1A1A1A] text-[9px] uppercase tracking-[0.15em] font-medium transition-all"
            >
              {reserveText}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startTransition(() => {
                  setIsCheckoutModalOpen(true);
                });
              }}
              className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 bg-[#1A1A1A] text-[#CBA153] text-[9px] uppercase tracking-[0.15em] font-medium transition-all hover:bg-black shadow-lg shadow-[#CBA153]/20 border border-[#CBA153]/20"
            >
              {askStylistText}
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Details */}
      <div onClick={handleNavigate} className="pt-4 pb-4 flex flex-col items-center text-center hover:opacity-80 transition-opacity rounded-b-2xl">
        <span className="text-[9px] uppercase tracking-[0.2em] text-[#CBA153] mb-1.5 font-medium">
          {category}
        </span>
        <h3 className="text-[14px] font-serif tracking-[0.02em] text-[#1A1A1A] line-clamp-1 px-3">
          {title}
        </h3>
      </div>

      {/* WhatsApp Modal */}
      {isCheckoutModalOpen && (
        <WhatsAppCheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          items={[{
            id,
            title,
            price: defaultSize?.price || 0,
            image: imageSrc,
            category: category.includes('Jewelry') ? 'Jewelry' : 'Clothing',
            quantity: 1
          }]}
          total={defaultSize?.price || 0}
          context="cart"
        />
      )}
    </div>
  );
}
