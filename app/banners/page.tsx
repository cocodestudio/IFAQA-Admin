'use client';

import React, { useState, useEffect } from 'react';
import { PromotionalBanner } from '@/lib/types';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBannersInStore
} from '@/lib/data-service';
import { DataTable } from '@/components/ui/DataTable';
import { NotchedBadge, RuledBadge } from '@/components/ui/ArchitecturalBadge';
import { Modal } from '@/components/ui/Modal';
import { BannerForm } from '@/components/forms/BannerForm';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon
} from 'lucide-react';

export default function BannersPage() {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionalBanner | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteCandidate, setDeleteCandidate] = useState<PromotionalBanner | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
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

  const handleToggle = async (banner: PromotionalBanner) => {
    try {
      const updated = await toggleBannerStatus(banner.id, !banner.isActive);
      setBanners(prev => prev.map(b => b.id === banner.id ? updated : b));
    } catch (err) {
      console.error('Failed to toggle banner status:', err);
    }
  };

  const handleMovePriority = async (banner: PromotionalBanner, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
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

  const handleFormSubmit = async (data: Partial<PromotionalBanner> & { endDate?: string }) => {
    setSaving(true);
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, data);
      } else {
        await createBanner(data);
      }
      setIsModalOpen(false);
      setEditingBanner(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteBanner(deleteCandidate.id);
      setDeleteCandidate(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete banner:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#3E3239] uppercase tracking-wider">
            Promotional & Hero Banners
          </h2>
          <p className="text-xs text-[#6B5560]">
            Control storefront announcements, hero campaigns, gradient overlays, and sequence priorities.
          </p>
        </div>
        <button
          onClick={() => { setEditingBanner(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#6B5560] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Banner</span>
        </button>
      </div>

      {/* Banners Data Table */}
      <DataTable
        data={banners}
        keyExtractor={b => b.id}
        emptyMessage={loading ? 'Loading promotional banners...' : 'No banners currently configured.'}
        columns={[
          {
            header: 'Sequence',
            accessor: (b) => {
              const idx = banners.findIndex(x => x.id === b.id);
              return (
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="font-bold text-[#3E3239]">#{b.priorityOrder}</span>
                  <div className="flex flex-col ml-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMovePriority(b, 'up')}
                      className="p-0.5 hover:text-[#3E3239] text-[#9E8189] disabled:opacity-20"
                      title="Move Priority Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === banners.length - 1}
                      onClick={() => handleMovePriority(b, 'down')}
                      className="p-0.5 hover:text-[#3E3239] text-[#9E8189] disabled:opacity-20"
                      title="Move Priority Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            }
          },
          {
            header: 'Campaign & Headline',
            accessor: b => (
              <div className="space-y-1">
                <div className="font-serif font-bold text-sm text-[#3E3239]">
                  {b.headline}
                </div>
                {b.subheadline && (
                  <p className="text-xs text-[#6B5560] line-clamp-1">
                    {b.subheadline}
                  </p>
                )}
                {b.badgeText && (
                  <div className="pt-0.5">
                    <NotchedBadge variant="sand">
                      {b.badgeText}
                    </NotchedBadge>
                  </div>
                )}
              </div>
            )
          },
          {
            header: 'Placement & Overlay',
            accessor: b => (
              <div className="space-y-1 text-xs">
                <RuledBadge accentColor="plum">
                  {b.placement}
                </RuledBadge>
                <div className="text-[11px] font-mono text-[#9E8189]">
                  Overlay: {b.gradientOverlay}
                </div>
              </div>
            )
          },
          {
            header: 'CTA Link',
            accessor: b => (
              <div className="text-xs font-mono">
                <div className="text-[#3E3239] font-medium">{b.ctaText}</div>
                <div className="text-[#9E8189] text-[11px] truncate max-w-[140px]">{b.ctaLink}</div>
              </div>
            )
          },
          {
            header: 'Status',
            accessor: b => (
              <button
                type="button"
                onClick={() => handleToggle(b)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-serif uppercase tracking-wider border transition-colors ${
                  b.isActive
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    : 'border-stone-400 bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
                title="Toggle Active Status"
              >
                {b.isActive ? <Eye className="w-3 h-3 text-emerald-700" /> : <EyeOff className="w-3 h-3 text-stone-500" />}
                <span>{b.isActive ? 'Active' : 'Hidden'}</span>
              </button>
            )
          },
          {
            header: 'Actions',
            className: 'text-right',
            accessor: b => (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingBanner(b); setIsModalOpen(true); }}
                  className="p-1.5 border border-[#C7A9A3] text-[#3E3239] hover:bg-[#E8D2C4]/40 transition-colors"
                  title="Edit Banner"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(b)}
                  className="p-1.5 border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                  title="Delete Banner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          }
        ]}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBanner(null); }}
        title={editingBanner ? `Edit Banner: ${editingBanner.headline}` : 'Configure New Promotional Banner'}
      >
        <BannerForm
          initialData={editingBanner || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsModalOpen(false); setEditingBanner(null); }}
          loading={saving}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirm Banner Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#3E3239]">
            Are you sure you wish to delete the banner <strong className="font-serif">&quot;{deleteCandidate?.headline}&quot;</strong>?
          </p>
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
              className="px-4 py-2 border border-red-800 bg-red-800 text-white text-xs font-serif uppercase tracking-wider hover:bg-red-900"
            >
              Confirm Deletion
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
