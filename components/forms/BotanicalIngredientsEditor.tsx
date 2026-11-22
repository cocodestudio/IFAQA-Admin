'use client';

import React from 'react';
import { HerbalIngredient } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

interface BotanicalIngredientsEditorProps {
  ingredients: HerbalIngredient[];
  onChange: (ingredients: HerbalIngredient[]) => void;
  error?: string;
}

export function BotanicalIngredientsEditor({
  ingredients,
  onChange,
  error
}: BotanicalIngredientsEditorProps) {
  const handleAdd = () => {
    onChange([
      ...ingredients,
      { botanicalName: '', commonName: '', partUsed: '', proportion: '' }
    ]);
  };

  const handleRemove = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof HerbalIngredient, value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239]">
          Botanical Compounding Ingredients ({ingredients.length})
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider hover:bg-[#6B5560] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Botanical</span>
        </button>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <div className="border border-[#C7A9A3]/50 bg-[#F7EFE7] divide-y divide-[#C7A9A3]/30">
        {ingredients.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-[#9E8189]">
            No ingredients added yet. At least one botanical ingredient is required for compounding.
          </div>
        ) : (
          ingredients.map((item, idx) => (
            <div key={idx} className="p-3 grid grid-cols-12 gap-3 items-center">
              <div className="col-span-4">
                <input
                  type="text"
                  placeholder="Botanical Name (e.g. Cuminum cyminum)"
                  value={item.botanicalName}
                  onChange={e => handleChange(idx, 'botanicalName', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  placeholder="Common / Unani Name"
                  value={item.commonName}
                  onChange={e => handleChange(idx, 'commonName', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Part Used (e.g. Seeds)"
                  value={item.partUsed}
                  onChange={e => handleChange(idx, 'partUsed', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Proportion (e.g. 25%)"
                  value={item.proportion}
                  onChange={e => handleChange(idx, 'proportion', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
                />
              </div>
              <div className="col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-red-700 hover:text-red-900 hover:bg-red-50 transition-colors"
                  title="Remove Botanical"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
