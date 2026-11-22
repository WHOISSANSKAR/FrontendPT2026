import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Package,
  AlertCircle
} from 'lucide-react';
import { OrderItem } from '../types';
import { OrderDetailsModal } from './modals/OrderDetailsModal';

interface OrdersViewProps {
  orders: OrderItem[];
  onBackToDashboard: () => void;
  onSelectOrder?: (order: OrderItem) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onBackToDashboard,
  onSelectOrder
}) => {
  // Search & Filter State
  const [orderNoQuery, setOrderNoQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({
    orderNo: '',
    date: 'All',
    status: 'All'
  });

  // Modal State for View Details
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Pagination State (10 items per page matching Track Tickets)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Order No / Vendor Filter
      const activeOrderQuery = appliedFilters.orderNo.trim().toLowerCase();
      if (activeOrderQuery) {
        const matchesNumber = order.orderNumber.toLowerCase().includes(activeOrderQuery);
        const matchesVendor = order.vendor.toLowerCase().includes(activeOrderQuery);
        const matchesId = order.id.toLowerCase().includes(activeOrderQuery);
        if (!matchesNumber && !matchesVendor && !matchesId) {
          return false;
        }
      }

      // Status Filter
      if (appliedFilters.status !== 'All') {
        if (order.status !== appliedFilters.status) {
          return false;
        }
      }

      // Date Filter
      if (appliedFilters.date !== 'All') {
        const dateLower = order.date.toLowerCase();
        if (appliedFilters.date === 'Today') {
          if (!dateLower.includes('today')) return false;
        } else if (appliedFilters.date === 'Past 7 Days') {
          if (!dateLower.includes('today') && !dateLower.includes('12 sep') && !dateLower.includes('10 sep')) {
            return false;
          }
        } else if (appliedFilters.date === 'September 2026') {
          if (!dateLower.includes('sep') && !dateLower.includes('today')) {
            return false;
          }
        } else if (appliedFilters.date === 'August 2026') {
          if (!dateLower.includes('aug')) {
            return false;
          }
        }
      }

      return true;
    });
  }, [orders, appliedFilters]);

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, safeCurrentPage, pageSize]);

  const handleApplyFilter = () => {
    setAppliedFilters({
      orderNo: orderNoQuery,
      date: dateFilter,
      status: statusFilter
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setOrderNoQuery('');
    setDateFilter('All');
    setStatusFilter('All');
    setAppliedFilters({
      orderNo: '',
      date: 'All',
      status: 'All'
    });
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    onSelectOrder?.(order);
  };

  // Status Pill Renderer
  const renderStatusPill = (status: OrderItem['status']) => {
    switch (status) {
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Processing</span>
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Pending</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const isFiltered = Boolean(
    orderNoQuery.trim() || appliedFilters.orderNo.trim() || appliedFilters.date !== 'All' || appliedFilters.status !== 'All'
  );

  return (
    <div 
      id="orders-view-page"
      className="w-full min-h-[calc(100dvh-56px)] flex-1 overflow-y-auto lg:overflow-hidden lg:h-[calc(100dvh-56px)] lg:max-h-[calc(100dvh-56px)] bg-[#F4F6F9] text-slate-800 p-3 lg:px-6 lg:py-4 flex flex-col gap-3 max-w-[1680px] mx-auto select-text"
    >
      {/* 1. Page Header (Fixed) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          {/* Breadcrumb: Dashboard / Orders */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1" aria-label="Breadcrumb">
            <button
              id="breadcrumb-orders-dashboard"
              type="button"
              onClick={onBackToDashboard}
              className="hover:text-blue-600 hover:underline transition-colors cursor-pointer font-medium"
            >
              Dashboard
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-bold">Orders</span>
          </nav>

          <h1 className="text-2xl font-black text-[#1E3A8A] tracking-tight">
            Order History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive log of hardware, PLC components, and spares procurement orders
          </p>
        </div>

        {/* Total Orders Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-[#E5EAF2] rounded-xl text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Total Orders: <strong className="text-slate-900 font-mono">{orders.length}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Search / Filter Card (Track Tickets Style) */}
      {/* [ Search Order No / Vendor ] [ All Dates ] [ All Statuses ] [ Search ] */}
      <div 
        id="orders-filter-card"
        className="bg-white rounded-xl border border-[#E5EAF2] p-3 shadow-2xs shrink-0"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3">
          
          {/* Order No / Vendor Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-filter-order-no"
              type="text"
              value={orderNoQuery}
              onChange={(e) => setOrderNoQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilter();
              }}
              placeholder="Search Order No / Vendor (e.g. #1024 or Siemens)"
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* Order Date Select */}
          <div className="w-full md:w-44">
            <select
              id="select-filter-order-date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
              }}
              aria-label="Filter orders by date"
              className="w-full px-3 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="Past 7 Days">Past 7 Days</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="w-full md:w-40">
            <select
              id="select-filter-order-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              aria-label="Filter orders by status"
              className="w-full px-3 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Delivered">Delivered</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Action Buttons: [ Search ] & [ Reset ] */}
          <div className="flex items-center gap-2">
            <button
              id="btn-apply-order-filter"
              type="button"
              onClick={handleApplyFilter}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            {isFiltered && (
              <button
                id="btn-reset-order-filters"
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. Main Order History Table Card */}
      {/* Visual match for Track Tickets table: rounded-xl, light border, sticky header, internal scrolling */}
      <div 
        id="orders-table-card"
        className="bg-white rounded-xl border border-[#E5EAF2] shadow-2xs overflow-hidden flex flex-col flex-1 min-h-0"
      >
        {/* Table Container - only vertically scrollable section */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-auto no-scrollbar scroll-x-visible" /* changes done by vb */>
          <table className="w-full text-left border-collapse min-w-[760px]">
            {/* Table Header: Sticky top-0, z-10, #F7F9FC, navy text, 13px font-bold, uppercase */}
            <thead className="sticky top-0 z-10 bg-[#F7F9FC] shadow-[0_1px_0_0_#E5EAF2]">
              <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                <th className="px-6 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider bg-[#F7F9FC] w-36">
                  Order ID
                </th>
                <th className="px-6 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider bg-[#F7F9FC] min-w-[220px]">
                  Items
                </th>
                <th className="px-6 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider bg-[#F7F9FC] w-40">
                  Status
                </th>
                <th className="px-6 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider bg-[#F7F9FC] w-44">
                  Ordered On
                </th>
                <th className="px-6 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider bg-[#F7F9FC] text-right w-36">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Rows: White background, 52-58px row height, divider lines, soft hover */}
            <tbody className="divide-y divide-[#E8EDF5]">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr 
                    key={order.id}
                    className="h-13 sm:h-14 hover:bg-[#F8FAFD] transition-colors group cursor-pointer"
                    onClick={() => handleViewDetails(order)}
                  >
                    {/* Order ID: bold font */}
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {order.orderNumber}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-slate-600 text-xs font-medium truncate max-w-xs">
                          {order.vendor}
                        </span>
                      </div>
                      {order.itemsDetail && order.itemsDetail.length > 0 && (
                        <div className="text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md mt-0.5">
                          {order.itemsDetail.join(', ')}
                        </div>
                      )}
                    </td>

                    {/* Status Pill */}
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      {renderStatusPill(order.status)}
                    </td>

                    {/* Ordered On */}
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.date}</span>
                      </div>
                    </td>

                    {/* Action: "View Details" button matching Track Tickets */}
                    <td className="px-6 py-2.5 whitespace-nowrap text-right">
                      <button
                        id={`btn-view-order-${order.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(order);
                        }}
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
                  <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-300" />
                      <span>No orders match your search and filter criteria.</span>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-xs text-blue-600 hover:underline font-semibold mt-1 cursor-pointer"
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

        {/* 4. Table Footer / Fixed Pagination (Matches Track Tickets) */}
        <div 
          id="orders-table-pagination"
          className="mt-auto px-5 sm:px-6 py-3.5 border-t border-[#E5EAF2] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative z-10"
        >
          {/* Left: Showing 1–10 of XX orders */}
          <div className="text-xs text-slate-500 font-medium order-2 sm:order-1">
            Showing{' '}
            <span className="font-bold text-slate-800">
              {totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(safeCurrentPage * pageSize, totalItems)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{totalItems}</span> orders
          </div>

          {/* Right: First, Previous, Page Buttons, Next, Last */}
          <div className="flex items-center gap-1 order-1 sm:order-2 ml-auto">
            {/* First */}
            <button
              id="btn-orders-first"
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => handlePageChange(1)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              First
            </button>

            {/* Previous */}
            <button
              id="btn-orders-prev"
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Numeric Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                  safeCurrentPage === pageNum
                    ? 'bg-[#1E3A8A] text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next */}
            <button
              id="btn-orders-next"
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              Next
            </button>

            {/* Last */}
            <button
              id="btn-orders-last"
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

      {/* 5. Order Details Modal */}
      {isDetailsOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isDetailsOpen} // changes done by vb: was missing, so the modal never opened
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};
