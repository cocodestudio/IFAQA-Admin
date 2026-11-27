'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CustomerProfile } from '@/lib/types';
import { getCustomers, normalizeSearchPhone } from '@/lib/data-service';
import { formatPriceINR, formatShortDate } from '@/lib/formatters';
import { usePagination } from '@/lib/use-pagination';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SearchField } from '@/components/ui/SearchField';
import { NotchedBadge } from '@/components/ui/ArchitecturalBadge';
import { Eye, RefreshCw } from 'lucide-react';

export default function CustomersDirectoryPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await getCustomers(forceRefresh);
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    const normQ = normalizeSearchPhone(q);

    return customers.filter((c) => {
      const matchesPhone =
        (normQ && normalizeSearchPhone(c.phoneNumber).includes(normQ)) ||
        (c.phoneNumber || '').toLowerCase().includes(q);
      return (
        matchesPhone ||
        c.fullName.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.savedAddresses.some(
          (a) =>
            (a.city || '').toLowerCase().includes(q) ||
            (a.stateProvince || '').toLowerCase().includes(q) ||
            (a.postalCode || '').toLowerCase().includes(q)
        )
      );
    });
  }, [customers, search]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems,
    resetPage,
  } = usePagination(filtered, 10);

  useEffect(() => {
    resetPage();
  }, [search, resetPage]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[#5A6962]">
          Registered accounts, repeat buyers, saved delivery addresses, and lifetime order totals
        </p>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-mono tabular-nums text-ifaqa-plum">
            {filtered.length} customer records
          </span>
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.6} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-xl bg-white border border-ifaqa-plum/10 shadow-luxury-card">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search customer name, mobile number, email, city, or pin code"
        />
      </div>

      <DataTable
        data={paginatedItems}
        keyExtractor={(c) => c.id}
        emptyMessage={loading ? 'Loading customers...' : 'No customer profiles found'}
        renderMobileCard={(c) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-ifaqa-plum">{c.fullName}</div>
                <div className="text-xs font-mono text-[#5A6962] tabular-nums">
                  {c.phoneNumber}
                </div>
              </div>
              <NotchedBadge variant={c.totalOrdersCount > 1 ? 'sand' : 'default'}>
                {c.totalOrdersCount} order{c.totalOrdersCount === 1 ? '' : 's'}
              </NotchedBadge>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-ifaqa-plum/10">
              <span className="font-mono text-sm font-medium tabular-nums text-ifaqa-plum">
                {formatPriceINR(c.lifetimeSpend)}
              </span>
              <Link
                href={`/customers/${encodeURIComponent(c.id)}`}
                className="h-8 px-3 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                <span>Inspect</span>
              </Link>
            </div>
          </div>
        )}
        columns={[
          {
            header: 'Customer',
            accessor: (c) => (
              <div>
                <div className="text-sm font-medium text-ifaqa-plum">{c.fullName}</div>
                <div className="text-xs text-[#5A6962]">{c.email || 'Phone account'}</div>
              </div>
            ),
          },
          {
            header: 'Phone',
            accessor: (c) => (
              <span className="font-mono text-xs tabular-nums text-ifaqa-plum">
                {c.phoneNumber}
              </span>
            ),
          },
          {
            header: 'Primary city',
            accessor: (c) => (
              <span className="text-xs text-[#3E524A]">
                {c.savedAddresses[0]
                  ? `${c.savedAddresses[0].city}, ${c.savedAddresses[0].stateProvince}`
                  : 'No saved address'}
              </span>
            ),
          },
          {
            header: 'Orders',
            accessor: (c) => (
              <NotchedBadge variant={c.totalOrdersCount > 1 ? 'sand' : 'default'}>
                {c.totalOrdersCount} order{c.totalOrdersCount === 1 ? '' : 's'}
              </NotchedBadge>
            ),
          },
          {
            header: 'Lifetime spend',
            className: 'text-right',
            accessor: (c) => (
              <span className="font-mono font-medium text-sm tabular-nums text-ifaqa-plum">
                {formatPriceINR(c.lifetimeSpend)}
              </span>
            ),
          },
          {
            header: 'Last active',
            accessor: (c) => (
              <span className="text-xs text-[#5A6962]">{formatShortDate(c.lastActiveAt)}</span>
            ),
          },
          {
            header: 'Action',
            className: 'text-right',
            accessor: (c) => (
              <Link
                href={`/customers/${encodeURIComponent(c.id)}`}
                className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
                <span>Inspect</span>
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
        itemLabel="customers"
      />
    </div>
  );
}
