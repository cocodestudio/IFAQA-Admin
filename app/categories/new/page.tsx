'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AilmentCategory } from '@/lib/types';
import { createAilment, getAilmentsAsync } from '@/lib/data-service';
import { triggerNavigationProgress } from '@/lib/nav-progress';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { ArrowLeft } from 'lucide-react';

export default function NewCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [nextOrder, setNextOrder] = useState(7);

  useEffect(() => {
    getAilmentsAsync()
      .then((list) => {
        if (list.length > 0) {
          const maxOrder = Math.max(...list.map((c) => c.displayOrder || 0));
          setNextOrder(maxOrder + 1);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (
    data: Omit<AilmentCategory, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setSaving(true);
    try {
      await createAilment(data);
      triggerNavigationProgress('/categories');
      router.push('/categories');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/categories"
          className="w-9 h-9 rounded-lg border border-ifaqa-plum/15 bg-white flex items-center justify-center text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors shrink-0"
          title="Back to categories"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.6} />
        </Link>
        <div>
          <h2 className="font-serif font-normal text-2xl text-ifaqa-plum">
            Add health category
          </h2>
          <p className="text-xs text-[#5A6962]">
            Create a category and upload cover artwork for homepage gradient cards
          </p>
        </div>
      </div>

      <CategoryForm
        mode="create"
        nextOrder={nextOrder}
        saving={saving}
        onSubmit={handleCreate}
      />
    </div>
  );
}
