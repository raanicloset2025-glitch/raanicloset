"use client";

import React, { useState } from "react";
import { Product, useAdminStore } from "@/store/useAdminStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Plus, Trash2, GripVertical, Check } from "lucide-react";
import CropModal from "./CropModal";

interface ProductMasterEditorProps {
  product: Product;
  onClose: () => void;
}

export default function ProductMasterEditor({ product, onClose }: ProductMasterEditorProps) {
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const products = useAdminStore((s) => s.products);
  const [activeTab, setActiveTab] = useState<"gallery" | "craft" | "curated">("gallery");

  // Local state for the product being edited
  const [editedProduct, setEditedProduct] = useState<Product>(product);

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

  const handleSelectFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    aspect: number,
    title: string,
    onComplete: (croppedUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropperState({ isOpen: true, imageSrc: url, aspect, title, onComplete });
    e.target.value = "";
  };

  const handleSave = () => {
    updateProduct(product.id, editedProduct);
    onClose();
  };

  const updateField = (field: keyof Product, value: any) => {
    setEditedProduct((prev) => ({ ...prev, [field]: value }));
  };

  // Gallery Helpers
  const getGallery = (p: Product) =>
    p.images && p.images.length >= 3 ? p.images : [p.imageSrc, p.imageSrc, p.imageSrc];
  const images = getGallery(editedProduct);

  const updateGalleryImage = (index: number, url: string) => {
    setEditedProduct((prev) => {
      const newImages = [...getGallery(prev)];
      newImages[index] = url;
      return { ...prev, images: newImages };
    });
  };

  // Specs Helpers
  const specs = editedProduct.craftSpecs || (editedProduct.type === 'jewelry' 
    ? [{ label: "Material", value: "22K Gold & Uncut Polki" }, { label: "Origin", value: "Handcrafted in Jaipur" }]
    : [{ label: "Material", value: "Pure Chanderi / Silk" }, { label: "Origin", value: "Woven in Madhya Pradesh" }]);

  const addSpec = () => {
    setEditedProduct({ ...editedProduct, craftSpecs: [...specs, { label: "New Spec", value: "Detail" }] });
  };

  const updateSpec = (index: number, field: 'label' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setEditedProduct({ ...editedProduct, craftSpecs: newSpecs });
  };

  const deleteSpec = (index: number) => {
    const newSpecs = specs.filter((_, i) => i !== index);
    setEditedProduct({ ...editedProduct, craftSpecs: newSpecs });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#FAFAFA] w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
      >
        {/* Header */}
        <div className="bg-white border-b border-[#EAEAEA] px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-serif text-[#1A0B16] font-bold">Product Master Editor</h2>
            <p className="text-[10px] uppercase tracking-wider text-[#888] font-medium mt-1">Editing: {editedProduct.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-slate-400 hover:text-[#1A0B16] p-2 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 border-b border-[#EAEAEA] bg-white shrink-0">
          <button 
            onClick={() => setActiveTab("gallery")}
            className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "gallery" ? "border-[#CBA153] text-[#1A0B16]" : "border-transparent text-[#888] hover:text-[#1A0B16]"}`}
          >
            1. Hero Gallery & Description
          </button>
          <button 
            onClick={() => setActiveTab("craft")}
            className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "craft" ? "border-[#CBA153] text-[#1A0B16]" : "border-transparent text-[#888] hover:text-[#1A0B16]"}`}
          >
            2. The Craft & Specs
          </button>
          <button 
            onClick={() => setActiveTab("curated")}
            className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "curated" ? "border-[#CBA153] text-[#1A0B16]" : "border-transparent text-[#888] hover:text-[#1A0B16]"}`}
          >
            3. Curated Pairings
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          
          {activeTab === "gallery" && (
            <div className="space-y-10">
              {/* Gallery Uploader */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1A0B16]">Floating Gallery Images (3)</h3>
                  <p className="text-xs text-[#888]">These 3 images appear in the 3D floating gallery on the PDP hero section.</p>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#EAEAEA] group bg-white">
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-sm">
                        <Camera size={24} className="mb-2 text-[#CBA153]" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest">Change Photo {i+1}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSelectFile(e, 3/4, `Gallery Image ${i+1}`, (url) => updateGalleryImage(i, url))} />
                      </label>
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-md">
                        {i === 0 ? "Left" : i === 1 ? "Center" : "Right"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#EAEAEA] pt-10">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block mb-2">Product Title</label>
                    <input 
                      value={editedProduct.title} 
                      onChange={(e) => updateField('title', e.target.value)}
                      className="w-full font-serif text-2xl text-[#1A0B16] bg-white border border-[#EAEAEA] rounded-lg px-4 py-3 outline-none focus:border-[#CBA153]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block mb-2">Badge / Subtitle (e.g. Party Wear Suits)</label>
                    <input 
                      value={editedProduct.category} 
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full text-sm text-[#1A0B16] bg-white border border-[#EAEAEA] rounded-lg px-4 py-3 outline-none focus:border-[#CBA153]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block mb-2">Short Description (Hero Section)</label>
                  <textarea 
                    value={editedProduct.description || ""} 
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full h-32 text-sm text-[#4A4A4A] bg-white border border-[#EAEAEA] rounded-lg px-4 py-3 outline-none focus:border-[#CBA153] resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "craft" && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row gap-10">
                
                {/* Craft Image */}
                <div className="w-full md:w-1/3 space-y-4">
                   <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1A0B16]">Main Card Photo / Craft Image</h3>
                    <p className="text-xs text-[#888]">Collection card par aur PDP "The Craft" section mein dikhta hai.</p>
                  </div>
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[#EAEAEA] group bg-white max-w-sm">
                    <img src={editedProduct.imageSrc} alt="Craft Image" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-sm">
                      <Camera size={24} className="mb-2 text-[#CBA153]" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">Change Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSelectFile(e, 3/4, "Main Card Photo", (url) => setEditedProduct((prev) => ({ ...prev, images: getGallery(prev), imageSrc: url })))} />
                    </label>
                  </div>
                </div>

                {/* Craft Content */}
                <div className="w-full md:w-2/3 space-y-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block mb-2">Craft Section Title</label>
                      <input 
                        value={editedProduct.craftTitle || "The Craft"} 
                        onChange={(e) => updateField('craftTitle', e.target.value)}
                        className="w-full font-serif text-3xl text-[#B8860B] bg-white border border-[#EAEAEA] rounded-lg px-4 py-3 outline-none focus:border-[#CBA153]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#888] block mb-2">Craft Detailed Description</label>
                      <textarea 
                        value={editedProduct.craftText || ""} 
                        onChange={(e) => updateField('craftText', e.target.value)}
                        className="w-full h-32 text-sm text-[#4A4A4A] bg-white border border-[#EAEAEA] rounded-lg px-4 py-3 outline-none focus:border-[#CBA153] resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Dynamic Specs */}
                  <div className="space-y-4 border-t border-[#EAEAEA] pt-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1A0B16]">Specifications</h3>
                        <p className="text-xs text-[#888]">Dynamic key-value pairs (e.g. Material, Origin)</p>
                      </div>
                      <button onClick={addSpec} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A0B16] text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#CBA153] hover:text-[#1A0B16] transition-colors">
                        <Plus size={14} /> Add Spec
                      </button>
                    </div>

                    <div className="space-y-3">
                      {specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white border border-[#EAEAEA] p-3 rounded-lg group">
                          <GripVertical size={16} className="text-[#CCC] cursor-move hidden md:block" />
                          <input 
                            value={spec.label}
                            onChange={(e) => updateSpec(i, 'label', e.target.value)}
                            placeholder="Label (e.g. MATERIAL)"
                            className="w-1/3 text-xs font-bold uppercase tracking-wider text-[#CBA153] bg-transparent outline-none border-b border-dashed border-transparent hover:border-[#CBA153]/50 focus:border-[#CBA153]"
                          />
                          <input 
                            value={spec.value}
                            onChange={(e) => updateSpec(i, 'value', e.target.value)}
                            placeholder="Value (e.g. Pure Silk)"
                            className="flex-1 text-sm font-serif text-[#1A0B16] bg-transparent outline-none border-b border-dashed border-transparent hover:border-[#CBA153]/50 focus:border-[#CBA153]"
                          />
                          <button onClick={() => deleteSpec(i)} className="text-[#CCC] hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === "curated" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1A0B16]">Manually Select Pairings</h3>
                <p className="text-xs text-[#888]">Click on up to 4 products to feature them in the "Curated Pairings" section at the bottom of the PDP page. If none are selected, it will automatically show products from the same category.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.filter(p => p.id !== product.id && p.type === product.type).map(p => {
                  const isSelected = (editedProduct.relatedProductIds || []).includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        let newIds = [...(editedProduct.relatedProductIds || [])];
                        if (isSelected) {
                          newIds = newIds.filter(id => id !== p.id);
                        } else {
                          if (newIds.length < 4) newIds.push(p.id);
                        }
                        updateField('relatedProductIds', newIds);
                      }}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${isSelected ? 'border-[#CBA153] scale-95 shadow-lg' : 'border-transparent hover:border-[#EAEAEA]'}`}
                    >
                      <img src={p.imageSrc} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-black/20' : 'bg-transparent'}`} />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#CBA153] text-white p-1 rounded-full">
                          <Check size={14} />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-[9px] text-white font-bold uppercase truncate">{p.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-[#EAEAEA] px-6 py-4 flex items-center justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#888] hover:text-[#1A0B16] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-8 py-2.5 bg-[#CBA153] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-[#B38B3F] transition-colors shadow-md">
            <Check size={16} /> Save Changes
          </button>
        </div>

      </motion.div>

      {/* Cropper Modal for inside Master Editor */}
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
    </div>
  );
}
