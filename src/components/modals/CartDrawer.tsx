import React, { useEffect, useState } from 'react';
// changes done by vb
import { X, ShoppingCart, Trash2, Plus, Minus, CheckCircle2, ArrowRight, ArrowLeft, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { CartItem, CriticalSpareItem } from '../../types';
// changes done by vb
import { addDeliveryAddress, DeliveryAddress, getDeliveryAddresses } from '../../services/checkout.service';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  spares?: CriticalSpareItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (addressId: number) => Promise<void>; // changes done by vb
}

// changes done by vb
type Step = 'cart' | 'address' | 'done';

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  spares = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  // changes done by vb
  const [step, setStep] = useState<Step>('cart');
  const [doneSummary, setDoneSummary] = useState({ parts: 0, units: 0 });
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // changes done by vb
  useEffect(() => {
    if (isOpen) {
      setStep('cart');
      setError(null);
      setShowNewAddress(false);
      setNewAddress('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalItems = cart.length;
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const getMaxStockForItem = (id: string): number => {
    const spare = spares.find(s => s.id === id);
    if (!spare) return Infinity;
    return Math.max(0, Number(spare.stock ?? spare.qty ?? 0));
  };

  // changes done by vb
  const openAddressStep = async () => {
    setStep('address');
    setError(null);
    setAddressesLoading(true);
    try {
      const list = await getDeliveryAddresses();
      setAddresses(list);
      setShowNewAddress(list.length === 0);
      setSelectedAddressId(prev =>
        prev !== null && list.some(a => a.id === prev) ? prev : list[0]?.id ?? null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load saved addresses.');
    } finally {
      setAddressesLoading(false);
    }
  };

  // changes done by vb
  const handleSaveAddress = async () => {
    const text = newAddress.trim();
    if (text.length < 5) {
      setError('Please enter a complete delivery address.');
      return;
    }
    setSavingAddress(true);
    setError(null);
    try {
      const saved = await addDeliveryAddress(text);
      setAddresses(prev => [saved, ...prev.filter(a => a.id !== saved.id)]);
      setSelectedAddressId(saved.id);
      setNewAddress('');
      setShowNewAddress(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  // changes done by vb
  const handleSubmit = async () => {
    if (selectedAddressId === null) {
      setError('Please select or add a delivery address.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const summary = { parts: totalItems, units: totalUnits };
    try {
      await onCheckout(selectedAddressId);
      setDoneSummary(summary);
      setStep('done');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to place the order.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white shadow-2xl border-l border-slate-200 w-full max-w-md h-full flex flex-col justify-between animate-in slide-in-from-right duration-200 text-slate-800">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          {/* changes done by vb */}
          {step === 'address' ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => { setStep('cart'); setError(null); }}
                disabled={submitting}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                title="Back to cart"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Choose Delivery Location</h3>
                <p className="text-[11px] text-slate-500">Select a saved address or add a new one</p>
              </div>
            </div>
          ) : (
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
                {/* changes done by vb */}
                <p className="text-[11px] text-slate-500">
                  {step === 'done'
                    ? `${doneSummary.parts} ${doneSummary.parts === 1 ? 'part' : 'parts'} (${doneSummary.units} ${doneSummary.units === 1 ? 'unit' : 'units'}) submitted`
                    : `${totalItems} ${totalItems === 1 ? 'part' : 'parts'} (${totalUnits} ${totalUnits === 1 ? 'unit' : 'units'}) queued`}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {step === 'done' ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Requisition Submitted!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Your procurement requisition ({doneSummary.parts} {doneSummary.parts === 1 ? 'part' : 'parts'}, {doneSummary.units} {doneSummary.units === 1 ? 'unit' : 'units'}) has been placed. You can track it under Orders.
              </p>
            </div>
          ) : step === 'address' ? (
            // changes done by vb
            <>
              {addressesLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading saved addresses…
                </div>
              ) : (
                <>
                  {addresses.length > 0 && (
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Saved addresses
                    </div>
                  )}
                  {addresses.map(addr => {
                    const active = addr.id === selectedAddressId;
                    return (
                      <button
                        type="button"
                        key={addr.id}
                        onClick={() => { setSelectedAddressId(addr.id); setError(null); }}
                        className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 text-xs transition-colors cursor-pointer ${
                          active
                            ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                            : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            active ? 'border-blue-600' : 'border-slate-300'
                          }`}
                        >
                          {active && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                        </span>
                        <MapPin className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-slate-800 leading-snug">{addr.address}</span>
                      </button>
                    );
                  })}

                  {showNewAddress ? (
                    <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-white space-y-2">
                      <label className="text-[11px] font-semibold text-slate-600">New delivery address</label>
                      <textarea
                        value={newAddress}
                        onChange={e => setNewAddress(e.target.value)}
                        rows={3}
                        placeholder="Building / unit, street, area, city, PIN code"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        {addresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => { setShowNewAddress(false); setNewAddress(''); setError(null); }}
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          disabled={savingAddress || newAddress.trim().length < 5}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {savingAddress && <Loader2 className="w-3 h-3 animate-spin" />}
                          Save address
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setShowNewAddress(true); setError(null); }}
                      className="w-full p-3 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-blue-600 hover:bg-blue-50/50 hover:border-blue-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add new address
                    </button>
                  )}
                </>
              )}
            </>
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
        {cart.length > 0 && step !== 'done' && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
            {/* changes done by vb */}
            {error && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                <span>{error}</span>
              </div>
            )}

            {step === 'address' && selectedAddress && (
              <div className="flex items-start gap-2 text-[11px] text-slate-600">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-px text-blue-600" />
                <span className="line-clamp-2">Deliver to: {selectedAddress.address}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Estimated Total ({totalItems} {totalItems === 1 ? 'part' : 'parts'}, {totalUnits} {totalUnits === 1 ? 'unit' : 'units'})
              </span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={openAddressStep}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Submit Enterprise Requisition</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              // changes done by vb
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || addressesLoading || selectedAddressId === null}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Placing order…</span>
                  </>
                ) : (
                  <>
                    <span>Submit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
