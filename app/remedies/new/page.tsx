'use client';

import React from 'react';
import Link from 'next/link';
import { RemedyForm } from '@/components/forms/RemedyForm';
import { ArrowLeft } from 'lucide-react';

export default function NewRemedyPage() {
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
            Add herbal remedy
          </h2>
          <p className="text-xs text-[#5A6962]">
            Configure nomenclature, ingredients, dosage, INR pricing, and photography
          </p>
        </div>
      </div>

      <RemedyForm isEdit={false} />
    </div>
  );
}
