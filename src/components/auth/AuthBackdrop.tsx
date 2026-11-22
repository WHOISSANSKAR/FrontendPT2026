// changes done by vb
import React from 'react';

const SPARKLES = [
  { top: 12, left: 18, size: 3, delay: 0 },
  { top: 22, left: 72, size: 2, delay: 1.4 },
  { top: 38, left: 8, size: 2, delay: 2.2 },
  { top: 9, left: 48, size: 2, delay: 3.1 },
  { top: 30, left: 90, size: 3, delay: 0.7 },
  { top: 52, left: 60, size: 2, delay: 2.8 },
  { top: 18, left: 34, size: 2, delay: 1.9 },
  { top: 44, left: 82, size: 2, delay: 3.6 },
];

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")";

export const AuthBackdrop: React.FC = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    style={{ background: 'linear-gradient(165deg, #EEF3FF 0%, #E6EDFF 40%, #EAF0FB 100%)' }}
    aria-hidden="true"
  >
    <div
      className="vb-aurora absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.55] blur-[110px]"
      style={{
        background:
          'conic-gradient(from 0deg at 50% 50%, #60A5FA, #818CF8, #38BDF8, #A5B4FC, #2563EB, #93C5FD, #60A5FA)',
      }}
    />

    <div
      className="absolute inset-0"
      style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 42%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 70%)' }}
    />

    <div
      className="vb-orb absolute -bottom-[25%] -left-[15%] h-[60vmax] w-[60vmax] rounded-full blur-[90px]"
      style={{ background: 'radial-gradient(circle, rgba(30,58,138,0.45) 0%, rgba(30,58,138,0) 65%)' }}
    />
    <div
      className="vb-orb-alt absolute -right-[10%] -top-[20%] h-[50vmax] w-[50vmax] rounded-full blur-[90px]"
      style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.40) 0%, rgba(56,189,248,0) 65%)' }}
    />

    <div
      className="absolute inset-x-0 bottom-0 h-[58%] [perspective:700px]"
      style={{
        WebkitMaskImage: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.6) 45%, transparent 100%)',
        maskImage: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.6) 45%, transparent 100%)',
      }}
    >
      <div
        className="vb-grid-floor absolute -left-1/2 bottom-[-30%] h-[160%] w-[200%] origin-bottom"
        style={{
          transform: 'rotateX(68deg)',
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.35) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </div>

    <div
      className="absolute inset-x-0 bottom-[38%] h-px opacity-60"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(56,189,248,0.7), rgba(99,102,241,0.6), transparent)' }}
    />

    {SPARKLES.map((s, i) => (
      <span
        key={i}
        className="vb-sparkle absolute rounded-full bg-white shadow-[0_0_10px_3px_rgba(147,197,253,0.9)]"
        style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
      />
    ))}

    <div className="absolute inset-0 opacity-[0.12] mix-blend-soft-light" style={{ backgroundImage: GRAIN }} />
  </div>
);
