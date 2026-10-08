import React from 'react';
import { Logo } from './Logo.jsx';

/**
 * DH AI brand icon featuring the Dev House mark logo encircled
 * by an animated rotating sRGB spectral ring (Blue, Purple, Red, Yellow, Green).
 */
export function DhAiIcon({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: { container: 'w-6 h-6', inset: 'w-[calc(100%-3px)] h-[calc(100%-3px)]', logo: 'w-3 h-3' },
    md: { container: 'w-7 h-7', inset: 'w-[calc(100%-4px)] h-[calc(100%-4px)]', logo: 'w-3.5 h-3.5' },
    lg: { container: 'w-9 h-9', inset: 'w-[calc(100%-5px)] h-[calc(100%-5px)]', logo: 'w-4.5 h-4.5' },
    xl: { container: 'w-11 h-11', inset: 'w-[calc(100%-6px)] h-[calc(100%-6px)]', logo: 'w-5.5 h-5.5' },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${s.container} ${className}`}
      aria-hidden="true"
    >
      {/* Soft luminous aura */}
      <div
        className="absolute -inset-0.5 rounded-full opacity-60 blur-[2px] pointer-events-none"
        style={{
          background:
            'conic-gradient(from 0deg, #4285F4 0deg, #9B51E0 72deg, #EA4335 144deg, #FBBC05 216deg, #34A853 288deg, #4285F4 360deg)',
          animation: 'aiSpin 3s linear infinite',
        }}
      />

      {/* Rotating sRGB spectrum ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            'conic-gradient(from 0deg, #4285F4 0deg, #9B51E0 72deg, #EA4335 144deg, #FBBC05 216deg, #34A853 288deg, #4285F4 360deg)',
          animation: 'aiSpin 3s linear infinite',
        }}
      />

      {/* Static inner circular disc with Dev House mark */}
      <div
        className={`relative z-10 ${s.inset} rounded-full bg-surface flex items-center justify-center overflow-hidden shadow-2xs`}
      >
        <Logo variant="mark" className={`${s.logo} object-contain`} />
      </div>
    </div>
  );
}

