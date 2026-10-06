"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import Navbar from "./navbar";
import WishlistIcon from "./navbar/WishlistIcon";
import SearchIcon from "./navbar/SearchIcon";
import HexagonPatchworkBag from "./HexagonPatchworkBag";
import AccountMenu from "./AccountMenu";
import SearchOverlay from "./SearchOverlay";

function MobileNavbar() {
  const { isJewelry, setSearchModalOpen, toggleTheme } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 z-[-50] pointer-events-none transition-opacity duration-[1000ms] bg-[#F9F6F0] ${
          !isJewelry ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`fixed inset-0 z-[-50] pointer-events-none transition-opacity duration-[1000ms] ${
          isJewelry ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 20%, #1A090D 0%, #0D0406 55%, #050102 100%)",
        }}
      />

      {/* MOBILE TOP NAVBAR (Animated Text Logo) - NO AUTO HIDE, FIXED BACKGROUND */}
      <div className={`fixed top-0 left-0 w-full z-50 flex justify-center items-center px-4 py-3 transition-all duration-500 ${isScrolled ? (isJewelry ? 'bg-[#050102]/90 backdrop-blur-md shadow-md shadow-black/50' : 'bg-[#F9F6F0]/90 backdrop-blur-md shadow-sm shadow-[#3B2F2F]/10') : 'bg-transparent'}`}>
        <Link href="/" className="relative z-10 group flex items-center justify-center w-[230px] h-[40px]">
          <style>{`
            @keyframes prism-glint {
              0% { transform: translateX(-150%) skewX(-25deg); }
              20% { transform: translateX(250%) skewX(-25deg); }
              100% { transform: translateX(250%) skewX(-25deg); }
            }
            .animate-prism-glint {
              animation: prism-glint 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
          `}</style>

          {/* Clothing Logo */}
          <div className={`absolute inset-0 flex items-center justify-center space-x-3 transition-[opacity,transform] ${isJewelry ? 'opacity-0 -translate-y-4 scale-95 pointer-events-none duration-[400ms] ease-in' : 'opacity-100 translate-y-0 scale-100 duration-[1000ms] delay-[200ms] ease-out'}`}>
            <div className="h-[28px] w-auto shrink-0 drop-shadow-sm transition-transform duration-500">
              <Image src="/raani-logo-new.png" alt="Logo" width={90} height={28} priority className="object-contain h-full w-auto mix-blend-multiply origin-left" />
            </div>
            <div className="flex flex-col justify-center items-center relative">
              <span className={`font-painter text-[24px] pl-1 pr-2 py-1 bg-gradient-to-r from-[#2A1E1E] to-[#603D3D] text-transparent bg-clip-text leading-none tracking-wide antialiased whitespace-nowrap animate-ink-sweep`} style={{ textShadow: "0 2px 6px rgba(224,162,156,0.25)"}}>
                Raani Closet
              </span>
              <span className="font-royal text-[8px] tracking-[0.3em] text-[#E0A29C] -mt-1 font-bold uppercase drop-shadow-sm">Boutique</span>
            </div>
          </div>

          {/* Jewelry Logo */}
          <div className={`absolute inset-0 flex items-center justify-center space-x-2 transition-[opacity,transform] ${!isJewelry ? 'opacity-0 translate-y-4 scale-95 pointer-events-none duration-[400ms] ease-in' : 'opacity-100 translate-y-0 scale-100 duration-[1000ms] delay-[200ms] ease-out'}`}>
            <div className="relative w-6 h-6 flex items-center justify-center text-slate-200 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                 <path d="M6 3h12l4 6-10 12L2 9l4-6z"/>
                 <path d="M2 9h20"/>
                 <path d="M12 21V9"/>
                 <path d="M6 3l6 6"/>
                 <path d="M18 3l-6 6"/>
              </svg>
              <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full animate-ping opacity-90"></div>
            </div>
            <div className="flex flex-col justify-center relative">
              <span className="font-painter text-[24px] pl-1 pr-2 py-1 tracking-wide antialiased whitespace-nowrap relative leading-none" style={{ color: '#E8E0D0' }}>
                Raani Closet
                <span className="absolute inset-0 w-[30px] animate-prism-glint bg-gradient-to-r from-transparent via-cyan-200/50 via-white via-fuchsia-200/50 to-transparent mix-blend-color-dodge pointer-events-none"></span>
              </span>
              <span className="font-royal italic text-[8px] tracking-[0.25em] text-slate-300/95 -mt-1 uppercase backdrop-blur-[1px]" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9)"}}>High Jewels</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="fixed bottom-6 left-0 w-full z-50 flex justify-center px-4 pointer-events-none">
        
        {/* Pill Toggle Button exactly centered above the mobile navbar */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            onClick={toggleTheme}
            className={`flex items-center w-[160px] h-[36px] rounded-full transform-gpu p-[4px] transition-[background-color,border-color,box-shadow,transform] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden cursor-pointer ${
              isJewelry
                ? "bg-[#0A0507]/80 border border-slate-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
                : "bg-white/90 border border-[#E0A29C]/30 shadow-[0_4px_20px_rgba(224,162,156,0.15)]"
            } backdrop-blur-md hover:scale-105 active:scale-95`}
          >
            {/* Sliding Pill Background */}
            <div
              className={`absolute top-[3px] bottom-[3px] w-[calc(50%-4px)] rounded-full transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isJewelry
                  ? "translate-x-[calc(100%+2px)] bg-gradient-to-r from-slate-800 to-slate-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  : "translate-x-[2px] bg-[#F9F6F0] shadow-[0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)]"
              }`}
            />
            {/* Labels */}
            <div className="relative w-full h-full flex justify-between items-center font-royal text-[10px] tracking-widest font-bold uppercase z-10">
              <span className={`transition-colors duration-[600ms] w-1/2 text-center ${isJewelry ? "text-slate-400" : "text-[#3B2F2F]"}`}>Cloth</span>
              <span className={`transition-colors duration-[600ms] w-1/2 text-center ${isJewelry ? "text-slate-200" : "text-[#3B2F2F]/40"}`}>Jewel</span>
            </div>
          </button>
        </div>

        <nav
          className={`pointer-events-auto w-full max-w-[340px] h-[60px] rounded-[24px] flex items-center justify-around px-6 transition-all duration-[1000ms] ease-in-out backdrop-blur-lg ${
            isJewelry
              ? "bg-[#0A0507]/80 border border-slate-700/50 shadow-xl"
              : "bg-white/90 border border-[#E0A29C]/20 shadow-xl"
          }`}
        >
          <Link
            href="/"
            className={`w-6 h-6 flex justify-center items-center transition-colors duration-[1000ms] ${
              isJewelry ? "text-slate-200" : "text-[#3B2F2F]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>

          <SearchIcon
            isJewelry={isJewelry}
            onClick={() => setSearchModalOpen(true)}
          />
          <WishlistIcon isJewelry={isJewelry} />
          <HexagonPatchworkBag
            isJewelry={isJewelry}
            onClick={() => useStore.getState().openCart()}
            cartCount={useStore((state) =>
              state.cartItems.reduce((acc, item) => acc + item.quantity, 0)
            )}
          />
          <AccountMenu isMobile={true} isJewelry={isJewelry} />
        </nav>
      </div>
    </>
  );
}

import { useAdminStore } from "@/store/useAdminStore";

export default function NavbarWrapper() {
  const fetchProducts = useAdminStore((s) => s.fetchProducts);
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <>
      <div className="md:hidden">
        <MobileNavbar />
      </div>
      <div className="hidden md:block">
        <Navbar />
      </div>
      <SearchOverlay />
    </>
  );
}
