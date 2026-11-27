import React from 'react';

function ShimmerBar({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-ifaqa-cashmere ${className}`}>
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.45s_infinite]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.68) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 w-full select-none" aria-busy="true" aria-label="Loading dashboard">
      {/* Header action bar skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ShimmerBar className="h-4 w-72 rounded-md" />
        <div className="flex items-center gap-2.5">
          <ShimmerBar className="h-9 w-24 rounded-lg" />
          <ShimmerBar className="h-9 w-32 rounded-lg" />
          <ShimmerBar className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* 4 KPI Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="p-5 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card flex flex-col justify-between min-h-[132px]"
          >
            <div className="flex items-center justify-between">
              <ShimmerBar className="h-3.5 w-28 rounded" />
              <ShimmerBar className="h-2.5 w-2.5 rounded-sm" />
            </div>
            <ShimmerBar className="h-8 w-24 rounded-md my-2" />
            <div className="flex items-center justify-between pt-2 border-t border-ifaqa-plum/5">
              <ShimmerBar className="h-3 w-32 rounded" />
              <ShimmerBar className="h-3 w-12 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Needs Attention Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-2">
              <ShimmerBar className="h-5 w-48 rounded" />
              <ShimmerBar className="h-3 w-56 rounded" />
            </div>
            <ShimmerBar className="h-7 w-40 rounded-md" />
          </div>
          <div className="h-52 flex items-end gap-4 pt-6 px-2">
            {[42, 65, 38, 84, 58, 76, 92].map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end h-40">
                  <ShimmerBar
                    className="w-full rounded-t-md"
                  />
                </div>
                <ShimmerBar className="h-2.5 w-10 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
          <div className="space-y-1.5">
            <ShimmerBar className="h-5 w-36 rounded" />
            <ShimmerBar className="h-3 w-48 rounded" />
          </div>
          <div className="divide-y divide-ifaqa-plum/10">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShimmerBar className="w-8 h-8 rounded-lg" />
                  <ShimmerBar className="h-3.5 w-36 rounded" />
                </div>
                <ShimmerBar className="h-4 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Watch Skeleton */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
        <div className="flex items-center justify-between border-b border-ifaqa-plum/10 pb-3">
          <ShimmerBar className="h-5 w-44 rounded" />
          <ShimmerBar className="h-3.5 w-24 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((card) => (
            <div
              key={card}
              className="p-4 rounded-lg border border-ifaqa-plum/10 bg-ifaqa-linen flex items-center justify-between"
            >
              <div className="space-y-2">
                <ShimmerBar className="h-4 w-36 rounded" />
                <ShimmerBar className="h-3 w-20 rounded" />
              </div>
              <ShimmerBar className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table Skeleton */}
      <div className="rounded-xl border border-ifaqa-plum/10 bg-white shadow-luxury-card overflow-hidden">
        <div className="h-10 bg-ifaqa-cashmere/70 border-b border-ifaqa-plum/10 px-4 flex items-center gap-6">
          {[0, 1, 2, 3, 4].map((c) => (
            <ShimmerBar key={c} className="h-3 w-20 rounded" />
          ))}
        </div>
        <div className="divide-y divide-ifaqa-plum/10">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="px-4 py-4 flex items-center justify-between gap-4">
              <ShimmerBar className="h-4 w-28 rounded" />
              <ShimmerBar className="h-4 w-36 rounded" />
              <ShimmerBar className="h-4 w-44 rounded hidden md:block" />
              <ShimmerBar className="h-4 w-16 rounded" />
              <ShimmerBar className="h-7 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
