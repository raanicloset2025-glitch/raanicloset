import { useState, useRef, useLayoutEffect, useCallback } from 'react';

export interface NodePoint {
  x: number;
  y: number;
  nodeWidth: number;
  nodeHeight: number;
}

export function useTimelineOverlay(itemCount: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<(HTMLElement | null)[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [points, setPoints] = useState<NodePoint[]>([]);

  const registerNode = useCallback((index: number) => (el: HTMLElement | null) => {
    nodeRefs.current[index] = el;
  }, []);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const newPoints: NodePoint[] = [];
    for (let i = 0; i < itemCount; i++) {
      const nodeEl = nodeRefs.current[i];
      if (!nodeEl) continue;
      const rect = nodeEl.getBoundingClientRect();
      newPoints.push({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
        nodeWidth: rect.width,
        nodeHeight: rect.height,
      });
    }

    setDimensions({ width: containerRect.width, height: containerRect.height });
    setPoints(newPoints);
  }, [itemCount]);

  useLayoutEffect(() => {
    measure();

    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });

    ro.observe(containerRef.current);
    nodeRefs.current.forEach((el) => {
      if (el) ro.observe(el);
    });

    // Handle web-font loading shifts
    document.fonts?.ready?.then(measure);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return { containerRef, registerNode, dimensions, points };
}
