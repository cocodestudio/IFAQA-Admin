'use client';

import React from 'react';
import Link from 'next/link';
import { RemedyForm } from '@/components/forms/RemedyForm';
import { ArrowLeft } from 'lucide-react';

export default function NewRemedyPage() {
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
            Compound New Classical Remedy
          </h2>
          <p className="text-xs text-[#6B5560]">
            Enter classical Unani nomenclature, botanical compounding proportions, and posology.
          </p>
        </div>
      </div>

      <RemedyForm isEdit={false} />
    </div>
  );
}
