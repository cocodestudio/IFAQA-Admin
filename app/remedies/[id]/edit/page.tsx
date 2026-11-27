'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HerbalRemedy } from '@/lib/types';
import { getRemedyById } from '@/lib/data-service';
import { RemedyForm } from '@/components/forms/RemedyForm';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditRemedyPage() {
  const params = useParams();
  const id = params?.id as string;

  const [remedy, setRemedy] = useState<HerbalRemedy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRemedyById(id)
      .then((data) => {
        setRemedy(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load remedy:', err);
        setError(`Remedy "${id}" could not be found.`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-ifaqa-plum/15 border-t-ifaqa-plum animate-spin mx-auto" />
        <p className="text-sm text-[#5A6962]">Loading formulation record</p>
      </div>
    );
  }

  if (error || !remedy) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-900 space-y-4 max-w-xl mx-auto my-8">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-700" strokeWidth={1.5} />
          <h2 className="font-serif text-lg">Remedy not found</h2>
        </div>
        <p className="text-sm">{error || 'This remedy does not exist.'}</p>
        <Link
          href="/remedies"
          className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Back to remedies</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/remedies"
          className="w-9 h-9 rounded-lg border border-ifaqa-plum/15 bg-white flex items-center justify-center text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors"
          title="Back to remedies"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </Link>
        <div>
          <h2 className="font-serif font-normal text-2xl text-ifaqa-plum">
            {remedy.name}
          </h2>
          <p className="text-xs font-mono text-[#5A6962]">{remedy.sku}</p>
        </div>
      </div>

      <RemedyForm initialData={remedy} isEdit={true} />
    </div>
  );
}
