import React from 'react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  accentDot?: 'plum' | 'brass' | 'amber' | 'green';
}

export function StatCard({
  title,
  value,
  subtitle,
  href,
  linkLabel,
  accentDot,
}: StatCardProps) {
  const dotColors = {
    plum: 'bg-ifaqa-plum',
    brass: 'bg-ifaqa-mauve',
    amber: 'bg-amber-600',
    green: 'bg-[#165A45]',
  };

  return (
    <div className="p-5 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card flex flex-col justify-between min-h-[132px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-sans text-[#5A6962]">{title}</span>
        {accentDot && (
          <span className={`w-2 h-2 rounded-sm shrink-0 ${dotColors[accentDot]}`} />
        )}
      </div>

      <div className="my-2">
        <div className="font-serif font-normal text-3xl text-ifaqa-plum tabular-nums leading-none">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-ifaqa-plum/5 text-xs">
        <span className="text-[#5A6962] truncate">{subtitle || ''}</span>
        {href && linkLabel && (
          <Link
            href={href}
            className="text-ifaqa-plum font-medium hover:text-[#165A45] shrink-0 transition-colors"
          >
            {linkLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
