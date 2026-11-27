import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-12 space-y-5">
      <div className="w-12 h-12 rounded-xl border border-ifaqa-plum/15 bg-ifaqa-cashmere flex items-center justify-center text-ifaqa-plum">
        <Compass className="w-6 h-6 text-[#5A6962]" strokeWidth={1.5} />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="font-mono text-xs text-[#5A6962]">Error 404</span>
        <h1 className="font-serif font-normal text-3xl text-ifaqa-plum">
          Page not found
        </h1>
        <p className="text-sm text-[#5A6962]">
          The requested admin page or order record does not exist in this workspace.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="h-10 px-5 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-sm font-medium hover:bg-[#165A45] transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Back to dashboard</span>
        </Link>
        <Link
          href="/login"
          className="h-10 px-5 rounded-lg border border-ifaqa-plum/15 bg-white text-sm font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center"
        >
          <span>Sign in</span>
        </Link>
      </div>
    </div>
  );
}
