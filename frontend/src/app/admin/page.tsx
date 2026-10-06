"use client";

import React, { useState, useRef } from "react";
import { useAdminStore, CategoryItem, Product } from "@/store/useAdminStore";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Trash2, Plus, Edit2, Check, X, Image as ImageIcon } from "lucide-react";

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-xl text-sm font-sans tracking-wide ${
        type === "success"
          ? "bg-[#1a1a1a] text-[#CBA153] border border-[#CBA153]/30"
          : "bg-[#3A1015] text-[#F4B8BC] border border-[#F4B8BC]/30"
      }`}
    >
      {type === "success" ? "✓ " : "✕ "}{message}
    </motion.div>
  );
}

// ─── Inline Editable Text ────────────────────────────────────────────────────
function EditableText({ value, onSave, className }: { value: string; onSave: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  return editing ? (
    <span className="inline-flex items-center gap-1">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className={`bg-[#1a1a1a] border border-[#CBA153]/40 rounded px-2 py-0.5 text-white outline-none ${className}`}
        onKeyDown={(e) => { if (e.key === "Enter") { onSave(draft); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
      />
      <button onClick={() => { onSave(draft); setEditing(false); }} className="text-[#CBA153] hover:text-white"><Check size={14} /></button>
      <button onClick={() => setEditing(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
    </span>
  ) : (
    <span className={`cursor-pointer group ${className}`} onClick={() => { setDraft(value); setEditing(true); }}>
      {value} <Edit2 size={11} className="inline opacity-0 group-hover:opacity-50 ml-1 text-[#CBA153]" />
    </span>
  );
}

// ─── Category Row ────────────────────────────────────────────────────────────
function CategoryRow({ cat, type }: { cat: CategoryItem; type: "clothing" | "jewelry" }) {
  const updateCategory = useAdminStore((s) => s.updateCategory);
  const deleteCategory = useAdminStore((s) => s.deleteCategory);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateCategory(cat.id, { image: url }, type);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="flex items-center gap-4 bg-[#111] border border-white/8 rounded-2xl px-4 py-3 group"
    >
      {/* Category Image */}
      <button onClick={() => fileRef.current?.click()} className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#CBA153]/30 hover:border-[#CBA153] transition-colors shrink-0">
        <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <ImageIcon size={14} className="text-white" />
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* Title */}
      <div className="flex-1 min-w-0">
        <EditableText
          value={cat.title}
          onSave={(v) => updateCategory(cat.id, { title: v }, type)}
          className="text-white text-sm font-sans"
        />
        {cat.tagline && (
          <EditableText
            value={cat.tagline}
            onSave={(v) => updateCategory(cat.id, { tagline: v }, type)}
            className="text-slate-400 text-xs"
          />
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => deleteCategory(cat.id, type)}
        className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

// ─── Product Row ─────────────────────────────────────────────────────────────
function ProductRow({ product, onToast }: { product: Product; onToast: (m: string, t: "success" | "error") => void }) {
  const starProduct = useAdminStore((s) => s.starProduct);
  const deleteProduct = useAdminStore((s) => s.deleteProduct);
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const fileRef = useRef<HTMLInputElement>(null);
  const starredCount = useAdminStore((s) => s.products.filter((p) => p.isStarred).length);

  const handleStar = () => {
    const result = starProduct(product.id);
    onToast(result.message, result.success ? "success" : "error");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateProduct(product.id, { imageSrc: url, images: [url, url, url] });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="flex items-center gap-4 bg-[#111] border border-white/8 rounded-2xl px-4 py-3 group"
    >
      {/* Product Image */}
      <button onClick={() => fileRef.current?.click()} className="relative w-12 h-16 rounded-xl overflow-hidden border border-white/10 hover:border-[#CBA153]/50 transition-colors shrink-0">
        <img src={product.imageSrc} alt={product.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <ImageIcon size={14} className="text-white" />
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <EditableText
          value={product.title}
          onSave={(v) => updateProduct(product.id, { title: v })}
          className="text-white text-sm font-sans font-medium"
        />
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] uppercase tracking-widest text-[#CBA153]/60 font-sans">{product.type}</span>
          <span className="text-slate-600">·</span>
          <EditableText
            value={product.category}
            onSave={(v) => updateProduct(product.id, { category: v })}
            className="text-slate-400 text-xs"
          />
        </div>
      </div>

      {/* Star Button */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={handleStar}
        className={`p-2 rounded-xl transition-all ${
          product.isStarred
            ? "text-[#CBA153] bg-[#CBA153]/10 hover:bg-[#CBA153]/20"
            : starredCount >= 4
            ? "text-slate-700 cursor-not-allowed"
            : "text-slate-500 hover:text-[#CBA153] hover:bg-[#CBA153]/10"
        }`}
        title={product.isStarred ? "Remove from Signature Collection" : starredCount >= 4 ? "Limit: 4 starred max" : "Add to Signature Collection"}
      >
        <Star size={16} fill={product.isStarred ? "currentColor" : "none"} />
      </motion.button>

      {/* Delete */}
      <button
        onClick={() => deleteProduct(product.id)}
        className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "products">("categories");
  const [typeTab, setTypeTab] = useState<"clothing" | "jewelry">("clothing");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const clothingCategories = useAdminStore((s) => s.clothingCategories);
  const jewelryCategories = useAdminStore((s) => s.jewelryCategories);
  const addCategory = useAdminStore((s) => s.addCategory);
  const products = useAdminStore((s) => s.products);
  const addProduct = useAdminStore((s) => s.addProduct);
  const starredCount = products.filter((p) => p.isStarred).length;

  const activeCategories = typeTab === "clothing" ? clothingCategories : jewelryCategories;
  const activeProducts = products.filter((p) => p.type === typeTab);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddCategory = () => {
    addCategory(
      {
        title: "New Category",
        image: "/categories/simple_suit.jpg",
        tagline: "Edit this tagline",
      },
      typeTab
    );
  };

  const handleAddProduct = () => {
    addProduct({
      title: "New Product",
      category: activeCategories[0]?.title || "Uncategorized",
      type: typeTab,
      imageSrc: "/categories/simple_suit.jpg",
      images: ["/categories/simple_suit.jpg"],
      description: "Product description",
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#CBA153]/60 mb-1">Raani Closet</p>
          <h1 className="text-2xl font-serif text-white">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111] border border-[#CBA153]/20 rounded-2xl px-4 py-2">
            <Star size={14} className="text-[#CBA153]" fill="currentColor" />
            <span className="text-sm text-[#CBA153] font-mono">{starredCount}/4</span>
            <span className="text-slate-600 text-xs">Signature Collection</span>
          </div>
          <a href="/" className="text-xs text-slate-500 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded-xl transition-colors">← Live Site</a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Tabs */}
        <div className="flex gap-2 mb-8 bg-[#111] border border-white/8 rounded-2xl p-1 w-fit">
          {(["categories", "products"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-sans capitalize transition-all duration-300 ${
                activeTab === tab
                  ? "bg-[#CBA153] text-[#1a1a1a] font-semibold shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Type Sub-Tabs */}
        <div className="flex gap-2 mb-6">
          {(["clothing", "jewelry"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeTab(t)}
              className={`px-5 py-1.5 rounded-full text-xs uppercase tracking-widest border transition-all duration-300 ${
                typeTab === t
                  ? "border-[#CBA153]/60 text-[#CBA153] bg-[#CBA153]/8"
                  : "border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ─── CATEGORIES ─────────────────────────────────────────────────── */}
        {activeTab === "categories" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm">{activeCategories.length} categories</p>
              <button
                onClick={handleAddCategory}
                className="flex items-center gap-2 bg-[#CBA153] text-[#1a1a1a] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#DFB76C] transition-colors"
              >
                <Plus size={15} /> Add Category
              </button>
            </div>
            <motion.div layout className="space-y-3">
              <AnimatePresence>
                {activeCategories.map((cat) => (
                  <CategoryRow key={cat.id} cat={cat} type={typeTab} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* ─── PRODUCTS ───────────────────────────────────────────────────── */}
        {activeTab === "products" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm">{activeProducts.length} products · {starredCount} starred</p>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 bg-[#CBA153] text-[#1a1a1a] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#DFB76C] transition-colors"
              >
                <Plus size={15} /> Add Product
              </button>
            </div>

            {/* Starred limit warning */}
            {starredCount >= 4 && (
              <div className="flex items-center gap-3 bg-[#3A1015]/40 border border-[#F4B8BC]/20 rounded-2xl px-4 py-3 mb-4">
                <Star size={14} className="text-[#CBA153]" fill="currentColor" />
                <p className="text-xs text-[#F4B8BC]">
                  Signature Collection is full (4/4). Remove a star to feature a different product.
                </p>
              </div>
            )}

            <motion.div layout className="space-y-3">
              <AnimatePresence>
                {activeProducts.map((product) => (
                  <ProductRow key={product.id} product={product} onToast={showToast} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
