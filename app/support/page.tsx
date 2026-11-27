'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SupportTicketRecord } from '@/lib/types';
import { getSupportTickets } from '@/lib/data-service';
import { formatShortDate } from '@/lib/formatters';
import { usePagination } from '@/lib/use-pagination';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SearchField } from '@/components/ui/SearchField';
import { NotchedBadge, RuledBadge } from '@/components/ui/ArchitecturalBadge';
import { Eye, RefreshCw } from 'lucide-react';

export default function SupportTicketsPage() {
  const [allTickets, setAllTickets] = useState<SupportTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'In Review' | 'Resolved'>('all');
  const [search, setSearch] = useState('');

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await getSupportTickets({ forceRefresh });
      setAllTickets(data);
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTickets = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allTickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (t.id || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q) ||
        (t.message || '').toLowerCase().includes(q) ||
        (t.customerName || '').toLowerCase().includes(q) ||
        (t.customerPhone || '').toLowerCase().includes(q) ||
        (t.orderNumber || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
      );
    });
  }, [allTickets, statusFilter, search]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems,
    resetPage,
  } = usePagination(filteredTickets, 10);

  useEffect(() => {
    resetPage();
  }, [statusFilter, search, resetPage]);

  const statusColor = (status: string): 'amber' | 'sand' | 'emerald' => {
    if (status === 'Resolved') return 'emerald';
    if (status === 'In Review') return 'sand';
    return 'amber';
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[#5A6962]">
          Handle customer order questions, formulation guidance, and resolution responses
        </p>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-mono tabular-nums text-ifaqa-plum">
            {filteredTickets.length} ticket{filteredTickets.length === 1 ? '' : 's'}
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

      {/* Search & Status Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-white border border-ifaqa-plum/10 shadow-luxury-card">
        <div className="md:col-span-6">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search ticket ID, customer, order #, subject, or message"
          />
        </div>
        <div className="md:col-span-6 flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-ifaqa-cashmere border border-ifaqa-plum/10">
          {(['all', 'Open', 'In Review', 'Resolved'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`flex-1 min-w-[72px] h-8 px-2.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === tab
                  ? 'bg-ifaqa-plum text-ifaqa-linen'
                  : 'text-[#5A6962] hover:text-ifaqa-plum hover:bg-white/70'
              }`}
            >
              {tab === 'all' ? 'All' : tab}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        data={paginatedItems}
        keyExtractor={(t) => t.id}
        emptyMessage={loading ? 'Loading support requests...' : 'No support tickets found'}
        renderMobileCard={(t) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-mono text-xs text-[#5A6962]">{t.id}</div>
                <div className="text-sm font-medium text-ifaqa-plum mt-0.5">{t.subject}</div>
                <div className="text-xs text-[#5A6962]">{t.category}</div>
              </div>
              <RuledBadge accentColor={statusColor(t.status)}>{t.status}</RuledBadge>
            </div>
            <p className="text-xs text-[#3E524A] line-clamp-2">{t.message}</p>
            <div className="flex items-center justify-between pt-2 border-t border-ifaqa-plum/10">
              <span className="text-xs text-[#5A6962]">{formatShortDate(t.createdAt)}</span>
              <Link
                href={`/support/${encodeURIComponent(t.id)}`}
                className="h-8 px-3 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                <span>Manage</span>
              </Link>
            </div>
          </div>
        )}
        columns={[
          {
            header: 'Ticket',
            accessor: (t) => (
              <div>
                <span className="font-mono text-xs font-medium text-ifaqa-plum">{t.id}</span>
                <div className="text-xs text-[#5A6962] mt-0.5">{formatShortDate(t.createdAt)}</div>
              </div>
            ),
          },
          {
            header: 'Customer & topic',
            accessor: (t) => (
              <div>
                <div className="text-sm font-medium text-ifaqa-plum">
                  {t.customerName || t.customerPhone || 'Customer'}
                </div>
                <div className="text-xs text-[#5A6962]">{t.category}</div>
              </div>
            ),
          },
          {
            header: 'Subject & message',
            accessor: (t) => (
              <div className="max-w-md space-y-0.5">
                <div className="text-xs font-medium text-ifaqa-plum">{t.subject}</div>
                <p className="text-xs text-[#3E524A] line-clamp-2">{t.message}</p>
              </div>
            ),
          },
          {
            header: 'Order ref',
            accessor: (t) =>
              t.orderNumber ? (
                <NotchedBadge variant="sand">{t.orderNumber}</NotchedBadge>
              ) : (
                <span className="text-xs text-[#5A6962]">—</span>
              ),
          },
          {
            header: 'Status',
            accessor: (t) => (
              <RuledBadge accentColor={statusColor(t.status)}>{t.status}</RuledBadge>
            ),
          },
          {
            header: 'Action',
            className: 'text-right',
            accessor: (t) => (
              <Link
                href={`/support/${encodeURIComponent(t.id)}`}
                className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
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
        itemLabel="tickets"
      />
    </div>
  );
}
