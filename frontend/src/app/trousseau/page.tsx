"use client";

import React, { useState } from "react";
import { useStore } from "@/store/useStore";
import { useAdminStore } from "@/store/useAdminStore";
import NavbarWrapper from "@/components/NavbarWrapper";
import LuxuryFooter from "@/components/LuxuryFooter";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Bookmark, ArrowLeft } from "lucide-react";

export default function TrousseauPage() {
  const router = useRouter();
  const { wishlistItems, toggleWishlist, addToCart, isJewelry } = useStore();
  const reserveText = useAdminStore((state: any) => state.reserveText) || 'Reserve';
  const [activeTab, setActiveTab] = useState<"ALL" | "CLOTHING" | "JEWELRY">("ALL");

  const filteredItems = wishlistItems.filter(item => {
    if (activeTab === "ALL") return true;
    if (activeTab === "CLOTHING") return item.category === "Clothing";
    if (activeTab === "JEWELRY") return item.category === "Jewelry";
    return true;
  });

  const buildWhatsAppUrl = () => {
    const itemList = wishlistItems.map(i => `- *${i.title}*`).join('\n');
    const message = [
      `*BESPOKE CONSULTATION REQUEST*`,
      ``,
      `Hello Raani Closet Atelier,`,
      `I would like to commission a custom look inspired by my curated Trousseau:`,
      ``,
      itemList,
      ``,
      `Please advise on customisation options.`
    ].join('\n');
    return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className={`min-h-screen flex flex-col ${isJewelry ? 'bg-[#050102] selection:text-[#F9F6F0]' : 'bg-[#F9F6F0] selection:text-[#1A0B16]'} selection:bg-[#E0A29C] transition-colors duration-1000`}>
      <NavbarWrapper />

      <section className="flex-grow w-full pt-[120px] pb-24 px-4 sm:px-8 md:px-16 max-w-[1600px] mx-auto flex flex-col">

        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className={`flex items-center gap-2 ${isJewelry ? 'text-white/50' : 'text-[#1A1A1A]/50'} hover:text-[#CBA153] transition-colors font-sans text-xs tracking-[0.2em] uppercase mb-10 group w-fit`}
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-[#CBA153] mb-2">
            Your Private Vault
          </span>
          <h1 className="flex flex-col md:flex-row items-center gap-3 mb-2">
            <span className={`font-royal text-3xl md:text-4xl ${isJewelry ? 'text-[#F9F6F0]' : 'text-[#1A1A1A]'}`}>The</span>
            <span className="font-painter text-7xl md:text-[7.5rem] text-[#CBA153] drop-shadow-md" style={{ lineHeight: '1.1' }}>
              Trousseau
            </span>
          </h1>
          <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#CBA153] to-transparent mb-8" />
          <p className={`font-serif italic text-lg md:text-xl ${isJewelry ? 'text-white/70' : 'text-[#1A1A1A]/70'} max-w-lg`}>
            Curated heirlooms and bespoke pieces saved for your celebrations.
          </p>
        </div>

        {/* Tabs */}
        {wishlistItems.length > 0 && (
          <div className="flex justify-center mb-12">
            <div className={`flex gap-12 border-b ${isJewelry ? 'border-white/10' : 'border-[#1A1A1A]/10'} px-8`}>
              {(["ALL", "CLOTHING", "JEWELRY"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-xs tracking-[0.2em] uppercase transition-colors relative ${
                    activeTab === tab ? (isJewelry ? "text-[#F9F6F0] font-medium" : "text-[#1A1A1A] font-medium") : (isJewelry ? "text-white/40 hover:text-white/70" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70")
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#CBA153]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid or Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow py-20 text-center">
            <div className={`w-24 h-24 mb-8 border ${isJewelry ? 'border-[#CBA153]/50 bg-white/5' : 'border-[#CBA153]/30 bg-white/50'} rounded-full flex items-center justify-center`}>
              <span className="font-royal text-[#CBA153] text-2xl">RC</span>
            </div>
            <h2 className={`text-2xl font-serif ${isJewelry ? 'text-[#F9F6F0]' : 'text-[#1A1A1A]'} mb-4`}>Your Trousseau Awaits Its First Masterpiece</h2>
            <p className={`${isJewelry ? 'text-white/50' : 'text-[#1A1A1A]/50'} font-sans text-sm max-w-md mx-auto mb-10 leading-relaxed`}>
              Curate your dream ensemble for private styling consultations. Save the artisan crafts you cherish.
            </p>
            <Link
              href="/"
              className={`inline-flex items-center gap-3 px-8 py-4 ${isJewelry ? 'bg-[#F9F6F0] text-[#050102] hover:bg-[#CBA153]' : 'bg-[#1A1A1A] text-[#F9F6F0] hover:bg-[#CBA153] hover:text-[#1A1A1A]'} transition-colors duration-500 font-sans text-xs tracking-[0.2em] uppercase`}
            >
              Explore Haute Couture
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filteredItems.map((item) => (
              <div key={item.id} className={`group relative flex flex-col w-full ${isJewelry ? 'bg-[#0A0505] border-white/5 shadow-black/50' : 'bg-[#FDFBF7] border-[#1A1A1A]/5 shadow-sm'} border transition-colors duration-500`}>

                {/* Image */}
                <div className={`relative aspect-[3/4] w-full overflow-hidden ${isJewelry ? 'bg-[#1a0e14]' : 'bg-[#F5F2EB]'}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  {/* Remove Button */}
                  <button
                    onClick={() => toggleWishlist(item)}
                    className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-sm transition-transform hover:scale-110 active:scale-95 text-[#1A1A1A]/50 hover:text-[#A31F2E]"
                    aria-label="Remove from Trousseau"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Info  NO price */}
                <div className="p-6 flex flex-col items-center text-center">
                  <span className={`text-[9px] uppercase tracking-[0.2em] ${isJewelry ? 'text-white/50' : 'text-[#3B2F2F]/50'} mb-2`}>
                    {item.category}
                  </span>
                  <h3 className={`text-sm font-serif tracking-wide ${isJewelry ? 'text-[#F9F6F0]' : 'text-[#1A1A1A]'} mb-5 line-clamp-1`}>
                    {item.title}
                  </h3>

                  {/* Reserve Button */}
                  <button
                    onClick={() => addToCart(item)}
                    className={`w-full flex items-center justify-center gap-2 py-3 border ${isJewelry ? 'border-white/30 text-[#F9F6F0] hover:bg-[#F9F6F0] hover:text-[#050102]' : 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F6F0]'} text-[10px] tracking-[0.2em] uppercase transition-colors group/btn`}
                  >
                    <Bookmark className="h-3.5 w-3.5 group-hover/btn:fill-current" />
                    {reserveText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WhatsApp Concierge Banner */}
        {wishlistItems.length > 0 && (
          <div className={`mt-24 p-12 ${isJewelry ? 'bg-[#0A0505] shadow-xl' : 'bg-[#1A1A1A]'} text-center border-t border-[#CBA153]/30`}>
            <h3 className="text-2xl font-serif text-[#F9F6F0] mb-4">Commission a Custom Look</h3>
            <p className="text-[#F9F6F0]/60 font-sans text-sm max-w-xl mx-auto mb-8">
              Love the embroidery of one piece but the silhouette of another? Send your curated Trousseau directly to our Master Stylists via WhatsApp for a bespoke consultation.
            </p>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#CBA153] hover:bg-[#DFB76C] text-[#0A0908] font-sans text-[11px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap border border-[#DFC07A]/50 shadow-[0_4px_20px_rgba(203,161,83,0.25)] hover:shadow-[0_6px_25px_rgba(203,161,83,0.4)] transition-all duration-300"
            >
              Consult Stylist on WhatsApp
            </a>
          </div>
        )}

      </section>

      <LuxuryFooter />
    </main>
  );
}
