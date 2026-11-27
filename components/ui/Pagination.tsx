'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FormSelect } from './FormInput';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

function getVisiblePages(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | 'ellipsis'> = [1];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) pages.push('ellipsis');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemLabel = 'records',
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-ifaqa-plum/10 shadow-luxury-card">
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5A6962]">
        <span className="font-mono tabular-nums text-ifaqa-plum">
          Showing {startIdx}–{endIdx} of {totalItems} {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-[#5A6962]">Per page</span>
            <div className="w-20">
              <FormSelect
                compact
                surface="linen"
                value={String(pageSize)}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                aria-label="Rows per page"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 px-2.5 rounded-lg text-xs font-medium border border-ifaqa-plum/15 bg-white text-ifaqa-plum hover:bg-ifaqa-cashmere disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {visiblePages.map((entry, idx) =>
            entry === 'ellipsis' ? (
              <span
                key={`el-${idx}`}
                className="px-1.5 text-xs font-mono text-[#5A6962] select-none"
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                aria-label={`Page ${entry}`}
                aria-current={currentPage === entry ? 'page' : undefined}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-mono font-medium border transition-colors tabular-nums ${
                  currentPage === entry
                    ? 'bg-ifaqa-plum text-ifaqa-linen border-ifaqa-plum'
                    : 'bg-white text-ifaqa-plum border-ifaqa-plum/15 hover:bg-ifaqa-cashmere'
                }`}
              >
                {entry}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 px-2.5 rounded-lg text-xs font-medium border border-ifaqa-plum/15 bg-white text-ifaqa-plum hover:bg-ifaqa-cashmere disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.6} />
          </button>
        </div>
      )}
    </div>
  );
}
