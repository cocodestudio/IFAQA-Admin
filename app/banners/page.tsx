'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PromotionalBanner } from '@/lib/types';
import {
  getBanners,
  deleteBanner,
  toggleBannerStatus,
  reorderBannersInStore,
} from '@/lib/data-service';
import { usePagination } from '@/lib/use-pagination';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SearchField } from '@/components/ui/SearchField';
import { NotchedBadge, RuledBadge } from '@/components/ui/ArchitecturalBadge';
import { Modal } from '@/components/ui/Modal';
import { Plus, ArrowUp, ArrowDown, Edit, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function BannersPage() {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<PromotionalBanner | null>(null);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await getBanners(forceRefresh);
      setBanners(data);
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBanners = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return banners;
    return banners.filter(
      (b) =>
        (b.headline || '').toLowerCase().includes(q) ||
        (b.subheadline || '').toLowerCase().includes(q) ||
        (b.badgeText || '').toLowerCase().includes(q) ||
        (b.placement || '').toLowerCase().includes(q)
    );
  }, [banners, search]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems,
    resetPage,
  } = usePagination(filteredBanners, 10);

  useEffect(() => {
    resetPage();
  }, [search, resetPage]);

  const handleToggle = async (banner: PromotionalBanner) => {
    try {
      const updated = await toggleBannerStatus(banner.id, !banner.isActive);
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
    } catch (err) {
      console.error('Failed to toggle banner status:', err);
    }
  };

  const handleMovePriority = async (banner: PromotionalBanner, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex((b) => b.id === banner.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const targetPriority = banners[targetIndex].priorityOrder;
    try {
      const resequenced = await reorderBannersInStore(banner.id, targetPriority);
      setBanners(resequenced);
    } catch (err) {
      console.error('Failed to reorder banners:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteBanner(deleteCandidate.id);
      setDeleteCandidate(null);
      await loadData(true);
    } catch (err) {
      console.error('Failed to delete banner:', err);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-[#5A6962]">
          Manage homepage campaign banners, announcement bars, and display order
        </p>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="h-9 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.6} />
            <span>Refresh</span>
          </button>
          <Link
            href="/banners/new"
            className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium hover:bg-[#165A45] transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" strokeWidth={1.6} />
            <span>Create banner</span>
          </Link>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white border border-ifaqa-plum/10 shadow-luxury-card">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search headline, badge text, or placement (hero / mid-page / announcement)"
        />
      </div>

      <DataTable
        data={paginatedItems}
        keyExtractor={(b) => b.id}
        emptyMessage={loading ? 'Loading banners...' : 'No promotional banners configured'}
        renderMobileCard={(b) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-ifaqa-plum">{b.headline}</div>
                {b.subheadline && (
                  <p className="text-xs text-[#5A6962] mt-0.5 line-clamp-2">{b.subheadline}</p>
                )}
              </div>
              <span className="font-mono text-xs text-[#5A6962] shrink-0 tabular-nums">
                #{b.priorityOrder}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RuledBadge accentColor="plum">{b.placement}</RuledBadge>
              {b.badgeText && <NotchedBadge variant="sand">{b.badgeText}</NotchedBadge>}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-ifaqa-plum/10">
              <button
                type="button"
                onClick={() => handleToggle(b)}
                className={`h-8 px-2.5 rounded-md text-xs font-medium border inline-flex items-center gap-1.5 ${
                  b.isActive
                    ? 'border-[#165A45]/25 bg-[#EEF4F1] text-ifaqa-plum'
                    : 'border-ifaqa-plum/15 bg-ifaqa-linen text-[#5A6962]'
                }`}
              >
                {b.isActive ? (
                  <Eye className="w-3.5 h-3.5 text-[#165A45]" strokeWidth={1.6} />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
                )}
                <span>{b.isActive ? 'Active' : 'Hidden'}</span>
              </button>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/banners/${encodeURIComponent(b.id)}/edit`}
                  className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum inline-flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" strokeWidth={1.6} />
                  <span>Edit</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(b)}
                  className="w-8 h-8 rounded-lg border border-red-200 text-red-700 flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                </button>
              </div>
            </div>
          </div>
        )}
        columns={[
          {
            header: 'Order',
            accessor: (b) => {
              const idx = banners.findIndex((x) => x.id === b.id);
              return (
                <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
                  <span className="font-medium text-ifaqa-plum">#{b.priorityOrder}</span>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMovePriority(b, 'up')}
                      className="p-0.5 text-[#5A6962] hover:text-ifaqa-plum disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" strokeWidth={1.6} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === banners.length - 1}
                      onClick={() => handleMovePriority(b, 'down')}
                      className="p-0.5 text-[#5A6962] hover:text-ifaqa-plum disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" strokeWidth={1.6} />
                    </button>
                  </div>
                </div>
              );
            },
          },
          {
            header: 'Banner',
            accessor: (b) => (
              <div className="space-y-1 max-w-sm">
                <div className="text-sm font-medium text-ifaqa-plum">{b.headline}</div>
                {b.subheadline && (
                  <p className="text-xs text-[#5A6962] line-clamp-1">{b.subheadline}</p>
                )}
                {b.badgeText && <NotchedBadge variant="sand">{b.badgeText}</NotchedBadge>}
              </div>
            ),
          },
          {
            header: 'Placement',
            accessor: (b) => (
              <div className="space-y-1 text-xs">
                <RuledBadge accentColor="plum">{b.placement}</RuledBadge>
                <div className="text-xs text-[#5A6962]">{b.gradientOverlay}</div>
              </div>
            ),
          },
          {
            header: 'Action link',
            accessor: (b) => (
              <div className="text-xs">
                <div className="font-medium text-ifaqa-plum">{b.ctaText}</div>
                <div className="font-mono text-[#5A6962] truncate max-w-[160px]">{b.ctaLink}</div>
              </div>
            ),
          },
          {
            header: 'Visibility',
            accessor: (b) => (
              <button
                type="button"
                onClick={() => handleToggle(b)}
                className={`h-8 px-2.5 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                  b.isActive
                    ? 'border-[#165A45]/25 bg-[#EEF4F1] text-ifaqa-plum hover:bg-[#dfe9e4]'
                    : 'border-ifaqa-plum/15 bg-ifaqa-linen text-[#5A6962] hover:bg-ifaqa-cashmere'
                }`}
              >
                {b.isActive ? (
                  <Eye className="w-3.5 h-3.5 text-[#165A45]" strokeWidth={1.6} />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
                )}
                <span>{b.isActive ? 'Active' : 'Hidden'}</span>
              </button>
            ),
          },
          {
            header: 'Actions',
            className: 'text-right',
            accessor: (b) => (
              <div className="flex items-center justify-end gap-1.5">
                <Link
                  href={`/banners/${encodeURIComponent(b.id)}/edit`}
                  className="w-8 h-8 rounded-lg border border-ifaqa-plum/15 bg-white text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center justify-center"
                  title="Edit banner"
                >
                  <Edit className="w-3.5 h-3.5" strokeWidth={1.6} />
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(b)}
                  className="w-8 h-8 rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                  title="Delete banner"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                </button>
              </div>
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
        itemLabel="banners"
      />

      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Delete banner"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#3E524A]">
            Are you sure you want to delete{' '}
            <strong className="font-medium text-ifaqa-plum">
              &ldquo;{deleteCandidate?.headline}&rdquo;
            </strong>
            ?
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ifaqa-plum/10">
            <button
              type="button"
              onClick={() => setDeleteCandidate(null)}
              className="h-9 px-4 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="h-9 px-4 rounded-lg bg-red-800 text-white text-xs font-medium hover:bg-red-900"
            >
              Delete banner
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
