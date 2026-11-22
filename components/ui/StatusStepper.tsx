'use client';

import React from 'react';
import { OrderStatus } from '@/lib/types';
import { Check, AlertCircle } from 'lucide-react';
import { ChamferBadge } from './ArchitecturalBadge';

const STAGES: { key: OrderStatus; label: string }[] = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'dispensing', label: 'Dispensing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' }
];

interface StatusStepperProps {
  currentStatus: OrderStatus;
  onAdvanceStatus?: (nextStatus: OrderStatus) => void;
  onCancelOrder?: () => void;
  disabled?: boolean;
}

export function StatusStepper({
  currentStatus,
  onAdvanceStatus,
  onCancelOrder,
  disabled = false
}: StatusStepperProps) {
  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = STAGES.findIndex(s => s.key === currentStatus);

  const getNextStatus = (): OrderStatus | null => {
    if (isCancelled || currentIndex === -1 || currentIndex >= STAGES.length - 1) {
      return null;
    }
    return STAGES[currentIndex + 1].key;
  };

  const nextStatus = getNextStatus();

  return (
    <div className="p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-[#6B5560] uppercase tracking-wider">
            Dispensary Fulfillment State
          </span>
          <div className="mt-1 flex items-center gap-3">
            <ChamferBadge status={currentStatus}>
              {currentStatus}
            </ChamferBadge>
            {isCancelled && (
              <span className="text-xs font-mono text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Order Cancelled
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {nextStatus && onAdvanceStatus && (
            <button
              onClick={() => onAdvanceStatus(nextStatus)}
              disabled={disabled}
              className="px-4 py-2 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#6B5560] transition-colors disabled:opacity-50"
            >
              Advance to {nextStatus} &rarr;
            </button>
          )}
          {!isCancelled && currentStatus !== 'delivered' && onCancelOrder && (
            <button
              onClick={onCancelOrder}
              disabled={disabled}
              className="px-3 py-2 border border-stone-400 bg-stone-100 text-stone-700 text-xs font-serif uppercase tracking-wider hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* 5-Stage Stepper Track (Sharp geometric rects, ZERO PILLS) */}
      <div className="grid grid-cols-5 gap-2 pt-2">
        {STAGES.map((stage, idx) => {
          const isPassed = !isCancelled && currentIndex > idx;
          const isCurrent = !isCancelled && currentIndex === idx;

          let blockStyle = 'border border-[#C7A9A3]/40 bg-[#E8D2C4]/20 text-[#9E8189]';
          if (isPassed) {
            blockStyle = 'border border-emerald-700/60 bg-emerald-50 text-emerald-900 font-semibold';
          } else if (isCurrent) {
            blockStyle = 'border-2 border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] font-bold shadow-sm';
          } else if (isCancelled) {
            blockStyle = 'border border-stone-300 bg-stone-100 text-stone-400';
          }

          return (
            <div
              key={stage.key}
              className={`p-3 text-center transition-all ${blockStyle}`}
            >
              <div className="flex items-center justify-center gap-1 text-[11px] font-mono uppercase tracking-wider">
                {isPassed && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                <span>Stage {idx + 1}</span>
              </div>
              <div className="mt-1 text-xs font-serif truncate">
                {stage.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
