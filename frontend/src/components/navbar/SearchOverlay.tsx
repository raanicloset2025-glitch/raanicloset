'use client';

import { useEffect, useState } from 'react';

export default function SearchOverlay({ isOpen, onClose, isJewelry }: { isOpen: boolean, onClose: () => void, isJewelry: boolean }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        document.getElementById('raani-search-input')?.focus();
      }, 100);
    } else {
      setQuery(''); 
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] backdrop-blur-2xl ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      } ${isJewelry ? 'bg-[#0a0a0c]/80' : 'bg-[#f9f6f0]/90'}`}
    >
      <div className="flex justify-between items-center px-6 md:px-12 py-8">
        <span className={`font-painter text-5xl tracking-wide ${isJewelry ? 'text-slate-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-[#3B2F2F]'}`}>Raani</span>
        <button 
          onClick={onClose} 
          className={`font-royal italic text-sm tracking-widest uppercase transition-colors hover:scale-105 active:scale-95 ${isJewelry ? 'text-slate-400 hover:text-white' : 'text-[#3B2F2F]/60 hover:text-[#3B2F2F]'}`}
        >
          Close [Esc]
        </button>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center px-8 w-full max-w-5xl mx-auto -mt-32">
        <div className="relative w-full">
          <input 
            id="raani-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the collection..."
            className={`w-full text-center font-royal italic text-4xl md:text-6xl lg:text-7xl bg-transparent outline-none transition-colors border-b-[2px] pb-4 ${
              isJewelry 
                ? 'text-white border-slate-700/50 focus:border-slate-300 placeholder:text-slate-700/50' 
                : 'text-[#1A0B16] border-[#E0A29C]/30 focus:border-[#E0A29C]/80 placeholder:text-[#3B2F2F]/20'
            }`}
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        <div className={`mt-16 text-center transition-all duration-700 ${query.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className={`font-sans text-[10px] uppercase tracking-[0.3em] font-semibold ${isJewelry ? 'text-slate-500' : 'text-[#3B2F2F]/40'}`}>
            Press Enter to search for "{query}"
          </p>
        </div>
      </div>
    </div>
  );
}
