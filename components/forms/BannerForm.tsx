'use client';

import React, { useState } from 'react';
import { PromotionalBanner, BannerGradient, BannerPlacement, BannerTextAlignment } from '@/lib/types';
import { FormInput, FormSelect } from '../ui/FormInput';
import { AlertCircle, Save } from 'lucide-react';

interface BannerFormProps {
  initialData?: PromotionalBanner;
  onSubmit: (data: Partial<PromotionalBanner> & { endDate?: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function BannerForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}: BannerFormProps) {
  const [formData, setFormData] = useState<{
    headline: string;
    subheadline: string;
    badgeText: string;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
    gradientOverlay: BannerGradient;
    textAlignment: BannerTextAlignment;
    placement: BannerPlacement;
    priorityOrder: number;
    isActive: boolean;
    endDate: string;
  }>({
    headline: initialData?.headline || '',
    subheadline: initialData?.subheadline || '',
    badgeText: initialData?.badgeText || 'Classical Heritage',
    ctaText: initialData?.ctaText || 'Explore Remedies',
    ctaLink: initialData?.ctaLink || '/catalog',
    imageUrl: initialData?.imageUrl || '/banners/hero-desktop.jpg',
    gradientOverlay: initialData?.gradientOverlay || 'mauve-reserve',
    textAlignment: initialData?.textAlignment || 'left',
    placement: initialData?.placement || 'hero',
    priorityOrder: initialData?.priorityOrder ?? 1,
    isActive: initialData?.isActive !== false,
    endDate: ''
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.headline || formData.headline.trim() === '') {
      setError('BANNER_ERROR: Banner headline cannot be empty');
      return;
    }

    if (formData.priorityOrder < 0) {
      setError('BANNER_ERROR: priorityOrder must be non-negative number');
      return;
    }

    if (formData.endDate && new Date(formData.endDate).getTime() < Date.now()) {
      setError('BANNER_ERROR: Cannot schedule a promotional banner with an expired end-date in the past.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save banner';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 border-l-4 border-red-700 bg-red-50 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <FormInput
        label="Promotional Headline *"
        required
        value={formData.headline}
        onChange={e => setFormData({ ...formData, headline: e.target.value })}
        placeholder="e.g. Imperial Dawakhana Formulations"
      />

      <FormInput
        label="Subheadline / Teaser"
        value={formData.subheadline}
        onChange={e => setFormData({ ...formData, subheadline: e.target.value })}
        placeholder="e.g. Formulated with 24K Gold Calx & Wild Himalayan Saffron"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Architectural Badge Text"
          value={formData.badgeText}
          onChange={e => setFormData({ ...formData, badgeText: e.target.value })}
          placeholder="HERITAGE HARVEST 2026"
        />
        <FormSelect
          label="Placement Target"
          value={formData.placement}
          onChange={e => setFormData({ ...formData, placement: e.target.value as BannerPlacement })}
        >
          <option value="hero">Homepage Hero Banner</option>
          <option value="announcement_bar">Top Announcement Bar</option>
          <option value="mid_page_feature">Mid-Page Feature Banner</option>
        </FormSelect>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="CTA Button Text"
          value={formData.ctaText}
          onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
          placeholder="Explore Remedies"
        />
        <FormInput
          label="CTA Link / Route"
          value={formData.ctaLink}
          onChange={e => setFormData({ ...formData, ctaLink: e.target.value })}
          placeholder="/catalog/muqawwi"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormSelect
          label="Gradient Overlay"
          value={formData.gradientOverlay}
          onChange={e => setFormData({ ...formData, gradientOverlay: e.target.value as BannerGradient })}
        >
          <option value="mauve-reserve">Mauve Reserve (#B2949D to #6B5F6F)</option>
          <option value="steel-night">Steel Night (#88A2BF to #141318)</option>
          <option value="none">None (Clean Artwork)</option>
        </FormSelect>
        <FormSelect
          label="Text Alignment"
          value={formData.textAlignment}
          onChange={e => setFormData({ ...formData, textAlignment: e.target.value as BannerTextAlignment })}
        >
          <option value="left">Left Aligned</option>
          <option value="center">Centered</option>
          <option value="right">Right Aligned</option>
        </FormSelect>
        <FormInput
          label="Priority Sequence (0 = Top)"
          type="number"
          min="0"
          value={formData.priorityOrder}
          onChange={e => setFormData({ ...formData, priorityOrder: parseInt(e.target.value, 10) || 0 })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Background Image URL"
          value={formData.imageUrl}
          onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="/banners/hero-desktop.jpg"
        />
        <FormInput
          label="Campaign Expiry (Optional)"
          type="date"
          value={formData.endDate}
          onChange={e => setFormData({ ...formData, endDate: e.target.value })}
          helperText="Must not be in the past."
        />
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 accent-[#3E3239]"
          />
          <span className="text-xs font-serif uppercase tracking-wider text-[#3E3239] font-medium">
            Active in Storefront Display
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C7A9A3]/30">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-[#C7A9A3] text-xs font-serif uppercase tracking-wider text-[#3E3239] hover:bg-[#E8D2C4]/30 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#6B5560] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Banner'}</span>
        </button>
      </div>
    </form>
  );
}
