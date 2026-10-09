"use client";

import React from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { uploadImage } from "@/lib/uploadHelper";

export default function NavbarEditor() {
    const [store, setStore] = React.useState<any>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setStore(useAdminStore.getState());
    
    useAdminStore.getState().fetchFromServer?.().then(() => {
      setStore(useAdminStore.getState());
    });

    const unsub = useAdminStore.subscribe((state: any) => {
      setStore(state);
    });
    return unsub;
  }, []);

  const [uploadingLogoType, setUploadingLogoType] = React.useState<'clothing' | 'jewelry' | 'tab' | null>(null);

  if (!mounted || !store.setBrandName) return null;


  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'clothing' | 'jewelry' | 'tab') => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      setUploadingLogoType(type);
      try {
        const url = await uploadImage(file);
        
        if (type === 'clothing') store.setClothingLogoUrl(url);
        else if (type === 'jewelry') store.setJewelryLogoUrl(url);
        else if (type === 'tab') store.setTabLogoUrl(url);
      } catch (error: any) {
        console.error("Logo upload failed:", error);
        alert(error?.message || "Logo upload failed. Please try again.");
      } finally {
        setUploadingLogoType(null);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-16 flex justify-center bg-white h-full">
      <div className="w-full max-w-2xl space-y-12 pb-24">
        <div className="border-b border-[#F0F0F0] pb-6">
          <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] tracking-wide mb-2">Navigation & Identity</h3>
          <p className="text-[#888] text-xs font-light">Manage brand logos, global contact details, and social links.</p>
        </div>

        {/* 1. Brand Logos */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A3A3A3]">1. Brand Identity</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="group cursor-pointer">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">Clothing Logo</span>
              <div className="border border-[#EAEAEA] rounded-lg p-4 flex flex-col items-center justify-center bg-white hover:bg-[#FAFAFA] transition-colors group-hover:border-[#CBA153] shadow-sm relative overflow-hidden h-32">
                <img src={store.clothingLogoUrl || "/raani-logo-new.png"} alt="Clothing Logo" className="w-full h-16 object-contain mb-3" />
                <span className="text-[9px] font-medium text-[#888]">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'clothing')} />
              </div>
            </label>

            <label className="group cursor-pointer">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">Jewelry Logo</span>
              <div className="border border-[#EAEAEA] rounded-lg p-4 flex flex-col items-center justify-center bg-[#1A0B16] hover:bg-black transition-colors group-hover:border-[#CBA153] shadow-sm relative overflow-hidden h-32">
                <img src={store.jewelryLogoUrl || "/raani-logo-new.png"} alt="Jewelry Logo" className="w-full h-16 object-contain mb-3 filter invert brightness-0" />
                <span className="text-[9px] font-medium text-[#CCC]">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'jewelry')} />
              </div>
            </label>

            <label className="group cursor-pointer">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">Tab Favicon</span>
              <div className="border border-[#EAEAEA] rounded-lg p-4 flex flex-col items-center justify-center bg-white hover:bg-[#FAFAFA] transition-colors group-hover:border-[#CBA153] shadow-sm relative overflow-hidden h-32">
                <img src={store.tabLogoUrl || store.clothingLogoUrl || "/raani-logo-new.png"} alt="Tab Logo" className="w-12 h-12 object-contain mb-3 rounded shadow-sm" />
                <span className="text-[9px] font-medium text-[#888]">Upload Favicon</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'tab')} />
              </div>
            </label>
          </div>
        </div>

        {/* 2. Global Contact Details */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A3A3A3]">2. Global Brand & Text</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">Brand Name</label>
                <input
                  type="text"
                  value={store.brandName || ""}
                  onChange={(e) => store.setBrandName(e.target.value)}
                  className="w-full text-xs p-3 border border-[#EAEAEA] rounded focus:border-[#CBA153] outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">Clothing Toggle Tab</label>
                <input
                  type="text"
                  value={store.clothingToggleName || ""}
                  onChange={(e) => store.setClothingToggleName(e.target.value)}
                  placeholder="e.g. Boutique"
                  className="w-full text-xs p-3 border border-[#EAEAEA] rounded focus:border-[#CBA153] outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">Jewelry Toggle Tab</label>
                <input
                  type="text"
                  value={store.jewelryToggleName || ""}
                  onChange={(e) => store.setJewelryToggleName(e.target.value)}
                  placeholder="e.g. Jewelry"
                  className="w-full text-xs p-3 border border-[#EAEAEA] rounded focus:border-[#CBA153] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">Clothing Logo Subtext</label>
                <input
                  type="text"
                  value={store.clothingLogoSubtext || ""}
                  onChange={(e) => store.setClothingLogoSubtext(e.target.value)}
                  placeholder="e.g. Boutique"
                  className="w-full text-xs p-3 border border-[#EAEAEA] rounded focus:border-[#CBA153] outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">Jewelry Logo Subtext</label>
                <input
                  type="text"
                  value={store.jewelryLogoSubtext || ""}
                  onChange={(e) => store.setJewelryLogoSubtext(e.target.value)}
                  placeholder="e.g. High Jewels"
                  className="w-full text-xs p-3 border border-[#EAEAEA] rounded focus:border-[#CBA153] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">WhatsApp Ask Stylist Button</label>
                <input
                  type="text"
                  value={store.askStylistText || ""}
                  onChange={(e) => store.setAskStylistText(e.target.value)}
                  className="w-full text-xs p-3 border border-[#EAEAEA] rounded focus:border-[#CBA153] outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">WhatsApp Reserve Button</label>
                <input
                  type="text"
                  value={store.reserveText || ""}
                  onChange={(e) => store.setReserveText(e.target.value)}
                  className="w-full text-xs p-3 border border-[#EAEAEA] rounded focus:border-[#CBA153] outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">WhatsApp Number</label>
              <input
                type="text"
                value={store.whatsappNumber || ""}
                onChange={(e) => store.setWhatsappNumber(e.target.value)}
                className="w-full text-xs p-3 border border-[#EAEAEA] rounded focus:border-[#CBA153] outline-none"
              />
            </div>
            <div className="pt-2">
              <label className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">Instagram Profile URL</label>
              <input
                type="text"
                value={store.instagramUrl || ""}
                onChange={(e) => store.setInstagramUrl(e.target.value)}
                className="w-full text-xs p-3 border border-[#EAEAEA] rounded focus:border-[#CBA153] outline-none"
                placeholder="https://instagram.com/username"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
