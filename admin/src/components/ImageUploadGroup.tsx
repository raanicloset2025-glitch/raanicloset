import React, { useState, useRef, useEffect } from "react";
import { uploadImage } from "../lib/uploadHelper";

interface ImageUploadGroupProps {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  fallbackImage: string;
  darkIcon?: boolean;
}

const ImageUploadGroup = React.memo(function ImageUploadGroup({ label, value, onChange, fallbackImage, darkIcon }: ImageUploadGroupProps) {
  const [isEncoding, setIsEncoding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsEncoding(true);

    try {
      const publicUrl = await uploadImage(file, (p) => {
        // can use progress here if needed
      });
      if (isMounted.current) {
        onChange(publicUrl);
        setIsEncoding(false);
      }
    } catch (error) {
      console.error("Image encoding failed:", error);
      if (isMounted.current) {
        alert("Image compression failed (WebP). Please check console.");
        setIsEncoding(false);
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <label className="group cursor-pointer block h-full">
      <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">
        {label}
      </span>
      <div 
        className={`border border-[#EAEAEA] rounded-lg p-6 flex flex-col items-center justify-center transition-colors shadow-sm relative overflow-hidden h-32
          ${isEncoding ? "cursor-wait opacity-80" : "hover:bg-[#FAFAFA] group-hover:border-[#CBA153]"} 
          ${darkIcon ? "bg-[#1A0B16] hover:bg-black" : "bg-white"}
        `}
        onClick={(e) => {
          if (isEncoding) {
            e.preventDefault();
          }
        }}
      >
        {isEncoding ? (
          <div className="text-center z-10 w-full flex flex-col items-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#1A0B16]/20 border-t-[#CBA153] animate-spin mb-3"></div>
            <div className={`text-[10px] tracking-wider uppercase font-medium ${darkIcon ? 'text-white' : 'text-[#1A0B16]'}`}>Compressing to WEBP...</div>
          </div>
        ) : (
          <>
            {value ? (
              <img src={value} alt={`${label} Preview`} className="h-10 object-contain mb-3" />
            ) : (
              <div className={`h-10 w-10 mb-3 border-2 border-dashed rounded-lg ${darkIcon ? 'border-gray-500' : 'border-gray-300'}`}></div>
            )}
            <span className={`text-[10px] font-medium ${darkIcon ? 'text-[#CCC]' : 'text-[#888]'}`}>Upload {label}</span>
          </>
        )}
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isEncoding}
        />
      </div>
    </label>
  );
});

export default ImageUploadGroup;
