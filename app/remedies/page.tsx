'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HerbalRemedy } from '@/lib/types';
import {
  getRemedies,
  getAilments,
  deleteRemedy,
  updateRemedy
} from '@/lib/data-service';
import { DataTable } from '@/components/ui/DataTable';
import { NotchedBadge, RuledBadge } from '@/components/ui/ArchitecturalBadge';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function RemediesListPage() {
  const [remedies, setRemedies] = useState<HerbalRemedy[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Deletion modal state
  const [deleteCandidate, setDeleteCandidate] = useState<HerbalRemedy | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const cats = getAilments();
      setCategories(cats);

      const data = await getRemedies({
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: search || undefined,
        stockFilter: stockFilter !== 'all' ? stockFilter : undefined
      });
      setRemedies(data);
    } catch (err) {
      console.error('Failed to load remedies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, stockFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleAvailability = async (remedy: HerbalRemedy) => {
    try {
      const updated = await updateRemedy(remedy.id, { isAvailable: !remedy.isAvailable });
      setRemedies(prev => prev.map(r => r.id === remedy.id ? updated : r));
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteRemedy(deleteCandidate.id);
      setDeleteCandidate(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#3E3239] uppercase tracking-wider">
            Dispensary Formulations & Catalog
          </h2>
          <p className="text-xs text-[#6B5560]">
            Manage classical Unani medicines, posology, inventory, and pricing.
          </p>
        </div>
        <Link
          href="/remedies/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#6B5560] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Compound New Remedy</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Search by formulation name, Urdu script, or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
            />
            <Search className="w-4 h-4 text-[#9E8189] absolute left-3 top-2.5" />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
            >
              <option value="all">All Classical Ailments</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
            >
              <option value="all">All Stock Statuses</option>
              <option value="low">Low Inventory (1-10 units)</option>
              <option value="out">Depleted / Out of Stock</option>
              <option value="inactive">Archived / Inactive</option>
            </select>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <DataTable
        data={remedies}
        keyExtractor={r => r.id}
        emptyMessage={loading ? 'Loading dispensary formulations...' : 'No matching remedies found.'}
        columns={[
          {
            header: 'Formulation Details',
            accessor: r => (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 border border-[#C7A9A3]/60 bg-[#E8D2C4]/20 flex-shrink-0 overflow-hidden">
                  <img
                    src={r.primaryImage || '/images/remedies/placeholder.jpg'}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm text-[#3E3239]">
                    {r.name}
                  </div>
                  <div className="text-xs font-mono text-[#6B5560] flex items-center gap-2">
                    <span>SKU: {r.sku}</span>
                    <span>&bull;</span>
                    <span dir="rtl" className="font-sans text-xs">{r.urduName}</span>
                  </div>
                </div>
              </div>
            )
          },
          {
            header: 'Ailment Category',
            accessor: r => (
              <NotchedBadge variant="default">
                {r.categoryName || r.categoryId}
              </NotchedBadge>
            )
          },
          {
            header: 'Form & Packaging',
            accessor: r => (
              <div className="text-xs">
                <span className="font-serif font-medium text-[#3E3239]">{r.form}</span>
                <div className="text-[#6B5560] font-mono text-[11px]">{r.packaging?.size}</div>
              </div>
            )
          },
          {
            header: 'Price',
            accessor: r => (
              <div className="text-xs font-mono">
                <div className="font-bold text-[#3E3239]">PKR {r.pricePKR.toLocaleString()}</div>
                <div className="text-[#9E8189] text-[11px]">USD ${r.priceUSD.toFixed(2)}</div>
              </div>
            )
          },
          {
            header: 'Inventory',
            accessor: r => (
              <RuledBadge accentColor={r.stockQuantity === 0 ? 'rose' : r.stockQuantity <= 10 ? 'amber' : 'emerald'}>
                {r.stockQuantity} units
              </RuledBadge>
            )
          },
          {
            header: 'Availability',
            accessor: r => (
              <button
                type="button"
                onClick={() => handleToggleAvailability(r)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-serif uppercase tracking-wider border transition-colors ${
                  r.isAvailable
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    : 'border-stone-400 bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
                title="Toggle Active Availability"
              >
                {r.isAvailable ? <Eye className="w-3 h-3 text-emerald-700" /> : <EyeOff className="w-3 h-3 text-stone-500" />}
                <span>{r.isAvailable ? 'Active' : 'Disabled'}</span>
              </button>
            )
          },
          {
            header: 'Actions',
            className: 'text-right',
            accessor: r => (
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/remedies/${r.id}/edit`}
                  className="p-1.5 border border-[#C7A9A3] text-[#3E3239] hover:bg-[#E8D2C4]/40 transition-colors"
                  title="Edit Formulation"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => { setDeleteCandidate(r); setDeleteError(null); }}
                  className="p-1.5 border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                  title="Delete Formulation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          }
        ]}
      />

      {/* Delete Confirmation Modal with Safety Lock Display */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Formulation Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#3E3239]">
            Are you sure you wish to delete <strong className="font-serif">{deleteCandidate?.name}</strong> (SKU: {deleteCandidate?.sku})?
          </p>

          {deleteError && (
            <div className="p-3 border-l-4 border-red-700 bg-red-50 text-red-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="p-3 border border-[#C7A9A3]/40 bg-[#E8D2C4]/20 text-xs text-[#6B5560]">
            <span className="font-bold text-[#3E3239]">Safety Lock:</span> Deletion is strictly blocked if any pending customer orders reference this remedy. Consider toggling availability to &quot;Disabled&quot; instead.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C7A9A3]/30">
            <button
              type="button"
              onClick={() => setDeleteCandidate(null)}
              className="px-4 py-2 border border-[#C7A9A3] text-xs font-serif uppercase tracking-wider text-[#3E3239] hover:bg-[#E8D2C4]/30"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="px-4 py-2 border border-red-800 bg-red-800 text-white text-xs font-serif uppercase tracking-wider hover:bg-red-900 disabled:opacity-50"
            >
              {deleting ? 'Verifying Lock...' : 'Confirm Deletion'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
