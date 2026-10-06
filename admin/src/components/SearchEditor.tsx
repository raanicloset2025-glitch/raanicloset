"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { Plus, X, Search, Zap, Check } from "lucide-react";

export default function SearchEditor() {
  const {
    trendingSearchesClothing,
    setTrendingSearchesClothing,
    trendingSearchesJewelry,
    setTrendingSearchesJewelry,
    searchSynonyms,
    setSearchSynonyms,
    searchCollectionsClothing,
    setSearchCollectionsClothing,
    searchCollectionsJewelry,
    setSearchCollectionsJewelry,
    searchSignatureClothing,
    setSearchSignatureClothing,
    searchSignatureJewelry,
    setSearchSignatureJewelry,
    clothingCategories,
    jewelryCategories,
    products,
  } = useAdminStore();

  const [newSynonymKey, setNewSynonymKey] = useState("");
  const [newSynonymValue, setNewSynonymValue] = useState("");

  const toggleSelection = (
    id: string,
    current: string[],
    setFn: (val: string[]) => void
  ) => {
    const list = current || [];
    if (list.includes(id)) {
      setFn(list.filter((x) => x !== id));
    } else {
      setFn([...list, id]);
    }
  };

  const handleAddTrending = (type: "clothing" | "jewelry") => {
    const list = type === "clothing" ? trendingSearchesClothing : trendingSearchesJewelry;
    if (list.length >= 8) return; // limit to 8
    const newList = [...list, "New Term"];
    if (type === "clothing") setTrendingSearchesClothing(newList);
    else setTrendingSearchesJewelry(newList);
  };

  const handleUpdateTrending = (type: "clothing" | "jewelry", index: number, value: string) => {
    const list = type === "clothing" ? [...trendingSearchesClothing] : [...trendingSearchesJewelry];
    list[index] = value;
    if (type === "clothing") setTrendingSearchesClothing(list);
    else setTrendingSearchesJewelry(list);
  };

  const handleRemoveTrending = (type: "clothing" | "jewelry", index: number) => {
    const list = type === "clothing" ? [...trendingSearchesClothing] : [...trendingSearchesJewelry];
    list.splice(index, 1);
    if (type === "clothing") setTrendingSearchesClothing(list);
    else setTrendingSearchesJewelry(list);
  };

  const handleAddSynonym = () => {
    if (!newSynonymKey.trim() || !newSynonymValue.trim()) return;
    setSearchSynonyms({
      ...(searchSynonyms || {}),
      [newSynonymKey.trim().toLowerCase()]: newSynonymValue.trim()
    });
    setNewSynonymKey("");
    setNewSynonymValue("");
  };

  const handleRemoveSynonym = (key: string) => {
    const newSynonyms = { ...searchSynonyms };
    delete newSynonyms[key];
    setSearchSynonyms(newSynonyms);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-12 pb-32">
      <div>
        <h2 className="text-2xl font-serif text-[#1A0B16] font-bold mb-2">Search & Discovery</h2>
        <p className="text-[#888] text-sm">Control what customers see before they search, and how the search engine interprets their queries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Trending Searches */}
        <div className="space-y-8 bg-white p-6 border border-[#EAEAEA] rounded-xl shadow-sm">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A0B16] flex items-center gap-2">
              <Zap size={16} className="text-[#CBA153]" /> Trending Searches
            </h3>
            <p className="text-xs text-[#888] mt-2">These appear on the search screen before the user starts typing.</p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#3B2F2F]">Clothing</span>
                <button onClick={() => handleAddTrending("clothing")} className="text-[10px] uppercase font-bold text-[#CBA153] hover:text-[#1A0B16]">
                  + Add Term
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(trendingSearchesClothing || []).map((term, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full px-3 py-1.5">
                    <input 
                      value={term}
                      onChange={(e) => handleUpdateTrending("clothing", idx, e.target.value)}
                      className="text-xs font-medium bg-transparent outline-none w-24 focus:w-32 transition-all"
                    />
                    <button onClick={() => handleRemoveTrending("clothing", idx)} className="text-[#888] hover:text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#EAEAEA] pt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#3B2F2F]">Jewelry</span>
                <button onClick={() => handleAddTrending("jewelry")} className="text-[10px] uppercase font-bold text-[#CBA153] hover:text-[#1A0B16]">
                  + Add Term
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(trendingSearchesJewelry || []).map((term, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full px-3 py-1.5">
                    <input 
                      value={term}
                      onChange={(e) => handleUpdateTrending("jewelry", idx, e.target.value)}
                      className="text-xs font-medium bg-transparent outline-none w-24 focus:w-32 transition-all"
                    />
                    <button onClick={() => handleRemoveTrending("jewelry", idx)} className="text-[#888] hover:text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Synonyms Engine */}
        <div className="space-y-8 bg-white p-6 border border-[#EAEAEA] rounded-xl shadow-sm">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A0B16] flex items-center gap-2">
              <Search size={16} className="text-[#CBA153]" /> Synonym Engine
            </h3>
            <p className="text-xs text-[#888] mt-2">Map common user searches to your luxury brand terminology to prevent zero-result drop-offs.</p>
          </div>

          <div className="flex gap-2 items-center">
            <input 
              value={newSynonymKey}
              onChange={e => setNewSynonymKey(e.target.value)}
              placeholder="If user types (e.g. red)"
              className="flex-1 text-xs px-3 py-2 border border-[#EAEAEA] rounded outline-none focus:border-[#CBA153]"
            />
            <span className="text-[#888] text-xs">→</span>
            <input 
              value={newSynonymValue}
              onChange={e => setNewSynonymValue(e.target.value)}
              placeholder="Search for (e.g. crimson)"
              className="flex-1 text-xs px-3 py-2 border border-[#EAEAEA] rounded outline-none focus:border-[#CBA153]"
            />
            <button onClick={handleAddSynonym} className="bg-[#1A0B16] text-white p-2 rounded hover:bg-[#CBA153] transition-colors">
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(searchSynonyms || {}).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between bg-[#FAFAFA] p-3 rounded border border-[#EAEAEA]">
                <div className="flex items-center gap-4 text-xs font-medium text-[#1A0B16]">
                  <span className="text-[#888]">"{key}"</span>
                  <span>→</span>
                  <span className="text-[#CBA153] uppercase tracking-wider">{val}</span>
                </div>
                <button onClick={() => handleRemoveSynonym(key)} className="text-[#888] hover:text-red-500 p-1">
                  <X size={14} />
                </button>
              </div>
            ))}
            {Object.keys(searchSynonyms || {}).length === 0 && (
              <p className="text-xs text-[#888] italic text-center py-4">No synonyms configured yet.</p>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
        {/* Collections */}
        <div className="space-y-8 bg-white p-6 border border-[#EAEAEA] rounded-xl shadow-sm">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A0B16] flex items-center gap-2">
              <Zap size={16} className="text-[#CBA153]" /> Collections (Category IDs)
            </h3>
            <p className="text-xs text-[#888] mt-2">Select categories to show in the search overlay Collections section.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3B2F2F] block mb-2">Clothing</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {clothingCategories?.map(cat => {
                  const isSelected = (searchCollectionsClothing || []).includes(cat.id);
                  return (
                    <div 
                      key={cat.id} 
                      onClick={() => toggleSelection(cat.id, searchCollectionsClothing, setSearchCollectionsClothing)}
                      className={`cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-300 relative aspect-square group ${
                        isSelected 
                          ? "border-[#CBA153] shadow-sm" 
                          : "border-[#EAEAEA] grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                      }`}
                    >
                      <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 backdrop-blur-sm">
                        <p className="text-[9px] text-white text-center truncate">{cat.title}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-[#CBA153] text-white rounded-full p-0.5 shadow-md">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3B2F2F] block mb-2">Jewelry</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {jewelryCategories?.map(cat => {
                  const isSelected = (searchCollectionsJewelry || []).includes(cat.id);
                  return (
                    <div 
                      key={cat.id} 
                      onClick={() => toggleSelection(cat.id, searchCollectionsJewelry, setSearchCollectionsJewelry)}
                      className={`cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-300 relative aspect-square group ${
                        isSelected 
                          ? "border-[#CBA153] shadow-sm" 
                          : "border-[#EAEAEA] grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                      }`}
                    >
                      <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 backdrop-blur-sm">
                        <p className="text-[9px] text-white text-center truncate">{cat.title}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-[#CBA153] text-white rounded-full p-0.5 shadow-md">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Signature Pieces */}
        <div className="space-y-8 bg-white p-6 border border-[#EAEAEA] rounded-xl shadow-sm">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A0B16] flex items-center gap-2">
              <Zap size={16} className="text-[#CBA153]" /> Signature Pieces (Product IDs)
            </h3>
            <p className="text-xs text-[#888] mt-2">Select products to show when no results are found.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3B2F2F] block mb-2">Clothing</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {products?.filter(p => p.type === 'clothing').map(p => {
                  const isSelected = (searchSignatureClothing || []).includes(p.id);
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => toggleSelection(p.id, searchSignatureClothing, setSearchSignatureClothing)}
                      className={`cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-300 relative aspect-square group ${
                        isSelected 
                          ? "border-[#CBA153] shadow-sm" 
                          : "border-[#EAEAEA] grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                      }`}
                    >
                      <img src={p.imageSrc} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 backdrop-blur-sm">
                        <p className="text-[9px] text-white text-center truncate">{p.title}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-[#CBA153] text-white rounded-full p-0.5 shadow-md">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#3B2F2F] block mb-2">Jewelry</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {products?.filter(p => p.type === 'jewelry').map(p => {
                  const isSelected = (searchSignatureJewelry || []).includes(p.id);
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => toggleSelection(p.id, searchSignatureJewelry, setSearchSignatureJewelry)}
                      className={`cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-300 relative aspect-square group ${
                        isSelected 
                          ? "border-[#CBA153] shadow-sm" 
                          : "border-[#EAEAEA] grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                      }`}
                    >
                      <img src={p.imageSrc} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 backdrop-blur-sm">
                        <p className="text-[9px] text-white text-center truncate">{p.title}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-[#CBA153] text-white rounded-full p-0.5 shadow-md">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
