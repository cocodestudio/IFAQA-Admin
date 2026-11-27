'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PromotionalBanner } from '@/lib/types';
import { getBannerById, updateBanner } from '@/lib/data-service';
import { triggerNavigationProgress } from '@/lib/nav-progress';
import { BannerForm } from '@/components/forms/BannerForm';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditBannerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [banner, setBanner] = useState<PromotionalBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBannerById(id)
      .then((data) => {
        setBanner(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Banner not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: Partial<PromotionalBanner> & { endDate?: string }) => {
    if (!banner) return;
    setSaving(true);
    try {
      await updateBanner(banner.id, data);
      triggerNavigationProgress('/banners');
      router.push('/banners');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-ifaqa-plum/15 border-t-ifaqa-plum animate-spin mx-auto" />
        <p className="text-sm text-[#5A6962]">Loading banner configuration</p>
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-900 space-y-4 max-w-xl mx-auto my-8">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-700" strokeWidth={1.6} />
          <h2 className="font-serif text-lg">Banner not found</h2>
        </div>
        <p className="text-sm">{error}</p>
        <Link
          href="/banners"
          className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
          <span>Back to banners</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/banners"
          className="w-9 h-9 rounded-lg border border-ifaqa-plum/15 bg-white flex items-center justify-center text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors shrink-0"
          title="Back to banners"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.6} />
        </Link>
        <div>
          <h2 className="font-serif font-normal text-2xl text-ifaqa-plum">
            Edit banner: {banner.headline}
          </h2>
          <p className="text-xs font-mono text-[#5A6962]">
            ID: {banner.id} • Priority #{banner.priorityOrder}
          </p>
        </div>
      </div>

      <BannerForm
        initialData={banner}
        onSubmit={handleSubmit}
        onCancel={() => {
          triggerNavigationProgress('/banners');
          router.push('/banners');
        }}
        loading={saving}
      />
    </div>
  );
}
