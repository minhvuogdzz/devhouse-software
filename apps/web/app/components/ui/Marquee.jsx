import React from 'react';

export function Marquee({ children, speed = 40, direction = 'left', className = '' }) {
  return (
    <div className={`flex w-full overflow-hidden gap-6 ${className} group`}>
      <div 
        className={`flex shrink-0 animate-marquee gap-6 group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: `${speed}s`, animationDirection: direction === 'right' ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
      <div 
        className={`flex shrink-0 animate-marquee gap-6 group-hover:[animation-play-state:paused]`}
        aria-hidden="true"
        style={{ animationDuration: `${speed}s`, animationDirection: direction === 'right' ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% - 1.5rem)); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  );
}
