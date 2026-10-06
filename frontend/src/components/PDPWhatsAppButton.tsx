'use client';

import React, { useState } from 'react';
import WhatsAppCheckoutModal from './WhatsAppCheckoutModal';
import { useAdminStore } from '@/store/useAdminStore';

export default function PDPWhatsAppButton({ product }: { product: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const askStylistText = useAdminStore((state: any) => state.askStylistText) || 'Ask Stylist on WhatsApp';
  const instagramUrl = useAdminStore((state: any) => state.instagramUrl);

  // We convert the product into a format that the modal accepts (an array of CartItems)
  const productAsItem = {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.imageSrc || product.images?.[0],
    category: product.category || 'Clothing',
    quantity: 1,
    size: 'Custom'
  };

  const handleInstagramClick = () => {
    if (instagramUrl) {
      const usernameMatch = instagramUrl.match(/(?:instagram\.com\/)([^/?#]+)/i);
      const username = usernameMatch ? usernameMatch[1] : '';
      if (username) {
        window.open(`https://ig.me/m/${username}`, '_blank');
      } else {
        window.open(instagramUrl, '_blank');
      }
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#CBA153] hover:bg-[#DFB76C] text-[#0A0908] font-sans text-[11px] font-semibold tracking-[0.1em] uppercase whitespace-nowrap border border-[#DFC07A]/50 shadow-[0_4px_20px_rgba(203,161,83,0.25)] hover:shadow-[0_6px_25px_rgba(203,161,83,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out"
        >
          <span>{askStylistText}</span>
        </button>
        <button 
          onClick={handleInstagramClick}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-90 text-white font-sans text-[11px] font-semibold tracking-[0.1em] uppercase whitespace-nowrap shadow-[0_4px_20px_rgba(188,24,136,0.25)] hover:shadow-[0_6px_25px_rgba(188,24,136,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out"
        >
          <span>Instagram DM</span>
        </button>
      </div>

      <WhatsAppCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        items={[productAsItem]}
        total={product.price}
        context="pdp"
      />
    </>
  );
}
