'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FlaskConical, Image as ImageIcon, Package, Shield } from 'lucide-react';
import { getDispensaryKPIs } from '@/lib/data-service';
import { DispensaryKPIs } from '@/lib/types';

export function AdminSidebar() {
  const pathname = usePathname();
  const [kpis, setKpis] = useState<DispensaryKPIs>({
    totalRemedies: 12,
    lowStockRemedies: 0,
    activeBanners: 3,
    pendingOrders: 2,
    totalRevenuePKR: 0,
    totalRevenueUSD: 0
  });

  useEffect(() => {
    let mounted = true;
    getDispensaryKPIs()
      .then(data => {
        if (mounted) setKpis(data);
      })
      .catch(err => {
        console.warn('Sidebar metric counters degradation fallback:', err);
      });
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null
    },
    {
      label: 'Remedies',
      href: '/remedies',
      icon: FlaskConical,
      badge: kpis.totalRemedies
    },
    {
      label: 'Banners',
      href: '/banners',
      icon: ImageIcon,
      badge: kpis.activeBanners
    },
    {
      label: 'Orders',
      href: '/orders',
      icon: Package,
      badge: kpis.pendingOrders
    }
  ];

  return (
    <aside className="w-64 bg-[#3E3239] text-[#F7EFE7] flex flex-col flex-shrink-0 min-h-screen border-r border-[#6B5560]/40">
      {/* Brand Header */}
      <div className="flex flex-col items-center px-6 py-6 border-b border-[#6B5560]/40 bg-[#3E3239]">
        <Link href="/" className="flex flex-col items-center group">
          <div className="relative w-36 h-16 flex items-center justify-center">
            {/* Master high-res transparent logo */}
            <img
              src="/images/logo.png"
              alt="IFAQA Herbal Remedies"
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            />
          </div>
          <span className="mt-2 font-serif text-sm tracking-[0.2em] text-[#F7EFE7] uppercase font-bold text-center">
            IFAQA REMEDIES
          </span>
          <span className="font-mono text-[10px] tracking-widest text-[#C7A9A3] uppercase mt-0.5">
            Dispensary Governance
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#6B5560]/50 text-[#F7EFE7] border-l-2 border-l-[#C7A9A3]'
                  : 'text-[#C7A9A3] hover:text-[#F7EFE7] hover:bg-[#6B5560]/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C7A9A3]' : 'text-[#9E8189]'}`} />
                <span className="tracking-wide">{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className="px-2 py-0.5 text-[11px] font-mono border border-[#C7A9A3]/40 bg-[#3E3239] text-[#C7A9A3]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Dispensary Security Clearance Footer */}
      <div className="p-4 border-t border-[#6B5560]/40 bg-[#3E3239]/80">
        <div className="flex items-center gap-2 text-xs text-[#C7A9A3]">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono tracking-wider uppercase text-[10px]">Dawakhana Certified</span>
        </div>
        <p className="mt-1 text-[11px] text-[#9E8189]">
          Port 3001 Admin Governance
        </p>
      </div>
    </aside>
  );
}
