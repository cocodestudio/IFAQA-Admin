'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CustomerReview } from '@/lib/types';
import { getReviews, moderateReview, deleteReview } from '@/lib/data-service';
import { formatShortDate } from '@/lib/formatters';
import { usePagination } from '@/lib/use-pagination';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SearchField } from '@/components/ui/SearchField';
import { NotchedBadge } from '@/components/ui/ArchitecturalBadge';
import { Modal } from '@/components/ui/Modal';
import { Star, CheckCircle2, EyeOff, Trash2, RefreshCw } from 'lucide-react';

export default function ReviewsModerationPage() {
  const [allReviews, setAllReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CustomerReview | null>(null);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await getReviews({ forceRefresh });
      setAllReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReviews = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allReviews.filter((r) => {
      if (statusFilter === 'approved' && !r.approved) return false;
      if (statusFilter === 'pending' && r.approved) return false;
      if (!q) return true;
      return (
        (r.remedyName || '').toLowerCase().includes(q) ||
        (r.remedyId || '').toLowerCase().includes(q) ||
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.title || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q) ||
        String(r.rating) === q
      );
    });
  }, [allReviews, statusFilter, search]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems,
    resetPage,
  } = usePagination(filteredReviews, 10);

  useEffect(() => {
    resetPage();
  }, [statusFilter, search, resetPage]);

  const handleToggleApprove = async (rev: CustomerReview) => {
    try {
      await moderateReview(rev.id, !rev.approved);
      setAllReviews((prev) =>
        prev.map((r) => (r.id === rev.id ? { ...r, approved: !r.approved } : r))
      );
    } catch (err) {
      console.error('Failed to moderate review:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteReview(deleteTarget.id);
      setAllReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const approvedCount = allReviews.filter((r) => r.approved).length;
  const pendingCount = allReviews.filter((r) => !r.approved).length;
  const avgRating =
    allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-[#5A6962]">
          Approve, hide, or remove customer reviews posted on product pages
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-ifaqa-plum">
          <span>Avg {avgRating} / 5.0</span>
          <span>•</span>
          <span>{approvedCount} published</span>
          <span>•</span>
          <span>{pendingCount} pending</span>
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-sans font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.6} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-white border border-ifaqa-plum/10 shadow-luxury-card">
        <div className="md:col-span-7">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search remedy name, customer name, review headline, or comment"
          />
        </div>

        <div className="md:col-span-5 flex items-center gap-1.5 p-1 rounded-lg bg-ifaqa-cashmere border border-ifaqa-plum/10">
          {(['all', 'pending', 'approved'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`flex-1 h-8 rounded-md text-xs font-medium capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-ifaqa-plum text-ifaqa-linen'
                  : 'text-[#5A6962] hover:text-ifaqa-plum'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <DataTable
        data={paginatedItems}
        keyExtractor={(r) => r.id}
        emptyMessage={loading ? 'Loading customer reviews...' : 'No reviews matching your filter'}
        renderMobileCard={(r) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-ifaqa-plum">
                  {r.remedyName || r.remedyId}
                </div>
                <div className="text-xs text-[#5A6962]">
                  {r.customerName} • {formatShortDate(r.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-ifaqa-mauve shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    strokeWidth={1.5}
                    fill={i < r.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-ifaqa-plum">{r.title}</div>
              <p className="text-xs text-[#3E524A] mt-0.5">{r.comment}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-ifaqa-plum/10">
              <button
                type="button"
                onClick={() => handleToggleApprove(r)}
                className={`h-8 px-3 rounded-lg text-xs font-medium border ${
                  r.approved
                    ? 'border-[#165A45]/25 bg-[#EEF4F1] text-ifaqa-plum'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                {r.approved ? 'Published' : 'Approve now'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(r)}
                className="w-8 h-8 rounded-lg border border-red-200 text-red-700 flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
        columns={[
          {
            header: 'Product',
            accessor: (r) => (
              <div>
                <div className="text-sm font-medium text-ifaqa-plum">
                  {r.remedyName || r.remedyId}
                </div>
                <div className="text-xs text-[#5A6962] mt-0.5">{formatShortDate(r.createdAt)}</div>
              </div>
            ),
          },
          {
            header: 'Customer',
            accessor: (r) => (
              <div className="space-y-1">
                <div className="text-sm text-ifaqa-plum font-medium">{r.customerName}</div>
                {r.verifiedPurchase && (
                  <NotchedBadge variant="sand">Verified buyer</NotchedBadge>
                )}
              </div>
            ),
          },
          {
            header: 'Rating',
            accessor: (r) => (
              <div className="flex items-center gap-0.5 text-ifaqa-mauve">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    strokeWidth={1.5}
                    fill={i < r.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            ),
          },
          {
            header: 'Review',
            accessor: (r) => (
              <div className="max-w-sm space-y-0.5">
                <div className="text-xs font-medium text-ifaqa-plum">{r.title}</div>
                <p className="text-xs text-[#3E524A] line-clamp-2">{r.comment}</p>
              </div>
            ),
          },
          {
            header: 'Status',
            accessor: (r) => (
              <button
                type="button"
                onClick={() => handleToggleApprove(r)}
                className={`h-8 px-2.5 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                  r.approved
                    ? 'border-[#165A45]/25 bg-[#EEF4F1] text-ifaqa-plum hover:bg-[#dfe9e4]'
                    : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                {r.approved ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#165A45]" strokeWidth={1.5} />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-amber-700" strokeWidth={1.5} />
                )}
                <span>{r.approved ? 'Approved' : 'Pending'}</span>
              </button>
            ),
          },
          {
            header: 'Actions',
            className: 'text-right',
            accessor: (r) => (
              <button
                type="button"
                onClick={() => setDeleteTarget(r)}
                className="w-8 h-8 rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                title="Delete review"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
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
        itemLabel="reviews"
      />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete customer review"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#3E524A]">
            Permanently remove the review by{' '}
            <strong className="font-medium text-ifaqa-plum">{deleteTarget?.customerName}</strong>?
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ifaqa-plum/10">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="h-9 px-4 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-9 px-4 rounded-lg bg-red-800 text-white text-xs font-medium hover:bg-red-900"
            >
              Delete review
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
