'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { HerbalRemedy } from '@/lib/types';
import {
  getRemedies,
  getAilments,
  deleteRemedy,
  updateRemedy,
} from '@/lib/data-service';
import { formatPriceINR } from '@/lib/formatters';
import { usePagination } from '@/lib/use-pagination';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SearchField } from '@/components/ui/SearchField';
import { NotchedBadge, RuledBadge } from '@/components/ui/ArchitecturalBadge';
import { Modal } from '@/components/ui/Modal';
import { FormSelect } from '@/components/ui/FormInput';
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Star,
  RefreshCw,
} from 'lucide-react';

export default function RemediesListPage() {
  const [allRemedies, setAllRemedies] = useState<HerbalRemedy[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  const [deleteCandidate, setDeleteCandidate] = useState<HerbalRemedy | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const storefrontBase =
    process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      setCategories(getAilments());
      const data = await getRemedies({ forceRefresh });
      setAllRemedies(data);
    } catch (err) {
      console.error('Failed to load remedies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRemedies = useMemo(() => {
    const term = search.toLowerCase().trim();
    return allRemedies.filter((r) => {
      if (selectedCategory !== 'all' && r.categoryId !== selectedCategory) return false;
      if (stockFilter === 'low' && !(r.stockQuantity > 0 && r.stockQuantity <= 10)) return false;
      if (stockFilter === 'out' && r.stockQuantity !== 0) return false;
      if (stockFilter === 'inactive' && r.isAvailable) return false;
      if (term) {
        const hit =
          r.name.toLowerCase().includes(term) ||
          (r.urduName || '').includes(term) ||
          (r.romanUrduName || '').toLowerCase().includes(term) ||
          (r.sku || '').toLowerCase().includes(term) ||
          (r.form || '').toLowerCase().includes(term) ||
          (r.categoryName || '').toLowerCase().includes(term);
        if (!hit) return false;
      }
      return true;
    });
  }, [allRemedies, search, selectedCategory, stockFilter]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems,
    resetPage,
  } = usePagination(filteredRemedies, 10);

  useEffect(() => {
    resetPage();
  }, [search, selectedCategory, stockFilter, resetPage]);

  const handleToggleAvailability = async (remedy: HerbalRemedy) => {
    try {
      const updated = await updateRemedy(remedy.id, { isAvailable: !remedy.isAvailable });
      setAllRemedies((prev) => prev.map((r) => (r.id === remedy.id ? updated : r)));
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleToggleFeatured = async (remedy: HerbalRemedy) => {
    try {
      const updated = await updateRemedy(remedy.id, { isFeatured: !remedy.isFeatured });
      setAllRemedies((prev) => prev.map((r) => (r.id === remedy.id ? updated : r)));
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteRemedy(deleteCandidate.id);
      setDeleteCandidate(null);
      await loadData(true);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Deletion failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-[#5A6962]">
          {filteredRemedies.length} of {allRemedies.length} botanical formulations shown
        </p>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="h-9 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            title="Sync latest remedies"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.6} />
            <span>Refresh</span>
          </button>
          <Link
            href="/remedies/new"
            className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium hover:bg-[#165A45] transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" strokeWidth={1.6} />
            <span>Add remedy</span>
          </Link>
        </div>
      </div>

      {/* Filters with Custom Luxury Dropdowns */}
      <div className="p-4 rounded-xl bg-white border border-ifaqa-plum/10 shadow-luxury-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search remedy name, Urdu, Roman Urdu, SKU, or form"
            />
          </div>

          <div className="md:col-span-3">
            <FormSelect
              compact
              surface="linen"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="md:col-span-3">
            <FormSelect
              compact
              surface="linen"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All stock levels</option>
              <option value="low">Low stock (1–10)</option>
              <option value="out">Out of stock</option>
              <option value="inactive">Hidden / Inactive</option>
            </FormSelect>
          </div>
        </div>
      </div>

      <DataTable
        data={paginatedItems}
        keyExtractor={(r) => r.id}
        emptyMessage={loading ? 'Loading remedies...' : 'No remedies match your filter'}
        renderMobileCard={(r) => (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-lg border border-ifaqa-plum/10 bg-ifaqa-cashmere overflow-hidden shrink-0">
                <img
                  src={r.primaryImage || '/images/remedies/placeholder.jpg'}
                  alt={r.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ifaqa-plum">{r.name}</div>
                <div className="text-xs font-mono text-[#5A6962] mt-0.5">
                  {r.sku} • {r.form} ({r.packaging?.size})
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-medium tabular-nums text-ifaqa-plum">
                    {formatPriceINR(r.pricePKR)}
                  </span>
                  <RuledBadge
                    accentColor={
                      r.stockQuantity === 0 ? 'rose' : r.stockQuantity <= 10 ? 'amber' : 'emerald'
                    }
                  >
                    {r.stockQuantity} in stock
                  </RuledBadge>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-ifaqa-plum/10">
              <button
                type="button"
                onClick={() => handleToggleAvailability(r)}
                className={`h-8 px-2.5 rounded-md text-xs font-medium border inline-flex items-center gap-1.5 ${
                  r.isAvailable
                    ? 'border-[#165A45]/25 bg-[#EEF4F1] text-ifaqa-plum'
                    : 'border-ifaqa-plum/15 bg-ifaqa-linen text-[#5A6962]'
                }`}
              >
                {r.isAvailable ? (
                  <Eye className="w-3.5 h-3.5 text-[#165A45]" strokeWidth={1.6} />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
                )}
                <span>{r.isAvailable ? 'Active' : 'Hidden'}</span>
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href={`/remedies/${r.id}/edit`}
                  className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum inline-flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" strokeWidth={1.6} />
                  <span>Edit</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteCandidate(r);
                    setDeleteError(null);
                  }}
                  className="w-8 h-8 rounded-lg border border-red-200 text-red-700 flex items-center justify-center hover:bg-red-50"
                  aria-label={`Delete ${r.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                </button>
              </div>
            </div>
          </div>
        )}
        columns={[
          {
            header: 'Formulation',
            accessor: (r) => (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg border border-ifaqa-plum/10 bg-ifaqa-cashmere shrink-0 overflow-hidden">
                  <img
                    src={r.primaryImage || '/images/remedies/placeholder.jpg'}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ifaqa-plum truncate max-w-[230px]">
                    {r.name}
                  </div>
                  <div className="text-xs text-[#5A6962] flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{r.sku}</span>
                    <span>•</span>
                    <span dir="rtl" className="font-urdu">
                      {r.urduName}
                    </span>
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: 'Category',
            accessor: (r) => (
              <NotchedBadge variant="default">
                {r.categoryName || r.categoryId}
              </NotchedBadge>
            ),
          },
          {
            header: 'Form',
            accessor: (r) => (
              <div className="text-xs">
                <div className="text-ifaqa-plum font-medium">{r.form}</div>
                <div className="text-[#5A6962]">{r.packaging?.size}</div>
              </div>
            ),
          },
          {
            header: 'Price',
            className: 'text-right',
            accessor: (r) => (
              <div className="font-mono tabular-nums text-xs">
                <div className="text-sm font-medium text-ifaqa-plum">
                  {formatPriceINR(r.pricePKR)}
                </div>
                <div className="text-[#5A6962]">${r.priceUSD.toFixed(2)}</div>
              </div>
            ),
          },
          {
            header: 'Stock',
            accessor: (r) => (
              <RuledBadge
                accentColor={
                  r.stockQuantity === 0 ? 'rose' : r.stockQuantity <= 10 ? 'amber' : 'emerald'
                }
              >
                {r.stockQuantity} units
              </RuledBadge>
            ),
          },
          {
            header: 'Featured',
            accessor: (r) => (
              <button
                type="button"
                onClick={() => handleToggleFeatured(r)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                  r.isFeatured
                    ? 'border-ifaqa-sand bg-[#FAF5EC] text-[#99752D]'
                    : 'border-ifaqa-plum/10 bg-white text-[#5A6962] hover:bg-ifaqa-cashmere'
                }`}
                title={r.isFeatured ? 'Featured on homepage' : 'Mark as featured'}
              >
                <Star
                  className="w-4 h-4"
                  strokeWidth={1.6}
                  fill={r.isFeatured ? 'currentColor' : 'none'}
                />
              </button>
            ),
          },
          {
            header: 'Visibility',
            accessor: (r) => (
              <button
                type="button"
                onClick={() => handleToggleAvailability(r)}
                className={`h-8 px-2.5 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                  r.isAvailable
                    ? 'border-[#165A45]/25 bg-[#EEF4F1] text-ifaqa-plum hover:bg-[#dfe9e4]'
                    : 'border-ifaqa-plum/15 bg-ifaqa-linen text-[#5A6962] hover:bg-ifaqa-cashmere'
                }`}
              >
                {r.isAvailable ? (
                  <Eye className="w-3.5 h-3.5 text-[#165A45]" strokeWidth={1.6} />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
                )}
                <span>{r.isAvailable ? 'Active' : 'Hidden'}</span>
              </button>
            ),
          },
          {
            header: 'Actions',
            className: 'text-right',
            accessor: (r) => (
              <div className="flex items-center justify-end gap-1.5">
                <a
                  href={`${storefrontBase}/remedy/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-ifaqa-plum/15 bg-white text-[#5A6962] hover:text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center justify-center"
                  title="View on storefront"
                >
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.6} />
                </a>
                <Link
                  href={`/remedies/${r.id}/edit`}
                  className="w-8 h-8 rounded-lg border border-ifaqa-plum/15 bg-white text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center justify-center"
                  title="Edit remedy"
                >
                  <Edit className="w-3.5 h-3.5" strokeWidth={1.6} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteCandidate(r);
                    setDeleteError(null);
                  }}
                  className="w-8 h-8 rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                  title="Delete remedy"
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
        itemLabel="remedies"
      />

      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Delete formulation"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#3E524A]">
            Are you sure you want to delete{' '}
            <strong className="font-medium text-ifaqa-plum">{deleteCandidate?.name}</strong> (
            <span className="font-mono text-xs">{deleteCandidate?.sku}</span>)?
          </p>

          {deleteError && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" strokeWidth={1.6} />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="p-3 rounded-lg border border-ifaqa-plum/10 bg-ifaqa-linen text-xs text-[#5A6962]">
            Remedies attached to active customer orders cannot be deleted. Hide availability instead to keep order history intact.
          </div>

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
              disabled={deleting}
              className="h-9 px-4 rounded-lg bg-red-800 text-white text-xs font-medium hover:bg-red-900 disabled:opacity-50"
            >
              {deleting ? 'Checking orders...' : 'Delete remedy'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
