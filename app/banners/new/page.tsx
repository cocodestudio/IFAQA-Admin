'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PromotionalBanner } from '@/lib/types';
import { createBanner } from '@/lib/data-service';
import { triggerNavigationProgress } from '@/lib/nav-progress';
import { BannerForm } from '@/components/forms/BannerForm';
import { ArrowLeft } from 'lucide-react';

export default function NewBannerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: Partial<PromotionalBanner> & { endDate?: string }) => {
    setSaving(true);
    try {
      await createBanner(data);
      triggerNavigationProgress('/banners');
      router.push('/banners');
    } finally {
      setSaving(false);
    }
  };

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
            Create promotional banner
          </h2>
          <p className="text-xs text-[#5A6962]">
            Design a homepage campaign banner, announcement bar, or mid-page highlight
          </p>
        </div>
      </div>

      <BannerForm
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
