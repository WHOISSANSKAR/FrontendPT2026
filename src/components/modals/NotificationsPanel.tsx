import React from 'react';
import { X, Bell, Check, ExternalLink, AlertTriangle, CheckCircle2, Ticket, ShoppingBag } from 'lucide-react';
import { NotificationItem } from '../../types';

// interface NotificationsPanelProps {
//   isOpen: boolean;
//   onClose: () => void;
//   notifications: NotificationItem[];
//   onMarkAllAsRead: () => void;
// }


interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
}


export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead
}) => {
  if (!isOpen) return null;

  const safeNotifications = notifications || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white shadow-2xl border-l border-slate-200 w-full max-w-sm h-full flex flex-col justify-between animate-in slide-in-from-right duration-200 text-slate-800">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              <p className="text-[11px] text-slate-500">Live operational dispatches & alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-bar */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-white text-xs shrink-0">
          <span className="text-[11px] text-slate-500">
            {safeNotifications.filter(n => n && !n.read).length} unread updates
          </span>
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {safeNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) onMarkAsRead(n.id);
              }}
              className={`p-3 rounded-xl transition-colors text-xs flex items-start gap-3 ${n.read ? 'opacity-70 hover:opacity-100 hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70 border border-blue-100/60'
                }`}
            >
              <div className="mt-0.5 shrink-0">
                {n.type === 'alert' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : n.type === 'order' ? (
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                ) : n.type === 'ticket' ? (
                  <Ticket className="w-4 h-4 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 leading-tight">
                  {n.title}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {n.message}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  {n.time}
                </div>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
