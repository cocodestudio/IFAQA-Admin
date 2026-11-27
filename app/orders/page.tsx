'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CustomerOrder } from '@/lib/types';
import { getOrders, normalizeSearchPhone } from '@/lib/data-service';
import { formatOrderAmount, formatShortDate, formatShortTime } from '@/lib/formatters';
import { usePagination } from '@/lib/use-pagination';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SearchField } from '@/components/ui/SearchField';
import { ChamferBadge, NotchedBadge } from '@/components/ui/ArchitecturalBadge';
import { Eye, RefreshCw } from 'lucide-react';

const STATUS_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All orders' },
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'dispensing', label: 'Dispensing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function OrdersListPage() {
  const [allOrders, setAllOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await getOrders({ forceRefresh });
      setAllOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const compactTerm = term.replace(/[-\s]/g, '');
    const normalizedPhone = term ? normalizeSearchPhone(term) : '';

    return allOrders.filter((o) => {
      if (activeTab !== 'all' && o.orderStatus !== activeTab) return false;
      if (!term) return true;

      const matchesPhone =
        (normalizedPhone && normalizeSearchPhone(o.customerPhone).includes(normalizedPhone)) ||
        (o.customerPhone || '').toLowerCase().includes(term);
      const matchesOrderNumber =
        (o.orderNumber || '').toLowerCase().includes(term) ||
        (o.orderNumber || '').toLowerCase().replace(/[-\s]/g, '').includes(compactTerm);
      const matchesOrderId = (o.id || '').toLowerCase().includes(term);
      const matchesName = (o.customerName || '').toLowerCase().includes(term);
      const matchesEmail = (o.customerEmail || '').toLowerCase().includes(term);
      const matchesCity = (o.shippingAddress?.city || '').toLowerCase().includes(term);
      const matchesTracking = (o.trackingNumber || '').toLowerCase().includes(term);
      const matchesItem = (o.items || []).some((i) => (i.name || '').toLowerCase().includes(term));

      return (
        matchesPhone ||
        matchesOrderNumber ||
        matchesOrderId ||
        matchesName ||
        matchesEmail ||
        matchesCity ||
        matchesTracking ||
        matchesItem
      );
    });
  }, [allOrders, activeTab, searchTerm]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems,
    resetPage,
  } = usePagination(filteredOrders, 10);

  useEffect(() => {
    resetPage();
  }, [activeTab, searchTerm, resetPage]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[#5A6962]">
          Review incoming orders, verify payment, assign couriers, and track dispatch
        </p>
        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={loading}
          className="h-9 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.6} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-ifaqa-cashmere border border-ifaqa-plum/10">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`h-8 px-3.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-ifaqa-plum text-ifaqa-linen'
                  : 'text-[#5A6962] hover:text-ifaqa-plum hover:bg-white/70'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="p-4 rounded-xl bg-white border border-ifaqa-plum/10 shadow-luxury-card">
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search order ID (e.g. IFA2026...), customer name, mobile, city, or remedy"
        />
      </div>

      {/* Table + Mobile Cards */}
      <DataTable
        data={paginatedItems}
        keyExtractor={(o) => o.id}
        emptyMessage={loading ? 'Loading orders...' : 'No matching orders found'}
        renderMobileCard={(o) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-mono text-xs font-medium tabular-nums text-ifaqa-plum">
                  {o.orderNumber}
                </div>
                <div className="text-sm font-medium text-ifaqa-plum mt-0.5">{o.customerName}</div>
                <div className="text-xs text-[#5A6962] font-mono tabular-nums">
                  {o.customerPhone} • {o.shippingAddress?.city}
                </div>
              </div>
              <ChamferBadge status={o.orderStatus}>{o.orderStatus}</ChamferBadge>
            </div>
            <div className="text-xs text-[#3E524A] line-clamp-2">
              {o.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-ifaqa-plum/10">
              <span className="font-mono text-sm font-medium tabular-nums text-ifaqa-plum">
                {formatOrderAmount(o.totalAmount, o.currency)}
              </span>
              <Link
                href={`/orders/${o.id}`}
                className="h-8 px-3 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Manage</span>
              </Link>
            </div>
          </div>
        )}
        columns={[
          {
            header: 'Order',
            accessor: (o) => (
              <div>
                <span className="font-mono font-medium text-xs tabular-nums text-ifaqa-plum">
                  {o.orderNumber}
                </span>
                <div className="text-xs text-[#5A6962] mt-0.5">
                  {formatShortDate(o.createdAt)} • {formatShortTime(o.createdAt)}
                </div>
              </div>
            ),
          },
          {
            header: 'Customer',
            accessor: (o) => (
              <div>
                <div className="font-medium text-sm text-ifaqa-plum">{o.customerName}</div>
                <div className="text-xs font-mono tabular-nums text-[#5A6962]">
                  {o.customerPhone}
                </div>
                <div className="text-xs text-[#5A6962]">
                  {o.shippingAddress?.city}, {o.shippingAddress?.country}
                </div>
              </div>
            ),
          },
          {
            header: 'Items',
            accessor: (o) => (
              <div className="text-xs text-[#3E524A] max-w-[240px]">
                <span className="font-medium text-ifaqa-plum">
                  {o.items?.length || 0} item(s):
                </span>{' '}
                {o.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
              </div>
            ),
          },
          {
            header: 'Payment',
            accessor: (o) => (
              <div className="space-y-1">
                <div className="text-xs text-ifaqa-plum capitalize">
                  {o.paymentMethod.replace(/_/g, ' ')}
                </div>
                <NotchedBadge variant={o.paymentStatus === 'verified' ? 'sand' : 'default'}>
                  {o.paymentStatus}
                </NotchedBadge>
              </div>
            ),
          },
          {
            header: 'Total',
            className: 'text-right',
            accessor: (o) => (
              <span className="font-mono font-medium text-sm tabular-nums text-ifaqa-plum">
                {formatOrderAmount(o.totalAmount, o.currency)}
              </span>
            ),
          },
          {
            header: 'Status',
            accessor: (o) => (
              <ChamferBadge status={o.orderStatus}>{o.orderStatus}</ChamferBadge>
            ),
          },
          {
            header: 'Action',
            className: 'text-right',
            accessor: (o) => (
              <Link
                href={`/orders/${o.id}`}
                className="h-8 px-3 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium hover:bg-[#165A45] transition-colors inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Manage</span>
              </Link>
            ),
          },
        ]}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        itemLabel="orders"
      />
    </div>
  );
}
