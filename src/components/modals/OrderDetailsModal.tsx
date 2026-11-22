import React from 'react';
import { X, ShoppingBag, Truck, Calendar, DollarSign, Building2, MapPin, Hash, CheckCircle2, Clock, AlertTriangle, Ban } from 'lucide-react';
import { OrderItem } from '../../types';

interface OrderDetailsModalProps {
  order: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!isOpen || !order) return null;

  const renderStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Processing</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div 
      id="order-details-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="order-details-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[calc(100%-24px)] sm:w-full max-w-[560px] max-h-[calc(100dvh-24px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800"
      >
        {/* Header with PseudoTeam light blue tint #EEF6FF */}
        <div 
          style={{ backgroundColor: '#EEF6FF' }}
          className="px-5 sm:px-6 py-4 border-b border-[#BFDBFE] flex items-center justify-between bg-[#EEF6FF] shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#2161F5] border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
              <ShoppingBag className="w-4 h-4 stroke-[2.2] text-[#2161F5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1E3A8A] tracking-tight">
                  Order Details
                </h2>
                <span className="font-mono font-bold text-slate-800 text-sm px-2 py-0.5 bg-white/80 rounded-md border border-blue-200/80">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Procurement specifications & dispatch details
              </p>
            </div>
          </div>

          <button 
            id="btn-close-order-details"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer border border-transparent hover:border-blue-200"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-xs bg-white overflow-y-auto no-scrollbar flex-1">
          {/* Top Info Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F8FAFD] border border-[#E5EAF2] rounded-xl">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Status</span>
              <div>{renderStatusBadge(order.status)}</div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Total Amount</span>
              <span className="font-mono font-black text-slate-900 text-sm">{order.totalAmount}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Ordered On</span>
              <div className="flex items-center gap-1 text-slate-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{order.date}</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Items Quantity</span>
              <span className="font-semibold text-slate-900">{order.itemsCount} line items</span>
            </div>
          </div>

          {/* Supplier & Dispatch Details */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E5EAF2]">
              <Building2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Vendor / Supplier</span>
                <span className="text-xs font-semibold text-slate-900">{order.vendor}</span>
              </div>
            </div>

            {/* changes done by vb */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E5EAF2]">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Delivery Location</span>
                <span className={`text-xs font-medium ${order.shippingAddress ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                  {order.shippingAddress || 'No delivery address recorded'}
                </span>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E5EAF2]">
                <Truck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Shipment Reference</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{order.trackingNumber}</span>
                </div>
              </div>
            )}
          </div>

          {/* changes done by vb: removed "Order History" timeline, "Manifest Items" list and the bottom Close button row.
              The modal still closes with the X in the header or by clicking outside it. */}
        </div>
      </div>
    </div>
  );
};
