'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HerbalRemedy, RemedyForm as FormType, AilmentCategoryId } from '@/lib/types';
import { createRemedy, updateRemedy, getAilments } from '@/lib/data-service';
import { uploadMedia } from '@/lib/storage-service';
import { triggerNavigationProgress } from '@/lib/nav-progress';
import { FormInput, FormTextarea, FormSelect } from '../ui/FormInput';
import { BotanicalIngredientsEditor } from './BotanicalIngredientsEditor';
import { RuledBadge } from '../ui/ArchitecturalBadge';
import {
  Upload,
  AlertCircle,
  Save,
  Plus,
  X,
  Leaf,
  IndianRupee,
  ImageIcon,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface RemedyFormProps {
  initialData?: HerbalRemedy;
  isEdit?: boolean;
}

const MAX_REMEDY_PHOTOS = 10;

const FORMS: FormType[] = [
  'Majun',
  'Safoof',
  'Sharbat',
  'Arq',
  'Hab',
  'Khamira',
  'Kushta',
  'Raughan',
  'Marham',
];

function dedupePhotos(primary?: string, list?: string[]): { primaryImage: string; images: string[] } {
  const seen = new Set<string>();
  const ordered: string[] = [];
  if (primary && primary.trim()) {
    const clean = primary.trim();
    seen.add(clean);
    ordered.push(clean);
  }
  for (const item of list || []) {
    const clean = (item || '').trim();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      ordered.push(clean);
    }
  }
  const capped = ordered.slice(0, MAX_REMEDY_PHOTOS);
  return {
    primaryImage: capped[0] || '',
    images: capped,
  };
}

