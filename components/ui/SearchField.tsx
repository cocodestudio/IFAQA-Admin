'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  className?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search...',
  onSubmit,
  className = '',
}: SearchFieldProps) {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className={`relative w-full ${className}`}>
      <Search
        className="w-4 h-4 text-[#5A6962] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        strokeWidth={1.6}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 rounded-lg text-sm bg-ifaqa-linen border border-ifaqa-plum/15 text-ifaqa-plum placeholder:text-[#5A6962]/70 focus:outline-none focus:bg-white focus:border-ifaqa-plum transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md text-[#5A6962] hover:text-ifaqa-plum hover:bg-ifaqa-cashmere inline-flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      )}
    </form>
  );
}
