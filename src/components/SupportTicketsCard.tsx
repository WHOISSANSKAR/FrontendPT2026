import React from 'react';
import { LifeBuoy, ArrowUpRight, Plus } from 'lucide-react';
import { SupportTicketItem } from '../types'; // changes done by vb
import { parseUiDate } from '../utils/overdue'; // changes done by vb

interface SupportTicketsCardProps {
  tickets?: SupportTicketItem[]; // changes done by vb: real tickets from the API (no mock numbers)
  onViewAll?: () => void;
  onCreateTicket?: () => void;
}

export const SupportTicketsCard: React.FC<SupportTicketsCardProps> = ({
  tickets = [],
  onViewAll,
  onCreateTicket
}) => {
  // changes done by vb: the line bar + Critical/Open/Pending legend is replaced by a list of the
  // most recent tickets (newest first), like the Recent Orders card.
  const total = tickets.length;
  const ticketTime = (t: SupportTicketItem) =>
    parseUiDate(t.createdAt || t.createdDate)?.getTime() || Number(t.id) || 0;
  const recentTickets = [...tickets].sort((a, b) => ticketTime(b) - ticketTime(a)).slice(0, 3);

  const shortDate = (t: SupportTicketItem) => {
    const d = parseUiDate(t.createdAt || t.createdDate);
    return d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : t.createdDate || '—';
  };

  const statusPill = (status: string) => {
    const tone =
      status === 'Open'
        ? 'bg-blue-50 text-blue-600 border-blue-200/70'
        : status === 'In Progress'
          ? 'bg-indigo-50 text-indigo-600 border-indigo-200/70'
          : status === 'Pending'
            ? 'bg-amber-50 text-amber-600 border-amber-200/70'
            : status === 'Resolved'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200/70'
              : 'bg-slate-50 text-slate-600 border-slate-200/70';
    return (
      <span className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-medium border ${tone}`}>
        {status}
      </span>
    );
  };

  return (
    <div 
      id="support-tickets-card"
      className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-3 flex flex-col h-full justify-between overflow-hidden"
    >
      {/* Top row: Icon + Title/Subtitle + Big Number */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight leading-tight">
              Support Tickets
            </h3>
            <p className="text-[11px] text-slate-500">
              Operations & QA
            </p>
          </div>
        </div>
        <span className="text-xl font-black text-slate-900 font-mono">
          {total}
        </span>
      </div>

      {/* changes done by vb: recent tickets list (replaces the segmented bar + legend) */}
      <div className="flex-1 min-h-0 overflow-y-auto my-1">
        <table className="w-full text-left text-xs border-collapse table-fixed">
          <thead>
            <tr className="text-slate-400 font-normal text-[11px] border-b border-slate-100">
              <th className="pb-1 font-normal">Ticket</th>
              <th className="pb-1 font-normal w-24">Status</th>
              <th className="pb-1 font-normal text-right w-14">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentTickets.map((t) => (
              <tr
                key={t.id}
                onClick={onViewAll}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                title={`${t.ticketNumber ? `${t.ticketNumber} · ` : ''}${t.title}`}
              >
                <td className="py-1 pr-2 font-semibold text-slate-900 truncate">{t.title}</td>
                <td className="py-1">{statusPill(t.status)}</td>
                <td className="py-1 text-right text-slate-500 whitespace-nowrap text-[11px]">{shortDate(t)}</td>
              </tr>
            ))}
            {recentTickets.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-[11px] text-slate-400">
                  No tickets yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Footer */}
      <div className="pt-1 flex items-center justify-between shrink-0">
        <button
          onClick={onViewAll}
          id="btn-view-tickets-link"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>View tickets</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onCreateTicket}
          id="btn-create-support-ticket"
          className="px-2.5 py-0.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
          <span>Create</span>
        </button>
      </div>
    </div>
  );
};
