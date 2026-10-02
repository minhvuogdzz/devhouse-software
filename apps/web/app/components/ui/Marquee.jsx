import React from 'react';

export function Marquee({ children, speed = 30, direction = 'left', className = '' }) {
  return (
    <div className={`overflow-hidden flex w-full relative ${className} group`}>
      <div 
        className={`flex min-w-full shrink-0 gap-6 pr-6 animate-marquee group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: `${speed}s`, animationDirection: direction === 'right' ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
      <div 
        className={`flex min-w-full shrink-0 gap-6 pr-6 animate-marquee group-hover:[animation-play-state:paused] absolute top-0 left-full`}
        style={{ animationDuration: `${speed}s`, animationDirection: direction === 'right' ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  );
}
