'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Package, Clock, LogOut, X, Scissors, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

interface AccountMenuProps {
  isMobile?: boolean;
  isJewelry?: boolean;
}

export default function AccountMenu({ isMobile = false, isJewelry = false }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const setAuthModalOpen = useStore((state) => state.setAuthModalOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close when clicking outside (for desktop dropdown)
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.account-menu-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, isMobile]);

  // Prevent scrolling when drawer/tracker is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isMobile]);

  const textColor = isJewelry ? 'text-slate-300' : 'text-[#3B2F2F]';
  const iconColor = isJewelry ? 'text-slate-400' : 'text-[#3B2F2F]/60';
  const bgColor = isJewelry ? 'bg-[#0A0507]' : 'bg-[#F9F6F0]';
  const borderClass = isJewelry ? 'border-slate-800' : 'border-[#E0A29C]/20';
  const hoverBg = isJewelry ? 'hover:bg-slate-900' : 'hover:bg-white';

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // Not logged in -> Open Auth Modal
      setAuthModalOpen(true);
    } else {
      // Logged in -> Toggle Menu
      setIsOpen(!isOpen);
    }
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative account-menu-container">
      {/* TRIGGER BUTTON */}
      <button 
        onClick={handleTriggerClick}
        className={isMobile 
          ? `w-6 h-6 flex justify-center items-center transition-colors duration-[1000ms] ${iconColor}`
          : `relative w-5 h-5 group hover:scale-[1.08] active:scale-[0.95] transition-transform duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${textColor}`
        }
        aria-label="Account"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="absolute inset-0 w-full h-full">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {/* DESKTOP DROPDOWN */}
      {!isMobile && user && (
        <div 
          className={`absolute right-0 top-full mt-4 w-56 rounded-2xl border ${borderClass} ${bgColor} shadow-2xl p-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform origin-top-right ${
            isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="p-3 mb-2 border-b border-inherit">
            <span className={`block font-sans text-sm ${isJewelry ? 'text-slate-200' : 'text-[#1A1A1A]'}`}>
              {user.email}
            </span>
            <span className={`block font-royal text-[9px] tracking-widest uppercase mt-1 text-[#CBA153]`}>
              {user.name}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={handleLogoutClick}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-sans text-xs tracking-wider uppercase transition-all duration-300 ${hoverBg} ${
                isJewelry ? 'text-slate-400 hover:text-slate-200' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* MOBILE SIDE DRAWER PORTALED */}
      {isMobile && user && mounted && createPortal(
        <>
          <div 
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
              isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsOpen(false)}
          />
          <div 
            className={`fixed top-0 right-0 h-[100vh] w-[85vw] sm:w-[400px] ${bgColor} z-[110] shadow-2xl border-l ${borderClass} transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className={`flex items-center justify-between p-6 border-b ${borderClass}`}>
              <div>
                <span className={`block font-sans text-lg ${isJewelry ? 'text-slate-200' : 'text-[#1A1A1A]'}`}>
                  {user.email}
                </span>
                <span className={`block font-royal text-[10px] tracking-widest uppercase mt-1 text-[#CBA153]`}>
                  {user.name}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full ${hoverBg} ${isJewelry ? 'text-slate-400' : 'text-[#1A1A1A]/50'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              <button
                onClick={handleLogoutClick}
                className={`flex items-center gap-4 w-full p-4 rounded-2xl font-sans text-xs tracking-widest uppercase transition-all duration-300 ${hoverBg} ${
                  isJewelry ? 'text-slate-400 hover:text-slate-200' : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A]'
                }`}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
