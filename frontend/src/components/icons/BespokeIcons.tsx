import React from 'react';
import { Check, PenTool, Sparkles, Aperture, Shirt, Scissors, User, Truck, Loader2 } from 'lucide-react';

export const ToileShirtIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M9 4.8 C10.2 4.2 13.8 4.2 15 4.8" />
    <path d="M9 4.8 L7.8 7.8 L12 9 L16.2 7.8 L15 4.8" />
    <path d="M9 4.8 L3.8 7.5 L2.8 10.8 L5.6 11.6 L6.5 10.5 L6.2 19.5 C9 20.8 15 20.8 17.8 19.5 L17.5 10.5 L18.4 11.6 L21.2 10.8 L20.2 7.5 L15 4.8" />
    <line x1="12" y1="9" x2="12" y2="20.3" strokeDasharray="1.5 1.5" />
    <path d="M17.5 10.5 C17.8 9 17 7.5 15 6.8" strokeDasharray="1.2 1.2" strokeOpacity="0.8" />
    <path d="M14.5 13.5 H16.5 M15.5 12.5 V14.5" />
  </svg>
);

export const NeedleThreadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M4 19.5 L16.8 6.7 C17.3 6.2 17.6 5.4 18.4 4.6 C19.3 3.7 20.4 4.8 19.5 5.7 C18.7 6.5 17.9 6.8 17.4 7.3 Z" />
    <line x1="17.6" y1="5.6" x2="18.4" y2="4.8" />
    <path d="M21 2.5 C19.5 2.5 18.2 3.8 18.2 5.8 C18.2 9.2 22.2 10.2 20.2 13.5 C18.2 16.8 11.8 11.2 9 14.2 C6.8 16.8 8.2 20.2 11.5 20.8" stroke="#CBA153" />
  </svg>
);

export const PremiumTruckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M2 17 V8.5 C2 7.7 2.7 7 3.5 7 H13 C13.4 7 13.8 7.2 14 7.5 L17.5 12 H20.5 C21.3 12 22 12.7 22 13.5 V17 H19.5" />
    <path d="M15.5 17 H8.5" />
    <path d="M4.5 17 H2" />
    <path d="M13 8.5 H13.8 L16.8 12 H13 Z" />
    <line x1="10.5" y1="7" x2="10.5" y2="17" strokeOpacity="0.4" />
    <circle cx="6.5" cy="17" r="2" />
    <circle cx="6.5" cy="17" r="0.5" fill="currentColor" />
    <circle cx="17.5" cy="17" r="2" />
    <circle cx="17.5" cy="17" r="0.5" fill="currentColor" />
    <line x1="20.5" y1="14" x2="22" y2="14" />
  </svg>
);

export const HauteStarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 4.8 C12 8.8 15.2 12 19.2 12 C15.2 12 12 15.2 12 19.2 C12 15.2 8.8 12 4.8 12 C8.8 12 12 8.8 12 4.8 Z" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </svg>
);

export const ATELIER_ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  check: Check,
  'pen-tool': PenTool,
  fabric: Sparkles,
  chakra: Aperture,      
  mannequin: ToileShirtIcon,
  needle: NeedleThreadIcon,
  suit: User,
  truck: PremiumTruckIcon,
};

export function resolveTimelineIcon(name: string) {
  return ATELIER_ICON_MAP[name] || Sparkles;
}
