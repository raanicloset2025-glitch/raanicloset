"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { Check, X, ZoomIn, RotateCcw, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/uploadHelper";

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
  const [rotation, setRotation] = useState(0);
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

      const rotRad = (rotation * Math.PI) / 180;
      const bBoxWidth = Math.abs(Math.cos(rotRad) * img.width) + Math.abs(Math.sin(rotRad) * img.height);
      const bBoxHeight = Math.abs(Math.sin(rotRad) * img.width) + Math.abs(Math.cos(rotRad) * img.height);

      const bBoxCanvas = document.createElement("canvas");
      bBoxCanvas.width = bBoxWidth;
      bBoxCanvas.height = bBoxHeight;
      const bBoxCtx = bBoxCanvas.getContext("2d");

      if (!bBoxCtx) {
        setIsCompressing(false);
        return;
      }

      bBoxCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
      bBoxCtx.rotate(rotRad);
      bBoxCtx.translate(-img.width / 2, -img.height / 2);
      bBoxCtx.drawImage(img, 0, 0);

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
        bBoxCanvas,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Export compressed WebP to Supabase
      canvas.toBlob(async (blob) => {
        if (!blob) {
            setIsCompressing(false);
            return;
        }
        try {
            const file = new File([blob], `cropped-${Date.now()}.webp`, { type: 'image/webp' });
            const url = await uploadImage(file);
            
            if (imageSrc.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
            onCropComplete(url);
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
            rotation={rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Controls & Actions */}
        <div className="p-5 bg-[#1A1A1A] border-t border-white/10 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <ZoomIn size={14} className="text-slate-400 min-w-[14px]" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CBA153] outline-none hover:bg-white/20 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-[#CBA153] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-[#CBA153] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full"
              />
              <button onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); }} className="p-1 text-slate-400 hover:text-white min-w-[24px] flex justify-center" title="Reset">
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <RotateCcw size={14} className="text-slate-400 min-w-[14px]" />
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CBA153] outline-none hover:bg-white/20 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-[#CBA153] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-[#CBA153] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full"
              />
              <div className="min-w-[24px]"></div>
            </div>
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
