'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTimelineOverlay } from './useTimelineOverlay';
import { resolveTimelineIcon } from '../icons/BespokeIcons';
import { StepStatus, TimelineStepItem } from './types';

interface ContinuousTimelineProps {
  steps: TimelineStepItem[];
  activeIndex: number;
}

export default function ContinuousTimeline({ steps, activeIndex }: ContinuousTimelineProps) {
  const { containerRef, registerNode, points, dimensions } = useTimelineOverlay(steps.length);

  return (
    <div className="relative w-full max-w-5xl mx-auto px-2.5 sm:px-6 md:px-8 py-12" ref={containerRef}>
      {/* 1. The Continuous Overlay SVG (Absolutely Positioned over the entire layout) */}
      <svg 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <defs>
          <linearGradient id="active-spine-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBA153" />
            <stop offset="100%" stopColor="#CBA153" stopOpacity={0.8} />
          </linearGradient>
        </defs>

        {points.length > 0 && points.map((point, i) => {
          if (i === points.length - 1) return null;
          
          const nextPoint = points[i + 1];
          const isCompleted = i < activeIndex;
          const isActiveTransition = i === activeIndex;
          
          // Basic Line connection: Since nodes might be vertically aligned (mobile) or zigzag (desktop),
          // We can use an S-curve Bezier that has vertical tangents.
          
          // To ensure true S-curve matching the exact aesthetic requested:
          // M startX, startY C startX, midY, endX, midY, endX, endY
          const startX = point.x;
          const startY = point.y + point.nodeHeight / 2;
          const endX = nextPoint.x;
          const endY = nextPoint.y - nextPoint.nodeHeight / 2;
          
          const distanceY = endY - startY;
          const cp1y = startY + distanceY * 0.4;
          const cp2y = endY - distanceY * 0.4;
          
          const pathD = `M ${startX} ${startY} C ${startX} ${cp1y}, ${endX} ${cp2y}, ${endX} ${endY}`;

          return (
            <g key={`connection-${i}`}>
              {/* Background Path (Dull Gold for upcoming) */}
              <path
                d={pathD}
                fill="none"
                stroke={isCompleted ? "#CBA153" : "rgba(203, 161, 83, 0.3)"}
                strokeWidth="2"
                strokeDasharray={isCompleted ? "none" : "6 6"}
              />

              {/* Active Golden Thread Over-Draw */}
              {isActiveTransition && (
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="url(#active-spine-gradient)"
                  strokeWidth="2.5"
                  className="filter-golden-thread"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* 2. The DOM Flow Nodes */}
      <div className="relative z-10 w-full flex flex-col space-y-4 md:space-y-0">
        {steps.map((item, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isUpcoming = index > activeIndex;
          
          const isLeft = index % 2 === 0;

          const IconComponent = resolveTimelineIcon(item.icon.name);

          // Render Row
          return (
            <div 
              key={item.id} 
              className={`timeline-row relative w-full flex min-h-[140px] md:min-h-[160px] items-stretch ${isUpcoming ? 'opacity-70' : 'opacity-100'}`}
            >
              {/* Desktop Left Column */}
              <div className="hidden md:flex flex-1 items-center justify-end pr-8 lg:pr-12">
                {isLeft && (
                  <div className="text-right">
                    <span className="font-royal text-[10px] text-[#CBA153] uppercase font-bold tracking-widest block mb-1">
                      {item.statusLabel} <span className="text-[#3B2F2F]/40 mx-1">|</span> {item.dates.display}
                    </span>
                    <h3 className="font-serif text-xl lg:text-2xl text-[#1A0B16] uppercase mb-2">
                      {item.stepNumber && <span className="text-[#CBA153] mr-2">{item.stepNumber}.</span>}
                      {item.title}
                    </h3>
                    <p className="font-sans font-light text-sm text-[#3B2F2F]/80 max-w-xs ml-auto leading-relaxed">{item.description}</p>
                  </div>
                )}
              </div>

              {/* Center Spine Node Column */}
              <div className="w-[56px] md:w-[100px] shrink-0 relative flex justify-center items-center">
                {/* Horizontal branch connectors (Desktop) */}
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-full h-[2px] z-0 flex items-center justify-center">
                  <div className={`w-1/2 h-full ${isLeft ? 'ml-auto origin-left' : 'mr-auto origin-right'} ${isUpcoming ? 'bg-transparent border-t-2 border-dashed border-[#CBA153]/30' : 'bg-[#CBA153]'}`} />
                </div>
                
                {/* The Node */}
                <div 
                  ref={registerNode(index)}
                  className={`relative w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border-[2px] flex items-center justify-center bg-[#F9F6F0] z-20 shrink-0 transition-all duration-500
                    ${isActive ? 'border-[#CBA153] glow-gold-luxury scale-110' : ''}
                    ${isCompleted ? 'border-[#CBA153] cursor-pointer hover:scale-[1.07] hover:brightness-105 hover:bg-white hover:border-[#E5C378] group' : ''}
                    ${isUpcoming ? 'border-[#CBA153]/40' : ''}
                  `}
                >
                  <IconComponent 
                    className={`w-5 h-5 md:w-6 md:h-6 text-[#CBA153] transition-colors ${isActive ? 'animate-[spin_4s_linear_infinite]' : ''} ${isCompleted ? 'group-hover:text-[#DFB15B]' : ''} ${isUpcoming ? 'text-[#CBA153]/40' : ''}`}
                    strokeWidth={1.5}
                  />
                  {/* Subtle pulsing background for active node */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#CBA153]" />
                  )}
                </div>
              </div>

              {/* Desktop Right Column & Mobile Content Column */}
              <div className="flex-1 flex flex-col justify-center py-5 pl-4 pr-2 md:pl-8 lg:pl-12 md:py-8">
                {/* Mobile View: Render Text here unconditionally */}
                <div className="md:hidden">
                  <span className="font-royal text-[9px] text-[#CBA153] uppercase font-bold tracking-widest block mb-0.5">
                    {item.statusLabel} <span className="text-[#3B2F2F]/40 mx-1">|</span> {item.dates.display}
                  </span>
                  <h3 className="font-serif text-[15px] sm:text-[17px] text-[#1A0B16] uppercase mb-1 leading-snug truncate">
                    {item.stepNumber && <span className="text-[#CBA153] mr-1">{item.stepNumber}.</span>}
                    {item.title}
                  </h3>
                  <p className="font-sans font-light text-xs text-[#3B2F2F]/75 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
                
                {/* Desktop View: Render Text here only if NOT left */}
                {!isLeft && (
                  <div className="hidden md:block text-left">
                    <span className="font-royal text-[10px] text-[#CBA153] uppercase font-bold tracking-widest block mb-1">
                      {item.statusLabel} <span className="text-[#3B2F2F]/40 mx-1">|</span> {item.dates.display}
                    </span>
                    <h3 className="font-serif text-xl lg:text-2xl text-[#1A0B16] uppercase mb-2">
                      {item.stepNumber && <span className="text-[#CBA153] mr-2">{item.stepNumber}.</span>}
                      {item.title}
                    </h3>
                    <p className="font-sans font-light text-sm text-[#3B2F2F]/80 max-w-xs leading-relaxed">{item.description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
