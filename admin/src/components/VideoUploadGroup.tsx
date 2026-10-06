import { useState, useRef, useEffect } from "react";
import { uploadVideo } from "../lib/uploadHelper";

export default function VideoUploadGroup({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  const [isEncoding, setIsEncoding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsEncoding(true);

    try {
      const publicUrl = await uploadVideo(file, (p) => {
        // Can add progress state here if needed
        console.log(`Video upload progress: ${p}%`);
      });

      if (isMounted.current) {
        onChange(publicUrl);
        setIsEncoding(false);
      }
    } catch (error) {
      console.error("Video upload failed:", error);
      alert("Video upload failed. Please check console.");
      if (isMounted.current) setIsEncoding(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-[10px] tracking-[0.2em] text-[#1A0B16]/60 uppercase font-semibold">
        {label}
      </label>
      
      <div 
        onClick={() => !isEncoding && fileInputRef.current?.click()}
        className={`w-full aspect-video border border-[#1A0B16]/10 rounded bg-[#F5F5F5] flex flex-col items-center justify-center p-4 transition-colors relative overflow-hidden ${isEncoding ? "cursor-wait opacity-80" : "cursor-pointer hover:border-[#1A0B16]/30"}`}
      >
        <input 
          type="file" 
          accept="video/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isEncoding}
        />
        
        {isEncoding ? (
          <div className="text-center z-10 w-full max-w-[80%]">
            <div className="w-8 h-8 rounded-full border-2 border-[#1A0B16]/20 border-t-[#CBA153] animate-spin mx-auto mb-3"></div>
            <div className="text-[10px] tracking-wider uppercase text-[#1A0B16] font-medium mb-2">Processing Video...</div>
          </div>
        ) : !value ? (
          <div className="text-center z-10">
            <svg className="w-6 h-6 mx-auto text-[#1A0B16]/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div className="text-[9px] tracking-[0.15em] uppercase font-semibold text-[#1A0B16]">
              UPLOAD VIDEO
            </div>
          </div>
        ) : null}

        {value && !isEncoding && (
          <video 
            src={value} 
            className="absolute inset-0 w-full h-full object-cover rounded"
            autoPlay loop muted playsInline
          />
        )}
      </div>
    </div>
  );
}
