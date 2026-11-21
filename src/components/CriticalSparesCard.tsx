import React from 'react';
import { Package, Plus } from 'lucide-react'; // changes done by vb: removed unused ArrowUpRight

interface CriticalSparesCardProps {
  onViewAll?: () => void;
  onRequestSpare?: () => void;
}

export const CriticalSparesCard: React.FC<CriticalSparesCardProps> = ({
  onViewAll,
  onRequestSpare
}) => {
  const critical = 3;
  const lowStock = 5;
  const pending = 4;
  const total = 12;

  return (
    <div 
      id="critical-spares-card"
      className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-3 flex flex-col h-full justify-between overflow-hidden"
    >
      {/* Top row: Icon + Title/Subtitle + Big Number */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight leading-tight">
              Critical Spares
            </h3>
            <p className="text-[11px] text-slate-500">
              Inventory status
            </p>
          </div>
        </div>
        <span className="text-xl font-black text-slate-900 font-mono">
          {total}
        </span>
      </div>

      {/* Segmented Progress Bar + Breakdown */}
      <div className="my-1.5 shrink-0">
        {/* Continuous 3-part Bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
          <div 
            style={{ width: `${(critical / total) * 100}%` }} 
            className="bg-rose-500 h-full rounded-l-full" 
            title={`Critical: ${critical}`}
          />
          <div 
            style={{ width: `${(lowStock / total) * 100}%` }} 
            className="bg-amber-500 h-full" 
            title={`Low Stock: ${lowStock}`}
          />
          <div 
            style={{ width: `${(pending / total) * 100}%` }} 
            className="bg-blue-600 h-full rounded-r-full" 
            title={`Pending: ${pending}`}
          />
        </div>

        {/* Breakdown Legend */}
        <div className="mt-1.5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-slate-600">Critical</span>
            <span className="font-bold text-slate-900 font-mono">{critical}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-600">Low Stock</span>
            <span className="font-bold text-slate-900 font-mono">{lowStock}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
            <span className="text-slate-600">Pending</span>
            <span className="font-bold text-slate-900 font-mono">{pending}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      {/* changes done by vb: removed the "{total} need action" link; Request button now sits on the right alone */}
      <div className="pt-1 flex items-center justify-end shrink-0">
        <button
          onClick={onRequestSpare}
          id="btn-request-spare"
          className="px-2.5 py-0.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
          <span>Request</span>
        </button>
      </div>
    </div>
  );
};