export function RemedyForm({ initialData, isEdit = false }: RemedyFormProps) {
  const router = useRouter();
  const ailments = getAilments();

  const initialMedia = dedupePhotos(
    initialData?.primaryImage || '/images/remedies/jawarish-kamuni-kabir.jpg',
    initialData?.images || ['/images/remedies/jawarish-kamuni-kabir.jpg']
  );

  const [formData, setFormData] = useState<Partial<HerbalRemedy>>({
    name: initialData?.name || '',
    urduName: initialData?.urduName || '',
    romanUrduName: initialData?.romanUrduName || '',
    sku: initialData?.sku || '',
    categoryId: initialData?.categoryId || 'hazim',
    categoryName: initialData?.categoryName || 'Digestive & Gastrointestinal Care',
    shortDescription: initialData?.shortDescription || '',
    longDescription: initialData?.longDescription || '',
    therapeuticIndications: initialData?.therapeuticIndications || [
      'Digestive balance',
      'Stomach comfort',
    ],
    herbalIngredients: initialData?.herbalIngredients || [
      {
        botanicalName: 'Cuminum cyminum',
        commonName: 'Zira Siyah',
        partUsed: 'Dried Seeds',
        proportion: '30%',
      },
    ],
    dosageInstructions: initialData?.dosageInstructions || {
      amount: '5g (about 1 teaspoon)',
      timing: 'Twice daily after meals',
      anupana: 'Lukewarm water',
      contraindications: ['Pregnancy'],
    },
    form: initialData?.form || 'Majun',
    packaging: initialData?.packaging || {
      size: '200g Jar',
      containerType: 'Amber Glass Jar',
    },
    pricePKR: initialData?.pricePKR || 1200,
    comparePricePKR: initialData?.comparePricePKR,
    priceUSD: initialData?.priceUSD || 15.0,
    stockQuantity: initialData?.stockQuantity ?? 50,
    isAvailable: initialData?.isAvailable !== false,
    isFeatured: !!initialData?.isFeatured,
    isBestSeller: !!initialData?.isBestSeller,
    images: initialMedia.images,
    primaryImage: initialMedia.primaryImage,
  });

  const [indicationInput, setIndicationInput] = useState('');
  const [contraindicationInput, setContraindicationInput] = useState('');
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);

  const allPhotos = formData.images || [];
  const mainPhoto = formData.primaryImage || allPhotos[0] || '';
  const extraPhotos = allPhotos.filter((img) => img !== mainPhoto);
  const remainingPhotoSlots = Math.max(0, MAX_REMEDY_PHOTOS - allPhotos.length);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCat = ailments.find((a) => a.id === e.target.value);
    setFormData((prev) => ({
      ...prev,
      categoryId: e.target.value as AilmentCategoryId,
      categoryName: selectedCat ? selectedCat.name : prev.categoryName,
    }));
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMessage(null);
    setPhotoNotice(null);
    try {
      const url = await uploadMedia(
        file,
        `remedies/${formData.sku || 'temp'}/main_${Date.now()}_${file.name}`
      );
      setFormData((prev) => {
        const nextList = [url, ...(prev.images || []).filter((x) => x !== url && x !== prev.primaryImage)].slice(
          0,
          MAX_REMEDY_PHOTOS
        );
        return {
          ...prev,
          primaryImage: url,
          images: nextList,
        };
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Main photo upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleGalleryFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (remainingPhotoSlots <= 0) {
      setPhotoNotice(`Maximum limit of ${MAX_REMEDY_PHOTOS} photos reached. Remove one before adding more.`);
      e.target.value = '';
      return;
    }

    const accepted = files.slice(0, remainingPhotoSlots);
    if (files.length > remainingPhotoSlots) {
      setPhotoNotice(
        `Only ${remainingPhotoSlots} more photo slot${remainingPhotoSlots === 1 ? '' : 's'} left (max ${MAX_REMEDY_PHOTOS}).`
      );
    } else {
      setPhotoNotice(null);
    }

    setUploading(true);
    setErrorMessage(null);
    try {
      const uploadedUrls: string[] = [];
      for (const file of accepted) {
        const url = await uploadMedia(
          file,
          `remedies/${formData.sku || 'temp'}/gallery_${Date.now()}_${file.name}`
        );
        uploadedUrls.push(url);
      }

      setFormData((prev) => {
        const current = prev.images || [];
        const merged = Array.from(new Set([...current, ...uploadedUrls])).slice(
          0,
          MAX_REMEDY_PHOTOS
        );
        return {
          ...prev,
          primaryImage: prev.primaryImage || merged[0] || '',
          images: merged,
        };
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gallery upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddGalleryUrl = () => {
    const clean = galleryUrlInput.trim();
    if (!clean) return;
    if (remainingPhotoSlots <= 0) {
      setPhotoNotice(`Maximum limit of ${MAX_REMEDY_PHOTOS} photos reached.`);
      return;
    }
    if (allPhotos.includes(clean)) {
      setPhotoNotice('This photo URL is already added.');
      return;
    }
    setPhotoNotice(null);
    setFormData((prev) => {
      const next = [...(prev.images || []), clean].slice(0, MAX_REMEDY_PHOTOS);
      return {
        ...prev,
        primaryImage: prev.primaryImage || clean,
        images: next,
      };
    });
    setGalleryUrlInput('');
  };

  const handleSetAsMain = (url: string) => {
    setFormData((prev) => {
      const rest = (prev.images || []).filter((img) => img !== url);
      return {
        ...prev,
        primaryImage: url,
        images: [url, ...rest],
      };
    });
  };

  const handleMoveExtraPhoto = (url: string, direction: 'left' | 'right') => {
    const idx = extraPhotos.indexOf(url);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= extraPhotos.length) return;

    const reorderedExtras = [...extraPhotos];
    [reorderedExtras[idx], reorderedExtras[targetIdx]] = [
      reorderedExtras[targetIdx],
      reorderedExtras[idx],
    ];

    setFormData((prev) => ({
      ...prev,
      images: mainPhoto ? [mainPhoto, ...reorderedExtras] : reorderedExtras,
    }));
  };

  const handleRemovePhoto = (url: string) => {
    setPhotoNotice(null);
    setFormData((prev) => {
      const remaining = (prev.images || []).filter((img) => img !== url);
      const nextPrimary =
        prev.primaryImage === url ? remaining[0] || '' : prev.primaryImage || remaining[0] || '';
      return {
        ...prev,
        primaryImage: nextPrimary,
        images: remaining,
      };
    });
  };

  const addIndication = () => {
    if (!indicationInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      therapeuticIndications: [...(prev.therapeuticIndications || []), indicationInput.trim()],
    }));
    setIndicationInput('');
  };

  const removeIndication = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      therapeuticIndications: (prev.therapeuticIndications || []).filter((_, i) => i !== idx),
    }));
  };

  const addContraindication = () => {
    if (!contraindicationInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      dosageInstructions: {
        ...prev.dosageInstructions!,
        contraindications: [
          ...(prev.dosageInstructions?.contraindications || []),
          contraindicationInput.trim(),
        ],
      },
    }));
    setContraindicationInput('');
  };

  const removeContraindication = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      dosageInstructions: {
        ...prev.dosageInstructions!,
        contraindications: (prev.dosageInstructions?.contraindications || []).filter(
          (_, i) => i !== idx
        ),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const cleaned = dedupePhotos(formData.primaryImage, formData.images);
      const payload: Partial<HerbalRemedy> = {
        ...formData,
        primaryImage: cleaned.primaryImage || '/images/remedies/placeholder.jpg',
        images:
          cleaned.images.length > 0 ? cleaned.images : ['/images/remedies/placeholder.jpg'],
      };

      if (isEdit && initialData?.id) {
        await updateRemedy(initialData.id, payload);
      } else {
        await createRemedy(payload);
      }
      triggerNavigationProgress('/remedies');
      router.push('/remedies');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save remedy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-900 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0" strokeWidth={1.6} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* Left 8 Columns */}
        <div className="xl:col-span-8 space-y-6 min-w-0">
          {/* 1. Core Identity */}
          <section className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <div className="border-b border-ifaqa-plum/10 pb-3 flex items-center gap-2.5">
              <Leaf className="w-4 h-4 text-[#165A45] shrink-0" strokeWidth={1.6} />
              <div>
                <h2 className="font-serif font-normal text-lg text-ifaqa-plum">
                  Formulation identity
                </h2>
                <p className="text-xs text-[#5A6962]">
                  English, Urdu script, SKU code, and pharmaceutical preparation style
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Remedy name *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jawarish Kamuni Kabir"
              />
              <FormInput
                label="Urdu script name *"
                required
                dir="rtl"
                className="font-urdu text-base"
                value={formData.urduName}
                onChange={(e) => setFormData({ ...formData, urduName: e.target.value })}
                placeholder="جوارش کمونی کبیر"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Roman Urdu name"
                value={formData.romanUrduName}
                onChange={(e) => setFormData({ ...formData, romanUrduName: e.target.value })}
                placeholder="Jawarish Kamuni Kabir"
              />
              <FormInput
                label="SKU identifier *"
                required
                disabled={isEdit}
                className="font-mono"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="IFA-HAZ-001"
                helperText={isEdit ? 'Locked once created' : 'Unique inventory SKU'}
              />
              <FormSelect
                label="Health category *"
                value={formData.categoryId}
                onChange={handleCategoryChange}
              >
                {ailments.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormSelect
                label="Form *"
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value as FormType })}
              >
                {FORMS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </FormSelect>
              <FormInput
                label="Pack size"
                value={formData.packaging?.size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packaging: { ...formData.packaging!, size: e.target.value },
                  })
                }
                placeholder="200g Jar"
              />
              <FormInput
                label="Container"
                value={formData.packaging?.containerType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packaging: { ...formData.packaging!, containerType: e.target.value },
                  })
                }
                placeholder="Amber glass jar"
              />
            </div>
          </section>

          {/* 2. Expanded Product Photography Studio (1 Main + Up to 9 Gallery = 10 Max) */}
          <section className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-5">
            <div className="border-b border-ifaqa-plum/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-[#165A45] shrink-0" strokeWidth={1.6} />
                <div>
                  <h2 className="font-serif font-normal text-lg text-ifaqa-plum">
                    Product photographs & gallery
                  </h2>
                  <p className="text-xs text-[#5A6962]">
                    Set 1 primary hero photograph and up to {MAX_REMEDY_PHOTOS - 1} extra gallery angles
                  </p>
                </div>
              </div>
              <RuledBadge accentColor={remainingPhotoSlots === 0 ? 'amber' : 'emerald'}>
                {allPhotos.length} / {MAX_REMEDY_PHOTOS} photos
              </RuledBadge>
            </div>

            {photoNotice && (
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" strokeWidth={1.6} />
                <span>{photoNotice}</span>
              </div>
            )}

            {/* Main Photo Studio */}
            <div className="p-4 rounded-xl bg-ifaqa-linen border border-ifaqa-plum/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5">
                <div className="relative aspect-[4/3] rounded-xl border border-ifaqa-plum/15 bg-ifaqa-cashmere overflow-hidden flex items-center justify-center">
                  {mainPhoto ? (
                    <img
                      src={mainPhoto}
                      alt="Primary remedy photograph"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-[#5A6962]">No main photo selected</span>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-ifaqa-plum text-ifaqa-linen inline-flex items-center gap-1">
                    <Star className="w-3 h-3 text-ifaqa-mauve" strokeWidth={1.6} fill="currentColor" />
                    <span>Main photo</span>
                  </span>
                </div>
              </div>

              <div className="md:col-span-7 space-y-3">
                <FormInput
                  label="Main photo URL or path"
                  value={mainPhoto}
                  onChange={(e) => {
                    const url = e.target.value;
                    setFormData((prev) => {
                      const others = (prev.images || []).filter(
                        (img) => img !== prev.primaryImage && img !== url
                      );
                      const nextList = url
                        ? [url, ...others].slice(0, MAX_REMEDY_PHOTOS)
                        : others;
                      return {
                        ...prev,
                        primaryImage: url,
                        images: nextList,
                      };
                    });
                  }}
                  placeholder="/images/remedies/jawarish-kamuni-kabir.jpg"
                />

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium cursor-pointer hover:bg-[#165A45] transition-colors inline-flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" strokeWidth={1.6} />
                    <span>{uploading ? 'Uploading...' : 'Replace main photo'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                  </label>
                  {mainPhoto && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(mainPhoto)}
                      className="h-9 px-3 rounded-lg border border-red-200 bg-white text-red-700 text-xs font-medium hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Gallery Photos Controls & Grid */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium text-ifaqa-plum">
                    Additional gallery photos ({extraPhotos.length})
                  </h3>
                  <p className="text-xs text-[#5A6962]">
                    Customers can swipe these extra product angles on the detail page
                  </p>
                </div>
                <label
                  className={`h-9 px-4 rounded-lg border text-xs font-medium inline-flex items-center gap-2 shrink-0 transition-colors ${
                    remainingPhotoSlots === 0
                      ? 'border-ifaqa-plum/10 bg-ifaqa-linen text-[#5A6962] cursor-not-allowed'
                      : 'border-ifaqa-plum/15 bg-white text-ifaqa-plum hover:bg-ifaqa-cashmere cursor-pointer'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
                  <span>
                    {uploading
                      ? 'Uploading...'
                      : remainingPhotoSlots === 0
                      ? 'Max 10 photos reached'
                      : `Upload gallery photos (${remainingPhotoSlots} left)`}
                  </span>
                  <input
                    type="file"
                    multiple
                    disabled={remainingPhotoSlots === 0 || uploading}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleGalleryFilesUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Add Gallery Photo URL */}
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={remainingPhotoSlots === 0}
                  placeholder={
                    remainingPhotoSlots === 0
                      ? 'Photo limit (10) reached'
                      : 'Paste an extra photo URL and click Add'
                  }
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGalleryUrl();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-lg text-sm bg-white border border-ifaqa-plum/15 text-ifaqa-plum placeholder:text-[#5A6962]/60 focus:outline-none focus:border-ifaqa-plum disabled:opacity-60"
                />
                <button
                  type="button"
                  disabled={remainingPhotoSlots === 0 || !galleryUrlInput.trim()}
                  onClick={handleAddGalleryUrl}
                  className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium hover:bg-[#165A45] transition-colors disabled:opacity-40 inline-flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.6} />
                  <span>Add URL</span>
                </button>
              </div>

              {/* Gallery Grid */}
              {extraPhotos.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-ifaqa-plum/15 bg-ifaqa-linen/60 text-center text-xs text-[#5A6962]">
                  No additional gallery photos yet. Upload multiple images or add URLs (up to {MAX_REMEDY_PHOTOS} total).
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                  {extraPhotos.map((imgUrl, idx) => (
                    <div
                      key={`${imgUrl}-${idx}`}
                      className="group rounded-xl border border-ifaqa-plum/10 bg-ifaqa-linen overflow-hidden flex flex-col"
                    >
                      <div className="relative aspect-square bg-ifaqa-cashmere overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={`Gallery view ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/90 text-ifaqa-plum tabular-nums">
                          #{idx + 2}
                        </span>
                      </div>

                      <div className="p-2 flex items-center justify-between gap-1 bg-white border-t border-ifaqa-plum/10">
                        <button
                          type="button"
                          onClick={() => handleSetAsMain(imgUrl)}
                          className="text-[11px] font-medium text-ifaqa-plum hover:text-[#165A45] transition-colors px-1.5 py-1 rounded hover:bg-ifaqa-cashmere"
                          title="Make this the primary photo"
                        >
                          Set main
                        </button>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveExtraPhoto(imgUrl, 'left')}
                            className="p-1 rounded text-[#5A6962] hover:text-ifaqa-plum disabled:opacity-25"
                            title="Move earlier"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === extraPhotos.length - 1}
                            onClick={() => handleMoveExtraPhoto(imgUrl, 'right')}
                            className="p-1 rounded text-[#5A6962] hover:text-ifaqa-plum disabled:opacity-25"
                            title="Move later"
                          >
                            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.6} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(imgUrl)}
                            className="p-1 rounded text-[#5A6962] hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 3. Botanical Ingredients */}
          <section className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <div className="border-b border-ifaqa-plum/10 pb-3">
              <h2 className="font-serif font-normal text-lg text-ifaqa-plum">
                Botanical ingredients
              </h2>
              <p className="text-xs text-[#5A6962]">
                Whole herbs, roots, and compounding shares displayed on the product page
              </p>
            </div>
            <BotanicalIngredientsEditor
              ingredients={formData.herbalIngredients || []}
              onChange={(ingredients) => setFormData({ ...formData, herbalIngredients: ingredients })}
            />
          </section>

          {/* 4. Descriptions & Therapeutic Indications */}
          <section className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <div className="border-b border-ifaqa-plum/10 pb-3">
              <h2 className="font-serif font-normal text-lg text-ifaqa-plum">
                Descriptions & therapeutic benefits
              </h2>
            </div>

            <FormInput
              label="Short summary"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Concise one-sentence summary shown on catalog cards"
            />

            <FormTextarea
              label="Full botanical & traditional description"
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              rows={5}
              placeholder="Preparation details, traditional notes, and clinical usage"
            />

            <div className="space-y-2">
              <label className="block text-xs font-medium text-ifaqa-plum">
                Therapeutic indications
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add benefit (e.g. Bloating relief)"
                  value={indicationInput}
                  onChange={(e) => setIndicationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addIndication();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-lg text-sm bg-white border border-ifaqa-plum/15 text-ifaqa-plum focus:outline-none focus:border-ifaqa-plum"
                />
                <button
                  type="button"
                  onClick={addIndication}
                  className="h-9 px-3.5 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium hover:bg-[#165A45] transition-colors inline-flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.6} />
                  <span>Add</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.therapeuticIndications || []).map((ti, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-ifaqa-plum/10 bg-ifaqa-cashmere text-ifaqa-plum"
                  >
                    <span>{ti}</span>
                    <button
                      type="button"
                      onClick={() => removeIndication(idx)}
                      className="hover:text-red-700"
                    >
                      <X className="w-3 h-3" strokeWidth={1.6} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Dosage & Precautions */}
          <section className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <div className="border-b border-ifaqa-plum/10 pb-3">
              <h2 className="font-serif font-normal text-lg text-ifaqa-plum">
                Dosage & precautions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Recommended dose"
                value={formData.dosageInstructions?.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dosageInstructions: { ...formData.dosageInstructions!, amount: e.target.value },
                  })
                }
                placeholder="5g (about 1 teaspoon)"
              />
              <FormInput
                label="Timing"
                value={formData.dosageInstructions?.timing}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dosageInstructions: { ...formData.dosageInstructions!, timing: e.target.value },
                  })
                }
                placeholder="Twice daily after meals"
              />
              <FormInput
                label="With (Anupana)"
                value={formData.dosageInstructions?.anupana}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dosageInstructions: { ...formData.dosageInstructions!, anupana: e.target.value },
                  })
                }
                placeholder="Lukewarm water"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-ifaqa-plum">
                Contraindications
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add precaution (e.g. Pregnancy)"
                  value={contraindicationInput}
                  onChange={(e) => setContraindicationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addContraindication();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-lg text-sm bg-white border border-ifaqa-plum/15 text-ifaqa-plum focus:outline-none focus:border-ifaqa-plum"
                />
                <button
                  type="button"
                  onClick={addContraindication}
                  className="h-9 px-3.5 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium hover:bg-[#165A45] transition-colors inline-flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.6} />
                  <span>Add</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.dosageInstructions?.contraindications || []).map((ci, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-red-200 bg-red-50 text-red-900"
                  >
                    <span>{ci}</span>
                    <button
                      type="button"
                      onClick={() => removeContraindication(idx)}
                      className="hover:text-red-700"
                    >
                      <X className="w-3 h-3" strokeWidth={1.6} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right 4 Columns: Sticky Pricing, Stock, Flags & Save Bar */}
        <div className="xl:col-span-4 xl:sticky xl:top-24 space-y-6">
          <section className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <div className="border-b border-ifaqa-plum/10 pb-3 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
              <h2 className="font-serif font-normal text-lg text-ifaqa-plum">
                Pricing & inventory
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Price (INR ₹) *"
                type="number"
                min="1"
                required
                className="font-mono tabular-nums"
                value={formData.pricePKR}
                onChange={(e) =>
                  setFormData({ ...formData, pricePKR: parseFloat(e.target.value) || 0 })
                }
              />
              <FormInput
                label="Compare at (INR ₹)"
                type="number"
                className="font-mono tabular-nums"
                value={formData.comparePricePKR || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    comparePricePKR: parseFloat(e.target.value) || undefined,
                  })
                }
              />
              <FormInput
                label="Export (USD $) *"
                type="number"
                step="0.01"
                min="0.1"
                required
                className="font-mono tabular-nums"
                value={formData.priceUSD}
                onChange={(e) =>
                  setFormData({ ...formData, priceUSD: parseFloat(e.target.value) || 0 })
                }
              />
              <FormInput
                label="Stock units *"
                type="number"
                min="0"
                required
                className="font-mono tabular-nums"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })
                }
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-ifaqa-plum/10">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm text-ifaqa-plum">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#0B2D22]"
                />
                <span>Available on storefront</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-sm text-ifaqa-plum">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#0B2D22]"
                />
                <span>Featured on homepage</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-sm text-ifaqa-plum">
                <input
                  type="checkbox"
                  checked={formData.isBestSeller}
                  onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#0B2D22]"
                />
                <span>Mark as bestseller</span>
              </label>
            </div>
          </section>

          {/* Compact Media Summary */}
          <section className="p-5 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#5A6962]">Media readiness</span>
              <span className="font-mono text-xs tabular-nums text-ifaqa-plum">
                {allPhotos.length} / {MAX_REMEDY_PHOTOS}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border border-ifaqa-plum/10 bg-ifaqa-cashmere overflow-hidden shrink-0">
                {mainPhoto && (
                  <img src={mainPhoto} alt="Main thumbnail" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="text-xs text-[#3E524A]">
                <div className="font-medium text-ifaqa-plum">
                  {mainPhoto ? 'Main photo ready' : 'Missing main photo'}
                </div>
                <div className="text-[#5A6962]">
                  {extraPhotos.length} extra angle{extraPhotos.length === 1 ? '' : 's'} attached
                </div>
              </div>
            </div>
          </section>

          {/* Sticky Actions */}
          <section className="p-5 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                triggerNavigationProgress('/remedies');
                router.push('/remedies');
              }}
              className="flex-1 h-10 px-4 rounded-lg border border-ifaqa-plum/15 bg-white text-sm font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 h-10 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-sm font-medium hover:bg-[#165A45] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" strokeWidth={1.6} />
              <span>{loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create remedy'}</span>
            </button>
          </section>
        </div>
      </div>
    </form>
  );
}
