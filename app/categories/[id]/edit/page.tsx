'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AilmentCategory, HerbalRemedy } from '@/lib/types';
import { getAilmentById, getRemedies, updateAilment } from '@/lib/data-service';
import { triggerNavigationProgress } from '@/lib/nav-progress';
import { formatPriceINR } from '@/lib/formatters';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [category, setCategory] = useState<AilmentCategory | null>(null);
  const [assignedRemedies, setAssignedRemedies] = useState<HerbalRemedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getAilmentById(id), getRemedies({ categoryId: id })])
      .then(([cat, rems]) => {
        setCategory(cat);
        setAssignedRemedies(rems);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Category not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (
    data: Omit<AilmentCategory, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!category) return;
    setSaving(true);
    setError(null);
    try {
      await updateAilment(category.id, data);
      triggerNavigationProgress('/categories');
      router.push('/categories');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-ifaqa-plum/15 border-t-ifaqa-plum animate-spin mx-auto" />
        <p className="text-sm text-[#5A6962]">Loading category record</p>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-900 space-y-4 max-w-xl mx-auto my-8">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-700" strokeWidth={1.6} />
          <h2 className="font-serif text-lg">Category not found</h2>
        </div>
        <p className="text-sm">{error}</p>
        <Link
          href="/categories"
          className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
          <span>Back to categories</span>
        </Link>
      </div>
    );
  }

  if (!category) return null;

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
          <h2 className="font-serif font-normal text-2xl text-ifaqa-plum">{category.name}</h2>
          <p className="text-xs font-mono text-[#5A6962]">
            Slug: /catalog/{category.slug} • Priority #{category.displayOrder}
          </p>
        </div>
      </div>

      <CategoryForm
        mode="edit"
        initialData={category}
        saving={saving}
        onSubmit={handleSave}
        rightSidebarExtra={
          <div className="p-5 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-3">
            <div className="flex items-center justify-between border-b border-ifaqa-plum/10 pb-2.5">
              <h3 className="font-serif text-base text-ifaqa-plum">
                Assigned remedies ({assignedRemedies.length})
              </h3>
            </div>
            {assignedRemedies.length === 0 ? (
              <p className="text-xs text-[#5A6962]">No formulations assigned yet.</p>
            ) : (
              <div className="divide-y divide-ifaqa-plum/10 max-h-80 overflow-y-auto">
                {assignedRemedies.map((r) => (
                  <Link
                    key={r.id}
                    href={`/remedies/${r.id}/edit`}
                    className="py-2.5 flex items-center justify-between gap-2 hover:text-[#165A45] transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-ifaqa-plum truncate group-hover:underline">
                        {r.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#5A6962]">{r.sku}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs tabular-nums text-ifaqa-plum">
                      <span>{formatPriceINR(r.pricePKR)}</span>
                      <ExternalLink className="w-3 h-3 text-[#5A6962]" strokeWidth={1.6} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
