import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  LifeBuoy,
  Clock,
  CheckCircle2,
  Layers,
  Eye,
  Calendar,
  X,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ProjectItem, SupportTicketItem } from '../types';
import { OpenTicketModal } from './modals/OpenTicketModal';

interface TicketsViewProps {
  tickets: SupportTicketItem[];
  onBackToDashboard: () => void;
  onViewTicketDetails: (ticket: SupportTicketItem) => void;
  onAddTicket: (ticket: SupportTicketItem) => void;
  isOpenModalInitial?: boolean;
  projects: ProjectItem[];
  defaultProjectId?: string;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets,
  projects,
  defaultProjectId,
  onBackToDashboard,
  onViewTicketDetails,
  onAddTicket,
  isOpenModalInitial = false
}) => {
  // Modal State
  const [isOpenModal, setIsOpenModal] = useState(isOpenModalInitial);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [activeFilterQuery, setActiveFilterQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // KPI calculations
  const openCount = useMemo(() => {
    return tickets.filter(t => t.status === 'Open').length;
  }, [tickets]);

  const inProgressCount = useMemo(() => {
    return tickets.filter(t => t.status === 'In Progress' || t.status === 'Pending').length;
  }, [tickets]);

  const resolvedCount = useMemo(() => {
    return tickets.filter(t => t.status === 'Resolved').length;
  }, [tickets]);

  const totalCount = tickets.length;

  // Filter Logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // Search query (ticket ID, title, project, or description)
      const query = activeFilterQuery || searchQuery;
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesId = t.ticketNumber.toLowerCase().includes(q);
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesProject = t.project.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesAssignee = t.assignee.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesProject && !matchesDesc && !matchesAssignee) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'In Progress') {
          if (t.status !== 'In Progress' && t.status !== 'Pending') return false;
        } else if (t.status !== statusFilter) {
          return false;
        }
      }

      // Date Filter
      if (dateFilter !== 'All') {
        const dateLower = t.createdDate.toLowerCase();
        if (dateFilter === 'Today') {
          if (!dateLower.includes('sep 16') && !dateLower.includes('today') && !dateLower.includes('just now') && !dateLower.includes('min') && !dateLower.includes('hr')) {
            return false;
          }
        } else if (dateFilter === 'Past 7 Days') {
          if (!dateLower.includes('sep') && !dateLower.includes('ago') && !dateLower.includes('yesterday')) {
            return false;
          }
        } else if (dateFilter === 'Past 30 Days') {
          if (!dateLower.includes('sep') && !dateLower.includes('aug')) {
            return false;
          }
        }
      }

      return true;
    });
  }, [tickets, searchQuery, activeFilterQuery, statusFilter, dateFilter]);

  // Pagination calculation
  const totalItems = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTickets = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, safeCurrentPage, pageSize]);

  const handleApplyFilter = () => {
    setActiveFilterQuery(searchQuery);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilterQuery('');
    setStatusFilter('All');
    setDateFilter('All');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Status Badge Renderer
  const renderStatusPill = (status: SupportTicketItem['status']) => {
    if (status === 'Open') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span>Open</span>
        </span>
      );
    }
    if (status === 'In Progress' || status === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>In Progress</span>
        </span>
      );
    }
    if (status === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Resolved</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>Closed</span>
      </span>
    );
  };

  return (
    <div
      id="tickets-module-root"
      className="flex-1 overflow-y-auto bg-[#F4F6F9] text-slate-800 p-3 lg:px-6 lg:py-4 flex flex-col gap-3 max-w-[1680px] w-full mx-auto select-text"
    >
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          {/* Breadcrumb: Dashboard / Tickets */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1" aria-label="Breadcrumb">
            <button
              id="breadcrumb-nav-dashboard"
              type="button"
              onClick={onBackToDashboard}
              className="hover:text-blue-600 hover:underline transition-colors font-medium cursor-pointer"
            >
              Dashboard
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-bold">Tickets</span>
          </nav>

          <h1 className="text-2xl font-black text-[#1E3A8A] tracking-tight">
            Track Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, track and resolve support requests
          </p>
        </div>

        {/* Right Action Button: + Open a Ticket */}
        <button
          id="btn-open-ticket-modal"
          type="button"
          onClick={() => setIsOpenModal(true)}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-white bg-[#2161F5] hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {/* changes done by vb */}
          <span>Open a Ticket</span>
        </button>
      </div>

      {/* 2. Compact KPI Summary Row (4 small cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 shrink-0">

        {/* KPI 1: OPEN (12) */}
        <div
          id="kpi-card-open"
          className="bg-white rounded-xl border border-[#E5EAF2] p-3 shadow-2xs flex items-center justify-between hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                OPEN
              </span>
              <span className="text-xl font-black text-slate-900 font-mono leading-none">
                {openCount}
              </span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-blue-600" />
        </div>

        {/* KPI 2: IN PROGRESS (6) */}
        <div
          id="kpi-card-in-progress"
          className="bg-white rounded-xl border border-[#E5EAF2] p-3 shadow-2xs flex items-center justify-between hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                IN PROGRESS
              </span>
              <span className="text-xl font-black text-slate-900 font-mono leading-none">
                {inProgressCount}
              </span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-amber-500" />
        </div>

        {/* KPI 3: RESOLVED (18) */}
        <div
          id="kpi-card-resolved"
          className="bg-white rounded-xl border border-[#E5EAF2] p-3 shadow-2xs flex items-center justify-between hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                RESOLVED
              </span>
              <span className="text-xl font-black text-slate-900 font-mono leading-none">
                {resolvedCount}
              </span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        {/* KPI 4: TOTAL TICKETS (36) */}
        <div
          id="kpi-card-total"
          className="bg-white rounded-xl border border-[#E5EAF2] p-3 shadow-2xs flex items-center justify-between hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                TOTAL TICKETS
              </span>
              <span className="text-xl font-black text-slate-900 font-mono leading-none">
                {totalCount}
              </span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-slate-400" />
        </div>

      </div>

      {/* 3. Search / Filter Bar (Clean White Card) */}
      <div
        id="tickets-filter-card"
        className="bg-white rounded-xl border border-[#E5EAF2] p-3 shadow-2xs shrink-0"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Tickets */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-search-tickets"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilter();
              }}
              placeholder="Search by ticket ID, title or keyword"
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* Status Dropdown: [ All Statuses ▼ ] */}
          <div className="w-full md:w-44">
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter tickets by status"
              className="w-full px-3 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Date Dropdown: [ All Dates ▼ ] */}
          <div className="w-full md:w-40">
            <select
              id="select-date-filter"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter tickets by date"
              className="w-full px-3 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="Past 7 Days">Past 7 Days</option>
              <option value="Past 30 Days">Past 30 Days</option>
            </select>
          </div>

          {/* Search / Filter Button */}
          <div className="flex items-center gap-2">
            <button
              id="btn-apply-filter"
              type="button"
              onClick={handleApplyFilter}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Search / Filter</span>
            </button>

            {(searchQuery || activeFilterQuery || statusFilter !== 'All' || dateFilter !== 'All') && (
              <button
                id="btn-reset-filters"
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Ticket Table Card */}
      <div
        id="tickets-table-card"
        className="bg-white rounded-xl border border-[#E5EAF2] shadow-2xs overflow-hidden flex flex-col flex-1 min-h-[360px]"
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            {/* Table Header: #F7F9FC, navy text, 13px-14px, thin divider */}
            <thead>
              <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider w-32">
                  Ticket ID
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider min-w-[220px]">
                  Title
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider w-32">
                  Status
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider w-44">
                  Date & Time
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider text-right w-36">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Rows: White background, 52-58px height, subtle #E8EDF5 divider, soft hover */}
            <tbody className="divide-y divide-[#E8EDF5]">
              {paginatedTickets.length > 0 ? (
                paginatedTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="h-14 hover:bg-[#F8FAFD] transition-colors group"
                  >
                    {/* Ticket ID: slightly bold */}
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                        {ticket.ticketNumber}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-5 py-2.5">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight">
                        {ticket.title}
                      </div>
                      <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                        {ticket.project}
                      </div>
                    </td>

                    {/* Description: Truncated with ellipsis */}
                    <td className="px-5 py-2.5">
                      <p className="text-xs text-slate-500 truncate max-w-sm lg:max-w-md">
                        {ticket.description || 'No description provided.'}
                      </p>
                    </td>

                    {/* Status Pill */}
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      {renderStatusPill(ticket.status)}
                    </td>

                    {/* Date & Time */}
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <span className="text-xs text-slate-600 font-mono">
                        {ticket.createdDate}
                      </span>
                    </td>

                    {/* Action: [ ◉ View Details ] */}
                    <td className="px-5 py-2.5 whitespace-nowrap text-right">
                      <button
                        id={`btn-view-details-${ticket.ticketNumber.toLowerCase()}`}
                        type="button"
                        onClick={() => onViewTicketDetails(ticket)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-300" />
                      <span>No support tickets match your search and filter criteria.</span>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-xs text-blue-600 hover:underline font-semibold mt-1"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Table Footer / Pagination */}
        <div
          id="tickets-table-pagination"
          className="mt-auto px-5 sm:px-6 pt-4 pb-5 sm:pb-6 border-t border-[#E5EAF2] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative z-10"
        >
          {/* Left: Showing 1–10 of 36 tickets */}
          <div className="text-xs text-slate-500 font-medium order-2 sm:order-1">
            Showing{' '}
            <span className="font-bold text-slate-800">
              {totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(safeCurrentPage * pageSize, totalItems)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{totalItems}</span> tickets
          </div>

          {/* Right: First, Previous, 1, 2, 3, Next, Last */}
          <div className="flex items-center gap-1 order-1 sm:order-2 ml-auto">
            {/* First */}
            <button
              id="btn-tickets-first"
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => handlePageChange(1)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              First
            </button>

            {/* Previous */}
            <button
              id="btn-tickets-prev"
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Numeric Page Buttons (1, 2, 3...) */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                className={`min-w-[28px] h-7 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${safeCurrentPage === pageNum
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next */}
            <button
              id="btn-tickets-next"
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              Next
            </button>

            {/* Last */}
            <button
              id="btn-tickets-last"
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => handlePageChange(totalPages)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* Open Ticket Modal (rendered on the same page when triggered) */}
      <OpenTicketModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onAddTicket={(newTkt) => {
          onAddTicket(newTkt);
          setIsOpenModal(false);
        }}
        projects={projects}
        defaultProjectId={defaultProjectId}
      />
    </div>
  );
};
