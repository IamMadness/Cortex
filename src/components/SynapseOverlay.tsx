import React, { useEffect, useState } from 'react';
import { Synapse } from '../types';

interface SynapseOverlayProps {
  synapses: Synapse[];
  containerRef: React.RefObject<HTMLDivElement>;
}

export const SynapseOverlay: React.FC<SynapseOverlayProps> = ({ synapses, containerRef }) => {
  const [paths, setPaths] = useState<{ id: number, d: string, label?: string, startX: number, startY: number, endX: number, endY: number, midX: number, midY: number }[]>([]);

  useEffect(() => {
    const updatePaths = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const newPaths = synapses.map(syn => {
        const sourceEl = document.getElementById(`node-${syn.sourceId}`);
        const targetEl = document.getElementById(`node-${syn.targetId}`);
        
        if (!sourceEl || !targetEl) return null;
        
        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        
        // Calculate positions relative to container, accounting for scroll
        const startX = sourceRect.left - containerRect.left + containerRef.current.scrollLeft;
        const startY = sourceRect.top - containerRect.top + containerRef.current.scrollTop + (sourceRect.height / 2);
        
        const endX = targetRect.left - containerRect.left + containerRef.current.scrollLeft;
        const endY = targetRect.top - containerRect.top + containerRef.current.scrollTop + (targetRect.height / 2);
        
        const curveOffset = Math.max(Math.abs(endY - startY) / 2, 40);
        const d = `M ${startX} ${startY} C ${startX - curveOffset} ${startY}, ${endX - curveOffset} ${endY}, ${endX} ${endY}`;
        
        // Calculate midpoint for label
        // For a cubic bezier with P0, P1, P2, P3 where P1=(x0-c, y0) and P2=(x1-c, y1)
        // At t=0.5, B(0.5) = 0.125*P0 + 0.375*P1 + 0.375*P2 + 0.125*P3
        const midX = 0.125 * startX + 0.375 * (startX - curveOffset) + 0.375 * (endX - curveOffset) + 0.125 * endX;
        const midY = 0.125 * startY + 0.375 * startY + 0.375 * endY + 0.125 * endY;

        return { id: syn.id!, d, label: syn.label, startX, startY, endX, endY, midX, midY };
      }).filter(Boolean) as any;
      
      setPaths(newPaths);
    };

    updatePaths();
    
    const observer = new ResizeObserver(updatePaths);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updatePaths);
    
    // Also update periodically just in case of animations
    const interval = setInterval(updatePaths, 100);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePaths);
      clearInterval(interval);
    };
  }, [synapses, containerRef]);

  if (paths.length === 0) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0, 242, 255, 0.8)" />
        </marker>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {paths.map(path => (
        <g key={path.id} className="group">
          {/* Main line */}
          <path 
            d={path.d} 
            fill="none" 
            stroke="rgba(0, 242, 255, 0.6)" 
            strokeWidth="2" 
            strokeDasharray="6 6"
            markerEnd="url(#arrowhead)"
            className="transition-colors duration-300"
            style={{ animation: 'dash 15s linear infinite', filter: 'url(#glow)' }}
          />
          
          {path.label && (
            <g transform={`translate(${path.midX}, ${path.midY})`}>
              <rect x="-35" y="-12" width="70" height="24" rx="12" fill="rgba(5, 5, 5, 0.9)" stroke="rgba(0, 242, 255, 0.5)" strokeWidth="1" style={{ filter: 'url(#glow)' }} />
              <text x="0" y="3" fill="rgba(0, 242, 255, 0.9)" fontSize="9" fontFamily="monospace" textAnchor="middle" alignmentBaseline="middle" fontWeight="bold">
                {path.label}
              </text>
            </g>
          )}
        </g>
      ))}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </svg>
  );
};
