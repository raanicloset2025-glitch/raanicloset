"use client";

import React, { useState, useRef } from "react";
import { useAdminStore, CategoryItem, Product } from "@/store/useAdminStore";
import { motion, AnimatePresence } from "framer-motion";
import CropModal from "./CropModal";
import { Star, Trash2, Plus, Upload, FolderPlus, Edit3, Camera } from "lucide-react";

export default function CategoryProductEditor() {
  const [typeTab, setTypeTab] = useState<"clothing" | "jewelry">("clothing");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const newProductFileRef = useRef<HTMLInputElement>(null);
  const [pendingCategoryTitle, setPendingCategoryTitle] = useState<string>("");

  // Cropper Modal state
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    imageSrc: string;
    aspect: number;
    title: string;
    onComplete: (dataUrl: string) => void;
  }>({
    isOpen: false,
    imageSrc: "",
    aspect: 1,
    title: "",
    onComplete: () => {},
  });

  const clothingCategories = useAdminStore((s) => s.clothingCategories);
  const jewelryCategories = useAdminStore((s) => s.jewelryCategories);
  const addCategory = useAdminStore((s) => s.addCategory);
  const updateCategory = useAdminStore((s) => s.updateCategory);
  const deleteCategory = useAdminStore((s) => s.deleteCategory);

  const clothingCategoryHeading = useAdminStore((s) => s.clothingCategoryHeading);
  const setClothingCategoryHeading = useAdminStore((s) => s.setClothingCategoryHeading);
  const jewelryCategoryHeading = useAdminStore((s) => s.jewelryCategoryHeading);
  const setJewelryCategoryHeading = useAdminStore((s) => s.setJewelryCategoryHeading);

  const products = useAdminStore((s) => s.products);
  const addProduct = useAdminStore((s) => s.addProduct);
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const deleteProduct = useAdminStore((s) => s.deleteProduct);
  const starProduct = useAdminStore((s) => s.starProduct);

  const starredCount = products.filter((p) => p.isStarred).length;
  const activeCategories = typeTab === "clothing" ? clothingCategories : jewelryCategories;
  const activeProducts = products.filter((p) => p.type === typeTab);
  const activeHeading = typeTab === "clothing" ? clothingCategoryHeading : jewelryCategoryHeading;
  const setHeading = typeTab === "clothing" ? setClothingCategoryHeading : setJewelryCategoryHeading;

  // Selected category defaulting
  const activeCat = activeCategories.find((c) => c.id === selectedCatId) || activeCategories[0];
  const activeCatProducts = activeCat ? activeProducts.filter((p) => p.category === activeCat.title) : [];

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectFile = (
    file: File,
    aspect: number,
    title: string,
    onComplete: (croppedUrl: string) => void
  ) => {
    const url = URL.createObjectURL(file);
    setCropperState({
      isOpen: true,
      imageSrc: url,
      aspect,
      title,
      onComplete,
    });
  };

  const handleTriggerNewProductWithPhoto = (categoryTitle: string) => {
    setPendingCategoryTitle(categoryTitle);
    newProductFileRef.current?.click();
  };

  const handleNewProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const catTitle = pendingCategoryTitle || activeCat?.title || "Simple Suits";

    handleSelectFile(file, 3 / 4, `Crop Photo for New ${catTitle} Product`, (croppedUrl) => {
      addProduct({
        title: `New ${catTitle} Piece`,
        category: catTitle,
        type: typeTab,
        imageSrc: croppedUrl,
        images: [croppedUrl, croppedUrl, croppedUrl],
        description: "Luxury handcrafted design...",
      });
      showToast(`New product created with uploaded photo!`, "success");
    });

    e.target.value = "";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFAFA] font-sans">
      {/* Hidden File Input for Direct Photo Add */}
      <input
        ref={newProductFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleNewProductFileChange}
      />

      {/* ACTION BAR */}
      <div className="py-4 md:h-20 border-b border-[#EAEAEA] bg-white flex flex-wrap items-center justify-between px-4 lg:px-10 shrink-0 shadow-sm gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-serif text-[#1A0B16]">Horizontal Category Suite & Product Atelier</h2>
          <p className="text-[#888] text-[9px] tracking-wide font-medium uppercase mt-0.5">
            Auto-Fitting Photo Uploads · Smart Crop Modal & Starred Homepage Collection (Max 4)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1A0B16] text-[#CBA153] px-3.5 py-1.5 rounded-lg text-xs font-mono shadow-sm">
            ★ {starredCount}/4 Signature Items Featured
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6 pb-24">
        {/* MODE SWITCHER & GLOBAL ADD CATEGORY */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#EAEAEA] pb-4 gap-4 bg-[#FFFFFF] p-4 rounded-xl shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#888] font-semibold">Mode:</span>
            <button
              onClick={() => { setTypeTab("clothing"); setSelectedCatId(null); }}
              className={`px-5 py-2 text-xs uppercase tracking-widest rounded-lg transition-all font-semibold ${
                typeTab === "clothing" ? "bg-[#1A0B16] text-[#CBA153] shadow-sm" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EAEAEA]"
              }`}
            >
              Clothing ({clothingCategories.length} Categories)
            </button>
            <button
              onClick={() => { setTypeTab("jewelry"); setSelectedCatId(null); }}
              className={`px-5 py-2 text-xs uppercase tracking-widest rounded-lg transition-all font-semibold ${
                typeTab === "jewelry" ? "bg-[#1A0B16] text-[#CBA153] shadow-sm" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EAEAEA]"
              }`}
            >
              Jewelry ({jewelryCategories.length} Categories)
            </button>
          </div>

          <button
            onClick={() => {
              addCategory({ title: "New Category", image: "/categories/simple_suit.jpg", tagline: "Custom tagline" }, typeTab);
              showToast("New category created!", "success");
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#CBA153] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#B38B3F] transition-colors shadow-sm"
          >
            <FolderPlus size={16} /> + Add New Category
          </button>
        </div>

        {/* CURSIVE SECTION HEADING EDITABLE CARD */}
        <div className="bg-white border border-[#CBA153]/30 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 size={16} className="text-[#CBA153]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A0B16]">
                Cursive Section Heading ({typeTab.toUpperCase()})
              </h3>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[#888]">Appears above 3-circle categories</span>
          </div>
          <p className="text-xs text-[#666]">
            Website par categories ke upar jo cursive title dikhta hai (jaise "Suit" ya "Jewels"), use yahan change karein:
          </p>
          <input
            value={activeHeading || ""}
            onChange={(e) => setHeading(e.target.value)}
            placeholder={typeTab === "clothing" ? "Suit" : "Jewels"}
            className="font-serif text-xl md:text-2xl text-[#1A0B16] bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-4 py-2.5 outline-none focus:border-[#CBA153] focus:bg-white w-full font-bold"
          />
        </div>

        {/* ─── SMART HORIZONTAL CATEGORIES CAROUSEL BAR ─────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A0B16]">
              Horizontal Categories Bar ({activeCategories.length})
            </h3>
            <span className="text-[10px] text-[#888]">Click any category card to view & add its products</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar">
            <AnimatePresence>
              {activeCategories.map((cat) => {
                const isSelected = activeCat?.id === cat.id;
                const count = activeProducts.filter((p) => p.category === cat.title).length;

                return (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer shrink-0 min-w-[260px] max-w-[280px] shadow-sm flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#1A0B16] text-white border-[#CBA153] shadow-md ring-2 ring-[#CBA153]/30"
                        : "bg-white text-[#1A0B16] border-[#EAEAEA] hover:border-[#CBA153]/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar Image & Cropper Trigger */}
                      <label className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#CBA153] shrink-0 cursor-pointer group">
                        <img src={cat.image} alt={cat.title} className="w-full h-full object-cover object-center" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px]">
                          <Upload size={14} />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              handleSelectFile(f, 1, `Crop Category Image: ${cat.title}`, (croppedUrl) =>
                                updateCategory(cat.id, { image: croppedUrl }, typeTab)
                              );
                            }
                          }}
                        />
                      </label>

                      <div className="flex-1 min-w-0">
                        <input
                          value={cat.title}
                          onChange={(e) => updateCategory(cat.id, { title: e.target.value }, typeTab)}
                          className={`font-serif font-bold text-sm bg-transparent border-b border-transparent hover:border-[#CBA153] outline-none w-full truncate ${
                            isSelected ? "text-white" : "text-[#1A0B16]"
                          }`}
                        />
                        <input
                          value={cat.tagline || ""}
                          placeholder="Tagline..."
                          onChange={(e) => updateCategory(cat.id, { tagline: e.target.value }, typeTab)}
                          className={`text-[10px] bg-transparent border-b border-transparent hover:border-white/30 outline-none w-full truncate mt-0.5 ${
                            isSelected ? "text-slate-400" : "text-[#888]"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-current/10">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                        isSelected ? "bg-[#CBA153] text-[#1A0B16]" : "bg-[#1A0B16] text-[#CBA153]"
                      }`}>
                        {count} Products
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(cat.id, typeTab);
                        }}
                        className={`p-1.5 rounded transition-colors ${
                          isSelected ? "text-slate-400 hover:text-red-400" : "text-slate-400 hover:text-red-600"
                        }`}
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── ACTIVE CATEGORY PRODUCTS VITRINE CARDS ─────────────────────────────────── */}
        {activeCat && (
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between border-b border-[#EAEAEA] pb-4 gap-3">
              <div className="flex items-center gap-3">
                <img src={activeCat.image} alt={activeCat.title} className="w-10 h-10 rounded-full object-cover object-center border border-[#CBA153]" />
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1A0B16]">
                    Products in "{activeCat.title}" ({activeCatProducts.length})
                  </h3>
                  <p className="text-xs text-[#888]">Upload custom photos, auto-fit ratios & star for homepage collection</p>
                </div>
              </div>

              {/* DIRECT PHOTO UPLOAD PRODUCT ADD BUTTON */}
              <button
                onClick={() => handleTriggerNewProductWithPhoto(activeCat.title)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#CBA153] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#B38B3F] transition-colors shadow-sm"
              >
                <Camera size={16} /> + Upload & Add Product to {activeCat.title}
              </button>
            </div>

            {/* PRODUCT VITRINE CARDS GRID (AUTO-FIT SHAPE MATCH) */}
            {activeCatProducts.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-[#EAEAEA] rounded-xl bg-[#FAFAFA]">
                <p className="text-xs text-[#888] mb-2">No products in "{activeCat.title}" yet.</p>
                <button
                  onClick={() => handleTriggerNewProductWithPhoto(activeCat.title)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CBA153] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#B38B3F] transition-colors shadow-sm"
                >
                  <Camera size={16} /> + Upload Photo & Add First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                <AnimatePresence>
                  {activeCatProducts.map((prod) => (
                    <motion.div
                      key={prod.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* 3:4 Vitrine Card Image Container (Auto-Fit Aspect Ratio) */}
                      <div className="relative aspect-[3/4] w-full bg-[#F5F5F5] overflow-hidden">
                        <img
                          src={prod.imageSrc}
                          alt={prod.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Always-Visible Photo Change Button */}
                        <label className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer hover:bg-black transition-colors shadow-sm">
                          <Camera size={13} className="text-[#CBA153]" />
                          <span>Change Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                handleSelectFile(f, 3 / 4, `Crop Product Photo: ${prod.title}`, (croppedUrl) =>
                                  updateProduct(prod.id, { imageSrc: croppedUrl, images: [croppedUrl, croppedUrl, croppedUrl] })
                                );
                              }
                            }}
                          />
                        </label>

                        {/* Top Right Star Status */}
                        <button
                          onClick={() => {
                            const res = starProduct(prod.id);
                            showToast(res.message, res.success ? "success" : "error");
                          }}
                          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${
                            prod.isStarred
                              ? "bg-[#CBA153] text-white"
                              : "bg-black/40 text-white/80 hover:text-white hover:bg-black/60"
                          }`}
                          title={prod.isStarred ? "Featured on Homepage" : "Star for Homepage"}
                        >
                          <Star size={14} fill={prod.isStarred ? "currentColor" : "none"} />
                        </button>
                      </div>

                      {/* Vitrine Card Content (Matches Live Site) */}
                      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between bg-white text-center">
                        <div>
                          <p className="text-[9px] uppercase font-sans tracking-[0.2em] text-[#CBA153] font-bold">
                            {prod.category}
                          </p>
                          <input
                            value={prod.title}
                            onChange={(e) => updateProduct(prod.id, { title: e.target.value })}
                            className="font-serif text-xs md:text-sm font-semibold text-[#1A0B16] bg-transparent border-b border-transparent hover:border-[#CBA153] focus:border-[#CBA153] outline-none text-center w-full mt-0.5"
                            placeholder="Product Title..."
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F5]">
                          <button
                            onClick={() => {
                              const res = starProduct(prod.id);
                              showToast(res.message, res.success ? "success" : "error");
                            }}
                            className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded transition-colors ${
                              prod.isStarred ? "text-[#CBA153] bg-[#CBA153]/10" : "text-slate-500 hover:text-[#1A0B16]"
                            }`}
                          >
                            {prod.isStarred ? "★ Starred" : "☆ Star"}
                          </button>

                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CROPPER MODAL */}
      <AnimatePresence>
        {cropperState.isOpen && (
          <CropModal
            imageSrc={cropperState.imageSrc}
            aspect={cropperState.aspect}
            title={cropperState.title}
            onCropComplete={cropperState.onComplete}
            onClose={() => setCropperState((prev) => ({ ...prev, isOpen: false }))}
          />
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-xs font-semibold tracking-wider shadow-2xl z-50 ${
              toast.type === "success" ? "bg-[#1A0B16] text-[#CBA153] border border-[#CBA153]/30" : "bg-[#3A1015] text-[#F4B8BC]"
            }`}
          >
            {toast.type === "success" ? "✓ " : "✕ "}{toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
