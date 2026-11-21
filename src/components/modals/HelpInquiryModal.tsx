import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { SupportTicketItem } from '../../types';

interface HelpInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTicket?: (ticket: SupportTicketItem) => void;
  onShowToast?: (message: string) => void;
}

export const HelpInquiryModal: React.FC<HelpInquiryModalProps> = ({
  isOpen,
  onClose,
  onAddTicket,
  onShowToast
}) => {
  const [query, setQuery] = useState('');
  const [submittedTicketNumber, setSubmittedTicketNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setErrorMessage('Please enter your query before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const ticketNumber = `TK-${Math.floor(Math.random() * 900) + 8900}`;
    const newTicket: SupportTicketItem = {
      id: `tkt-${Date.now()}`,
      ticketNumber,
      title: query.trim().length > 60 ? `${query.trim().slice(0, 57)}...` : query.trim(),
      description: query.trim(),
      project: 'Support Inquiry',
      priority: 'High',
      status: 'Open',
      assignee: 'Operations QA Support',
      createdDate: 'Just now'
    };

    if (onAddTicket) {
      onAddTicket(newTicket);
    }

    if (onShowToast) {
      onShowToast(`Support Ticket ${ticketNumber} created successfully.`);
    }

    setSubmittedTicketNumber(ticketNumber);
    setQuery('');
    setIsSubmitting(false);

    setTimeout(() => {
      setSubmittedTicketNumber(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[calc(100dvh-24px)] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-150 text-slate-800 p-5 sm:p-7">
        
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Support Tickets
          </h2>
          <button 
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {submittedTicketNumber && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-200 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Your query has been submitted!</p>
              <p className="text-emerald-700 mt-0.5">
                Ticket <span className="font-mono font-bold">{submittedTicketNumber}</span> has been created.
              </p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs sm:text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Support Tickets Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-5">
            <label 
              htmlFor="modal-support-query"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              Your Query
            </label>
            <textarea
              id="modal-support-query"
              rows={5}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Type your query here..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none shadow-2xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
