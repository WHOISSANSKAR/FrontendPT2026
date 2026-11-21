import React from 'react';
import { X, ShoppingBag, CheckCircle2, Clock, Truck } from 'lucide-react';
import { OrderItem } from '../../types';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderItem[];
}

export const OrdersModal: React.FC<OrdersModalProps> = ({
  isOpen,
  onClose,
  orders
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[calc(100%-24px)] sm:w-full max-w-2xl max-h-[calc(100dvh-24px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Procurement & Order History</h3>
              <p className="text-[11px] text-slate-500">Hardware components, PLCs, and spare dispatch orders</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100 p-2">
          {orders.map((ord) => (
            <div key={ord.id} className="p-3.5 hover:bg-slate-50/70 rounded-xl transition-colors flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-xs">{ord.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      ord.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ord.status === 'Processing'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {ord.itemsCount} line items · Vendor: <span className="font-medium text-slate-700">{ord.vendor}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {ord.totalAmount}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Placed {ord.date}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">Total Purchase Volume: <strong className="text-slate-900 font-mono">₹21,540</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
