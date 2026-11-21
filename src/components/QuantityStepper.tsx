// changes done by vb: new shared quantity picker used by CriticalSparesModal and CriticalSparesView
import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export const MIN_ORDER_QTY = 1;
export const MAX_ORDER_QTY = 999;

export const clampOrderQty = (value: number) =>
  Math.min(MAX_ORDER_QTY, Math.max(MIN_ORDER_QTY, Math.floor(value) || MIN_ORDER_QTY));

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Called when Enter is pressed in the number field, with the committed quantity. */
  onSubmit?: (quantity: number) => void;
  /** Used for accessible labels, e.g. the part name. */
  itemLabel: string;
  size?: 'sm' | 'md';
}

/** Compact −/number/+ control used to pick an order quantity for a spare part. */
export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  onSubmit,
  itemLabel,
  size = 'sm',
}) => {
  // Text draft only while the user is typing (so the field can be cleared); otherwise show `value`.
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    const next = draft === null ? value : clampOrderQty(Number(draft));
    setDraft(null);
    if (next !== value) onChange(next);
    return next;
  };

  const step = (delta: number) => onChange(clampOrderQty(value + delta));

  const icon = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  const btnPad = size === 'md' ? 'p-1.5' : 'p-1';
  const inputCls = size === 'md' ? 'w-12 text-sm py-1' : 'w-10 text-xs py-1';

  return (
    <div className="inline-flex items-center rounded-md border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={value <= MIN_ORDER_QTY}
        aria-label={`Decrease quantity of ${itemLabel}`}
        className={`${btnPad} text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-l-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
      >
        <Minus className={icon} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={MIN_ORDER_QTY}
        max={MAX_ORDER_QTY}
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit?.(commit());
          }
        }}
        aria-label={`Quantity of ${itemLabel}`}
        className={`${inputCls} text-center font-semibold text-slate-800 bg-transparent border-x border-slate-200 focus:outline-none focus:bg-blue-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
      />
      <button
        type="button"
        onClick={() => step(1)}
        disabled={value >= MAX_ORDER_QTY}
        aria-label={`Increase quantity of ${itemLabel}`}
        className={`${btnPad} text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-r-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
      >
        <Plus className={icon} />
      </button>
    </div>
  );
};
