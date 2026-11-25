import React, { useState } from 'react';
import { X, PackageX, Search, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { CriticalSpareItem, CartItem } from '../../types';
import { QuantityStepper, MIN_ORDER_QTY } from '../QuantityStepper';

interface CriticalSparesModalProps {
  isOpen: boolean;
  onClose: () => void;
  spares: CriticalSpareItem[];
  cart?: CartItem[];
  onAddToCart: (spare: CriticalSpareItem, quantity: number) => void;
  onOpenCart?: () => void;
}

export const CriticalSparesModal: React.FC<CriticalSparesModalProps> = ({
  isOpen,
  onClose,
  spares,
  cart = [],
  onAddToCart,
  onOpenCart
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [requestedId, setRequestedId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const getAvailableStock = (sp: CriticalSpareItem) =>
    Math.max(0, Number(sp.stock ?? sp.qty ?? 0) || 0);

  const getCartQty = (id: string) =>
    cart.find(c => c.id === id)?.quantity ?? 0;

  const getRemainingStock = (sp: CriticalSpareItem) =>
    Math.max(0, getAvailableStock(sp) - getCartQty(sp.id));

  const getQty = (sp: CriticalSpareItem) => {
    const remaining = getRemainingStock(sp);
    if (remaining <= 0) return 0;
    const raw = quantities[sp.id] ?? MIN_ORDER_QTY;
    return Math.min(Math.max(MIN_ORDER_QTY, raw), remaining);
  };

  const setQty = (sp: CriticalSpareItem, value: number) => {
    const remaining = getRemainingStock(sp);
    const clamped =
      remaining <= 0
        ? 0
        : Math.min(Math.max(MIN_ORDER_QTY, Math.floor(value) || MIN_ORDER_QTY), remaining);
    setQuantities(prev => ({ ...prev, [sp.id]: clamped }));
  };

  const safeSpares = spares || [];
  const filteredSpares = safeSpares.filter(sp => {
    const matchesFilter = filter === 'All' || sp.status === filter;
    const matchesSearch =
      sp.name.toLowerCase().includes(search.toLowerCase()) ||
      sp.partNumber.toLowerCase().includes(search.toLowerCase()) ||
      sp.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalCartItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleRequest = (sp: CriticalSpareItem, qty?: number) => {
    const remaining = getRemainingStock(sp);
    if (remaining <= 0) return;

    const chosenQty = qty !== undefined ? qty : getQty(sp);
    const safeQty = Math.min(Math.max(MIN_ORDER_QTY, chosenQty), remaining);

    onAddToCart(sp, safeQty);
    setQuantities(prev => ({ ...prev, [sp.id]: MIN_ORDER_QTY }));
    setRequestedId(sp.id);
    setTimeout(() => setRequestedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[calc(100%-24px)] sm:w-full max-w-3xl max-h-[calc(100dvh-24px)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <PackageX className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Critical Spares Inventory & Requisition</h3>
              <p className="text-[11px] text-slate-500">Live warehouse telemetry & emergency procurement</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenCart && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>View Cart</span>
                {totalCartItems > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                    {totalCartItems}
                  </span>
                )}
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

        {/* Filter Bar */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 bg-white shrink-0">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search part number, component name, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 scroll-x-visible">
            {['All', 'Critical', 'Low Stock', 'Pending'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  filter === st
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Spares Table */}
        <div
          className="flex-1 overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none scroll-x-visible"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <table className="w-full text-left text-xs border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                <th className="py-2.5 px-4 bg-slate-50/90">Part / Component</th>
                <th className="py-2.5 px-3 bg-slate-50/90">Category</th>
                <th className="py-2.5 px-3 text-center bg-slate-50/90">Stock / Min</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Lead Time</th>
                <th className="py-2.5 px-3">Unit Cost</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSpares.map((sp) => {
                const availableStock = getAvailableStock(sp);
                const inCartQty = getCartQty(sp.id);
                const remainingStock = getRemainingStock(sp);
                const isOutOfStock = availableStock <= 0;
                const isMaxInCart = !isOutOfStock && remainingStock <= 0;

                return (
                  <tr key={sp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900 leading-tight">{sp.name}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {sp.partNumber}
                        {inCartQty > 0 && (
                          <span className="ml-2 text-blue-600 font-sans font-semibold">
                            • {inCartQty} in cart
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {sp.category}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className={`font-bold ${availableStock <= sp.minThreshold ? 'text-rose-600' : 'text-slate-800'}`}>
                        {availableStock}
                      </span>
                      <span className="text-slate-400"> / {sp.minThreshold}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        sp.status === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : sp.status === 'Low Stock'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {sp.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {sp.leadTimeDays} days
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      {sp.unitCost}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {remainingStock > 0 ? (
                        <QuantityStepper
                          value={getQty(sp)}
                          max={remainingStock}
                          onChange={(q) => setQty(sp, q)}
                          onSubmit={(q) => handleRequest(sp, q)}
                          itemLabel={sp.name}
                        />
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleRequest(sp)}
                        disabled={remainingStock <= 0}
                        title={
                          isOutOfStock
                            ? 'Out of stock'
                            : isMaxInCart
                              ? `All ${availableStock} available units are already in your cart`
                              : `Add up to ${remainingStock} available`
                        }
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ml-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          requestedId === sp.id
                            ? 'bg-emerald-600 text-white'
                            : remainingStock <= 0
                              ? 'bg-slate-100 text-slate-400 border border-slate-200'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        {requestedId === sp.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Added to Cart</span>
                          </>
                        ) : isOutOfStock ? (
                          <span>Out of Stock</span>
                        ) : isMaxInCart ? (
                          <span>Max in Cart</span>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Choose a quantity and click Add to Cart — open View Cart when ready to checkout</span>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">{filteredSpares.length} components listed</span>
            {onOpenCart && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Open Cart ({cart.length}) →
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};