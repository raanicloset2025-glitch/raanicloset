"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useAdminStore } from "@/store/useAdminStore";
import FloatingImageGallery from "@/components/FloatingImageGallery";
import PDPMasthead from "@/components/PDPMasthead";
import PDPWhatsAppButton from "@/components/PDPWhatsAppButton";
import PDPAddToCartButton from "@/components/PDPAddToCartButton";
import CuratedSlider from "@/components/CuratedSlider";
import LuxuryFooter from "@/components/LuxuryFooter";

export default function ProductDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isJewelry } = useStore();
  const { products, isEditMode, updateProduct } = useAdminStore();

  const isNew = id === "new";
  
  // Find product from store
  const product = products.find((p) => p.id === id);

  if (!mounted) {
    // Return a skeleton or dark screen for SSR/hydration to avoid mismatch
    return <div className="min-h-screen bg-[#080808]" />;
  }

  // Use a fallback template if 'new', otherwise use product
  const data = product ?? (isNew ? { 
    id: "new", 
    title: "New Product Title", 
    category: "New Category", 
    imageSrc: "/categories/simple_suit.jpg", 
    images: ["/categories/simple_suit.jpg"],
    description: "Enter product description here.", 
    type: isJewelry ? "jewelry" : "clothing",
    craftTitle: "The Craft",
    craftText: "Rooted in centuries of heritage...",
    craftSpecs: [
      { label: "Material", value: "Pure Chanderi / Silk" },
      { label: "Origin", value: "Woven in Madhya Pradesh" },
      { label: "Care", value: "Dry Clean Only" }
    ]
  } : null);

  if (!data) {
    return (
      <main className="min-h-screen bg-[#050102] flex items-center justify-center font-sans">
        <PDPMasthead />
        <div className="text-center text-amber-500 mt-32">
          <h1 className="text-4xl font-serif mb-4">Product Not Found</h1>
          <p className="text-white/60">The product you are looking for does not exist or has been removed.</p>
        </div>
      </main>
    );
  }

  const isJewelryProduct = data.type === "jewelry";
  const related = data.relatedProductIds && data.relatedProductIds.length > 0 
    ? data.relatedProductIds.map((rid: string) => products.find((p) => p.id === rid)).filter(Boolean)
    : products.filter((p) => p.id !== id && p.type === data.type).slice(0, 4);

  // Auto-save helper when in edit mode
  const handleChange = (key: string, value: any) => {
    if (isEditMode && !isNew) {
      updateProduct(data.id, { [key]: value });
    }
  };

  return (
    <main
      className={`min-h-screen overflow-x-hidden font-sans relative isolate transition-colors duration-1000 ${
        isJewelryProduct ? "bg-[#050102]" : "bg-[#FDFBF7]"
      }`}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle,_rgba(203,161,83,0.07)_0%,_transparent_70%)] pointer-events-none -z-10" />

      <PDPMasthead />

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-center pt-28 md:pt-32 pb-20 px-4 md:px-12 z-10 gap-12 lg:gap-20 max-w-[1600px] mx-auto">
        <div className="relative w-full lg:w-1/2 flex items-center justify-center z-20">
          <FloatingImageGallery 
            product={data} 
            
          />
        </div>

        <div className="relative w-full lg:w-1/2 max-w-xl z-30 flex flex-col items-center text-center lg:items-start lg:text-left mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-8 h-[1px] bg-[#B8860B]/60 hidden lg:block" />
            <span className="font-painter text-3xl md:text-4xl text-[#B8860B]">
              {isEditMode ? (
                <input 
                  value={data.category || ''} 
                  onChange={e => handleChange('category', e.target.value)}
                  className="bg-transparent border-b border-dashed border-[#B8860B]/50 outline-none text-center lg:text-left w-full"
                />
              ) : data.category}
            </span>
            <div className="w-8 h-[1px] bg-[#B8860B]/60 hidden lg:block" />
          </div>

          <span className={`mb-4 px-3 py-1 rounded-full text-[9px] font-sans uppercase tracking-widest border ${
            isJewelryProduct ? "border-[#CBA153]/40 text-[#CBA153]" : "border-[#3B2F2F]/20 text-[#3B2F2F]/60"
          }`}>
            {isJewelryProduct ? "Jewellery" : "Clothing"}
          </span>

          <h1 className={`font-royal text-4xl md:text-5xl lg:text-6xl tracking-[0.05em] uppercase mb-6 leading-tight ${
            isJewelryProduct ? "text-[#F9F6F0]" : "text-[#1A1A1A]"
          }`}>
            {isEditMode ? (
              <input 
                value={data.title || ''} 
                onChange={e => handleChange('title', e.target.value)}
                className="bg-transparent border-b border-dashed border-[#CBA153]/50 outline-none text-center lg:text-left w-full"
              />
            ) : data.title}
          </h1>

          <p className={`font-sans text-sm md:text-base leading-relaxed max-w-md font-light ${
            isJewelryProduct ? "text-slate-300" : "text-[#4A4A4A]"
          }`}>
            {isEditMode ? (
              <textarea 
                value={data.description || ''} 
                onChange={e => handleChange('description', e.target.value)}
                className="bg-transparent border border-dashed border-[#CBA153]/50 outline-none text-center lg:text-left w-full p-2 rounded-xl resize-none min-h-[100px]"
              />
            ) : data.description}
          </p>

          <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 flex-wrap">
            <PDPWhatsAppButton product={data} />
            <PDPAddToCartButton product={data} />
          </div>
        </div>
      </section>

      {/* Craft Section */}
      <section className="relative w-full flex items-center justify-center py-20 px-6 md:px-12 lg:px-24 z-10 max-w-[1600px] mx-auto">
        <div className="w-full flex flex-col lg:flex-row-reverse items-center justify-between gap-16 lg:gap-24">
          <div className="w-full lg:w-[50%] xl:w-[45%] relative group flex justify-center">
            <div className="relative aspect-[4/5] w-full max-w-[320px] xl:max-w-[380px] overflow-hidden shadow-xl rounded-sm border border-[#CBA153]/20">
              <img
                src={data.imageSrc}
                alt="Detail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]"
              />
              <div className={`absolute inset-0 bg-gradient-to-tr ${isJewelryProduct ? "from-[#050102]/60" : "from-[#FDFBF7]/60"} via-transparent to-transparent`} />
            </div>
            <p className={`absolute bottom-0 xl:bottom-6 left-6 xl:-left-6 font-sans text-[10px] tracking-[0.3em] uppercase ${isJewelryProduct ? "text-[#F9F6F0]" : "text-[#1A1A1A]"} -rotate-90 origin-bottom-left hidden xl:block`}>
              {isJewelryProduct ? "Master Crafted Detail" : "Hand-Loomed Texture"}
            </p>
          </div>

          <div className="w-full lg:w-[45%] flex flex-col items-start text-left">
            <h2 className="font-painter text-6xl md:text-8xl text-[#B8860B] mb-8 leading-tight">
              {isEditMode ? (
                <input 
                  value={data.craftTitle || "The Craft"} 
                  onChange={e => handleChange('craftTitle', e.target.value)}
                  className="bg-transparent border-b border-dashed border-[#CBA153]/50 outline-none w-full"
                />
              ) : (data.craftTitle || "The Craft")}
            </h2>
            <p className={`font-sans text-sm md:text-base leading-[2.2] mb-12 max-w-lg font-light ${isJewelryProduct ? "text-slate-300" : "text-[#4A4A4A]"}`}>
              {isEditMode ? (
                <textarea 
                  value={data.craftText || (isJewelryProduct ? "Each piece is an act of devotion..." : "Rooted in centuries of heritage...")} 
                  onChange={e => handleChange('craftText', e.target.value)}
                  className="bg-transparent border border-dashed border-[#CBA153]/50 outline-none w-full p-3 min-h-[120px] rounded-xl"
                />
              ) : (data.craftText || (isJewelryProduct
                ? "Each piece is an act of devotion. Our master craftsmen spend weeks perfecting the placement of each stone, preserving an art form that has graced the necks of queens."
                : "Rooted in centuries of heritage, every thread tells a story of dedication, carrying the weight of tradition and the lightness of modern elegance."))}
            </p>
            <div className="w-full max-w-md border-t border-[#CBA153]/30 pt-8 flex flex-col gap-6">
              {(data.craftSpecs || (isJewelryProduct
                ? [{ label: "Material", value: "22K Gold & Uncut Polki" }, { label: "Origin", value: "Handcrafted in Jaipur" }, { label: "Care", value: "Store in velvet pouch" }]
                : [{ label: "Material", value: "Pure Chanderi / Silk" }, { label: "Origin", value: "Woven in Madhya Pradesh" }, { label: "Care", value: "Dry Clean Only" }]
              )).map((spec, idx) => (
                <div key={idx} className="flex justify-between items-end border-b border-[#CBA153]/20 pb-4">
                  <span className="font-sans text-[10px] text-[#B8860B] tracking-[0.2em] uppercase">
                    {isEditMode ? (
                      <input 
                        value={spec.label || ''} 
                        onChange={e => {
                          const newSpecs = [...(data.craftSpecs || [])];
                          newSpecs[idx] = { ...newSpecs[idx], label: e.target.value };
                          handleChange('craftSpecs', newSpecs);
                        }}
                        className="bg-transparent border-b border-dashed border-[#B8860B]/50 outline-none w-24"
                      />
                    ) : spec.label}
                  </span>
                  <span className={`font-royal text-sm tracking-wider font-medium ${isJewelryProduct ? "text-[#F9F6F0]" : "text-[#1A1A1A]"}`}>
                    {isEditMode ? (
                      <input 
                        value={spec.value || ''} 
                        onChange={e => {
                          const newSpecs = [...(data.craftSpecs || [])];
                          newSpecs[idx] = { ...newSpecs[idx], value: e.target.value };
                          handleChange('craftSpecs', newSpecs);
                        }}
                        className="bg-transparent border-b border-dashed border-[#CBA153]/50 outline-none text-right"
                      />
                    ) : spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curated Slider */}
      {related.length > 0 && (
        <section className={`w-full py-20 ${isJewelryProduct ? "bg-[#050102]" : "bg-[#FDFBF7]"}`}>
          <div className="text-center mb-12">
            <h3 className="font-painter text-4xl text-[#B8860B]">Curated Pairings</h3>
          </div>
          <CuratedSlider items={related.map((p: any) => ({ ...p, price: 0 }))} />
        </section>
      )}

      {/* Footer */}
      <LuxuryFooter />
    </main>
  );
}
