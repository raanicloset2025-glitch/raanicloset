'use client';

import { useStore } from '@/store/useStore';

export default function TransitionCurtain() {
  const isTransitioning = useStore((state) => state.isTransitioning);

  return (
    <div 
      className={`fixed inset-0 z-[9999] pointer-events-none bg-[#050102] transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isTransitioning ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
