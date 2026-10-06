'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function HomeCurtainDrop() {
  const setIsTransitioning = useStore((state) => state.setIsTransitioning);

  useEffect(() => {
    // When homepage mounts, drop the curtain to reveal the page
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [setIsTransitioning]);

  return null;
}
