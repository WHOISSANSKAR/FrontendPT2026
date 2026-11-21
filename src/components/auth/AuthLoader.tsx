// changes done by vb: new full-screen loader shown right after sign-in / sign-up
import React from 'react';
import { Check } from 'lucide-react';

interface AuthLoaderProps {
  userName: string;
  /** 0–100 */
  progress: number;
  visible: boolean;
  isNewUser?: boolean;
}

const STEPS = [
  { label: 'Verifying your session', at: 15 },
  { label: 'Loading your projects', at: 50 },
  { label: 'Preparing your dashboard', at: 85 },
];

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'P';

export const AuthLoader: React.FC<AuthLoaderProps> = ({ userName, progress, visible, isNewUser }) => {
  const pct = Math.round(Math.min(100, Math.max(0, progress)));
  const firstName = userName.trim().split(/\s+/)[0] || 'there';

  return (
    <div
      id="login-welcome-screen"
      role="status"
      aria-live="polite"
      className="relative z-10 flex w-full max-w-[380px] flex-col items-center text-center select-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.98)',
        transition: 'opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Avatar inside a spinning gradient ring */}
      <div className="relative h-24 w-24">
        {/* changes done by vb: pulsing halo rings behind the avatar */}
        <span className="auth-halo absolute inset-0 rounded-full bg-blue-400/30" />
        <span className="auth-halo absolute inset-0 rounded-full bg-sky-400/25" style={{ animationDelay: '1.1s' }} />
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: 'conic-gradient(from 0deg, #2563EB, #38BDF8, rgba(56,189,248,0) 70%)',
            animationDuration: '1.1s',
          }}
        />
        <div className="absolute inset-[4px] rounded-full bg-[#F4F8FF]" />
        {/* changes done by vb: Sora font for the initials */}
        <div className="auth-display absolute inset-[10px] flex items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] text-2xl font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)]">
          {initialsOf(userName)}
        </div>
      </div>

      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
        {isNewUser ? 'Welcome' : 'Welcome back'}
      </p>
      {/* changes done by vb: Sora display font */}
      <h1 id="authenticated-user-greeting" className="auth-display mt-1.5 text-[30px] font-bold text-[#0B1736]">
        {userName || firstName}
      </h1>

      {/* Step checklist */}
      <ul className="mt-7 w-full space-y-2.5 text-left">
        {STEPS.map((step) => {
          const done = pct >= step.at + 15 || pct === 100;
          const active = !done && pct >= step.at - 15;
          return (
            <li
              key={step.label}
              // changes done by vb: frosted rows + staggered entrance
              className={`auth-rise flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm backdrop-blur-md transition-colors duration-300 ${
                done
                  ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
                  : active
                    ? 'border-blue-200 bg-white/90 text-[#0F172A] shadow-[0_2px_10px_rgba(37,99,235,0.08)]'
                    : 'border-white/80 bg-white/55 text-slate-400'
              }`}
              style={{ animationDelay: `${150 + STEPS.indexOf(step) * 90}ms` }}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  done ? 'bg-emerald-500 text-white' : active ? 'border-2 border-[#2563EB] border-t-transparent animate-spin' : 'border-2 border-slate-200'
                }`}
              >
                {done && <Check className="h-3 w-3 stroke-[3]" />}
              </span>
              <span className="font-medium">{step.label}</span>
            </li>
          );
        })}
      </ul>

      {/* Progress bar */}
      <div className="mt-6 w-full">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
          <div
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] transition-[width] duration-75 ease-linear"
            style={{ width: `${pct}%` }}
          >
            {/* changes done by vb: moving shimmer on the progress bar */}
            <span className="auth-shimmer absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>
        </div>
        <div className="mt-2 text-right font-mono text-[11px] text-slate-400">{pct}%</div>
      </div>
    </div>
  );
};
