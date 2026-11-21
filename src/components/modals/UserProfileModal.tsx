import React from 'react';
import { X, User, Mail, ShieldCheck, Building, KeyRound, BellRing } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenFullAccount?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  onOpenFullAccount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[calc(100dvh-24px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Account & Profile</h3>
              <p className="text-[11px] text-slate-500">Global Director of Operations Credentials</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto no-scrollbar flex-1">
          
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-blue-50/40 border border-blue-100">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              VB
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Vaniya Batra</div>
              <div className="text-slate-500 text-[11px]">Senior Project Director, Global Operations</div>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> Tier 1 Enterprise Super-Admin
              </div>
            </div>
          </div>

          <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </span>
              <span className="font-medium text-slate-800">vb@gmail.com</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Department
              </span>
              <span className="font-medium text-slate-800">Industrial Delivery & Logistics</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                Security Access
              </span>
              <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                SEC-LVL-4 (Full Read/Write)
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-slate-400" />
                Alert Notifications
              </span>
              <span className="text-emerald-700 font-semibold text-[11px]">Instant Push & Email Enabled</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer"
          >
            Sign Out
          </button>
          <div className="flex items-center gap-2">
            {onOpenFullAccount && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullAccount();
                }}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                Account Settings
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
