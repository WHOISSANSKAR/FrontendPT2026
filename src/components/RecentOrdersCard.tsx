import React from 'react';
import { ArrowRight } from 'lucide-react';
import { OrderItem } from '../types';

interface RecentOrdersCardProps {
  orders?: OrderItem[];
  onViewAll?: () => void;
  onSelectOrder?: (order: OrderItem) => void;
}

export const RecentOrdersCard: React.FC<RecentOrdersCardProps> = ({
  orders,
  onViewAll,
  onSelectOrder
}) => {
  // changes done by vb: always show the real orders (up to 4). The old code replaced them with
  // 4 hard-coded sample orders (#1024…#1021) whenever there were fewer than 4 real ones.
  const displayOrders = (orders || []).slice(0, 4);

  const renderStatusPill = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/70">
            Delivered
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200/70">
            Processing
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200/70">
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div 
      id="recent-orders-card"
      className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-3 flex flex-col h-full justify-between overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 shrink-0">
        <h2 className="text-xs font-bold text-slate-900 tracking-tight">
          Recent Orders
        </h2>
        <button
          onClick={onViewAll}
          id="btn-orders-view-all"
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-slate-400 font-normal text-[11px] border-b border-slate-100">
              <th className="pb-1 font-normal">Order ID</th>
              <th className="pb-1 font-normal text-center">Items</th>
              <th className="pb-1 font-normal">Status</th>
              <th className="pb-1 font-normal text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayOrders.map((order) => (
              <tr 
                key={order.id}
                onClick={() => onSelectOrder?.(order as any)}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <td className="py-1.5 font-bold text-slate-900 font-mono text-xs">
                  {order.orderNumber}
                </td>
                <td className="py-1.5 text-center text-slate-600 font-medium text-xs">
                  {order.itemsCount}
                </td>
                <td className="py-1.5 whitespace-nowrap">
                  {renderStatusPill(order.status)}
                </td>
                <td className="py-1.5 text-right text-slate-500 whitespace-nowrap text-[11px]">
                  {order.date}
                </td>
              </tr>
            ))}
            {/* changes done by vb: empty state instead of sample orders */}
            {displayOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[11px] text-slate-400">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
