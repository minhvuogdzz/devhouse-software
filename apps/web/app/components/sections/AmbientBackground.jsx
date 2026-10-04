import React from 'react';

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-500">
      {/* Background color base */}
      <div className="absolute inset-0 bg-bg transition-colors duration-500" />
      
      {/* Moving blurred orbs (Warped Space effect) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-primary/20 dark:bg-primary/10 blur-[80px] sm:blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
      
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-accent/20 dark:bg-accent/10 blur-[80px] sm:blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
      
      <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-primary-subtle dark:bg-primary-subtle blur-[80px] sm:blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />
      
      {/* Noise overlay for premium texture */}
      <div 
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 20s infinite alternate ease-in-out;
          will-change: transform;
        }
        .animation-delay-2000 {
          animation-delay: -5s;
        }
        .animation-delay-4000 {
          animation-delay: -10s;
        }
      `}</style>
    </div>
  );
}
