import React from 'react';
import { 
  FileText, 
  Compass, 
  Tag, 
  Calendar, 
  Cpu, 
  Zap, 
  ShoppingCart,
  FolderPlus
} from 'lucide-react';

interface QuickActionsCardProps {
  onUploadProject?: () => void;
  onGenerateReport?: () => void;
  onTrackProject?: () => void;
  onViewTickets?: () => void;
  onViewOrders?: () => void;
  onRequestSpare?: () => void;
  onCreateInquiry?: () => void;
  onOpenCart?: () => void;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onUploadProject,
  onGenerateReport,
  onTrackProject,
  onViewTickets,
  onViewOrders,
  onRequestSpare,
  onCreateInquiry,
  onOpenCart
}) => {
  const actions = [
    {
      id: 'qa-upload',
      label: 'Upload Project', // changes done by vb: full name (was 'Upload...')
      icon: FolderPlus,
      action: onUploadProject
    },
    {
      id: 'qa-generate',
      label: 'Generate Report', // changes done by vb: full name (was 'Generate...')
      icon: FileText,
      action: onGenerateReport
    },
    {
      id: 'qa-track',
      label: 'Track Project',
      icon: Compass,
      action: onTrackProject
    },
    {
      id: 'qa-tickets',
      label: 'View Tickets',
      icon: Tag,
      action: onViewTickets
    },
    {
      id: 'qa-orders',
      label: 'View Orders',
      icon: Calendar,
      action: onViewOrders
    },
    {
      id: 'qa-spare',
      label: 'Request Spare',
      icon: Cpu,
      action: onRequestSpare
    },
    {
      id: 'qa-inquiry',
      label: 'Create Inquiry',
      icon: Zap,
      action: onCreateInquiry
    },
    {
      id: 'qa-cart',
      label: 'Open Cart',
      icon: ShoppingCart,
      action: onOpenCart
    }
  ];

  return (
    <div 
      id="quick-actions-card"
      className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-3 flex flex-col h-full justify-between overflow-hidden"
    >
      {/* Header */}
      <div className="pb-1.5 shrink-0">
        <h2 className="text-xs font-bold text-slate-900 tracking-tight">
          Quick Actions
        </h2>
      </div>

      {/* 4x2 Grid of Actions */}
      <div className="grid grid-cols-4 gap-2 my-auto flex-1 items-center">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.action}
              id={`quick-action-btn-${act.id}`}
              // changes done by vb: min-height instead of fixed height so a 2-line name fits
              className="flex flex-col items-center justify-center px-1 py-1.5 rounded-lg bg-[#F0F6FF] hover:bg-[#E0EEFE] active:scale-95 transition-all text-center cursor-pointer group min-h-[50px]"
              title={act.label}
            >
              <Icon className="w-4 h-4 shrink-0 text-blue-600 group-hover:scale-110 transition-transform stroke-[2]" />
              {/* changes done by vb: full name wraps onto 2 lines instead of being cut with "..." */}
              <span className="text-[10.5px] font-medium text-slate-800 leading-[1.15] mt-1 max-w-full break-words">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
