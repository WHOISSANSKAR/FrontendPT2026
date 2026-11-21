import React, { useState } from 'react';
import { X, Ticket, Plus, Search, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SupportTicketItem } from '../../types';

interface TicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: SupportTicketItem[];
  onAddTicket: (ticket: SupportTicketItem) => void;
  initialProjectName?: string;
}

export const TicketsModal: React.FC<TicketsModalProps> = ({
  isOpen,
  onClose,
  tickets,
  onAddTicket,
  initialProjectName
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New ticket fields
  const [title, setTitle] = useState('');
  const [project, setProject] = useState(initialProjectName || 'Project Zephyr');
  const [priority, setPriority] = useState<SupportTicketItem['priority']>('High');
  const [assignee, setAssignee] = useState('Vaniya Batra');

  if (!isOpen) return null;

  const safeTickets = tickets || [];
  const filteredTickets = safeTickets.filter(t => {
    const matchesFilter = filterStatus === 'All' || t.status === filterStatus;
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTicket: SupportTicketItem = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TK-${Math.floor(Math.random() * 900) + 8900}`,
      title: title.trim(),
      project,
      priority,
      status: 'Open',
      assignee,
      createdDate: 'Just now'
    };

    onAddTicket(newTicket);
    setTitle('');
    setShowCreateForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[calc(100%-24px)] sm:w-full max-w-2xl max-h-[calc(100dvh-24px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Support Tickets & Operations QA</h3>
              <p className="text-[11px] text-slate-500">24 active incident and calibration dispatches</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create form toggle */}
        {showCreateForm ? (
          <form onSubmit={handleCreate} className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/40 text-xs space-y-3 shrink-0 animate-in slide-in-from-top-2 duration-150 overflow-y-auto max-h-[220px] no-scrollbar">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Create Operational Ticket</span>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Issue Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Servo motor thermal trip during continuous torque cycle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Project</label>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assignee</label>
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Dispatch Ticket
              </button>
            </div>
          </form>
        ) : null}

        {/* Filter controls */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by ticket number, title, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1">
            {['All', 'Critical', 'Open', 'Pending', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  filterStatus === st
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((t) => (
              <div 
                key={t.id}
                className="p-3 hover:bg-slate-50/80 rounded-xl transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase shrink-0 ${
                    t.priority === 'Critical'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : t.priority === 'High'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {t.priority}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 leading-tight">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-slate-600 font-semibold">{t.ticketNumber}</span>
                      <span>·</span>
                      <span className="font-medium text-blue-600">{t.project}</span>
                      <span>·</span>
                      <span>Assignee: {t.assignee}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    t.status === 'Open' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : t.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {t.createdDate}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No support tickets found matching your filter criteria.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>SLA Target: &lt; 2 hrs for Critical tickets</span>
          <span className="font-semibold text-slate-700">{filteredTickets.length} tickets shown</span>
        </div>

      </div>
    </div>
  );
};
