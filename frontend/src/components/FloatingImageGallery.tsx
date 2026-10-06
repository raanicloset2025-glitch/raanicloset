'use client';

import React, { useState } from 'react';
import PDPWishlistButton from './PDPWishlistButton';

export default function FloatingImageGallery({ product }: { product: any }) {
  const images = product.images && product.images.length >= 3
    ? product.images.slice(0, 3)
    : [product.imageSrc, product.imageSrc, product.imageSrc];

  const [slots, setSlots] = useState(['center', 'left', 'right']);

  const handleImageClick = (clickedSlot: string, imageIndex: number) => {
    if (clickedSlot === 'center') return;
    const newSlots = [...slots];
    const currentCenterImageIndex = slots.indexOf('center');
    newSlots[currentCenterImageIndex] = clickedSlot;
    newSlots[imageIndex] = 'center';
    setSlots(newSlots);
  };

  // 3D Glassmorphic Desktop Classes
  const getDesktopSlotClasses = (slot: string) => {
    switch (slot) {
      case 'center':
        return 'left-[110px] top-0 w-[280px] h-[480px] z-30 shadow-[0_30px_60px_rgba(203,161,83,0.25)] scale-100 rounded-2xl';
      case 'left':
        return 'left-0 top-[60px] w-[200px] h-[280px] z-10 shadow-[0_20px_50px_rgba(203,161,83,0.15)] scale-95 cursor-pointer hover:-translate-y-3 hover:shadow-[0_40px_70px_rgba(203,161,83,0.25)] rounded-2xl';
      case 'right':
        return 'left-[320px] top-[240px] w-[180px] h-[240px] z-10 shadow-[0_20px_50px_rgba(203,161,83,0.15)] scale-95 cursor-pointer hover:-translate-y-3 hover:shadow-[0_40px_70px_rgba(203,161,83,0.25)] rounded-2xl';
      default: return '';
    }
  };

  // 3D Glassmorphic Mobile Classes
  const getMobileSlotClasses = (slot: string) => {
    switch (slot) {
      case 'center':
        return 'left-[66px] top-0 w-[168px] h-[288px] z-30 shadow-[0_20px_40px_rgba(203,161,83,0.25)] scale-100 rounded-xl';
      case 'left':
        return 'left-0 top-[36px] w-[120px] h-[168px] z-10 shadow-[0_12px_30px_rgba(203,161,83,0.15)] scale-95 cursor-pointer hover:-translate-y-1 rounded-xl';
      case 'right':
        return 'left-[192px] top-[144px] w-[108px] h-[144px] z-10 shadow-[0_12px_30px_rgba(203,161,83,0.15)] scale-95 cursor-pointer hover:-translate-y-1 rounded-xl';
      default: return '';
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center h-[340px] md:h-[500px] lg:h-[650px]">

      {/* Mobile: 3-image floating gallery */}
      <div className="block lg:hidden relative w-[310px] h-[320px]">
        {images.map((imgSrc: string, i: number) => {
          const currentSlot = slots[i];
          const isCenter = currentSlot === 'center';
          return (
            <div
              key={i}
              onClick={() => handleImageClick(currentSlot, i)}
              className={`absolute border border-white/60 bg-white/40 backdrop-blur-md overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${getMobileSlotClasses(currentSlot)}`}
            >
              {/* Frosted Glass Overlay for non-center items instead of black mask */}
              <div className={`absolute inset-0 bg-white/30 backdrop-blur-[2px] transition-all duration-[800ms] z-10 pointer-events-none ${isCenter ? 'opacity-0 backdrop-blur-none' : 'opacity-100'}`} />
              <img
                src={imgSrc}
                alt={`Product View ${i + 1}`}
                className={`w-full h-full object-cover transition-transform duration-[800ms] ${isCenter ? 'brightness-105 contrast-105' : 'brightness-90'} ${
                  i === 1 ? 'object-[center_15%] scale-[1.3]' :
                  i === 2 ? 'object-[center_80%] scale-[1.5]' :
                  'object-top'
                }`}
              />
              {isCenter && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                  <div className="pointer-events-auto">
                    <PDPWishlistButton id={product.id} title={product.title} price={product.price} imageSrc={product.imageSrc} category={product.category} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: Interactive Swapping Gallery */}
      <div className="hidden lg:block relative w-[500px] h-[600px] perspective-[1200px]">
        {images.map((imgSrc: string, i: number) => {
          const currentSlot = slots[i];
          const isCenter = currentSlot === 'center';
          return (
            <div
              key={i}
              onClick={() => handleImageClick(currentSlot, i)}
              className={`absolute border border-white/60 bg-white/40 backdrop-blur-md overflow-hidden transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${getDesktopSlotClasses(currentSlot)}`}
            >
              {/* Frosted Glass Wash instead of harsh black shadow */}
              <div className={`absolute inset-0 bg-white/30 backdrop-blur-[2px] transition-all duration-[800ms] z-10 pointer-events-none ${isCenter ? 'opacity-0 backdrop-blur-none' : 'opacity-100'}`} />
              <img
                src={imgSrc}
                alt={`Product Gallery View ${i + 1}`}
                className={`w-full h-full object-cover transition-transform duration-[800ms] ${isCenter ? 'brightness-105 contrast-105' : 'brightness-90'} ${
                  i === 1 ? 'object-[center_15%] scale-[1.3]' :
                  i === 2 ? 'object-[center_80%] scale-[1.5]' :
                  'object-top hover:scale-105'
                }`}
              />
              {isCenter && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                  <div className="pointer-events-auto">
                    <PDPWishlistButton id={product.id} title={product.title} price={product.price} imageSrc={product.imageSrc} category={product.category} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Floating Gold Dust Particles */}
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-[#CBA153] rounded-full blur-[1px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-[#CBA153]/60 rounded-full blur-[2px] animate-pulse delay-700 pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-1.5 h-1.5 bg-[#CBA153]/80 rounded-full blur-[1px] animate-pulse delay-1000 pointer-events-none" />
      </div>
    </div>
  );
}
