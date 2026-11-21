import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { SupportTicketItem } from '../types';

interface HelpViewProps {
  onAddTicket?: (ticket: SupportTicketItem) => void;
  onShowToast?: (message: string) => void;
  onBackToDashboard?: () => void;
}

export const HelpView: React.FC<HelpViewProps> = ({
  onAddTicket,
  onShowToast
}) => {
  const [query, setQuery] = useState('');
  const [submittedTicketNumber, setSubmittedTicketNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Auto-clear success message after 6 seconds
    setTimeout(() => {
      setSubmittedTicketNumber(null);
    }, 6000);
  };

  return (
    <div 
      id="help-page-container" 
      className="flex-1 w-full bg-[#F4F6F9] text-slate-800 min-h-[calc(100dvh-56px)] overflow-y-auto no-scrollbar flex flex-col justify-center items-center px-4 sm:px-6 py-8"
    >
      <div className="w-full max-w-xl mx-auto flex flex-col">
        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">
          Support Tickets
        </h1>

        {/* Clean White Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 w-full transition-all">
          {/* Success Feedback Banner */}
          {submittedTicketNumber && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-emerald-900">Your query has been submitted!</p>
                <p className="text-emerald-700 mt-0.5">
                  Ticket <span className="font-mono font-bold">{submittedTicketNumber}</span> has been created. Our team will review and respond promptly.
                </p>
              </div>
            </div>
          )}

          {/* Error Feedback Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2.5 animate-in fade-in duration-200 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Support Tickets Form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-5">
              <label 
                htmlFor="support-ticket-query"
                className="block text-sm font-semibold text-slate-800 mb-2.5"
              >
                Your Query
              </label>
              <textarea
                id="support-ticket-query"
                rows={6}
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
              id="submit-support-ticket-btn"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HelpView;
