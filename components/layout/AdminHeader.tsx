'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';

export function AdminHeader() {
  const pathname = usePathname();
  const { session, logout } = useAdminAuth();

  const getPageTitle = () => {
    if (pathname === '/') return 'Dispensary Governance Overview';
    if (pathname === '/remedies') return 'Classical Herbal Formulations';
    if (pathname === '/remedies/new') return 'Compound New Formulation';
    if (pathname.includes('/remedies/') && pathname.includes('/edit')) return 'Edit Formulation Spec';
    if (pathname === '/banners') return 'Promotional Hero & Announcement Banners';
    if (pathname === '/orders') return 'Customer Order Fulfillment Pipeline';
    if (pathname.startsWith('/orders/')) return 'Dispensary Order Compounding Spec';
    return 'Administrative Portal';
  };

  return (
    <header className="h-16 px-6 border-b border-[#C7A9A3]/30 bg-[#F7EFE7] flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-lg font-semibold text-[#3E3239] tracking-wide">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Dispensary Health Indicator (Sharp border-l-2 RuledBadge style, ZERO PILLS) */}
        <span className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1 border-l-2 border-l-emerald-600 bg-emerald-50 text-xs font-mono text-emerald-900">
          <span className="inline-block w-2 h-2 bg-emerald-600 animate-pulse" />
          <span>DISPENSARY LIVE</span>
        </span>

        {/* Super Admin Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#C7A9A3]/40">
          <div className="w-8 h-8 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] flex items-center justify-center font-serif text-xs font-bold">
            HT
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-[#3E3239]">
              {session?.displayName || 'Chief Hakeem Tariq'}
            </span>
            <span className="text-[10px] font-mono text-[#6B5560] uppercase">
              Super Admin
            </span>
          </div>
          <button
            onClick={logout}
            className="ml-3 p-1.5 text-[#6B5560] hover:text-[#3E3239] hover:bg-[#C7A9A3]/20 transition-colors"
            title="Sign Out of Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
