'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function PDPCurtainDrop() {
  const setIsTransitioning = useStore((state) => state.setIsTransitioning);

  useEffect(() => {
    // 1. Force the body to black when the PDP mounts
    document.body.style.background = '#050102';

    // 2. Stop the transition overlay so the fade-in can happen
    // We add a tiny delay to ensure the DOM is painted first
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.background = '';
    };
  }, [setIsTransitioning]);

  return null;
}
