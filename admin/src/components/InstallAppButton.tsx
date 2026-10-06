'use client';

import { useState, useEffect } from 'react';

// Define the BeforeInstallPromptEvent interface since it's not in standard lib
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

interface InstallAppButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'sidebar';
}

export default function InstallAppButton({ className = '', variant = 'primary' }: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt. Clear it up.
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) {
    return null;
  }

  const baseClasses = "flex items-center justify-center transition-colors";
  
  let variantClasses = "";
  if (variant === 'primary') {
    variantClasses = "w-full py-3 px-4 bg-[#CBA153] text-[#1A0B16] font-medium rounded shadow-sm hover:bg-[#b58b44]";
  } else if (variant === 'secondary') {
    variantClasses = "py-2 px-4 border border-[#CBA153] text-[#CBA153] rounded hover:bg-[#CBA153] hover:text-[#1A0B16]";
  } else if (variant === 'sidebar') {
    variantClasses = "w-full py-2 px-4 border border-white/20 text-white rounded hover:bg-white/10 hover:border-white/40 text-sm";
  }

  return (
    <button 
      onClick={handleInstallClick} 
      className={`${baseClasses} ${variantClasses} ${className}`}
      type="button"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Install App
    </button>
  );
}
