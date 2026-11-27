'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FlaskConical,
  Image as ImageIcon,
  Package,
  Tags,
  MessageSquareHeart,
  Users,
  LifeBuoy,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { getDispensaryKPIs } from '@/lib/data-service';
import { useAdminAuth } from '@/lib/admin-auth';
import { DispensaryKPIs } from '@/lib/types';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const [kpis, setKpis] = useState<DispensaryKPIs>({
    totalRemedies: 31,
    lowStockRemedies: 0,
    activeBanners: 3,
    pendingOrders: 0,
    totalRevenuePKR: 0,
    totalRevenueUSD: 0,
    pendingReviews: 0,
    openTickets: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    let mounted = true;
    getDispensaryKPIs()
      .then((data) => {
        if (mounted) setKpis(data);
      })
      .catch(() => { });
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const navGroups = [
    {
      label: 'Operations',
      items: [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
        {
          label: 'Orders',
          href: '/orders',
          icon: Package,
          badge: kpis.pendingOrders > 0 ? kpis.pendingOrders : null,
        },
        {
          label: 'Customers',
          href: '/customers',
          icon: Users,
          badge: kpis.totalCustomers && kpis.totalCustomers > 0 ? kpis.totalCustomers : null,
        },
      ],
    },
    {
      label: 'Catalog & Storefront',
      items: [
        {
          label: 'Remedies',
          href: '/remedies',
          icon: FlaskConical,
          badge: kpis.totalRemedies,
        },
        { label: 'Categories', href: '/categories', icon: Tags, badge: 6 },
        {
          label: 'Banners',
          href: '/banners',
          icon: ImageIcon,
          badge: kpis.activeBanners,
        },
      ],
    },
    {
      label: 'Customer Care',
      items: [
        {
          label: 'Reviews',
          href: '/reviews',
          icon: MessageSquareHeart,
          badge: kpis.pendingReviews && kpis.pendingReviews > 0 ? kpis.pendingReviews : null,
        },
        {
          label: 'Support',
          href: '/support',
          icon: LifeBuoy,
          badge: kpis.openTickets && kpis.openTickets > 0 ? kpis.openTickets : null,
        },
      ],
    },
  ];

  const renderSidebarContent = (isCompact: boolean, isMobileDrawer: boolean) => (
    <div
      className={`flex flex-col h-full bg-ifaqa-cashmere border-e border-ifaqa-plum/10 text-ifaqa-plum transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] shrink-0 ${isCompact ? 'w-[76px]' : 'w-64'
        }`}
    >
      {/* Brand Block + Collapse Control */}
      <div
        className={`h-16 px-3.5 border-b border-ifaqa-plum/10 flex items-center ${isCompact ? 'justify-center' : 'justify-between'
          }`}
      >
        <Link
          href="/"
          onClick={onCloseMobile}
          className={`flex items-center gap-2.5 min-w-0 ${isCompact ? 'justify-center' : ''}`}
          title="IFAQA Admin Dashboard"
        >
          <div className="h-9 w-9 rounded-lg bg-white border border-ifaqa-plum/10 flex items-center justify-center shrink-0 overflow-hidden p-1">
            <img
              src="/images/logo.png"
              alt="IFAQA Herbal Remedies"
              className="h-6 w-auto object-contain"
            />
          </div>
          {!isCompact && (
            <div className="min-w-0">
              <span className="font-serif text-base font-medium text-ifaqa-plum block truncate leading-tight">
                IFAQA
              </span>
              <span className="text-[11px] text-[#5A6962] block truncate">
                Admin
              </span>
            </div>
          )}
        </Link>

        {isMobileDrawer && onCloseMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A6962] hover:bg-white hover:text-ifaqa-plum transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        ) : (
          !isCompact &&
          onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex w-8 h-8 rounded-lg items-center justify-center text-[#5A6962] hover:bg-white hover:text-ifaqa-plum transition-colors shrink-0"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )
        )}
      </div>

      {/* Expand trigger row when collapsed */}
      {isCompact && onToggleCollapse && !isMobileDrawer && (
        <div className="pt-3 px-3 flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-10 h-9 rounded-lg border border-ifaqa-plum/10 bg-white/80 hover:bg-white flex items-center justify-center text-[#5A6962] hover:text-ifaqa-plum transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Grouped Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group, gIdx) => (
          <div key={group.label} className={gIdx > 0 ? 'mt-5' : ''}>
            {!isCompact ? (
              <div className="px-3 mb-2 text-[11px] font-medium text-[#5A6962]">
                {group.label}
              </div>
            ) : (
              gIdx > 0 && <div className="my-3 mx-2 border-t border-ifaqa-plum/10" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={item.label}
                    className={`h-9 rounded-lg flex items-center text-sm transition-all duration-150 ${isCompact
                        ? 'justify-center px-0 relative'
                        : 'justify-between px-3'
                      } ${isActive
                        ? 'bg-ifaqa-plum text-ifaqa-linen font-medium shadow-luxury-card'
                        : 'text-[#3E524A] hover:bg-white/85 hover:text-ifaqa-plum'
                      }`}
                  >
                    <div className={`flex items-center ${isCompact ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                      <span className="w-5 h-5 flex items-center justify-center shrink-0">
                        <Icon
                          className={`w-[17px] h-[17px] transition-transform duration-150 ${isActive ? 'text-ifaqa-mauve' : 'text-[#5A6962]'
                            }`}
                          strokeWidth={1.6}
                        />
                      </span>
                      {!isCompact && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCompact && item.badge !== null && (
                      <span
                        className={`text-xs font-mono tabular-nums ${isActive ? 'text-ifaqa-linen/80' : 'text-[#5A6962]'
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isCompact && item.badge !== null && item.badge > 0 && (
                      <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-sm bg-ifaqa-mauve" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Premium Sign Out Footer */}
      <div className="p-3 border-t border-ifaqa-plum/10">
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          className={`w-full h-10 rounded-xl border border-ifaqa-plum/15 bg-white text-ifaqa-plum hover:bg-ifaqa-plum hover:text-ifaqa-linen hover:border-ifaqa-plum transition-colors flex items-center font-medium text-xs shadow-luxury-card group ${isCompact ? 'justify-center px-0' : 'justify-center gap-2.5 px-4'
            }`}
        >
          <LogOut
            className="w-4 h-4 text-[#5A6962] group-hover:text-ifaqa-mauve transition-colors shrink-0"
            strokeWidth={1.6}
          />
          {!isCompact && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block sticky top-0 h-screen shrink-0 print:hidden">
        {renderSidebarContent(collapsed, false)}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex print:hidden">
          <div
            className="fixed inset-0 bg-[#0B2D22]/40 transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full shadow-luxury-lifted">
            {renderSidebarContent(false, true)}
          </div>
        </div>
      )}
    </>
  );
}
