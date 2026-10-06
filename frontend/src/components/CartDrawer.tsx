'use client';

import React, { useState, useEffect } from "react";
import { useStore, CartItem } from "@/store/useStore";
import { useAdminStore } from "@/store/useAdminStore";
import { QRCodeSVG } from "qrcode.react";
import { X, ArrowRight, ScanLine, Bookmark } from "lucide-react";

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, isJewelry } = useStore();
  const whatsappNumber = useAdminStore((state: any) => state.whatsappNumber) || "919876543210";
  const askStylistText = useAdminStore((state: any) => state.askStylistText) || "Ask Stylist on WhatsApp";
  const instagramUrl = useAdminStore((state: any) => state.instagramUrl);
  const [activeTab, setActiveTab] = useState<"ALL" | "CLOTHING" | "JEWELRY">("ALL");
  
  // New States for State Morphing and Grand Transition
  const [isShowingQR, setIsShowingQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    // Reset QR state when cart is closed
    if (!isCartOpen) {
      setTimeout(() => setIsShowingQR(false), 500);
    }
  }, [isCartOpen]);

  const filteredItems = cartItems.filter(item => {
    if (activeTab === "ALL") return true;
    if (activeTab === "CLOTHING") return item.category === "Clothing";
    if (activeTab === "JEWELRY") return item.category === "Jewelry";
    return true;
  });

  // Build WhatsApp direct link with all reserved items
  const buildWhatsAppUrl = (useWeb: boolean) => {
    const itemList = cartItems.map(item =>
      `- *${item.title}* | Qty: ${item.quantity}`
    ).join('\n');
    const message = [
      `*Private Consultation Request*`,
      ``,
      `Greetings Raani Closet Atelier,`,
      `I would like to speak with a stylist regarding my reserved pieces:`,
      ``,
      itemList,
      ``,
      `Please assist me with details and availability.`
    ].join('\n');
    const phone = whatsappNumber.replace(/\D/g, "");
    const text = encodeURIComponent(message);
    
    return useWeb 
      ? `https://web.whatsapp.com/send?phone=${phone}&text=${text}`
      : `https://wa.me/${phone}?text=${text}`;
  };

  const handleAskStylist = () => {
    if (isMobile) {
      window.open(buildWhatsAppUrl(false), '_blank');
      closeCart();
    } else {
      setIsShowingQR(true); // Morph the cart!
    }
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
      <div className={`fixed inset-0 z-[100] flex justify-end transition-all duration-700 ${
        isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none delay-700'
      }`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-700 ${
            isCartOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeCart}
        />

        {/* Drawer */}
        <div
          className={`relative w-full md:w-[450px] ${isJewelry ? 'bg-[#050102]' : 'bg-[#F9F6F0]'} h-full shadow-[-20px_0_40px_rgba(0,0,0,0.15)] flex flex-col transform-gpu transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ borderLeft: "1px solid rgba(203,161,83,0.2)" }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-8 py-6 border-b ${isJewelry ? 'border-white/10' : 'border-[#1A1A1A]/10'} relative z-10 transition-colors`}>
            <h2 className="flex items-center gap-2">
              <span className={`font-royal text-xl ${isJewelry ? 'text-[#F9F6F0]' : 'text-[#1A1A1A]'}`}>Your</span>
              <span className="font-painter text-4xl text-[#CBA153]" style={{ lineHeight: '1' }}>Atelier</span>
            </h2>
            <button onClick={closeCart} className={`${isJewelry ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-black/5'} transition-colors p-2 rounded-full`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Morphing Area: Items OR QR Code */}
          <div className="flex-1 relative overflow-hidden">
            
            {/* View 1: Standard Cart Items */}
            <div className={`absolute inset-0 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isShowingQR ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
            }`}>
              {/* Tabs */}
              <div className={`flex px-8 border-b ${isJewelry ? 'border-white/5' : 'border-[#1A1A1A]/5'}`}>
                {(["ALL", "CLOTHING", "JEWELRY"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-[9px] tracking-[0.25em] uppercase transition-colors relative ${
                      activeTab === tab ? (isJewelry ? "text-[#F9F6F0] font-bold" : "text-[#1A1A1A] font-bold") : (isJewelry ? "text-white/40 hover:text-white/70" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70")
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#CBA153]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Reserved Items List */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <p className={`font-painter text-4xl ${isJewelry ? 'text-white/30' : 'text-[#1A1A1A]/30'}`}>
                      Empty
                    </p>
                    <p className={`font-sans text-[9px] tracking-[0.3em] uppercase ${isJewelry ? 'text-white/40' : 'text-[#1A1A1A]/40'}`}>
                      Your curation awaits.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex gap-5 group"
                      style={{ animationDelay: `${(index * 150) + 200}ms` }}
                    >
                      <div className={`relative w-24 h-32 flex-shrink-0 ${isJewelry ? 'bg-[#1a0e14]' : 'bg-[#E8E0D0]'} overflow-hidden`}>
                        <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className={`font-serif text-lg ${isJewelry ? 'text-[#F9F6F0]' : 'text-[#1A1A1A]'} pr-4 leading-tight`}>{item.title}</h3>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className={`${isJewelry ? 'text-white/30' : 'text-[#1A1A1A]/30'} hover:text-[#CBA153] transition-colors`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className={`font-sans text-[9px] tracking-[0.25em] uppercase ${isJewelry ? 'text-white/40' : 'text-[#1A1A1A]/40'} mt-2`}>{item.category}</p>
                        </div>
                        <p className={`font-sans text-[10px] tracking-widest ${isJewelry ? 'text-white/60' : 'text-[#1A1A1A]/60'}`}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* View 2: WhatsApp QR Code Portal */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${isJewelry ? 'bg-[#050102]' : 'bg-[#F9F6F0]'} transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              !isShowingQR ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
            }`}>
              <button 
                onClick={() => setIsShowingQR(false)}
                className={`absolute top-4 left-6 ${isJewelry ? 'text-white/50' : 'text-[#1A1A1A]/50'} hover:text-[#CBA153] transition-colors flex items-center gap-2 font-sans text-[9px] uppercase tracking-[0.2em]`}
              >
                <ArrowRight className="w-3 h-3 rotate-180" /> Back to List
              </button>
              
              <div className="relative p-6 bg-white shadow-[0_10px_40px_rgba(203,161,83,0.15)] mb-8 group rounded-xl">
                <div className="absolute inset-0 border border-[#CBA153]/30 m-2 pointer-events-none rounded-xl"></div>
                <QRCodeSVG 
                  value={buildWhatsAppUrl(false)} 
                  size={180}
                  level="H"
                  fgColor="#1A1A1A"
                />
                {/* Scan Line Animation */}
                <div className="absolute top-4 left-4 right-4 h-[2px] bg-[#CBA153]/50 shadow-[0_0_10px_#CBA153] animate-scan opacity-0 group-hover:opacity-100"></div>
              </div>

              <style>{`
                @keyframes scan {
                  0% { transform: translateY(0); }
                  50% { transform: translateY(180px); }
                  100% { transform: translateY(0); }
                }
                .animate-scan {
                  animation: scan 3s ease-in-out infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                  width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: ${isJewelry ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
                  border-radius: 4px;
                }
              `}</style>

              <h3 className={`font-royal text-2xl ${isJewelry ? 'text-[#F9F6F0]' : 'text-[#1A1A1A]'} mb-3 flex items-center gap-2`}>
                <ScanLine className="w-5 h-5 text-[#CBA153]" />
                Scan to Connect
              </h3>
              <p className={`${isJewelry ? 'text-white/60' : 'text-[#3B2F2F]/60'} font-sans text-[11px] max-w-[280px] leading-relaxed text-center mb-8`}>
                Open your phone camera to scan this code. You will be connected instantly to your personal stylist.
              </p>

              <div className="flex items-center gap-4 w-full px-8 mb-6">
                <div className={`flex-1 h-px ${isJewelry ? 'bg-white/10' : 'bg-[#3B2F2F]/10'}`}></div>
                <span className={`${isJewelry ? 'text-white/40' : 'text-[#3B2F2F]/40'} font-sans text-[9px] tracking-widest uppercase`}>Or</span>
                <div className={`flex-1 h-px ${isJewelry ? 'bg-white/10' : 'bg-[#3B2F2F]/10'}`}></div>
              </div>

              <a 
                href={buildWhatsAppUrl(true)} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full py-4 border ${isJewelry ? 'border-white/20 text-[#F9F6F0] hover:bg-white hover:text-[#050102]' : 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F9F6F0]'} font-sans text-[10px] tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 group`}
              >
                Open WhatsApp Web
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

          </div>

          {/* Footer - Checkout Options */}
          <div className={`p-8 ${isJewelry ? 'bg-[#050102] border-white/5' : 'bg-[#F9F6F0] border-[#1A1A1A]/5'} border-t transition-transform duration-500 ${isShowingQR ? 'translate-y-full absolute opacity-0' : 'translate-y-0 relative opacity-100'}`}>
            <div className="flex gap-3">
              <button
                onClick={handleAskStylist}
                disabled={filteredItems.length === 0}
                className={`flex-1 py-4 ${isJewelry ? 'bg-[#F9F6F0] text-[#050102]' : 'bg-[#1A1A1A] text-[#F9F6F0]'} font-sans text-[10px] tracking-[0.1em] uppercase hover:bg-[#D5B06D] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D5B06D]/10`}
              >
                {askStylistText}
              </button>
              <button
                onClick={handleInstagramClick}
                disabled={filteredItems.length === 0}
                className="flex-1 py-4 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-90 text-white font-sans text-[10px] tracking-[0.1em] uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#bc1888]/10"
              >
                Instagram DM
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
