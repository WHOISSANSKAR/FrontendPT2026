import React, { useState } from 'react';
import { X, ShoppingCart, Trash2, Plus, Minus, CheckCircle2, ArrowRight } from 'lucide-react';
import { CartItem, CriticalSpareItem } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  spares?: CriticalSpareItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  spares = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const totalItems = cart.length;
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const getMaxStockForItem = (id: string): number => {
    const spare = spares.find(s => s.id === id);
    if (!spare) return Infinity;
    return Math.max(0, Number(spare.stock ?? spare.qty ?? 0));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onCheckout();
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white shadow-2xl border-l border-slate-200 w-full max-w-md h-full flex flex-col justify-between animate-in slide-in-from-right duration-200 text-slate-800">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center relative">
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Procurement Requisition Cart</h3>
              <p className="text-[11px] text-slate-500">
                {totalItems} {totalItems === 1 ? 'part' : 'parts'} ({totalUnits} {totalUnits === 1 ? 'unit' : 'units'}) queued
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Requisition Submitted!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Your procurement requisition ({totalItems} {totalItems === 1 ? 'part' : 'parts'}, {totalUnits} {totalUnits === 1 ? 'unit' : 'units'}) has been transmitted to enterprise supplier logistics.
              </p>
            </div>
          ) : cart.length > 0 ? (
            cart.map((item) => {
              const maxStock = getMaxStockForItem(item.id);
              const atMaxStock = Number.isFinite(maxStock) && item.quantity >= maxStock;

              return (
                <div 
                  key={item.id}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                    <div className="font-mono text-[11px] text-slate-500">{item.partNumber}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-blue-600">
                        ₹{item.unitPrice.toLocaleString('en-IN')} each
                      </span>
                      {Number.isFinite(maxStock) && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          (Stock: {maxStock})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Quantity control */}
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-semibold text-xs text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        disabled={atMaxStock}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title={atMaxStock ? `Max available stock (${maxStock}) reached` : 'Increase quantity'}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
              <ShoppingCart className="w-10 h-10 stroke-[1.5] mb-2 text-slate-300" />
              <span className="font-semibold text-slate-700">Your Requisition Cart is empty</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Add emergency spares from the Critical Spares panel or project tracking view.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && !submitted && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Estimated Total ({totalItems} {totalItems === 1 ? 'part' : 'parts'}, {totalUnits} {totalUnits === 1 ? 'unit' : 'units'})
              </span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Submit Enterprise Requisition</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};