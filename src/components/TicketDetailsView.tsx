
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Ticket,
  FileText,
  Download,
  Eye,
  Paperclip,
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Building2,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import type { SupportTicketItem } from '../types';

import {
  updateCustomerTicketStatus,
  downloadCustomerTicketAttachment,
} from '../services/tickets.service';

interface TicketDetailsViewProps {
  ticket: SupportTicketItem;
  onBackToTickets: () => void;
  onBackToDashboard: () => void;
  onUpdateTicketStatus?: (
    ticketId: string,
    newStatus: SupportTicketItem['status']
  ) => void;
}

const AVAILABLE_STATUSES = [
  'Open',
  'In Progress',
  'Pending',
  'Resolved',
  'Closed',
] as const;

export const TicketDetailsView: React.FC<TicketDetailsViewProps> = ({
  ticket,
  onBackToTickets,
  onBackToDashboard,
  onUpdateTicketStatus,
}) => {
  const [currentStatus, setCurrentStatus] =
    useState<SupportTicketItem['status']>(ticket.status);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [previewAttachment, setPreviewAttachment] = useState(false);

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Keep status synchronized when a different ticket is opened.
  useEffect(() => {
    setCurrentStatus(ticket.status);
    setActionNotice(null);
    setActionError(null);
  }, [ticket.id, ticket.status]);

  // ==================================================
  // STATUS BADGE
  // ==================================================

  const getStatusBadge = (status: SupportTicketItem['status']) => {
    switch (status) {
      case 'Open':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#2161F5] border border-blue-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#2161F5] animate-pulse" />
            <span>Open</span>
          </span>
        );

      case 'In Progress':
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{status}</span>
          </span>
        );

      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Resolved</span>
          </span>
        );

      case 'Closed':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Closed</span>
          </span>
        );
    }
  };

  // ==================================================
  // PRIORITY BADGE
  // Backend currently does not return priority.
  // ==================================================

  const getPriorityBadge = () => {
    const priority = ticket.priority;

    if (!priority || priority === 'Not specified') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
          Not specified
        </span>
      );
    }

    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
            Critical
          </span>
        );

      case 'High':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
            High
          </span>
        );

      case 'Medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            Medium
          </span>
        );

      case 'Low':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
            {priority}
          </span>
        );
    }
  };

  // ==================================================
  // UPDATE TICKET STATUS
  // ==================================================

  const handleStatusChange = async (
    newStatus: SupportTicketItem['status']
  ) => {
    if (newStatus === currentStatus || isUpdatingStatus) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      setActionError(null);
      setActionNotice(null);

      // Call FastAPI PATCH endpoint.
      await updateCustomerTicketStatus(ticket.id, newStatus);

      // Update UI only after successful API response.
      setCurrentStatus(newStatus);

      // Notify parent component.
      onUpdateTicketStatus?.(ticket.id, newStatus);

      setActionNotice(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Ticket status update failed:', error);

      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to update ticket status.'
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ==================================================
  // DOWNLOAD ACTUAL ATTACHMENT
  // ==================================================

  const handleDownload = async () => {
    if (!ticket.attachmentAvailable || isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);
      setActionError(null);
      setActionNotice(null);

      // Fetch actual attachment from FastAPI.
      const blob = await downloadCustomerTicketAttachment(ticket.id);

      if (!blob || blob.size === 0) {
        throw new Error('The attachment is empty or unavailable.');
      }

      const url = window.URL.createObjectURL(blob);

      const element = document.createElement('a');

      element.href = url;
      element.download = `ticket-${ticket.ticketNumber}-attachment`;

      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      setActionNotice('Attachment downloaded successfully.');
    } catch (error) {
      console.error('Attachment download failed:', error);

      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to download attachment.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // ==================================================
  // ATTACHMENT INFORMATION
  // ==================================================

  const displayAttachment = ticket.attachment || {
    name: 'Ticket attachment',
    size: 'Available for download',
    type: 'File',
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div
      id="ticket-details-view"
      className="flex-1 w-full min-h-[calc(100dvh-56px)] overflow-y-auto lg:overflow-hidden lg:h-[calc(100dvh-56px)] lg:max-h-[calc(100dvh-56px)] bg-[#F4F6F9] text-slate-800 px-3 sm:px-4 py-3 lg:px-8 lg:py-3.5 select-text flex flex-col gap-3 mx-auto"
    >
      {/* ==================================================
          SUCCESS NOTICE
      ================================================== */}

      {actionNotice && (
        <div className="fixed top-16 right-8 z-50 bg-[#1E3A8A] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>

          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="ml-2 hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==================================================
          ERROR NOTICE
      ================================================== */}

      {actionError && (
        <div className="fixed top-16 right-8 z-50 max-w-md bg-rose-50 text-rose-700 border border-rose-200 px-4 py-3 rounded-xl shadow-lg flex items-start gap-2 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />

          <span className="flex-1">{actionError}</span>

          <button
            type="button"
            onClick={() => setActionError(null)}
            className="hover:text-rose-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==================================================
          TOP BREADCRUMB & ACTIONS
      ================================================== */}

      <div className="flex items-center justify-between gap-3 shrink-0">
        <div>
          <nav
            className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5"
            aria-label="Breadcrumb"
          >
            <button
              id="breadcrumb-dashboard"
              type="button"
              onClick={onBackToDashboard}
              className="hover:text-blue-600 hover:underline transition-colors font-medium cursor-pointer"
            >
              Dashboard
            </button>

            <span className="text-slate-400">/</span>

            <button
              id="breadcrumb-tickets"
              type="button"
              onClick={onBackToTickets}
              className="hover:text-blue-600 hover:underline transition-colors font-medium cursor-pointer"
            >
              Tickets
            </button>

            <span className="text-slate-400">/</span>

            <span className="text-slate-800 font-bold">
              Ticket Details
            </span>
          </nav>

          <h1 className="text-xl font-black text-[#1E3A8A] tracking-tight">
            Ticket Details
          </h1>
        </div>

        <button
          id="btn-back-to-tickets"
          type="button"
          onClick={onBackToTickets}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#E5EAF2] shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Tickets</span>
        </button>
      </div>

      {/* ==================================================
          TICKET HEADER
      ================================================== */}

      <div
        id="ticket-header-card"
        style={{ backgroundColor: '#EEF6FF' }}
        className="bg-[#EEF6FF] rounded-xl border border-[#BFDBFE] shadow-2xs p-3.5 lg:px-6 lg:py-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-5 lg:gap-6">
          <div className="w-11 h-11 rounded-xl bg-white text-[#2161F5] border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Ticket className="w-5 h-5 stroke-[2.2] text-[#2161F5]" />
          </div>

          <div className="flex flex-col justify-center space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5 pb-0.5">
              <span className="text-sm font-black font-mono text-[#2161F5]">
                Ticket #{ticket.ticketNumber}
              </span>

              {getStatusBadge(currentStatus)}

              {getPriorityBadge()}
            </div>

            <h2 className="text-base lg:text-[17px] font-bold text-slate-900 leading-snug">
              {ticket.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Created: {ticket.createdDate || 'Not available'}</span>
              </span>

              <span>•</span>

              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#2161F5] font-semibold">
                  {ticket.project || 'General'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================
            CHANGE STATUS
        ================================================== */}

        <div className="relative shrink-0 self-start md:self-center">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Update Status:
            </span>

            <div className="flex flex-wrap items-center gap-1">
              {AVAILABLE_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() =>
                    handleStatusChange(
                      status as SupportTicketItem['status']
                    )
                  }
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isUpdatingStatus
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  } ${
                    currentStatus === status
                      ? 'bg-[#2161F5] text-white shadow-2xs font-bold'
                      : 'bg-white/80 text-slate-600 hover:bg-white border border-blue-100/80'
                  }`}
                >
                  {isUpdatingStatus && currentStatus === status ? (
                    <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                  ) : null}

                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          TWO COLUMN DETAILS LAYOUT
      ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">

        {/* ==================================================
            LEFT CARD: SUPPORT TICKET
        ================================================== */}

        <div
          id="card-support-ticket-body"
          className="lg:col-span-7 bg-white rounded-xl border border-[#E5EAF2] shadow-2xs overflow-hidden flex flex-col min-h-[400px] lg:h-full"
        >
          <div className="px-5 py-3.5 bg-[#F7F9FC] border-b border-[#E5EAF2] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-4.5 rounded-full bg-[#2161F5]" />

              <h3 className="text-sm lg:text-base font-bold text-[#1E3A8A]">
                Support Ticket
              </h3>
            </div>

            <span className="text-xs font-medium text-slate-500 font-mono">
              ID: {ticket.id}
            </span>
          </div>

          <div className="p-5 lg:p-6 space-y-4 text-xs overflow-y-auto flex-1 flex flex-col justify-between">

            {/* TITLE */}

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Title
              </span>

              <p className="text-sm lg:text-[15px] font-semibold text-slate-900 bg-[#F9FAFC] p-3.5 rounded-xl border border-slate-200/70 shadow-2xs leading-snug">
                {ticket.title || 'Untitled ticket'}
              </p>
            </div>

            {/* DESCRIPTION */}

            <div className="flex-1 flex flex-col min-h-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Description
              </span>

              <div className="text-sm lg:text-[14px] text-slate-700 leading-relaxed bg-[#F9FAFC] p-4 lg:p-5 rounded-xl border border-slate-200/70 whitespace-pre-line overflow-y-auto flex-1 shadow-2xs min-h-[140px]">
                {ticket.description || 'No description provided.'}
              </div>
            </div>

            {/* ATTACHMENT */}

            <div className="shrink-0 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Attachment
              </span>

              <div
                id="ticket-attachment-card"
                className="p-3.5 lg:p-4 bg-blue-50/40 border border-blue-100/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-200 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Paperclip className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>
                        {ticket.attachmentAvailable
                          ? displayAttachment.name
                          : 'No attachment'}
                      </span>
                    </h4>

                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {ticket.attachmentAvailable
                        ? `${displayAttachment.type} • ${displayAttachment.size}`
                        : 'No file was uploaded with this ticket.'}
                    </p>
                  </div>
                </div>

                {ticket.attachmentAvailable ? (
                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <button
                      id="btn-view-attachment"
                      type="button"
                      onClick={() => setPreviewAttachment(true)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      id="btn-download-attachment"
                      type="button"
                      disabled={isDownloading}
                      onClick={handleDownload}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2161F5] hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}

                      <span>
                        {isDownloading ? 'Downloading...' : 'Download'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">
                    Not available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            RIGHT CARD: TICKET INFORMATION
        ================================================== */}

        <div
          id="card-ticket-info-body"
          className="lg:col-span-5 bg-white rounded-xl border border-[#E5EAF2] shadow-2xs overflow-hidden flex flex-col justify-between min-h-[400px] lg:h-full"
        >
          <div className="px-5 py-3.5 bg-[#F7F9FC] border-b border-[#E5EAF2] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-4.5 rounded-full bg-[#2161F5]" />

              <h3 className="text-sm lg:text-base font-bold text-[#1E3A8A]">
                Ticket Information
              </h3>
            </div>
          </div>

          <div className="p-5 lg:p-6 divide-y divide-[#E8EEF5] text-xs lg:text-sm flex-1 flex flex-col justify-around">

            {/* TICKET ID */}

            <div className="py-2.5 first:pt-0 flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">
                Ticket ID
              </span>

              <span className="font-mono font-bold text-slate-900 text-sm">
                {ticket.ticketNumber}
              </span>
            </div>

            {/* STATUS */}

            <div className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">
                Status
              </span>

              <div>{getStatusBadge(currentStatus)}</div>
            </div>

            {/* PRIORITY */}

            <div className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">
                Priority
              </span>

              <div>{getPriorityBadge()}</div>
            </div>

            {/* PROJECT */}

            <div className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">
                Project
              </span>

              <span className="font-bold text-[#2161F5] text-right">
                {ticket.project || 'General'}
              </span>
            </div>

            {/* DATE & TIME */}

            <div className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">
                Date & Time
              </span>

              <span className="font-mono text-slate-800 text-right">
                {ticket.createdDate || 'Not available'}
              </span>
            </div>

            {/* ASSIGNED MANAGER */}

            <div className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">
                Assigned Manager
              </span>

              <span className="font-semibold text-slate-900 flex items-center gap-2 text-right">
                <User className="w-4 h-4 text-slate-400 shrink-0" />

                <span>
                  {ticket.manager || ticket.assignee || 'Not assigned'}
                </span>
              </span>
            </div>

            {/* MANAGER EMAIL */}

            <div className="py-2.5 last:pb-0 flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">
                Manager Email
              </span>

              {ticket.managerEmail ? (
                <a
                  href={`mailto:${ticket.managerEmail}`}
                  className="font-medium text-[#2161F5] hover:underline flex items-center gap-2 text-right"
                >
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />

                  <span>{ticket.managerEmail}</span>
                </a>
              ) : (
                <span className="text-slate-400">
                  Not available
                </span>
              )}
            </div>
          </div>

          {/* FOOTER */}

          <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E5EAF2] flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#2161F5]" />
              <span>Ticket Support Information</span>
            </span>

            <span className="font-mono text-slate-400 font-medium">
              {ticket.ticketNumber}
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================
          ATTACHMENT PREVIEW MODAL
      ================================================== */}

      {previewAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setPreviewAttachment(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in zoom-in-95"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />

                <span className="font-bold text-slate-900 text-sm">
                  {displayAttachment.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewAttachment(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-3">
              <FileText className="w-10 h-10 mx-auto text-blue-500" />

              <h4 className="font-bold text-slate-900 text-sm">
                Attachment available
              </h4>

              <p className="text-xs text-slate-500 leading-relaxed">
                Your attachment is stored on the server. The current API
                does not provide the original file type or preview metadata.
                Download the file to view it.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewAttachment(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>

              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownload}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}

                <span>
                  {isDownloading ? 'Downloading...' : 'Download File'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};