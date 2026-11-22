'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HerbalRemedy, RemedyForm as FormType, AilmentCategoryId } from '@/lib/types';
import { createRemedy, updateRemedy, getAilments } from '@/lib/data-service';
import { uploadMedia } from '@/lib/storage-service';
import { FormInput, FormTextarea, FormSelect } from '../ui/FormInput';
import { BotanicalIngredientsEditor } from './BotanicalIngredientsEditor';
import { Upload, AlertCircle, Save } from 'lucide-react';

interface RemedyFormProps {
  initialData?: HerbalRemedy;
  isEdit?: boolean;
}

const FORMS: FormType[] = ['Majun', 'Safoof', 'Sharbat', 'Arq', 'Hab', 'Khamira', 'Kushta', 'Raughan', 'Marham'];

export function RemedyForm({ initialData, isEdit = false }: RemedyFormProps) {
  const router = useRouter();
  const ailments = getAilments();

  const [formData, setFormData] = useState<Partial<HerbalRemedy>>({
    name: initialData?.name || '',
    urduName: initialData?.urduName || '',
    romanUrduName: initialData?.romanUrduName || '',
    sku: initialData?.sku || '',
    categoryId: initialData?.categoryId || 'hazim',
    categoryName: initialData?.categoryName || 'Digestive & Gastrointestinal Care',
    shortDescription: initialData?.shortDescription || '',
    longDescription: initialData?.longDescription || '',
    therapeuticIndications: initialData?.therapeuticIndications || ['Digestive weakness', 'Gastric distress'],
    herbalIngredients: initialData?.herbalIngredients || [
      { botanicalName: 'Cuminum cyminum', commonName: 'Zira Siyah', partUsed: 'Dried Seeds', proportion: '30%' }
    ],
    dosageInstructions: initialData?.dosageInstructions || {
      amount: '5g (approx. 1 teaspoon)',
      timing: 'Twice daily after meals',
      anupana: 'Lukewarm spring water or Arq-e-Badiyan',
      contraindications: ['Pregnancy']
    },
    form: initialData?.form || 'Majun',
    packaging: initialData?.packaging || { size: '200g Jar', containerType: 'Amber UV-Protected Glass' },
    pricePKR: initialData?.pricePKR || 1200,
    comparePricePKR: initialData?.comparePricePKR || 1400,
    priceUSD: initialData?.priceUSD || 15.00,
    stockQuantity: initialData?.stockQuantity ?? 50,
    isAvailable: initialData?.isAvailable !== false,
    isFeatured: !!initialData?.isFeatured,
    isBestSeller: !!initialData?.isBestSeller,
    images: initialData?.images || ['/images/remedies/jawarish-kamuni-kabir.jpg'],
    primaryImage: initialData?.primaryImage || '/images/remedies/jawarish-kamuni-kabir.jpg'
  });

  const [indicationInput, setIndicationInput] = useState('');
  const [contraindicationInput, setContraindicationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(formData.primaryImage || '');

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCat = ailments.find(a => a.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      categoryId: (e.target.value as AilmentCategoryId),
      categoryName: selectedCat ? selectedCat.name : prev.categoryName
    }));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      const url = await uploadMedia(file, `remedies/${formData.sku || 'temp'}/${file.name}`);
      setImagePreview(url);
      setFormData(prev => ({
        ...prev,
        primaryImage: url,
        images: [url, ...(prev.images || [])]
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMessage(msg);
    }
  };

  const addIndication = () => {
    if (indicationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        therapeuticIndications: [...(prev.therapeuticIndications || []), indicationInput.trim()]
      }));
      setIndicationInput('');
    }
  };

  const removeIndication = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      therapeuticIndications: (prev.therapeuticIndications || []).filter((_, i) => i !== idx)
    }));
  };

  const addContraindication = () => {
    if (contraindicationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        dosageInstructions: {
          ...prev.dosageInstructions!,
          contraindications: [...(prev.dosageInstructions?.contraindications || []), contraindicationInput.trim()]
        }
      }));
      setContraindicationInput('');
    }
  };

  const removeContraindication = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      dosageInstructions: {
        ...prev.dosageInstructions!,
        contraindications: (prev.dosageInstructions?.contraindications || []).filter((_, i) => i !== idx)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isEdit && initialData?.id) {
        await updateRemedy(initialData.id, formData);
      } else {
        await createRemedy(formData);
      }
      router.push('/remedies');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save remedy';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {errorMessage && (
        <div className="p-4 border-l-4 border-red-700 bg-red-50 text-red-900 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Nomenclature & Classification */}
      <div className="p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-[#3E3239] uppercase tracking-wider border-b border-[#C7A9A3]/30 pb-2">
          1. Core Nomenclature & Classical Classification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="English / Brand Formulation Name *"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Jawarish Kamuni Kabir"
          />
          <FormInput
            label="Classical Urdu Script (RTL) *"
            required
            dir="rtl"
            value={formData.urduName}
            onChange={e => setFormData({ ...formData, urduName: e.target.value })}
            placeholder="جوارش کمونی کبیر"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Roman Urdu Name"
            value={formData.romanUrduName}
            onChange={e => setFormData({ ...formData, romanUrduName: e.target.value })}
            placeholder="Jawarish Kamuni Kabir"
          />
          <FormInput
            label="SKU Identifier *"
            required
            disabled={isEdit}
            value={formData.sku}
            onChange={e => setFormData({ ...formData, sku: e.target.value })}
            placeholder="IFA-HAZ-001"
            helperText={isEdit ? 'SKU cannot be modified once registered.' : 'Unique dispensary inventory SKU.'}
          />
          <FormSelect
            label="Ailment Category *"
            value={formData.categoryId}
            onChange={handleCategoryChange}
          >
            {ailments.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.urduName})
              </option>
            ))}
          </FormSelect>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormSelect
            label="Classical Pharmaceutical Form *"
            value={formData.form}
            onChange={e => setFormData({ ...formData, form: e.target.value as FormType })}
          >
            {FORMS.map(f => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Packaging Size"
            value={formData.packaging?.size}
            onChange={e => setFormData({
              ...formData,
              packaging: { ...formData.packaging!, size: e.target.value }
            })}
            placeholder="250g Jar"
          />
          <FormInput
            label="Container Type"
            value={formData.packaging?.containerType}
            onChange={e => setFormData({
              ...formData,
              packaging: { ...formData.packaging!, containerType: e.target.value }
            })}
            placeholder="Amber UV Glass"
          />
        </div>
      </div>

      {/* Section 2: Botanical Ingredients Compounding */}
      <div className="p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-[#3E3239] uppercase tracking-wider border-b border-[#C7A9A3]/30 pb-2">
          2. Botanical Ingredients Compounding Specification
        </h2>
        <BotanicalIngredientsEditor
          ingredients={formData.herbalIngredients || []}
          onChange={ingredients => setFormData({ ...formData, herbalIngredients: ingredients })}
        />
      </div>

      {/* Section 3: Traditional Posology & Dosage */}
      <div className="p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-[#3E3239] uppercase tracking-wider border-b border-[#C7A9A3]/30 pb-2">
          3. Traditional Posology & Anupana (Vehicle)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Dosage Amount"
            value={formData.dosageInstructions?.amount}
            onChange={e => setFormData({
              ...formData,
              dosageInstructions: { ...formData.dosageInstructions!, amount: e.target.value }
            })}
            placeholder="5g to 10g (approx 1 teaspoon)"
          />
          <FormInput
            label="Dosage Timing"
            value={formData.dosageInstructions?.timing}
            onChange={e => setFormData({
              ...formData,
              dosageInstructions: { ...formData.dosageInstructions!, timing: e.target.value }
            })}
            placeholder="Twice daily after meals"
          />
          <FormInput
            label="Traditional Vehicle (Anupana)"
            value={formData.dosageInstructions?.anupana}
            onChange={e => setFormData({
              ...formData,
              dosageInstructions: { ...formData.dosageInstructions!, anupana: e.target.value }
            })}
            placeholder="Lukewarm spring water or Arq"
          />
        </div>

        {/* Contraindications chip list */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239] mb-1">
            Contraindications
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add contraindication..."
              value={contraindicationInput}
              onChange={e => setContraindicationInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addContraindication(); } }}
            />
            <button
              type="button"
              onClick={addContraindication}
              className="px-3 py-2 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.dosageInstructions?.contraindications || []).map((ci, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-red-700/40 bg-red-50 text-red-900 font-mono">
                <span>{ci}</span>
                <button type="button" onClick={() => removeContraindication(idx)} className="hover:text-red-700 font-bold">&times;</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Traditional Pharmacology & Indications */}
      <div className="p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-[#3E3239] uppercase tracking-wider border-b border-[#C7A9A3]/30 pb-2">
          4. Traditional Pharmacology & Clinical Indications
        </h2>
        <FormInput
          label="Short Luxury Teaser (1-2 sentences)"
          value={formData.shortDescription}
          onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
          placeholder="Noble digestive electuary featuring Persian black caraway..."
        />
        <FormTextarea
          label="In-Depth Botanical & Clinical Traditional Pharmacology"
          value={formData.longDescription}
          onChange={e => setFormData({ ...formData, longDescription: e.target.value })}
          rows={5}
          placeholder="Detailed preparation methods, clinical compendium citations, and biological actions..."
        />
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239] mb-1">
            Therapeutic Indications
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add indication..."
              value={indicationInput}
              onChange={e => setIndicationInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIndication(); } }}
            />
            <button
              type="button"
              onClick={addIndication}
              className="px-3 py-2 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.therapeuticIndications || []).map((ti, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-[#C7A9A3] bg-[#E8D2C4]/40 text-[#3E3239] font-serif">
                <span>{ti}</span>
                <button type="button" onClick={() => removeIndication(idx)} className="hover:text-red-700 font-bold">&times;</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section 5: Pricing, Inventory & Flags */}
      <div className="p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-[#3E3239] uppercase tracking-wider border-b border-[#C7A9A3]/30 pb-2">
          5. Pricing, Dispensary Inventory & Showcase Toggles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormInput
            label="Price (PKR) *"
            type="number"
            min="1"
            required
            value={formData.pricePKR}
            onChange={e => setFormData({ ...formData, pricePKR: parseFloat(e.target.value) || 0 })}
          />
          <FormInput
            label="Compare Price (PKR)"
            type="number"
            value={formData.comparePricePKR || ''}
            onChange={e => setFormData({ ...formData, comparePricePKR: parseFloat(e.target.value) || undefined })}
          />
          <FormInput
            label="Price (USD) *"
            type="number"
            step="0.01"
            min="0.1"
            required
            value={formData.priceUSD}
            onChange={e => setFormData({ ...formData, priceUSD: parseFloat(e.target.value) || 0 })}
          />
          <FormInput
            label="Stock Quantity *"
            type="number"
            min="0"
            required
            value={formData.stockQuantity}
            onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#C7A9A3]/30">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-4 h-4 accent-[#3E3239]"
            />
            <span className="text-xs font-serif uppercase tracking-wider text-[#3E3239] font-medium">
              Available for Purchase
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 accent-[#3E3239]"
            />
            <span className="text-xs font-serif uppercase tracking-wider text-[#3E3239] font-medium">
              Featured on Homepage
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isBestSeller}
              onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
              className="w-4 h-4 accent-[#3E3239]"
            />
            <span className="text-xs font-serif uppercase tracking-wider text-[#3E3239] font-medium">
              Dispensary Bestseller
            </span>
          </label>
        </div>
      </div>

      {/* Section 6: Media & Imagery */}
      <div className="p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-[#3E3239] uppercase tracking-wider border-b border-[#C7A9A3]/30 pb-2">
          6. Media & Imagery (JPG, PNG, WebP only)
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 border border-[#C7A9A3] bg-[#E8D2C4]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {imagePreview ? (
              <img src={imagePreview} alt="Remedy Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-mono text-[#9E8189]">No Image</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider cursor-pointer hover:bg-[#6B5560] transition-colors">
              <Upload className="w-4 h-4" />
              <span>Upload Imagery</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-[#9E8189]">
              Supported formats: JPEG, PNG, WebP (Max 8MB). Non-image formats will be rejected with INVALID_MEDIA_TYPE.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Controls */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push('/remedies')}
          className="px-6 py-2.5 border border-[#C7A9A3] text-xs font-serif uppercase tracking-wider text-[#3E3239] hover:bg-[#E8D2C4]/30 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-2.5 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#6B5560] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Recording Spec...' : isEdit ? 'Update Formulation' : 'Record New Formulation'}</span>
        </button>
      </div>
    </form>
  );
}
