'use client';
import NavbarWrapper from "@/components/NavbarWrapper";
import LuxuryFooter from "@/components/LuxuryFooter";
import ProductGrid from "@/components/ProductGrid";
import CollectionHeader from "@/components/CollectionHeader";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function CollectionPage() {
  const isJewelry = useStore((state) => state.isJewelry);

  return (
    <main className={`min-h-screen flex flex-col selection:bg-[#E0A29C] selection:text-[#1A0B16] transition-colors duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isJewelry ? 'bg-[#050102]' : 'bg-[#F9F6F0]'} animate-in fade-in duration-1000 fill-mode-both`}>
      {/* Shared Navbar */}
      <NavbarWrapper />

      {/* Main Content Area - Starts below navbar */}
      <section className="flex-grow w-full pt-[120px] md:pt-[140px] pb-16 flex flex-col relative z-0">
        
        {/* Elegant Back Button */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 pt-4">
          <Link 
            href="/" 
            className={`group inline-flex items-center gap-2 transition-colors duration-500 ${isJewelry ? 'text-[#D5B06D]/50 hover:text-[#D5B06D]' : 'text-[#3B2F2F]/50 hover:text-[#CBA153]'}`}
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-500 group-hover:-translate-x-1" />
            <span className="text-[9px] uppercase tracking-[0.25em] font-medium font-sans">Return to Atelier</span>
          </Link>
        </div>

        <>
          {/* Pre-docked Sticky Categories */}
          <CollectionHeader />

          {/* Product Grid with a staggered fade up */}
          <div className="mt-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] fill-mode-both delay-150">
            <ProductGrid />
          </div>
        </>
        
      </section>

      <LuxuryFooter />
    </main>
  );
}
