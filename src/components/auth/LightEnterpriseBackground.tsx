import React from 'react';

export const LightEnterpriseBackground: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0"
      style={{ backgroundColor: '#F6F9FD' }}
      aria-hidden="true"
    >
      {/* 1. Subtle Radial Lighting Overlay */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle at 50% 25%, rgba(239, 246, 255, 0.8) 0%, rgba(246, 249, 253, 0) 70%)'
        }}
      />

      {/* 2. Soft Blurred Blue Gradient Blobs */}
      {/* Top Left Blob */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full blur-3xl opacity-60 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(191, 219, 254, 0.45) 0%, rgba(219, 234, 254, 0.15) 70%, transparent 100%)',
          animationDuration: '9s'
        }}
      />

      {/* Bottom Right Blob */}
      <div 
        className="absolute -bottom-36 -right-36 w-96 h-96 sm:w-[560px] sm:h-[560px] rounded-full blur-3xl opacity-50 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(147, 197, 253, 0.35) 0%, rgba(224, 231, 255, 0.2) 70%, transparent 100%)',
          animationDuration: '12s'
        }}
      />

      {/* Center Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(219, 234, 254, 0.3) 0%, transparent 65%)'
        }}
      />

      {/* 3. Extremely Subtle Dot Matrix Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="light-dot-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#94A3B8" fillOpacity="0.28" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#light-dot-grid)" />
      </svg>

      {/* 4. Elegant Thin Curved Geometric Lines (Slow, smooth, barely noticeable) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-25" 
        viewBox="0 0 1440 900" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path 
          d="M -100 200 C 300 100, 700 350, 1100 150 C 1300 50, 1500 220, 1600 180" 
          stroke="#3B82F6" 
          strokeWidth="1.2" 
          strokeDasharray="6 6"
          strokeOpacity="0.25"
        />
        <path 
          d="M -50 750 C 350 850, 650 620, 1050 780 C 1250 860, 1450 710, 1550 760" 
          stroke="#2563EB" 
          strokeWidth="1.2" 
          strokeOpacity="0.18"
        />
        <path 
          d="M 150 -50 C 250 300, 100 600, 300 950" 
          stroke="#60A5FA" 
          strokeWidth="1" 
          strokeOpacity="0.14"
        />
        <path 
          d="M 1300 -50 C 1150 250, 1350 650, 1200 950" 
          stroke="#93C5FD" 
          strokeWidth="1" 
          strokeOpacity="0.16"
        />
      </svg>
    </div>
  );
};
