"use client";

import React, { useState } from "react";
import { useAdminStore, Product } from "@/store/useAdminStore";
import { Star, X, Plus, Image as ImageIcon } from "lucide-react";

export default function SignatureCollectionDashboard() {
  const products = useAdminStore((s) => s.products);
  const starProduct = useAdminStore((s) => s.starProduct);
  const unstarProduct = useAdminStore((s) => s.unstarProduct);

  const [activeTab, setActiveTab] = useState<"clothing" | "jewelry">("clothing");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get starred products for the active tab (Clothing vs Jewelry)
  const starredProducts = products
    .filter((p) => p.isStarred && p.type === activeTab)
    .sort((a, b) => (b.starredAt ?? 0) - (a.starredAt ?? 0));
    
  const slots = Array.from({ length: 4 }).map((_, i) => starredProducts[i] || null);

  const unstarredProducts = products.filter((p) => !p.isStarred && p.type === activeTab);
  const filteredSearch = unstarredProducts.filter((p) => {
    return p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-white border-2 border-[#1A0B16] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-10 relative overflow-hidden">
      {/* Background Decorative Graphic */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#CBA153] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-xl md:text-2xl font-serif text-[#1A0B16] flex items-center gap-2">
            <Star className="text-[#CBA153] fill-[#CBA153]" size={24} />
            Homepage Signature Collection
          </h2>
          <p className="text-xs text-[#666] mt-1 font-sans tracking-wide">
            Manage the 4 exclusive products featured on the frontend homepage.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          {/* Toggle between Clothing and Jewelry */}
          <div className="flex bg-[#F5F5F5] p-1 rounded-lg mr-4 border border-[#EAEAEA]">
            <button
              onClick={() => setActiveTab("clothing")}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                activeTab === "clothing" ? "bg-white shadow-sm text-[#1A0B16]" : "text-[#888] hover:text-[#1A0B16]"
              }`}
            >
              Clothing
            </button>
            <button
              onClick={() => setActiveTab("jewelry")}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                activeTab === "jewelry" ? "bg-white shadow-sm text-[#1A0B16]" : "text-[#888] hover:text-[#1A0B16]"
              }`}
            >
              Jewelry
            </button>
          </div>
          <div className="px-4 py-2 bg-[#F9F9F9] rounded-lg border border-[#EAEAEA] text-xs font-semibold text-[#1A0B16]">
            {starredProducts.length} / 4 Featured
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {slots.map((product, idx) => (
          <div 
            key={product?.id || `empty-${idx}`} 
            className={`h-64 relative group rounded-xl overflow-hidden border-2 flex flex-col transition-all hover:shadow-lg ${
              product ? 'border-[#EAEAEA] bg-[#FDFDFD]' : 'border-dashed border-[#CBA153]/40 bg-[#CBA153]/5'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const productId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('productId');
              if (!productId || product) return;
              const dropped = products.find((p) => p.id === productId);
              if (!dropped || dropped.type !== activeTab) {
                alert(`Sirf ${activeTab} products yahan drop karein.`);
                return;
              }
              if (dropped.isStarred) return;
              const res = starProduct(productId);
              if (!res.success) alert(res.message);
            }}
          >
            {product ? (
              <>
                <div className="flex-1 w-full overflow-hidden relative">
                  <img src={product.imageSrc} alt={product.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <button 
                    onClick={() => unstarProduct(product.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove from Homepage"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-3 left-3 pr-3">
                    <span className="text-[9px] uppercase tracking-widest text-[#CBA153] font-semibold mb-1 block">
                      {product.category}
                    </span>
                    <h4 className="text-white font-serif text-sm leading-tight line-clamp-2">
                      {product.title}
                    </h4>
                  </div>
                </div>
              </>
            ) : (
              <button 
                onClick={() => {
                  if (starredProducts.length >= 4) {
                    alert("Maximum 4 products allowed. Please remove one first.");
                    return;
                  }
                  setIsModalOpen(true);
                }}
                disabled={starredProducts.length >= 4}
                className="flex-1 w-full h-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#EAEAEA] hover:border-[#CBA153] hover:bg-[#CBA153]/5 transition-all text-[#888] hover:text-[#CBA153] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Plus size={20} />
                </div>
                <span className="text-xs uppercase tracking-widest font-semibold">Add Signature Item</span>
                <span className="text-[10px] text-[#CBA153] font-medium opacity-80">(Or Drag & Drop here)</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Product Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#F0F0F0] flex items-center justify-between bg-[#FDFDFD]">
              <div>
                <h3 className="text-xl font-serif text-[#1A0B16]">Select Signature Product</h3>
                <p className="text-xs text-[#888] mt-1">Pick a product from your catalog to feature on the homepage.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors">
                <X size={20} className="text-[#1A0B16]" />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="px-6 py-4 border-b border-[#F0F0F0] flex flex-col md:flex-row gap-4 bg-white">
              <input 
                type="text"
                placeholder={`Search ${activeTab} products by name or category...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 text-sm border border-[#EAEAEA] rounded-lg focus:border-[#CBA153] outline-none"
              />
            </div>

            {/* Modal Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
              {filteredSearch.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#888]">
                  <ImageIcon size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">No products found matching your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredSearch.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        starProduct(p.id);
                        setIsModalOpen(false);
                        setSearchQuery("");
                      }}
                      className="group flex flex-col text-left bg-white rounded-xl border border-[#EAEAEA] overflow-hidden hover:border-[#CBA153] hover:shadow-md transition-all"
                    >
                      <div className="aspect-[3/4] w-full overflow-hidden relative">
                        <img src={p.imageSrc} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 shadow-lg">
                            <Plus size={20} className="text-[#CBA153]" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <span className="text-[8px] uppercase tracking-widest text-[#CBA153] font-semibold">{p.category}</span>
                        <h4 className="text-xs font-serif text-[#1A0B16] mt-0.5 line-clamp-1">{p.title}</h4>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
