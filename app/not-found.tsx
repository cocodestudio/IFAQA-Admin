import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 text-[#3E3239] space-y-6">
      <div className="w-16 h-16 border-2 border-[#C7A9A3] bg-[#E8D2C4]/30 flex items-center justify-center text-[#3E3239] mx-auto">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-xs uppercase tracking-widest text-[#6B5560]">
          Error 404 &bull; Unmapped Dispensary Route
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#3E3239]">
          Administrative Segment Not Found
        </h1>
        <p className="text-sm text-[#9E8189] max-w-md mx-auto">
          The requested administrative module, specimen record, or order pipeline route does not exist within the IFAQA Herbal Remedies Governance Portal.
        </p>
      </div>

      <div className="pt-4 flex items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#6B5560] transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dispensary Overview</span>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#C7A9A3] text-[#3E3239] text-xs font-serif uppercase tracking-wider hover:bg-[#E8D2C4]/30 transition-colors"
        >
          <span>Admin Login</span>
        </Link>
      </div>
    </div>
  );
}
