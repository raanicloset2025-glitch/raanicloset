'use client';
import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CartItem, useStore } from "@/store/useStore";
import { useAdminStore } from "@/store/useAdminStore";
import Image from "next/image";
import { X, ArrowRight, ScanLine } from "lucide-react";

interface WhatsAppCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  context: "cart" | "pdp";
}

export default function WhatsAppCheckoutModal({ isOpen, onClose, items, total, context }: WhatsAppCheckoutModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const wishlistItems = useStore((state: any) => state.wishlistItems) || [];
  const cartItems = useStore((state: any) => state.cartItems) || [];

  const getFullUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path.startsWith('/') ? path : '/' + path}`;
    }
    return path;
  };

  const generateWhatsAppMessage = () => {
    let msg = `*Private Consultation Request*\n\nGreetings Raani Closet Atelier,\nI would like to speak with a stylist regarding:\n\n`;
    
    msg += `*Currently Viewing:*\n`;
    items.forEach(item => {
      msg += `- *${item.title}* | Qty: ${item.quantity}\n`;
      if (item.image) msg += `  Image: ${getFullUrl(item.image)}\n`;
    });

    if (wishlistItems.length > 0) {
      msg += `\n*Also in my Trousseau (Wishlist):*\n`;
      wishlistItems.forEach((item: any) => {
        msg += `- *${item.title}*\n`;
        if (item.image) msg += `  Image: ${getFullUrl(item.image)}\n`;
      });
    }

    // Include cart items if not already in context
    if (cartItems.length > 0 && context === 'pdp') {
      msg += `\n*Also in my Bag (Reserve):*\n`;
      cartItems.forEach((item: any) => {
        msg += `- *${item.title}* | Qty: ${item.quantity}\n`;
        if (item.image) msg += `  Image: ${getFullUrl(item.image)}\n`;
      });
    }

    msg += `\nPlease assist me with details and availability.`;
    return encodeURIComponent(msg);
  };

  const adminWhatsapp = useAdminStore((state: any) => state.whatsappNumber) || "919876543210";
  const instagramUrl = useAdminStore((state: any) => state.instagramUrl);

  const getWhatsAppUrl = (useWeb: boolean) => {
    const text = generateWhatsAppMessage();
    const phone = adminWhatsapp.replace(/\D/g, "");
    return useWeb 
      ? `https://web.whatsapp.com/send?phone=${phone}&text=${text}`
      : `https://wa.me/${phone}?text=${text}`;
  };

  const handleInstagramClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (instagramUrl) {
      const usernameMatch = instagramUrl.match(/(?:instagram\.com\/)([^/?#]+)/i);
      const username = usernameMatch ? usernameMatch[1] : '';
      if (username) {
        window.open(`https://ig.me/m/${username}`, '_blank');
      } else {
        window.open(instagramUrl, '_blank');
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  const mainItem = items[0];

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-in fade-in duration-700" 
        onClick={onClose} 
      />
      
      {/* SPA Drawer */}
      <div className="relative w-full max-w-[440px] h-full bg-[#F9F6F0] shadow-[-20px_0_40px_rgba(0,0,0,0.15)] flex flex-col transform-gpu animate-in slide-in-from-right duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <X className="w-4 h-4 text-[#1A1A1A]" />
        </button>

        {/* Top: Product Image Context */}
        <div className="relative w-full h-[45%] bg-[#EAEAEA]">
          {mainItem?.image ? (
             <Image 
               src={mainItem.image} 
               alt={mainItem.title} 
               fill 
               className="object-cover object-top"
             />
          ) : (
             <div className="w-full h-full bg-[#1A1A1A]" />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F6F0] via-[#F9F6F0]/20 to-black/30" />
          
          <div className="absolute bottom-6 left-8 right-8">
            <h2 className="font-serif text-3xl text-[#1A1A1A] mb-2 leading-tight">
              {mainItem?.title || "Bespoke Collection"}
            </h2>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#603D3D]">
              {items.length > 1 ? `+ ${items.length - 1} more items` : 'Private Consultation'}
            </p>
          </div>
        </div>

        {/* Bottom: QR & Web Connect */}
        <div className="flex-1 flex flex-col p-8 bg-[#F9F6F0]">
          
          <div className="flex-1 flex flex-col items-center justify-center -mt-6">
            {!isMobile && (
              <>
                <div className="relative p-5 bg-white shadow-[0_10px_30px_rgba(203,161,83,0.1)] mb-6 group">
                  <div className="absolute inset-0 border border-[#CBA153]/30 m-2"></div>
                  <QRCodeSVG 
                    value={getWhatsAppUrl(false)} 
                    size={160}
                    level="H"
                    fgColor="#1A1A1A"
                  />
                  {/* Scan Line Animation */}
                  <div className="absolute top-4 left-4 right-4 h-[2px] bg-[#CBA153]/50 shadow-[0_0_8px_#CBA153] animate-scan opacity-0 group-hover:opacity-100"></div>
                </div>

                <style>{`
                  @keyframes scan {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(160px); }
                    100% { transform: translateY(0); }
                  }
                  .animate-scan {
                    animation: scan 3s ease-in-out infinite;
                  }
                `}</style>

                <h3 className="font-royal text-xl text-[#1A1A1A] mb-2 flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-[#CBA153]" />
                  Scan to Connect
                </h3>
                <p className="text-[#3B2F2F]/70 font-sans text-[11px] max-w-[280px] leading-relaxed text-center mb-8">
                  Open your phone camera to scan this code. You will be connected instantly to your personal stylist.
                </p>

                <div className="flex items-center gap-4 w-full px-8 mb-6">
                  <div className="flex-1 h-px bg-[#3B2F2F]/10"></div>
                  <span className="text-[#3B2F2F]/40 font-sans text-[9px] tracking-widest uppercase">Or</span>
                  <div className="flex-1 h-px bg-[#3B2F2F]/10"></div>
                </div>
              </>
            )}

            {isMobile && (
              <div className="mb-10 text-center">
                <h3 className="font-royal text-2xl text-[#1A1A1A] mb-4">Connect with a Stylist</h3>
                <p className="text-[#3B2F2F]/70 font-sans text-xs leading-relaxed max-w-[280px] mx-auto">
                  Click the button below to open WhatsApp on your phone and start a private consultation for this piece.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
              <a 
                href={getWhatsAppUrl(!isMobile)} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full py-4 border border-[#1A1A1A] text-[#1A1A1A] font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-[#1A1A1A] hover:text-[#F9F6F0] transition-colors flex items-center justify-center gap-2 group"
              >
                {isMobile ? 'Open WhatsApp' : 'Open WhatsApp Web'}
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </a>
              <button 
                onClick={handleInstagramClick}
                className="w-full py-4 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-90 text-white font-sans text-[10px] tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2"
              >
                Open Instagram DM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
