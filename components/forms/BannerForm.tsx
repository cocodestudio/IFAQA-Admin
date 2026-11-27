'use client';

import React, { useState } from 'react';
import { PromotionalBanner, BannerGradient, BannerPlacement, BannerTextAlignment } from '@/lib/types';
import { uploadMedia } from '@/lib/storage-service';
import { FormInput, FormSelect } from '../ui/FormInput';
import { AlertCircle, Save, Upload, ArrowRight } from 'lucide-react';

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
  loading = false,
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
    ctaText: initialData?.ctaText || 'Explore remedies',
    ctaLink: initialData?.ctaLink || '/catalog',
    imageUrl: initialData?.imageUrl || '/images/hero-botanical.jpg',
    gradientOverlay: initialData?.gradientOverlay || 'mauve-reserve',
    textAlignment: initialData?.textAlignment || 'left',
    placement: initialData?.placement || 'hero',
    priorityOrder: initialData?.priorityOrder ?? 1,
    isActive: initialData?.isActive !== false,
    endDate: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadMedia(file, `banners/${Date.now()}_${file.name}`);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload banner artwork');
    } finally {
      setUploading(false);
    }
  };

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
      setError(err instanceof Error ? err.message : 'Failed to save banner');
    }
  };

  const alignClass =
    formData.textAlignment === 'center'
      ? 'items-center text-center'
      : formData.textAlignment === 'right'
      ? 'items-end text-right'
      : 'items-start text-left';

  const bgGradient =
    formData.gradientOverlay === 'steel-night'
      ? 'linear-gradient(145deg, rgba(14,59,45,0.92) 0%, rgba(6,24,17,0.88) 100%)'
      : formData.gradientOverlay === 'mauve-reserve'
      ? 'linear-gradient(135deg, rgba(22,90,69,0.9) 0%, rgba(11,45,34,0.88) 100%)'
      : 'linear-gradient(135deg, rgba(11,45,34,0.6) 0%, rgba(11,45,34,0.45) 100%)';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
      {/* Left: Form Editor */}
      <form
        onSubmit={handleSubmit}
        className="xl:col-span-7 p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-5"
      >
        {error && (
          <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" strokeWidth={1.6} />
            <span>{error}</span>
          </div>
        )}

        <FormInput
          label="Banner headline *"
          required
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          placeholder="Pure Unani and Ayurvedic herbal remedies"
        />

        <FormInput
          label="Subheadline"
          value={formData.subheadline}
          onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
          placeholder="Small-batch formulations prepared cleanly in Saharanpur"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Eyebrow badge text"
            value={formData.badgeText}
            onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
            placeholder="Seasonal harvest"
          />
          <FormSelect
            label="Placement on storefront"
            value={formData.placement}
            onChange={(e) =>
              setFormData({ ...formData, placement: e.target.value as BannerPlacement })
            }
          >
            <option value="hero">Homepage hero banner</option>
            <option value="announcement_bar">Top announcement bar</option>
            <option value="mid_page_feature">Mid-page feature strip</option>
          </FormSelect>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Button label"
            value={formData.ctaText}
            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
            placeholder="Shop products"
          />
          <FormInput
            label="Destination route"
            value={formData.ctaLink}
            onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
            placeholder="/catalog/muqawwi"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormSelect
            label="Color treatment"
            value={formData.gradientOverlay}
            onChange={(e) =>
              setFormData({ ...formData, gradientOverlay: e.target.value as BannerGradient })
            }
          >
            <option value="mauve-reserve">Botanical spruce (#165A45 → #0B2D22)</option>
            <option value="steel-night">Deep forest night (#0E3B2D → #061811)</option>
            <option value="none">Clean artwork only</option>
          </FormSelect>
          <FormSelect
            label="Text alignment"
            value={formData.textAlignment}
            onChange={(e) =>
              setFormData({ ...formData, textAlignment: e.target.value as BannerTextAlignment })
            }
          >
            <option value="left">Start aligned</option>
            <option value="center">Centered</option>
            <option value="right">End aligned</option>
          </FormSelect>
          <FormInput
            label="Display priority"
            type="number"
            min="0"
            className="font-mono tabular-nums"
            value={formData.priorityOrder}
            onChange={(e) =>
              setFormData({ ...formData, priorityOrder: parseInt(e.target.value, 10) || 0 })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <FormInput
            label="Banner image URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="/images/hero-botanical.jpg"
          />
          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-ifaqa-plum">Or upload artwork</span>
            <label className="h-[42px] px-3.5 rounded-lg border border-ifaqa-plum/15 bg-ifaqa-linen hover:bg-ifaqa-cashmere text-xs font-medium text-ifaqa-plum cursor-pointer flex items-center justify-center gap-2 transition-colors">
              <Upload className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
              <span>{uploading ? 'Uploading...' : 'Choose JPG, PNG or WebP'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <FormInput
          label="Campaign end date (optional)"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          helperText="Leave blank to keep active until hidden manually"
        />

        <label className="inline-flex items-center gap-2.5 cursor-pointer text-sm text-ifaqa-plum pt-1">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded accent-[#0B2D22]"
          />
          <span>Publish banner on storefront</span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ifaqa-plum/10">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-lg border border-ifaqa-plum/15 bg-white text-sm font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="h-10 px-6 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-sm font-medium hover:bg-[#165A45] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" strokeWidth={1.6} />
            <span>{loading ? 'Saving...' : 'Save banner'}</span>
          </button>
        </div>
      </form>

      {/* Right: Live Storefront Preview */}
      <div className="xl:col-span-5 xl:sticky xl:top-24 p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
        <div className="flex items-center justify-between border-b border-ifaqa-plum/10 pb-3">
          <div>
            <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
              Live storefront preview
            </h3>
            <p className="text-xs text-[#5A6962]">
              Target: {formData.placement.replace(/_/g, ' ')} • Priority #{formData.priorityOrder}
            </p>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${
              formData.isActive
                ? 'bg-[#EEF4F1] text-ifaqa-plum'
                : 'bg-ifaqa-linen text-[#5A6962]'
            }`}
          >
            {formData.isActive ? 'Published' : 'Draft'}
          </span>
        </div>

        <div className="relative rounded-xl overflow-hidden min-h-[260px] flex flex-col justify-center p-6 sm:p-8 border border-ifaqa-plum/10 bg-[#0B2D22]">
          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              alt="Banner artwork preview"
              className="absolute inset-0 w-full h-full object-cover opacity-55"
            />
          )}
          <div className="absolute inset-0" style={{ background: bgGradient }} />

          <div className={`relative z-10 flex flex-col gap-3 ${alignClass}`}>
            {formData.badgeText && (
              <span className="inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FAF5EC]/95 text-ifaqa-plum border border-ifaqa-sand">
                {formData.badgeText}
              </span>
            )}
            <h4 className="font-serif font-normal text-2xl sm:text-3xl text-ifaqa-linen leading-tight">
              {formData.headline || 'Banner headline preview'}
            </h4>
            {formData.subheadline && (
              <p className="text-xs sm:text-sm text-ifaqa-linen/85 max-w-md leading-relaxed">
                {formData.subheadline}
              </p>
            )}
            {formData.ctaText && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-ifaqa-mauve text-[#0F1714] text-xs font-medium">
                  <span>{formData.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
