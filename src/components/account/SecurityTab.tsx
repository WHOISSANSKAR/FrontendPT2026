import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2
} from 'lucide-react'; // changes done by vb

interface SecurityTabProps {
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  onUpdatePassword: (e: React.FormEvent) => void;
  pwError: string | null;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onUpdatePassword,
  pwError
}) => {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const calculatePasswordStrength = (pw: string): { score: number; label: string; color: string } => {
    if (!pw) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
    if (/\d/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: 'Very Weak', color: 'bg-slate-300' };
    }
  };

  const pwStrength = calculatePasswordStrength(newPassword);

  return (
    <div id="section-security" className="h-full flex flex-col justify-between min-h-0">
      {/* Form Container */}
      <form onSubmit={onUpdatePassword} className="flex-1 min-h-0 flex flex-col justify-between">
        <div className="space-y-4 sm:space-y-5 overflow-y-auto md:overflow-visible pr-0.5">
          {/* Header Block: Title & Description */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              Password & Security
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Update your account credentials, configure two-factor authentication, and monitor active sessions.
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Error Banner if any */}
          {pwError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{pwError}</span>
            </div>
          )}

          {/* 3-Column Password Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-3.5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input 
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-10 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showCurrentPw ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input 
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-10 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
                  placeholder="At least 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showNewPw ? 'Hide password' : 'Show password'}
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-10 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all"
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showConfirmPw ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Indicator Beneath Password Fields: Compact & Elegant Horizontal Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-600">Password Strength:</span>
              <div className="flex items-center gap-1.5 w-32 h-2">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step}
                    className={`flex-1 h-full rounded-full transition-all duration-300 ${
                      step <= pwStrength.score ? pwStrength.color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-semibold ${
                pwStrength.score >= 3 ? 'text-emerald-600' : pwStrength.score === 2 ? 'text-amber-600' : 'text-slate-500'
              }`}>
                {pwStrength.label}
              </span>
            </div>

            {confirmPassword && newPassword && (
              <div className="text-xs flex items-center gap-1.5">
                {confirmPassword === newPassword ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passwords Match
                  </span>
                ) : (
                  <span className="text-rose-600 font-medium">
                    Passwords do not match
                  </span>
                )}
              </div>
            )}
          </div>

          {/* changes done by vb */}
        </div>

        {/* Action Bar - Pinned to bottom right with clear separator */}
        <div className="shrink-0 pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            id="update-password-btn"
            className="px-6 h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all active:scale-[0.99] flex items-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  );
};
