"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
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
  title = "Adjust And Crop Image",
  onCropComplete,
  onClose,
}: CropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const createCroppedImage = async () => {
    try {
      if (!completedCrop || !imgRef.current) {
        alert("Please make a selection first");
        return;
      }
      setIsCompressing(true);

      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setIsCompressing(false);
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsCompressing(false);
          return;
        }
        try {
          const file = new File([blob], `cropped-${Date.now()}.webp`, { type: "image/webp" });
          const url = await uploadImage(file);
          if (imageSrc.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
          onCropComplete(url);
          onClose();
        } catch (uploadErr) {
          console.error("Upload failed", uploadErr);
          alert("Image upload failed.");
          setIsCompressing(false);
        }
      }, "image/webp", 0.9);
    } catch (e) {
      console.error("Error cropping image:", e);
      setIsCompressing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col my-8"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h3 className="text-base font-serif text-white tracking-wide">{title}</h3>
            <p className="text-xs text-slate-400 font-sans mt-1">Drag corners to resize crop area freely</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover*text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="relative w-full bg-[#050505] flex items-center justify-center p-4 min-h-[300px] max-h-[60vh] overflow-hidden">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            className="max-h-full"
          >
            <img 
              ref={imgRef} 
              src={imageSrc} 
              alt="Crop target" 
              className="max-h-[50vh] w-auto object-contain"
              onLoad={(e) => {
                setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 });
              }}
            />
          </ReactCrop>
        </div>

        <div className="p-6 flex items-center justify-between border-t border-white/5 bg-[#0F0F0F]">
          <button onClick={onClose} className="px-5 py-2.5 text-xs uppercase tracking-wider text-slate-300 hover:text-white">
            Cancel
          </button>
          <button
            onClick={createCroppedImage}
            disabled={isCompressing || !completedCrop?.width || !completedCrop?.height}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#CBA153] hover:bg-[#DFB76C] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest rounded-full transition-all disabled:opacity-50"
          >
            {isCompressing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isCompressing ? "}Ploading..." : "Crop And Save"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
