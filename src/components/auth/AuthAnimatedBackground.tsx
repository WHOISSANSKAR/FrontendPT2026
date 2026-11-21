// changes done by vb: animated background for the login / sign-up / loader screens
// Drifting aurora blobs + panning dot grid + rising particles + a soft light sweep.
// All motion is CSS (see "AUTH SCREENS" in index.css) and switches off with prefers-reduced-motion.
import React from 'react';

// Fixed (not random) so the layout is identical on every render.
const PARTICLES = [
  { left: 6, size: 6, dur: 16, delay: 0, drift: 30, round: true },
  { left: 14, size: 10, dur: 22, delay: 4, drift: -20, round: false },
  { left: 23, size: 5, dur: 14, delay: 8, drift: 16, round: true },
  { left: 31, size: 8, dur: 19, delay: 2, drift: -28, round: false },
  { left: 42, size: 4, dur: 13, delay: 10, drift: 24, round: true },
  { left: 51, size: 9, dur: 24, delay: 6, drift: -14, round: false },
  { left: 60, size: 6, dur: 17, delay: 1, drift: 30, round: true },
  { left: 68, size: 11, dur: 25, delay: 9, drift: -24, round: false },
  { left: 76, size: 5, dur: 15, delay: 3, drift: 18, round: true },
  { left: 84, size: 8, dur: 21, delay: 7, drift: -30, round: false },
  { left: 91, size: 4, dur: 12, delay: 5, drift: 12, round: true },
  { left: 97, size: 7, dur: 18, delay: 11, drift: -16, round: false },
];

export const AuthAnimatedBackground: React.FC = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    style={{ background: 'linear-gradient(160deg, #F7FAFF 0%, #EEF4FF 45%, #F4F8FF 100%)' }}
    aria-hidden="true"
  >
    {/* Aurora blobs */}
    <div
      className="auth-blob-a absolute -top-[18%] -left-[12%] h-[58vmax] w-[58vmax] rounded-full blur-[90px] opacity-70"
      style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.38) 0%, rgba(59,130,246,0) 65%)' }}
    />
    <div
      className="auth-blob-b absolute -bottom-[22%] -right-[14%] h-[62vmax] w-[62vmax] rounded-full blur-[100px] opacity-70"
      style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.34) 0%, rgba(14,165,233,0) 65%)' }}
    />
    <div
      className="auth-blob-c absolute top-[30%] left-[38%] h-[40vmax] w-[40vmax] rounded-full blur-[90px] opacity-60"
      style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.30) 0%, rgba(129,140,248,0) 65%)' }}
    />

    {/* Panning dot grid, faded toward the edges */}
    <div
      className="auth-grid-pan absolute inset-0 opacity-60"
      style={{
        backgroundImage: 'radial-gradient(rgba(37,99,235,0.22) 1.2px, transparent 1.2px)',
        backgroundSize: '28px 28px',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, #000 30%, transparent 80%)',
        maskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, #000 30%, transparent 80%)',
      }}
    />

    {/* Rising particles */}
    {PARTICLES.map((p, i) => (
      <span
        key={i}
        className={`auth-particle absolute bottom-[-24px] border border-blue-400/40 bg-blue-300/20 ${p.round ? 'rounded-full' : 'rounded-[3px]'}`}
        style={{
          left: `${p.left}%`,
          width: p.size,
          height: p.size,
          animationDuration: `${p.dur}s`,
          animationDelay: `-${p.delay}s`,
          ['--auth-drift' as string]: `${p.drift}px`,
        }}
      />
    ))}

    {/* Light sweep */}
    <div
      className="auth-sweep absolute -top-1/4 left-0 h-[150%] w-[28%]"
      style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)' }}
    />
  </div>
);
