'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronRight } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';

interface AdminHeaderProps {
  onOpenMobileNav?: () => void;
}

export function AdminHeader({ onOpenMobileNav }: AdminHeaderProps) {
  const pathname = usePathname();
  const { session, preferences } = useAdminAuth();

  const getPageTitle = () => {
    if (pathname === '/') return 'Dispensary overview';
    if (pathname === '/remedies') return 'Herbal remedies';
    if (pathname === '/remedies/new') return 'Add herbal remedy';
    if (pathname.includes('/remedies/') && pathname.includes('/edit')) return 'Edit remedy';
    if (pathname === '/categories') return 'Health categories';
    if (pathname.includes('/categories/') && pathname.includes('/edit')) return 'Edit category';
    if (pathname === '/banners') return 'Storefront banners';
    if (pathname === '/banners/new') return 'Create banner';
    if (pathname.includes('/banners/') && pathname.includes('/edit')) return 'Edit banner';
    if (pathname === '/orders') return 'Customer orders';
    if (pathname.startsWith('/orders/')) return 'Order fulfillment';
    if (pathname === '/reviews') return 'Product reviews';
    if (pathname === '/customers') return 'Customers';
    if (pathname.startsWith('/customers/')) return 'Customer profile';
    if (pathname === '/support') return 'Support tickets';
    if (pathname.startsWith('/support/')) return 'Support ticket';
    if (pathname === '/account') return 'My account';
    return 'Admin portal';
  };

  const initials = (session?.displayName || 'Chief Hakeem')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-ifaqa-plum/10 bg-ifaqa-linen/95 backdrop-blur-sm flex items-center justify-between sticky top-0 z-20 print:hidden">
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden w-9 h-9 rounded-lg border border-ifaqa-plum/15 bg-white flex items-center justify-center text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" strokeWidth={1.6} />
          </button>
        )}
        <h1 className="font-serif font-normal text-xl sm:text-2xl text-ifaqa-plum truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* Clickable Chief Hakeem Profile Chip -> /account */}
      <Link
        href="/account"
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-ifaqa-plum/15 hover:bg-white transition-colors shrink-0 group"
        title="Open my account"
      >
        <div className="w-8 h-8 rounded-lg bg-ifaqa-plum text-ifaqa-linen flex items-center justify-center font-serif text-xs font-medium shrink-0">
          {initials || 'HT'}
        </div>
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-medium text-ifaqa-plum group-hover:text-[#165A45] transition-colors">
            {session?.displayName || 'Chief Hakeem Tariq'}
          </span>
          <span className="text-[11px] text-[#5A6962]">
            {preferences.designation || 'Administrator'}
          </span>
        </div>
        <ChevronRight
          className="w-3.5 h-3.5 text-[#5A6962] group-hover:text-ifaqa-plum group-hover:translate-x-0.5 transition-all"
          strokeWidth={1.6}
        />
      </Link>
    </header>
  );
}
