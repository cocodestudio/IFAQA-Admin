'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AilmentCategory, HerbalRemedy } from '@/lib/types';
import { getAilmentsAsync, getRemedies, updateAilment } from '@/lib/data-service';
import { usePagination } from '@/lib/use-pagination';
import { Pagination } from '@/components/ui/Pagination';
import { SearchField } from '@/components/ui/SearchField';
import { RuledBadge } from '@/components/ui/ArchitecturalBadge';
import { Edit, Eye, EyeOff, Tags, RefreshCw } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AilmentCategory[]>([]);
  const [remedies, setRemedies] = useState<HerbalRemedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [cats, rems] = await Promise.all([
        getAilmentsAsync(forceRefresh),
        getRemedies({ forceRefresh }),
      ]);
      setCategories(cats);
      setRemedies(rems);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    return categories.filter((cat) => {
      if (statusFilter === 'active' && !cat.isActive) return false;
      if (statusFilter === 'hidden' && cat.isActive) return false;
      if (!q) return true;
      return (
        cat.name.toLowerCase().includes(q) ||
        (cat.urduName || '').includes(q) ||
        (cat.slug || '').toLowerCase().includes(q) ||
        (cat.tagline || '').toLowerCase().includes(q) ||
        (cat.description || '').toLowerCase().includes(q)
      );
    });
  }, [categories, search, statusFilter]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedItems,
    resetPage,
  } = usePagination(filteredCategories, 6);

  useEffect(() => {
    resetPage();
  }, [search, statusFilter, resetPage]);

  const handleToggleActive = async (cat: AilmentCategory) => {
    try {
      const updated = await updateAilment(cat.id, { isActive: !cat.isActive });
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    } catch (err) {
      console.error('Failed to toggle category visibility:', err);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[#5A6962]">
          Manage storefront health categories, bilingual labels, descriptions, and sort order
        </p>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-mono tabular-nums text-ifaqa-plum">
            {filteredCategories.length} categories shown
          </span>
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.6} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-white border border-ifaqa-plum/10 shadow-luxury-card">
        <div className="md:col-span-8">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search category title, Urdu label, slug, or description"
          />
        </div>
        <div className="md:col-span-4 flex items-center gap-1.5 p-1 rounded-lg bg-ifaqa-cashmere border border-ifaqa-plum/10">
          {(['all', 'active', 'hidden'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`flex-1 h-8 rounded-md text-xs font-medium capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-ifaqa-plum text-ifaqa-linen'
                  : 'text-[#5A6962] hover:text-ifaqa-plum'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[#5A6962]">Loading health categories...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl border border-ifaqa-plum/10 text-sm text-[#5A6962]">
          No categories match your search.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedItems.map((cat) => {
              const count = remedies.filter((r) => r.categoryId === cat.id).length || cat.remedyCount;
            return (
              <div
                key={cat.id}
                className="p-5 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card hover:border-ifaqa-plum/20 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-ifaqa-cashmere flex items-center justify-center text-ifaqa-plum shrink-0">
                        <Tags className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
                      </span>
                      <span className="font-mono text-xs text-[#5A6962] tabular-nums">
                        #{cat.displayOrder} • {cat.slug}
                      </span>
                    </div>
                    <RuledBadge accentColor={cat.isActive ? 'emerald' : 'plum'}>
                      {count} remedies
                    </RuledBadge>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg text-ifaqa-plum">{cat.name}</h3>
                    <div
                      dir="rtl"
                      className="font-urdu text-sm text-[#5A6962] mt-0.5 text-right"
                    >
                      {cat.urduName}
                    </div>
                  </div>

                  <p className="text-xs text-[#3E524A] line-clamp-2 leading-relaxed">
                    {cat.tagline || cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-ifaqa-plum/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(cat)}
                    className={`h-8 px-2.5 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                      cat.isActive
                        ? 'border-[#165A45]/25 bg-[#EEF4F1] text-ifaqa-plum'
                        : 'border-ifaqa-plum/15 bg-ifaqa-linen text-[#5A6962]'
                    }`}
                  >
                    {cat.isActive ? (
                      <Eye className="w-3.5 h-3.5 text-[#165A45]" strokeWidth={1.6} />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
                    )}
                    <span>{cat.isActive ? 'Active' : 'Hidden'}</span>
                  </button>

                  <Link
                    href={`/categories/${encodeURIComponent(cat.id)}/edit`}
                    className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" strokeWidth={1.6} />
                    <span>Edit</span>
                  </Link>
                </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 12, 24]}
            itemLabel="categories"
          />
        </>
      )}
    </div>
  );
}
