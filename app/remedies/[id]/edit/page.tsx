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
      .then(data => {
        setRemedy(data);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to load remedy for edit:', err);
        setError(`NOT_FOUND: Remedy "${id}" does not exist in dispensary records.`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-[#3E3239] space-y-3">
        <div className="w-8 h-8 border-2 border-[#C7A9A3] border-t-[#3E3239] animate-spin mx-auto" />
        <p className="font-serif text-sm tracking-wider uppercase">Loading formulation spec...</p>
      </div>
    );
  }

  if (error || !remedy) {
    return (
      <div className="p-8 border border-red-300 bg-red-50 text-red-950 space-y-4 max-w-xl mx-auto my-12">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-700" />
          <h2 className="font-serif text-lg font-bold">Formulation Not Found</h2>
        </div>
        <p className="text-sm font-mono">{error || 'Remedy could not be located.'}</p>
        <Link
          href="/remedies"
          className="inline-flex items-center gap-2 px-4 py-2 border border-red-900 bg-red-900 text-red-50 text-xs font-serif uppercase tracking-wider hover:bg-red-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Remedies Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/remedies"
          className="p-2 border border-[#C7A9A3] text-[#3E3239] hover:bg-[#E8D2C4]/30 transition-colors"
          title="Return to Catalog"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="font-serif text-lg font-bold text-[#3E3239] uppercase tracking-wider">
            Edit Formulation: {remedy.name}
          </h2>
          <p className="text-xs text-[#6B5560]">
            Update posology, inventory stock levels, prices, and therapeutic indications.
          </p>
        </div>
      </div>

      <RemedyForm initialData={remedy} isEdit={true} />
    </div>
  );
}
