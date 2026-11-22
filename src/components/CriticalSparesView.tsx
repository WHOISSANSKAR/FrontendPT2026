import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Cpu,
  AlertCircle,
  ShoppingCart,
  CheckCircle2
} from 'lucide-react';
import { CriticalSpareItem, CartItem } from '../types';
import { QuantityStepper, MIN_ORDER_QTY } from './QuantityStepper';

interface CriticalSparesViewProps {
  spares: CriticalSpareItem[];
  cart?: CartItem[];
  onBackToDashboard: () => void;
  onAddToCart?: (spare: CriticalSpareItem, quantity: number) => void;
}

export const CriticalSparesView: React.FC<CriticalSparesViewProps> = ({
  spares,
  cart = [],
  onBackToDashboard,
  onAddToCart
}) => {
  const [orderQty, setOrderQty] = useState<Record<string, number>>({});
  const [requestedId, setRequestedId] = useState<string | null>(null);

  const getAvailableStock = (item: CriticalSpareItem) =>
    Math.max(0, Number(item.qty !== undefined ? item.qty : item.stock) || 0);

  const getCartQty = (id: string) =>
    cart.find(c => c.id === id)?.quantity ?? 0;

  const getRemainingStock = (item: CriticalSpareItem) =>
    Math.max(0, getAvailableStock(item) - getCartQty(item.id));

  const getOrderQty = (item: CriticalSpareItem) => {
    const remaining = getRemainingStock(item);
    if (remaining <= 0) return 0;
    const raw = orderQty[item.id] ?? MIN_ORDER_QTY;
    return Math.min(Math.max(MIN_ORDER_QTY, raw), remaining);
  };

  const handleSetOrderQty = (item: CriticalSpareItem, nextQty: number) => {
    const remaining = getRemainingStock(item);
    const clamped =
      remaining <= 0
        ? 0
        : Math.min(Math.max(MIN_ORDER_QTY, Math.floor(nextQty) || MIN_ORDER_QTY), remaining);
    setOrderQty(prev => ({ ...prev, [item.id]: clamped }));
  };

  const handleRequestSpare = (item: CriticalSpareItem, qty?: number) => {
    if (!onAddToCart) return;
    const remaining = getRemainingStock(item);
    if (remaining <= 0) return;

    const chosenQty = qty !== undefined ? qty : getOrderQty(item);
    const safeQty = Math.min(Math.max(MIN_ORDER_QTY, chosenQty), remaining);

    onAddToCart(item, safeQty);
    setOrderQty(prev => ({ ...prev, [item.id]: MIN_ORDER_QTY }));
    setRequestedId(item.id);
    setTimeout(() => setRequestedId(current => (current === item.id ? null : current)), 1500);
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  // Pagination State (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Extract unique families for dropdown
  const uniqueFamilies = useMemo(() => {
    const set = new Set<string>();
    spares.forEach(s => {
      const fam = s.family || s.category;
      if (fam) set.add(fam);
    });
    return Array.from(set).sort();
  }, [spares]);

  // Filter Logic
  const filteredSpares = useMemo(() => {
    return spares.filter((item) => {
      const query = (activeQuery || searchQuery).trim().toLowerCase();
      if (query) {
        const matchesSerial = (item.serialNo || '').toLowerCase().includes(query);
        const matchesHw = (item.hwIdentifier || '').toLowerCase().includes(query);
        const matchesModel = (item.modelNo || '').toLowerCase().includes(query);
        const matchesFamily = (item.family || item.category || '').toLowerCase().includes(query);
        const matchesPart = (item.partNumber || '').toLowerCase().includes(query);
        const matchesName = (item.name || '').toLowerCase().includes(query);
        const matchesCity = (item.city || '').toLowerCase().includes(query);
        const matchesState = (item.state || '').toLowerCase().includes(query);
        const matchesProj = (item.projectTitle || item.projectId || '').toLowerCase().includes(query);

        if (!matchesSerial && !matchesHw && !matchesModel && !matchesFamily && !matchesPart && !matchesName && !matchesCity && !matchesState && !matchesProj) {
          return false;
        }
      }

      if (familyFilter !== 'All') {
        const itemFam = item.family || item.category;
        if (itemFam !== familyFilter) {
          return false;
        }
      }

      if (stockFilter !== 'All') {
        const quantity = item.qty !== undefined ? item.qty : item.stock;
        if (stockFilter === 'Low' && quantity > 2) return false;
        if (stockFilter === 'In Stock' && quantity <= 2) return false;
      }

      return true;
    });
  }, [spares, searchQuery, activeQuery, familyFilter, stockFilter]);

  // Pagination calculations
  const totalItems = filteredSpares.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedSpares = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredSpares.slice(startIndex, startIndex + pageSize);
  }, [filteredSpares, safeCurrentPage, pageSize]);

  const handleApplyFilter = () => {
    setActiveQuery(searchQuery);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveQuery('');
    setFamilyFilter('All');
    setStockFilter('All');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || activeQuery.trim() || familyFilter !== 'All' || stockFilter !== 'All'
  );

  return (
    <div
      id="critical-spares-page-root"
      className="w-full min-h-[calc(100dvh-56px)] flex-1 overflow-y-auto lg:overflow-hidden lg:h-[calc(100dvh-56px)] lg:max-h-[calc(100dvh-56px)] bg-[#F4F6F9] text-slate-800 p-3 lg:px-6 lg:py-4 flex flex-col gap-3 max-w-[1680px] mx-auto select-text"
    >
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
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
            <span className="text-slate-800 font-bold">Critical Spares</span>
          </nav>

          <h1 className="text-2xl font-black text-[#1E3A8A] tracking-tight">
            Critical Spares
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Hardware Inventory & Procurement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-[#E5EAF2] rounded-xl text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>Total Spares: <strong className="text-slate-900 font-mono">{spares.length}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Search / Filter Bar */}
      <div
        id="critical-spares-filter-card"
        className="bg-white rounded-xl border border-[#E5EAF2] p-3 shadow-2xs shrink-0"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-search-spares"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyFilter();
              }}
              placeholder="Search Serial No / Hardware Identifier / Family / Part"
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          <div className="w-full md:w-44">
            <select
              id="select-family-filter"
              value={familyFilter}
              onChange={(e) => {
                setFamilyFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter spares by family"
              className="w-full px-3 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
            >
              <option value="All">All Families</option>
              {uniqueFamilies.map(fam => (
                <option key={fam} value={fam}>{fam}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-36">
            <select
              id="select-stock-filter"
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter spares by stock status"
              className="w-full px-3 py-2 bg-white border border-[#E5EAF2] rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
            >
              <option value="All">All Stock</option>
              <option value="Low">Low Stock (≤ 2)</option>
              <option value="In Stock">In Stock (&gt; 2)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-apply-spares-filter"
              type="button"
              onClick={handleApplyFilter}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Search / Filter</span>
            </button>

            {hasActiveFilters && (
              <button
                id="btn-reset-spares-filters"
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

      {/* 3. Main Critical Spares Table Card */}
      <div
        id="critical-spares-table-card"
        className="bg-white rounded-xl border border-[#E5EAF2] shadow-2xs overflow-hidden flex flex-col flex-1 min-h-0"
      >
        <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-auto no-scrollbar scroll-x-visible" /* changes done by vb */>
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="sticky top-0 z-10 bg-[#F7F9FC] shadow-[0_1px_0_0_#E5EAF2]">
              <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2]">
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider text-left bg-[#F7F9FC] w-40">
                  Serial No
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider text-left bg-[#F7F9FC] w-44">
                  H/W Identifier
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider text-left bg-[#F7F9FC] w-36">
                  Model No
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider text-center bg-[#F7F9FC] w-24">
                  Stock Qty
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider text-left bg-[#F7F9FC] min-w-[150px]">
                  Family
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider text-left bg-[#F7F9FC] w-36">
                  City
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider text-left bg-[#F7F9FC] w-36">
                  State
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider text-center bg-[#F7F9FC] w-32">
                  Order Qty
                </th>
                <th className="px-5 py-3 text-[13px] font-bold text-[#1E3A8A] uppercase tracking-wider text-right bg-[#F7F9FC] w-44">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8EDF5]">
              {paginatedSpares.length > 0 ? (
                paginatedSpares.map((item) => {
                  const quantity = getAvailableStock(item);
                  const remainingStock = getRemainingStock(item);
                  const isOutOfStock = quantity <= 0;
                  const isMaxInCart = !isOutOfStock && remainingStock <= 0;
                  const isLowQuantity = quantity <= 2;

                  return (
                    <tr
                      key={item.id}
                      className="h-13 sm:h-14 hover:bg-[#F8FAFD] transition-colors group"
                    >
                      {/* Serial No */}
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                          {item.serialNo || item.partNumber}
                        </span>
                      </td>

                      {/* H/W Identifier */}
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <span className="font-mono text-slate-800 font-semibold text-xs sm:text-sm">
                          {item.hwIdentifier || `HW-${item.partNumber.slice(0, 7)}`}
                        </span>
                      </td>

                      {/* Model No */}
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <span className="font-mono text-slate-700 text-xs sm:text-sm">
                          {item.modelNo || `MDL-${item.partNumber.slice(-4)}`}
                        </span>
                      </td>

                      {/* Stock Qty Badge */}
                      <td className="px-5 py-2.5 whitespace-nowrap text-center">
                        {isLowQuantity ? (
                          <span className="inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-full font-bold font-mono text-xs text-rose-700 bg-rose-50 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                            {quantity}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-full font-bold font-mono text-xs text-blue-700 bg-blue-50 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5" />
                            {quantity}
                          </span>
                        )}
                      </td>

                      {/* Family */}
                      <td className="px-5 py-2.5 whitespace-nowrap font-medium text-slate-800 text-xs sm:text-sm">
                        {item.family || item.category}
                      </td>

                      {/* City */}
                      <td className="px-5 py-2.5 whitespace-nowrap text-slate-600 text-xs sm:text-sm">
                        {item.city || 'Gurugram'}
                      </td>

                      {/* State */}
                      <td className="px-5 py-2.5 whitespace-nowrap text-slate-600 text-xs sm:text-sm">
                        {item.state || 'Haryana'}
                      </td>

                      {/* Order Qty (clamped to remaining available stock) */}
                      <td className="px-5 py-2.5 whitespace-nowrap text-center">
                        {remainingStock > 0 ? (
                          <QuantityStepper
                            value={getOrderQty(item)}
                            max={remainingStock}
                            onChange={(q) => handleSetOrderQty(item, q)}
                            onSubmit={(q) => handleRequestSpare(item, q)}
                            itemLabel={item.name}
                            size="md"
                          />
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-2.5 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleRequestSpare(item)}
                          disabled={!onAddToCart || remainingStock <= 0}
                          title={
                            isOutOfStock
                              ? 'Out of stock'
                              : isMaxInCart
                                ? `All ${quantity} available units are already in your cart`
                                : `Add up to ${remainingStock} available`
                          }
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            requestedId === item.id
                              ? 'bg-emerald-600 text-white'
                              : remainingStock <= 0
                                ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                          }`}
                        >
                          {requestedId === item.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Added to Cart</span>
                            </>
                          ) : isOutOfStock ? (
                            <span>Out of Stock</span>
                          ) : isMaxInCart ? (
                            <span>Max in Cart</span>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Request Spare</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-300" />
                      <span>No critical spares match your search and filter criteria.</span>
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

        {/* 4. Table Footer / Fixed Pagination */}
        <div
          id="critical-spares-table-pagination"
          className="mt-auto px-5 sm:px-6 py-3.5 border-t border-[#E5EAF2] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative z-10"
        >
          <div className="text-xs text-slate-500 font-medium order-2 sm:order-1">
            Showing{' '}
            <span className="font-bold text-slate-800">
              {totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(safeCurrentPage * pageSize, totalItems)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{totalItems}</span> spares
          </div>

          <div className="flex items-center gap-1 order-1 sm:order-2 ml-auto">
            <button
              id="btn-spares-first"
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => handlePageChange(1)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              First
            </button>

            <button
              id="btn-spares-prev"
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              Previous
            </button>

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

            <button
              id="btn-spares-next"
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              Next
            </button>

            <button
              id="btn-spares-last"
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
    </div>
  );
};