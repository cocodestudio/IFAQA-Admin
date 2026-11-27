'use client';

import React from 'react';
import { OrderStatus } from '@/lib/types';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';
import { ChamferBadge } from './ArchitecturalBadge';

const STAGES: { key: OrderStatus; label: string }[] = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'dispensing', label: 'Dispensing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
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
  disabled = false,
}: StatusStepperProps) {
  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);

  const getNextStatus = (): OrderStatus | null => {
    if (isCancelled || currentIndex === -1 || currentIndex >= STAGES.length - 1) {
      return null;
    }
    return STAGES[currentIndex + 1].key;
  };

  const nextStatus = getNextStatus();

  return (
    <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-[#5A6962]">
            Fulfillment stage
          </span>
          <div className="mt-1.5 flex items-center gap-3">
            <ChamferBadge status={currentStatus}>{currentStatus}</ChamferBadge>
            {isCancelled && (
              <span className="text-xs font-medium text-red-700 inline-flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" strokeWidth={1.5} /> Order cancelled
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {nextStatus && onAdvanceStatus && (
            <button
              type="button"
              onClick={() => onAdvanceStatus(nextStatus)}
              disabled={disabled}
              className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium hover:bg-[#165A45] transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <span className="capitalize">Mark {nextStatus}</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
          {!isCancelled && currentStatus !== 'delivered' && onCancelOrder && (
            <button
              type="button"
              onClick={onCancelOrder}
              disabled={disabled}
              className="h-9 px-3.5 rounded-lg border border-ifaqa-plum/15 bg-white text-[#5A6962] text-xs font-medium hover:bg-red-50 hover:text-red-800 hover:border-red-200 transition-colors disabled:opacity-50"
            >
              Cancel order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STAGES.map((stage, idx) => {
          const isPassed = !isCancelled && currentIndex > idx;
          const isCurrent = !isCancelled && currentIndex === idx;

          let blockStyle = 'border border-ifaqa-plum/10 bg-ifaqa-linen text-[#5A6962]';
          if (isPassed) {
            blockStyle = 'border border-[#165A45]/25 bg-[#EEF4F1] text-ifaqa-plum font-medium';
          } else if (isCurrent) {
            blockStyle = 'border border-ifaqa-plum bg-ifaqa-plum text-ifaqa-linen font-medium';
          } else if (isCancelled) {
            blockStyle = 'border border-ifaqa-plum/10 bg-ifaqa-linen text-[#5A6962]/60';
          }

          return (
            <div key={stage.key} className={`p-3 rounded-lg transition-colors ${blockStyle}`}>
              <div className="flex items-center justify-between text-xs font-mono tabular-nums opacity-80">
                <span>0{idx + 1}</span>
                {isPassed && <Check className="w-3.5 h-3.5 text-[#165A45]" strokeWidth={1.5} />}
              </div>
              <div className="mt-1 text-sm truncate">{stage.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
