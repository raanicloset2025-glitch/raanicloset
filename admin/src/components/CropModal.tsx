"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { Check, X, ZoomIn, RotateCcw, Loader2 } from "lucide-react";

export interface CropModalProps {
  imageSrc: string;
  aspect?: number;
  title?: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export default function CropModal({
  imageSrc,
  aspect = 1,
  title = "Adjust Image Focus & Crop",
  onCropComplete,
  onClose,
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const handleCropComplete = useCallback((_croppedArea: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const [isCompressing, setIsCompressing] = useState(false);

  const createCroppedImage = async () => {
    try {
      if (!croppedAreaPixels || !imageSrc) return;
      setIsCompressing(true);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setIsCompressing(false);
        return;
      }

      // Cap output size so the saved data stays light
      const MAX_DIM = 1400;
      const scale = Math.min(1, MAX_DIM / Math.max(croppedAreaPixels.width, croppedAreaPixels.height));
      canvas.width = Math.round(croppedAreaPixels.width * scale);
      canvas.height = Math.round(croppedAreaPixels.height * scale);

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Export compressed WebP to local filesystem
      canvas.toBlob(async (blob) => {
        if (!blob) {
            setIsCompressing(false);
            return;
        }
        try {
            const formData = new FormData();
            formData.append("file", blob, "cropped.webp");
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || "Upload failed");
            
            if (imageSrc.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
            onCropComplete(data.url);
            onClose();
        } catch (uploadErr) {
            console.error("Upload failed", uploadErr);
            alert("Image upload failed. Please check console.");
            setIsCompressing(false);
        }
      }, "image/webp", 0.82);
    } catch (e) {
      console.error("Error cropping image:", e);
      alert("Image crop failed. Please try another image.");
      setIsCompressing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1A1A1A]">
          <div>
            <h3 className="text-sm font-serif text-white">{title}</h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Drag to reposition focal point. Pinch or scroll to zoom.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-80 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Controls & Actions */}
        <div className="p-5 bg-[#1A1A1A] border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn size={14} className="text-slate-400" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#CBA153]"
            />
            <button onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); }} className="p-1 text-slate-400 hover:text-white" title="Reset Zoom">
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-sans uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createCroppedImage}
              disabled={isCompressing}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#CBA153] text-[#1A1A1A] font-semibold text-xs font-sans uppercase tracking-wider rounded-xl hover:bg-[#DFB76C] transition-all shadow-lg disabled:opacity-50"
            >
              {isCompressing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isCompressing ? "Uploading..." : "Apply Crop"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
