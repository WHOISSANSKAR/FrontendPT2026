import React from 'react';
import { Package, Plus } from 'lucide-react'; // changes done by vb: removed unused ArrowUpRight
import { CriticalSpareItem } from '../types'; // changes done by vb

interface CriticalSparesCardProps {
  spares?: CriticalSpareItem[]; // changes done by vb: real spares from the API (no mock numbers)
  onViewAll?: () => void;
  onRequestSpare?: () => void;
}

export const CriticalSparesCard: React.FC<CriticalSparesCardProps> = ({
  spares = [],
  onViewAll,
  onRequestSpare
}) => {
  // changes done by vb: the line bar + Critical/Low Stock/Pending legend is replaced by a list of the
  // most recent spares (newest = highest id first), like the Recent Orders card.
  const total = spares.length;
  const recentSpares = [...spares]
    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
    .slice(0, 3);

  const statusPill = (status: string) => {
    const s = String(status || '').trim().toLowerCase();
    const tone =
      s === 'out of stock' || s === 'critical'
        ? 'bg-rose-50 text-rose-600 border-rose-200/70'
        : s === 'low stock' || s === 'pending'
          ? 'bg-amber-50 text-amber-600 border-amber-200/70'
          : s === 'available' || s === 'normal' || s === 'in stock'
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200/70'
            : 'bg-slate-50 text-slate-600 border-slate-200/70';
    return (
      <span className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-medium border ${tone}`}>
        {status || 'Unknown'}
      </span>
    );
  };

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

      {/* changes done by vb: recent spares list (replaces the segmented bar + legend) */}
      <div className="flex-1 min-h-0 overflow-y-auto my-1">
        <table className="w-full text-left text-xs border-collapse table-fixed">
          <thead>
            <tr className="text-slate-400 font-normal text-[11px] border-b border-slate-100">
              <th className="pb-1 font-normal">Part</th>
              <th className="pb-1 font-normal text-center w-10">Qty</th>
              <th className="pb-1 font-normal text-right w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentSpares.map((sp) => (
              <tr
                key={sp.id}
                onClick={onViewAll}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                title={`${sp.name}${sp.serialNo ? ` · ${sp.serialNo}` : ''}`}
              >
                <td className="py-1 pr-2 font-semibold text-slate-900 truncate">{sp.name}</td>
                <td className="py-1 text-center font-mono text-slate-600">{sp.qty ?? sp.stock ?? 0}</td>
                <td className="py-1 text-right">{statusPill(sp.status)}</td>
              </tr>
            ))}
            {recentSpares.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-[11px] text-slate-400">
                  No spares yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
