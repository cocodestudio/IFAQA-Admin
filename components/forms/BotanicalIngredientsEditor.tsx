'use client';

import React from 'react';
import { HerbalIngredient } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

interface BotanicalIngredientsEditorProps {
  ingredients: HerbalIngredient[];
  onChange: (ingredients: HerbalIngredient[]) => void;
  error?: string;
}

const cellInput =
  'w-full px-3 py-2 rounded-lg text-xs bg-white border border-ifaqa-plum/15 text-ifaqa-plum placeholder:text-[#5A6962]/60 focus:outline-none focus:border-ifaqa-plum';

export function BotanicalIngredientsEditor({
  ingredients,
  onChange,
  error,
}: BotanicalIngredientsEditorProps) {
  const handleAdd = () => {
    onChange([
      ...ingredients,
      { botanicalName: '', commonName: '', partUsed: '', proportion: '' },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof HerbalIngredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-[#5A6962] tabular-nums">
          {ingredients.length} botanical ingredient{ingredients.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="h-8 px-3 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium hover:bg-[#165A45] transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Add ingredient</span>
        </button>
      </div>

      {error && <p className="text-xs text-red-700 font-medium">{error}</p>}

      <div className="rounded-xl border border-ifaqa-plum/10 bg-ifaqa-linen divide-y divide-ifaqa-plum/10 overflow-hidden">
        {ingredients.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#5A6962]">
            Add at least one herbal ingredient for this formulation
          </div>
        ) : (
          ingredients.map((item, idx) => (
            <div key={idx} className="p-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              <div className="sm:col-span-4">
                <input
                  type="text"
                  placeholder="Botanical name (e.g. Cuminum cyminum)"
                  value={item.botanicalName}
                  onChange={(e) => handleChange(idx, 'botanicalName', e.target.value)}
                  className={cellInput}
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Common / Unani name"
                  value={item.commonName}
                  onChange={(e) => handleChange(idx, 'commonName', e.target.value)}
                  className={cellInput}
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Part used"
                  value={item.partUsed}
                  onChange={(e) => handleChange(idx, 'partUsed', e.target.value)}
                  className={cellInput}
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Share (e.g. 25%)"
                  value={item.proportion}
                  onChange={(e) => handleChange(idx, 'proportion', e.target.value)}
                  className={`${cellInput} font-mono tabular-nums`}
                />
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A6962] hover:text-red-700 hover:bg-red-50 transition-colors"
                  title="Remove ingredient"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
