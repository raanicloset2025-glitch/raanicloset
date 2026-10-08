"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { Check, X, ZoomIn, ZoomOut, RotateCcw, RotateCw, Loader2, RefreshCw } from "lucide-react";
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          <div>
            <h3 className="text-base font-serif text-white tracking-wide">{title}</h3>
            <p className="text-xs text-slate-400 font-sans mt-1">Adjust framing, zoom, and rotation</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-[400px] bg-[#050505]">
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
            style={{
              containerStyle: { backgroundColor: '#050505' },
              cropAreaStyle: { border: '2px solid #CBA153', boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.8)' }
            }}
          />
        </div>

        {/* Controls & Actions */}
        <div className="p-6 bg-[#0F0F0F] border-t border-white/5 space-y-6">
          <div className="space-y-5">
            {/* Zoom Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Zoom</label>
                <span className="text-[10px] text-[#CBA153] font-mono bg-[#CBA153]/10 px-2 py-0.5 rounded">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setZoom(Math.max(1, zoom - 0.1))} className="text-slate-500 hover:text-[#CBA153] transition-colors" title="Zoom Out">
                  <ZoomOut size={18} />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer outline-none hover:bg-white/20 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#CBA153] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(203,161,83,0.3)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-[#CBA153] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(203,161,83,0.3)] [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-125"
                />
                <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="text-slate-500 hover:text-[#CBA153] transition-colors" title="Zoom In">
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>

            {/* Rotate Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Rotate</label>
                <span className="text-[10px] text-[#CBA153] font-mono bg-[#CBA153]/10 px-2 py-0.5 rounded">{rotation}°</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setRotation((rotation - 90 + 360) % 360)} className="text-slate-500 hover:text-[#CBA153] transition-colors" title="Rotate Left">
                  <RotateCcw size={18} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer outline-none hover:bg-white/20 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#CBA153] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(203,161,83,0.3)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-[#CBA153] [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(203,161,83,0.3)] [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-125"
                />
                <button onClick={() => setRotation((rotation + 90) % 360)} className="text-slate-500 hover:text-[#CBA153] transition-colors" title="Rotate Right">
                  <RotateCw size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button
              onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-sans uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw size={14} />
              Reset
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-sans uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCroppedImage}
                disabled={isCompressing}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#CBA153] hover:bg-[#DFB76C] text-[#1A1A1A] font-bold text-xs font-sans uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(203,161,83,0.2)] hover:shadow-[0_0_30px_rgba(203,161,83,0.4)] disabled:opacity-50 disabled:shadow-none"
              >
                {isCompressing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {isCompressing ? "Uploading..." : "Apply Crop"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
