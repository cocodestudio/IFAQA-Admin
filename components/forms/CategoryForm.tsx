'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AilmentCategory } from '@/lib/types';
import { uploadMedia } from '@/lib/storage-service';
import { FormInput, FormTextarea } from '@/components/ui/FormInput';
import { RuledBadge } from '@/components/ui/ArchitecturalBadge';
import {
  AlertCircle,
  ArrowRight,
  ImagePlus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<AilmentCategory>;
  nextOrder?: number;
  onSubmit: (data: Omit<AilmentCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  saving?: boolean;
  rightSidebarExtra?: React.ReactNode;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  hazim: '/images/cat-hazim.webp',
  muqawwi: '/images/cat-muqawwi.webp',
  sual: '/images/cat-sual.webp',
  mafasil: '/images/cat-mafasil.webp',
  jild: '/images/cat-jild.webp',
  'quwwat-e-mudafiat': '/images/cat-quwwat-e-mudafiat.webp',
};
const DEFAULT_FALLBACK_PREVIEW = '/images/hero-botanical.jpg';

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function CategoryForm({
  mode,
  initialData,
  nextOrder = 7,
  onSubmit,
  saving = false,
  rightSidebarExtra,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');
  const [urduName, setUrduName] = useState(initialData?.urduName || '');
  const [romanName, setRomanName] = useState(initialData?.romanName || '');
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [displayOrder, setDisplayOrder] = useState<number>(
    initialData?.displayOrder ?? nextOrder
  );
  const [bannerImage, setBannerImage] = useState(initialData?.bannerImage || '');
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive !== false);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (mode === 'create' && !slugEdited) {
      setSlug(toSlug(val));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const folderSlug = toSlug(slug || name || 'general') || 'general';
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uploadedUrl = await uploadMedia(
        file,
        `categories/${folderSlug}/${Date.now()}_${safeName}`
      );
      setBannerImage(uploadedUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload category image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a category name.');
      return;
    }
    const finalSlug = toSlug(slug || name);
    if (!finalSlug) {
      setError('Please provide a valid URL slug.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        urduName: urduName.trim() || name.trim(),
        romanName: romanName.trim() || name.trim(),
        slug: finalSlug,
        tagline: tagline.trim(),
        description: description.trim() || tagline.trim(),
        iconIdentifier: initialData?.iconIdentifier || 'leaf',
        bannerImage: bannerImage.trim(),
        displayOrder: Number.isFinite(displayOrder) && displayOrder > 0 ? displayOrder : 1,
        remedyCount: initialData?.remedyCount ?? 0,
        isActive,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  const hasCustomPhoto = Boolean(
    bannerImage &&
      (bannerImage.startsWith('http') ||
        bannerImage.startsWith('data:') ||
        bannerImage.startsWith('/images/'))
  );
  const resolvedFallback =
    DEFAULT_CATEGORY_IMAGES[toSlug(slug || initialData?.slug || '')] || DEFAULT_FALLBACK_PREVIEW;
  const previewImageSrc = hasCustomPhoto ? bannerImage : resolvedFallback;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-8 p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-5"
      >
        <div className="border-b border-ifaqa-plum/10 pb-3">
          <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
            {mode === 'create'
              ? 'New health category & storefront artwork'
              : 'Category details & storefront artwork'}
          </h3>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" strokeWidth={1.6} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="English category name *"
            required
            placeholder="e.g. Heart & Cholesterol Wellness"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <FormInput
            label="Urdu title (RTL)"
            dir="rtl"
            placeholder="e.g. قلب اور صحت"
            className="font-urdu text-base"
            value={urduName}
            onChange={(e) => setUrduName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            label="URL slug *"
            required
            disabled={mode === 'edit'}
            placeholder="heart-wellness"
            className="font-mono text-xs"
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value.toLowerCase());
            }}
          />
          <FormInput
            label="Roman Urdu label"
            placeholder="Qalb wa Sehat"
            value={romanName}
            onChange={(e) => setRomanName(e.target.value)}
          />
          <FormInput
            label="Display order"
            type="number"
            min="1"
            className="font-mono tabular-nums"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
          />
        </div>

        <FormInput
          label="Category tagline"
          placeholder="Concise luxury summary shown on cards"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />

        <FormTextarea
          label="Therapeutic overview / card description"
          rows={3}
          placeholder="Classical botanical formulations prepared for..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Category Cover Photo Upload */}
        <div className="p-4 rounded-xl bg-ifaqa-linen border border-ifaqa-plum/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-semibold text-ifaqa-plum flex items-center gap-1.5">
                <ImagePlus className="w-4 h-4 text-[#165A45]" strokeWidth={1.6} />
                <span>Category cover photo (Home card background)</span>
              </h4>
              <p className="text-[11px] text-[#5A6962] mt-0.5">
                Upload JPG, PNG, or WebP (landscape botanical composition works best under text gradient).
              </p>
            </div>

            {bannerImage && (
              <button
                type="button"
                onClick={() => setBannerImage('')}
                className="text-xs text-red-700 hover:text-red-900 inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                <span>Remove photo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-7">
              <FormInput
                label="Image URL or uploaded asset path"
                placeholder="https://... or upload photo →"
                className="font-mono text-xs"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
              />
            </div>
            <div className="sm:col-span-5">
              <label className="h-[42px] px-3.5 rounded-lg border border-ifaqa-plum/20 bg-white hover:bg-ifaqa-cashmere text-xs font-medium text-ifaqa-plum cursor-pointer flex items-center justify-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-[#165A45]" strokeWidth={1.6} />
                <span>{uploading ? 'Uploading photo...' : 'Upload category photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-ifaqa-plum pt-1">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded accent-[#0B2D22]"
          />
          <span>Publish category across storefront homepage & navigation</span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ifaqa-plum/10">
          <Link
            href="/categories"
            className="h-10 px-4 rounded-lg border border-ifaqa-plum/15 bg-white text-sm font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere inline-flex items-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="h-10 px-6 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-sm font-medium hover:bg-[#165A45] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" strokeWidth={1.6} />
            <span>
              {saving
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Create category'
                  : 'Save category'}
            </span>
          </button>
        </div>
      </form>

      {/* Right Column: Live Gradient Card Preview + Optional Assigned Remedies */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-5 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5A6962]">
              Live homepage card preview
            </span>
            <RuledBadge accentColor={isActive ? 'emerald' : 'plum'}>
              {isActive ? 'Visible' : 'Hidden'}
            </RuledBadge>
          </div>

          <div className="relative h-56 rounded-xl overflow-hidden border border-ifaqa-plum/15 bg-[#0B2D22] flex flex-col justify-between p-5 text-[#FAF8F5]">
            <img
              src={previewImageSrc}
              alt={name || 'Category preview'}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(110deg, rgba(8,33,24,0.94) 0%, rgba(11,45,34,0.78) 54%, rgba(11,45,34,0.34) 100%)',
              }}
            />
            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded bg-[#C5A059] text-[#0B2D22] font-mono text-[11px] font-semibold">
                {initialData?.remedyCount ?? 0} remedies
              </span>
              <span className="font-mono text-[11px] text-[#FAF8F5]/75">
                #{displayOrder}
              </span>
            </div>
            <div className="relative z-10 space-y-1.5">
              <div className="font-serif text-lg text-[#FAF8F5] leading-snug line-clamp-1">
                {name || 'Category name'}
              </div>
              {urduName && (
                <div dir="rtl" className="font-urdu text-xs text-[#DFBA73] text-right line-clamp-1">
                  {urduName}
                </div>
              )}
              <p className="text-xs text-[#FAF8F5]/80 line-clamp-2 leading-relaxed">
                {description || tagline || 'Therapeutic summary appears here over the emerald gradient.'}
              </p>
              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-[#DFBA73] font-medium">
                <span>Explore formulations</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
              </div>
            </div>
          </div>
        </div>

        {rightSidebarExtra}
      </div>
    </div>
  );
}
