'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';

interface HexagonPatchworkBagProps {
  isJewelry?: boolean;
  onClick?: () => void;
  cartPulse?: boolean;
  cartCount?: number;
}

export default function HexagonPatchworkBag({ isJewelry = false, onClick, cartPulse = false, cartCount = 0 }: HexagonPatchworkBagProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center group focus:outline-none w-7 h-7 hover:scale-110 active:scale-95 transition-transform duration-300"
      aria-label="Reserved Items"
    >
      <style>{`
        .heartbeat-dot {
          animation: heartbeat-dot 0.8s ease-in-out infinite;
        }
        @keyframes heartbeat-dot {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(203, 161, 83, 0.7); }
          50% { transform: scale(1.15); box-shadow: 0 0 0 4px rgba(203, 161, 83, 0); }
        }
      `}</style>

      <Bookmark
        className={`w-5 h-5 transition-colors duration-700 group-hover:fill-current ${
          isJewelry ? 'text-[#CBA153] group-hover:text-[#D5B06D]' : 'text-[#3B2F2F] group-hover:text-[#CBA153]'
        }`}
        strokeWidth={1.5}
      />

      {mounted && cartCount > 0 && (
        <span className={`absolute -top-1 -right-2 flex h-[14px] w-[14px] items-center justify-center rounded-full shadow-sm text-[8px] font-bold transition-all duration-[800ms] ${cartPulse ? 'heartbeat-dot' : ''} bg-[#CBA153] text-[#1A1A1A] border border-[#CBA153]/50`}>
          {cartCount}
        </span>
      )}
    </button>
  );
}
