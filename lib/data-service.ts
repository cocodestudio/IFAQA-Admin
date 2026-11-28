import {
  HerbalRemedy,
  PromotionalBanner,
  CustomerOrder,
  OrderStatus,
  PaymentStatus,
  AilmentCategory,
  DispensaryKPIs,
  CustomerReview,
  SupportTicketRecord,
  CustomerProfile,
  OrderTrendPoint,
} from './types';
import { mockStore } from './mock-store';
import { getFirestoreDb, isMockFallback } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

// Recursively strips `undefined` keys so Firestore setDoc/updateDoc never rejects optional fields
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefined(v);
      }
    }
    return out as T;
  }
  return value;
}

// Short-lived client collection cache + in-flight dedupe so tab switches & searches stay instant
type CacheKey =
  | 'remedies'
  | 'ailments'
  | 'banners'
  | 'orders'
  | 'reviews'
  | 'supportTickets'
  | 'customers';

const ADMIN_CACHE_TTL_MS = 15_000;
const adminCache = new Map<CacheKey, { data: unknown; timestamp: number }>();
const inFlightFetches = new Map<CacheKey, Promise<unknown>>();

export function invalidateAdminCache(keys?: CacheKey | CacheKey[]): void {
  if (!keys) {
    adminCache.clear();
    return;
  }
  const list = Array.isArray(keys) ? keys : [keys];
  for (const k of list) {
    adminCache.delete(k);
  }
}

async function cachedFetch<T>(
  key: CacheKey,
  fetcher: () => Promise<T>,
  forceRefresh = false
): Promise<T> {
  if (!forceRefresh) {
    const hit = adminCache.get(key);
    if (hit && Date.now() - hit.timestamp < ADMIN_CACHE_TTL_MS) {
      return hit.data as T;
    }
    const pending = inFlightFetches.get(key);
    if (pending) {
      return pending as Promise<T>;
    }
  }

  const run = fetcher()
    .then((result) => {
      adminCache.set(key, { data: result, timestamp: Date.now() });
      return result;
    })
    .finally(() => {
      inFlightFetches.delete(key);
    });

  inFlightFetches.set(key, run);
  return run;
}

// Allowed forward-only state machine transitions
const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['dispensing', 'cancelled'],
  dispensing: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export function validateStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
  if (currentStatus === nextStatus) return true;
  const validNext = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!validNext || !validNext.includes(nextStatus)) {
    throw new Error(
      `INVALID_STATUS_TRANSITION: Cannot transition order status from "${currentStatus}" to "${nextStatus}".`
    );
  }
  return true;
}

export function normalizeSearchPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('03')) {
    return '+92' + clean.slice(1);
  }
  if (/^[6-9]\d{9}$/.test(clean)) {
    return '+91' + clean;
  }
  return clean;
}

export function validateBannerPayload(banner: Partial<PromotionalBanner> & { endDate?: string }): boolean {
  if (!banner || typeof banner !== 'object') {
    throw new Error('BANNER_ERROR: Banner payload must be an object');
  }
  if (!banner.headline || banner.headline.trim() === '') {
    throw new Error('BANNER_ERROR: Banner headline cannot be empty');
  }
  if (
    banner.priorityOrder !== undefined &&
    (typeof banner.priorityOrder !== 'number' || banner.priorityOrder < 0)
  ) {
    throw new Error(
      `BANNER_ERROR: priorityOrder must be non-negative number, got ${banner.priorityOrder}`
    );
  }
  if (banner.endDate && new Date(banner.endDate).getTime() < Date.now()) {
    throw new Error(
      'BANNER_ERROR: Cannot schedule a promotional banner with an expired end-date in the past.'
    );
  }
  return true;
}

export function validateRemedyPayload(payload: Partial<HerbalRemedy>): boolean {
  const required = ['name', 'urduName', 'categoryId', 'pricePKR', 'priceUSD', 'herbalIngredients'];
  for (const field of required) {
    if (!(payload as Record<string, unknown>)[field]) {
      throw new Error(`VALIDATION_ERROR: Missing required field: ${field}`);
    }
  }
  if (
    typeof payload.pricePKR !== 'number' ||
    payload.pricePKR <= 0 ||
    typeof payload.priceUSD !== 'number' ||
    payload.priceUSD <= 0
  ) {
    throw new Error('VALIDATION_ERROR: Prices must be positive numbers');
  }
  if (!Array.isArray(payload.herbalIngredients) || payload.herbalIngredients.length === 0) {
    throw new Error('VALIDATION_ERROR: Must include at least one herbal ingredient');
  }
  return true;
}

export function resequenceBanners(
  existingBanners: PromotionalBanner[],
  targetBannerId: string,
  newPriority: number
): PromotionalBanner[] {
  const target = existingBanners.find((b) => b.id === targetBannerId);
  if (!target) return existingBanners;

  const filtered = existingBanners.filter((b) => b.id !== targetBannerId);
  const updatedTarget = { ...target, priorityOrder: newPriority };

  const result: PromotionalBanner[] = [];
  let inserted = false;

  for (const b of filtered) {
    if (!inserted && b.priorityOrder >= newPriority) {
      result.push(updatedTarget);
      inserted = true;
    }
    result.push(b);
  }

  if (!inserted) {
    result.push(updatedTarget);
  }

  return result.map((b, idx) => ({ ...b, priorityOrder: idx + 1 }));
}

// ==================== REMEDIES SERVICE ====================

export async function getRemedies(filter?: {
  categoryId?: string;
  search?: string;
  stockFilter?: string;
  forceRefresh?: boolean;
}): Promise<HerbalRemedy[]> {
  let remedies = await cachedFetch<HerbalRemedy[]>(
    'remedies',
    async () => {
      const db = getFirestoreDb();
      if (db && !isMockFallback) {
        try {
          const snapshot = await getDocs(collection(db, 'remedies'));
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...(d.data() as HerbalRemedy), id: d.id }));
            list.sort((a, b) => {
              const tA = new Date(a.updatedAt || a.createdAt || 0).getTime();
              const tB = new Date(b.updatedAt || b.createdAt || 0).getTime();
              return tB - tA || (b.pricePKR || 0) - (a.pricePKR || 0);
            });
            return list;
          }
        } catch (err) {
          console.warn('Firestore getRemedies notice; using store fallback:', err);
        }
      }
      return mockStore.getRemedies();
    },
    filter?.forceRefresh
  );

  if (filter?.categoryId) {
    remedies = remedies.filter((r) => r.categoryId === filter.categoryId);
  }

  if (filter?.search) {
    const term = filter.search.toLowerCase().trim();
    remedies = remedies.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        (r.urduName || '').includes(term) ||
        (r.romanUrduName || '').toLowerCase().includes(term) ||
        (r.sku || '').toLowerCase().includes(term) ||
        (r.form || '').toLowerCase().includes(term) ||
        (r.categoryName || '').toLowerCase().includes(term)
    );
  }

  if (filter?.stockFilter) {
    if (filter.stockFilter === 'low') {
      remedies = remedies.filter((r) => r.stockQuantity > 0 && r.stockQuantity <= 10);
    } else if (filter.stockFilter === 'out') {
      remedies = remedies.filter((r) => r.stockQuantity === 0);
    } else if (filter.stockFilter === 'inactive') {
      remedies = remedies.filter((r) => !r.isAvailable);
    }
  }

  return remedies;
}

export async function getRemedyById(id: string): Promise<HerbalRemedy> {
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      const docRef = doc(db, 'remedies', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...(snap.data() as HerbalRemedy), id: snap.id };
      }
    } catch (err) {
      console.warn(`Firestore getRemedyById("${id}") notice:`, err);
    }
  }

  const remedy = mockStore.getRemedyById(id);
  if (!remedy) {
    throw new Error(`NOT_FOUND: Remedy "${id}" does not exist.`);
  }
  return remedy;
}

export async function createRemedy(data: Partial<HerbalRemedy>): Promise<HerbalRemedy> {
  validateRemedyPayload(data);

  const existingRemedies = await getRemedies();
  const duplicate = existingRemedies.find((r) => r.sku.toUpperCase() === data.sku?.toUpperCase());
  if (duplicate) {
    throw new Error(`CONFLICT_ERROR: Remedy with SKU "${data.sku}" already exists.`);
  }

  const id =
    data.id ||
    data.slug ||
    data.name!
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  const now = new Date().toISOString();

  const newRemedy: HerbalRemedy = {
    id,
    sku: data.sku!,
    name: data.name!,
    urduName: data.urduName!,
    romanUrduName: data.romanUrduName || data.name!,
    slug: data.slug || id,
    categoryId: data.categoryId!,
    categoryName: data.categoryName || data.categoryId!,
    shortDescription: data.shortDescription || '',
    longDescription: data.longDescription || '',
    therapeuticIndications: data.therapeuticIndications || [],
    herbalIngredients: data.herbalIngredients || [],
    dosageInstructions: data.dosageInstructions || {
      amount: '5g',
      timing: 'Twice daily',
      anupana: 'Lukewarm water',
      contraindications: [],
    },
    form: data.form || 'Majun',
    packaging: data.packaging || { size: '100g', containerType: 'Jar' },
    pricePKR: data.pricePKR!,
    comparePricePKR: data.comparePricePKR,
    priceUSD: data.priceUSD!,
    stockQuantity: data.stockQuantity ?? 50,
    isAvailable: data.isAvailable !== false,
    isFeatured: !!data.isFeatured,
    isBestSeller: !!data.isBestSeller,
    rating: data.rating || 5.0,
    reviewCount: data.reviewCount || 0,
    images:
      data.images && data.images.length > 0 ? data.images : ['/images/remedies/placeholder.jpg'],
    primaryImage: data.primaryImage || data.images?.[0] || '/images/remedies/placeholder.jpg',
    createdAt: now,
    updatedAt: now,
  };

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    await setDoc(doc(db, 'remedies', newRemedy.id), stripUndefined(newRemedy));
  }

  mockStore.addRemedy(newRemedy);
  invalidateAdminCache(['remedies', 'ailments']);
  return newRemedy;
}

export async function updateRemedy(
  id: string,
  updates: Partial<HerbalRemedy>
): Promise<HerbalRemedy> {
  const existing = await getRemedyById(id);
  const merged = stripUndefined({
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    await setDoc(doc(db, 'remedies', id), merged, { merge: true });
  }

  invalidateAdminCache(['remedies', 'ailments']);
  try {
    return mockStore.updateRemedy(id, updates);
  } catch {
    return merged as HerbalRemedy;
  }
}

export async function deleteRemedy(id: string): Promise<void> {
  const orders = await getOrders();
  const activeOrderStatuses: OrderStatus[] = ['placed', 'confirmed', 'dispensing', 'dispatched'];

  let hasActiveOrder = false;
  for (const ord of orders) {
    if (activeOrderStatuses.includes(ord.orderStatus)) {
      if (ord.items && ord.items.some((item) => item.remedyId === id)) {
        hasActiveOrder = true;
        break;
      }
    }
  }

  if (hasActiveOrder) {
    throw new Error(
      `SAFETY_LOCK: Cannot delete remedy "${id}" with pending customer orders. Deactivate remedy instead.`
    );
  }

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await deleteDoc(doc(db, 'remedies', id));
    } catch (err) {
      console.warn('Firestore deleteDoc failed; deleting from store fallback:', err);
    }
  }

  mockStore.deleteRemedy(id);
  invalidateAdminCache(['remedies', 'ailments']);
}

export function validateBatchDelete(remedyIds: string[]): { count: number; allowed: boolean } {
  if (!Array.isArray(remedyIds) || remedyIds.length === 0) {
    throw new Error('BATCH_ERROR: No remedy IDs specified for deletion.');
  }
  if (remedyIds.length > 20) {
    throw new Error(
      `BATCH_LIMIT_EXCEEDED: Cannot delete ${remedyIds.length} remedies at once. Max allowed batch is 20.`
    );
  }
  return { count: remedyIds.length, allowed: true };
}

export async function batchDeleteRemedies(ids: string[]): Promise<void> {
  validateBatchDelete(ids);
  for (const id of ids) {
    await deleteRemedy(id);
  }
}

// ==================== AILMENT CATEGORIES SERVICE ====================

export function getAilments(): AilmentCategory[] {
  return mockStore.getCategories();
}

export async function getAilmentsAsync(forceRefresh = false): Promise<AilmentCategory[]> {
  return cachedFetch<AilmentCategory[]>(
    'ailments',
    async () => {
      const db = getFirestoreDb();
      if (db && !isMockFallback) {
        try {
          const snap = await getDocs(collection(db, 'ailments'));
          if (!snap.empty) {
            const list = snap.docs.map((d) => ({ ...(d.data() as AilmentCategory), id: d.id as any }));
            return list.sort((a, b) => a.displayOrder - b.displayOrder);
          }
        } catch (err) {
          console.warn('Firestore getAilments failed; using store fallback:', err);
        }
      }
      return mockStore.getCategories();
    },
    forceRefresh
  );
}

export async function createAilment(
  data: Omit<AilmentCategory, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<AilmentCategory> {
  const cleanSlug = (data.slug || data.name || 'category')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `category-${Date.now()}`;

  const now = new Date().toISOString();
  const id = (data.id || cleanSlug) as AilmentCategory['id'];
  const newCategory: AilmentCategory = {
    ...data,
    id,
    slug: cleanSlug,
    urduName: data.urduName || data.name,
    romanName: data.romanName || data.name,
    tagline: data.tagline || '',
    description: data.description || data.tagline || '',
    iconIdentifier: data.iconIdentifier || 'leaf',
    bannerImage: data.bannerImage || '/images/hero-mortar-botanical.webp',
    displayOrder: Number.isFinite(data.displayOrder) ? data.displayOrder : 1,
    remedyCount: data.remedyCount ?? 0,
    isActive: data.isActive !== false,
    createdAt: now,
    updatedAt: now,
  };

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await setDoc(doc(db, 'ailments', id), stripUndefined(newCategory));
    } catch (err) {
      console.warn('Firestore createAilment failed:', err);
      throw err;
    }
  }

  invalidateAdminCache('ailments');
  if (typeof window !== 'undefined') {
    const storefrontBase = (process.env.NEXT_PUBLIC_STOREFRONT_URL || '').replace(/\/$/, '');
    if (storefrontBase) {
      void fetch(`${storefrontBase}/api/storefront?refresh=1`, { mode: 'no-cors' }).catch(() => {});
    }
  }
  const existing = mockStore.getCategories();
  if (existing.some((c) => c.id === id)) {
    return mockStore.updateCategory(id, newCategory);
  }
  return mockStore.addCategory(newCategory);
}

export async function updateAilment(
  id: string,
  updates: Partial<AilmentCategory>
): Promise<AilmentCategory> {
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await setDoc(
        doc(db, 'ailments', id),
        stripUndefined({
          ...updates,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore updateAilment failed:', err);
      throw err;
    }
  }

  invalidateAdminCache('ailments');
  if (typeof window !== 'undefined') {
    const storefrontBase = (process.env.NEXT_PUBLIC_STOREFRONT_URL || '').replace(/\/$/, '');
    if (storefrontBase) {
      void fetch(`${storefrontBase}/api/storefront?refresh=1`, { mode: 'no-cors' }).catch(() => {});
    }
  }
  return mockStore.updateCategory(id, updates);
}

// ==================== BANNERS SERVICE ====================

export async function getBanners(forceRefresh = false): Promise<PromotionalBanner[]> {
  return cachedFetch<PromotionalBanner[]>(
    'banners',
    async () => {
      const db = getFirestoreDb();
      if (db && !isMockFallback) {
        try {
          const colRef = collection(db, 'banners');
          const snapshot = await getDocs(colRef);
          if (!snapshot.empty) {
            return snapshot.docs
              .map((d) => ({ ...(d.data() as PromotionalBanner), id: d.id }))
              .sort((a, b) => (a.priorityOrder ?? 99) - (b.priorityOrder ?? 99));
          }
        } catch (err) {
          console.warn('Firestore getBanners failed; using store fallback:', err);
        }
      }
      return mockStore.getBanners();
    },
    forceRefresh
  );
}

export async function getBannerById(id: string): Promise<PromotionalBanner> {
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      const snap = await getDoc(doc(db, 'banners', id));
      if (snap.exists()) {
        return { ...(snap.data() as PromotionalBanner), id: snap.id };
      }
    } catch (err) {
      console.warn(`Firestore getBannerById("${id}") failed:`, err);
    }
  }

  const banner = mockStore.getBannerById(id);
  if (!banner) {
    throw new Error(`NOT_FOUND: Banner "${id}" does not exist.`);
  }
  return banner;
}

export async function createBanner(
  data: Partial<PromotionalBanner> & { endDate?: string }
): Promise<PromotionalBanner> {
  validateBannerPayload(data);

  const id = data.id || `banner-${Date.now()}`;
  const now = new Date().toISOString();

  const newBanner: PromotionalBanner = {
    id,
    headline: data.headline!.trim(),
    subheadline: data.subheadline || '',
    badgeText: data.badgeText || 'Classical Heritage',
    ctaText: data.ctaText || 'Explore',
    ctaLink: data.ctaLink || '/catalog',
    imageUrl: data.imageUrl || '',
    gradientOverlay: data.gradientOverlay || 'mauve-reserve',
    textAlignment: data.textAlignment || 'left',
    placement: data.placement || 'hero',
    isActive: data.isActive !== false,
    priorityOrder: data.priorityOrder ?? 1,
    createdAt: now,
    updatedAt: now,
  };

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    await setDoc(doc(db, 'banners', newBanner.id), stripUndefined(newBanner));
  }

  mockStore.addBanner(newBanner);
  invalidateAdminCache('banners');
  return newBanner;
}

export async function updateBanner(
  id: string,
  updates: Partial<PromotionalBanner> & { endDate?: string }
): Promise<PromotionalBanner> {
  const existing = await getBannerById(id);
  validateBannerPayload({ headline: updates.headline || existing.headline || 'Valid', ...updates });
  const merged = stripUndefined({
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    await setDoc(doc(db, 'banners', id), merged, { merge: true });
  }

  invalidateAdminCache('banners');
  try {
    return mockStore.updateBanner(id, updates);
  } catch {
    return merged as PromotionalBanner;
  }
}

export async function toggleBannerStatus(id: string, isActive: boolean): Promise<PromotionalBanner> {
  return updateBanner(id, { isActive });
}

export async function reorderBannersInStore(
  targetId: string,
  newPriority: number
): Promise<PromotionalBanner[]> {
  const currentBanners = await getBanners();
  const resequenced = resequenceBanners(currentBanners, targetId, newPriority);
  mockStore.setBanners(resequenced);

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    for (const b of resequenced) {
      try {
        await updateDoc(doc(db, 'banners', b.id), { priorityOrder: b.priorityOrder });
      } catch (_) {}
    }
  }

  invalidateAdminCache('banners');
  return resequenced;
}

export async function deleteBanner(id: string): Promise<void> {
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (err) {
      console.warn('Firestore deleteBanner failed:', err);
    }
  }
  mockStore.deleteBanner(id);
  invalidateAdminCache('banners');
}

// ==================== ORDERS SERVICE ====================

export async function getOrders(filter?: {
  status?: string;
  search?: string;
  forceRefresh?: boolean;
}): Promise<CustomerOrder[]> {
  let orders = await cachedFetch<CustomerOrder[]>(
    'orders',
    async () => {
      const db = getFirestoreDb();
      if (db && !isMockFallback) {
        try {
          const snapshot = await getDocs(collection(db, 'orders'));
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ ...(d.data() as CustomerOrder), id: d.id }));
            list.sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            return list;
          }
        } catch (err) {
          console.warn('Firestore getOrders failed; using store fallback:', err);
        }
      }
      return mockStore.getOrders();
    },
    filter?.forceRefresh
  );

  if (filter?.status && filter.status !== 'all') {
    orders = orders.filter((o) => o.orderStatus === filter.status);
  }

  if (filter?.search) {
    const term = filter.search.toLowerCase().trim();
    const compactTerm = term.replace(/[-\s]/g, '');
    const normalizedPhone = normalizeSearchPhone(term);

    orders = orders.filter((o) => {
      const matchesPhone =
        (normalizedPhone && normalizeSearchPhone(o.customerPhone).includes(normalizedPhone)) ||
        (o.customerPhone || '').toLowerCase().includes(term);
      const matchesOrderNumber =
        (o.orderNumber || '').toLowerCase().includes(term) ||
        (o.orderNumber || '').toLowerCase().replace(/[-\s]/g, '').includes(compactTerm);
      const matchesOrderId = (o.id || '').toLowerCase().includes(term);
      const matchesCustomerName = (o.customerName || '').toLowerCase().includes(term);
      const matchesEmail = (o.customerEmail || '').toLowerCase().includes(term);
      const matchesCity = (o.shippingAddress?.city || '').toLowerCase().includes(term);
      const matchesTracking = (o.trackingNumber || '').toLowerCase().includes(term);
      const matchesItem = (o.items || []).some((i) => (i.name || '').toLowerCase().includes(term));
      return (
        matchesPhone ||
        matchesOrderNumber ||
        matchesOrderId ||
        matchesCustomerName ||
        matchesEmail ||
        matchesCity ||
        matchesTracking ||
        matchesItem
      );
    });
  }

  return orders;
}

export async function getOrderById(id: string): Promise<CustomerOrder> {
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      const snap = await getDoc(doc(db, 'orders', id));
      if (snap.exists()) {
        return { ...(snap.data() as CustomerOrder), id: snap.id };
      }
    } catch (err) {
      console.warn(`Firestore getOrderById("${id}") failed:`, err);
    }
  }

  const order = mockStore.getOrderById(id);
  if (!order) {
    throw new Error(`NOT_FOUND: Order "${id}" does not exist.`);
  }
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus
): Promise<CustomerOrder> {
  const order = await getOrderById(orderId);
  validateStatusTransition(order.orderStatus, nextStatus);

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        orderStatus: nextStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore updateDoc order failed:', err);
    }
  }

  invalidateAdminCache(['orders', 'customers']);
  try {
    return mockStore.updateOrder(order.id, { orderStatus: nextStatus });
  } catch {
    return { ...order, orderStatus: nextStatus, updatedAt: new Date().toISOString() };
  }
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<CustomerOrder> {
  const order = await getOrderById(orderId);
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        paymentStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore update paymentStatus failed:', err);
    }
  }

  invalidateAdminCache(['orders', 'customers']);
  try {
    return mockStore.updateOrder(order.id, { paymentStatus });
  } catch {
    return { ...order, paymentStatus, updatedAt: new Date().toISOString() };
  }
}

export async function updateOrderFulfillment(
  orderId: string,
  updates: { trackingNumber?: string; courierName?: string; adminNotes?: string }
): Promise<CustomerOrder> {
  const order = await getOrderById(orderId);

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (_) {}
  }

  invalidateAdminCache('orders');
  try {
    return mockStore.updateOrder(order.id, updates);
  } catch {
    return { ...order, ...updates, updatedAt: new Date().toISOString() };
  }
}

// ==================== REVIEWS MODERATION SERVICE ====================

export async function getReviews(filter?: {
  status?: 'all' | 'approved' | 'pending';
  search?: string;
  forceRefresh?: boolean;
}): Promise<CustomerReview[]> {
  let reviews = await cachedFetch<CustomerReview[]>(
    'reviews',
    async () => {
      const db = getFirestoreDb();
      let list: CustomerReview[] = [];
      if (db && !isMockFallback) {
        try {
          const snap = await getDocs(collection(db, 'reviews'));
          if (!snap.empty) {
            list = snap.docs.map((d) => ({ ...(d.data() as CustomerReview), id: d.id }));
          } else {
            list = mockStore.getReviews();
          }
        } catch (err) {
          console.warn('Firestore getReviews failed; using store fallback:', err);
          list = mockStore.getReviews();
        }
      } else {
        list = mockStore.getReviews();
      }
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    },
    filter?.forceRefresh
  );

  if (filter?.status === 'approved') {
    reviews = reviews.filter((r) => r.approved);
  } else if (filter?.status === 'pending') {
    reviews = reviews.filter((r) => !r.approved);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    reviews = reviews.filter(
      (r) =>
        (r.remedyName || '').toLowerCase().includes(q) ||
        (r.remedyId || '').toLowerCase().includes(q) ||
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.title || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q)
    );
  }

  return reviews;
}

export async function moderateReview(
  reviewId: string,
  approved: boolean
): Promise<void> {
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { approved });
    } catch (err) {
      console.warn('Firestore moderateReview failed:', err);
    }
  }
  mockStore.updateReview(reviewId, { approved });
  invalidateAdminCache('reviews');
}

export async function deleteReview(reviewId: string): Promise<void> {
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      console.warn('Firestore deleteReview failed:', err);
    }
  }
  mockStore.deleteReview(reviewId);
  invalidateAdminCache('reviews');
}

// ==================== SUPPORT TICKETS SERVICE ====================

export async function getSupportTickets(filter?: {
  status?: 'all' | 'Open' | 'In Review' | 'Resolved';
  forceRefresh?: boolean;
}): Promise<SupportTicketRecord[]> {
  let tickets = await cachedFetch<SupportTicketRecord[]>(
    'supportTickets',
    async () => {
      const db = getFirestoreDb();
      let list: SupportTicketRecord[] = [];
      if (db && !isMockFallback) {
        try {
          const snap = await getDocs(collection(db, 'supportTickets'));
          if (!snap.empty) {
            list = snap.docs.map((d) => ({ ...(d.data() as SupportTicketRecord), id: d.id }));
          } else {
            list = mockStore.getTickets();
          }
        } catch (err) {
          console.warn('Firestore getSupportTickets failed; using store fallback:', err);
          list = mockStore.getTickets();
        }
      } else {
        list = mockStore.getTickets();
      }
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    },
    filter?.forceRefresh
  );

  if (filter?.status && filter.status !== 'all') {
    tickets = tickets.filter((t) => t.status === filter.status);
  }

  return tickets;
}

export async function updateSupportTicket(
  ticketId: string,
  updates: { status?: 'Open' | 'In Review' | 'Resolved'; adminReply?: string },
  customerId?: string
): Promise<void> {
  const now = new Date().toISOString();
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await setDoc(
        doc(db, 'supportTickets', ticketId),
        stripUndefined({ ...updates, updatedAt: now }),
        { merge: true }
      );
      if (customerId) {
        const custRef = doc(db, 'customers', customerId);
        const custSnap = await getDoc(custRef);
        if (custSnap.exists()) {
          const data = custSnap.data();
          if (Array.isArray(data.supportTickets)) {
            const nextTickets = data.supportTickets.map((t: any) =>
              t.id === ticketId ? { ...t, ...updates, updatedAt: now } : t
            );
            await updateDoc(custRef, { supportTickets: nextTickets });
          }
        }
      }
    } catch (err) {
      console.warn('Firestore updateSupportTicket failed:', err);
    }
  }
  mockStore.updateTicket(ticketId, updates);
  invalidateAdminCache(['supportTickets', 'customers']);
}

// ==================== CUSTOMERS DIRECTORY SERVICE ====================

export async function getCustomers(forceRefresh = false): Promise<CustomerProfile[]> {
  return cachedFetch<CustomerProfile[]>(
    'customers',
    async () => {
      const [orders, tickets] = await Promise.all([
        getOrders({ forceRefresh }),
        getSupportTickets({ forceRefresh }),
      ]);
      const map = new Map<string, CustomerProfile>();

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      const snap = await getDocs(collection(db, 'customers'));
      snap.forEach((docSnap) => {
        const d = docSnap.data() as Record<string, any>;
        const phone = d.phoneNumber || d.profile?.alternatePhone || '';
        const key = docSnap.id || phone;
        map.set(key, {
          id: docSnap.id,
          phoneNumber: phone || '—',
          fullName: d.fullName || d.profile?.fullName || 'Customer',
          email: d.email || d.profile?.email || '',
          savedAddresses: Array.isArray(d.savedAddresses) ? d.savedAddresses : [],
          totalOrdersCount: 0,
          lifetimeSpend: 0,
          supportTicketCount: Array.isArray(d.supportTickets) ? d.supportTickets.length : 0,
          createdAt: d.createdAt || d.lastActiveAt || new Date().toISOString(),
          lastActiveAt: d.lastActiveAt || new Date().toISOString(),
        });
      });
    } catch (err) {
      console.warn('Firestore getCustomers failed; aggregating from orders:', err);
    }
  }

  for (const order of orders) {
    const phoneKey = normalizeSearchPhone(order.customerPhone);
    let existing = map.get(order.customerId);
    if (!existing && phoneKey) {
      for (const entry of map.values()) {
        if (normalizeSearchPhone(entry.phoneNumber) === phoneKey) {
          existing = entry;
          break;
        }
      }
    }

    if (existing) {
      existing.totalOrdersCount += 1;
      existing.lifetimeSpend += order.totalAmount || 0;
      if (new Date(order.createdAt).getTime() > new Date(existing.lastActiveAt).getTime()) {
        existing.lastActiveAt = order.createdAt;
      }
      if (existing.savedAddresses.length === 0 && order.shippingAddress) {
        existing.savedAddresses = [
          {
            ...order.shippingAddress,
            id: `addr_${order.id}`,
            label: 'Checkout Address',
            isDefault: true,
          },
        ];
      }
    } else {
      const key = order.customerId !== 'guest' ? order.customerId : phoneKey || order.id;
      map.set(key, {
        id: key,
        phoneNumber: order.customerPhone,
        fullName: order.customerName,
        email: order.customerEmail,
        savedAddresses: order.shippingAddress
          ? [
              {
                ...order.shippingAddress,
                id: `addr_${order.id}`,
                label: 'Order Address',
                isDefault: true,
              },
            ]
          : [],
        totalOrdersCount: 1,
        lifetimeSpend: order.totalAmount || 0,
        supportTicketCount: tickets.filter(
          (t) =>
            t.customerId === order.customerId ||
            (t.customerPhone && normalizeSearchPhone(t.customerPhone) === phoneKey)
        ).length,
        createdAt: order.createdAt,
        lastActiveAt: order.createdAt,
      });
    }
  }

      return Array.from(map.values()).sort(
        (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      );
    },
    forceRefresh
  );
}

// ==================== DISPENSARY KPIS & ANALYTICS ====================

export async function getDispensaryKPIs(): Promise<DispensaryKPIs> {
  const [remedies, banners, orders, reviews, tickets, customers] = await Promise.all([
    getRemedies(),
    getBanners(),
    getOrders(),
    getReviews().catch(() => []),
    getSupportTickets().catch(() => []),
    getCustomers().catch(() => []),
  ]);

  const totalRemedies = remedies.length;
  const lowStockRemedies = remedies.filter((r) => r.stockQuantity <= 10 || !r.isAvailable).length;
  const activeBanners = banners.filter((b) => b.isActive).length;
  const pendingOrders = orders.filter((o) =>
    ['placed', 'confirmed', 'dispensing'].includes(o.orderStatus)
  ).length;
  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const openTickets = tickets.filter((t) => t.status !== 'Resolved').length;

  let totalRevenuePKR = 0;
  let totalRevenueUSD = 0;

  for (const o of orders) {
    if (o.orderStatus === 'cancelled') continue;
    if (o.currency === 'USD') {
      totalRevenueUSD += o.totalAmount;
    } else {
      totalRevenuePKR += o.totalAmount;
    }
  }

  return {
    totalRemedies,
    lowStockRemedies,
    activeBanners,
    pendingOrders,
    totalRevenuePKR,
    totalRevenueUSD,
    pendingReviews,
    openTickets,
    totalCustomers: customers.length,
  };
}

export async function getOrderTrendSeries(days = 7): Promise<OrderTrendPoint[]> {
  const orders = await getOrders();
  const points: OrderTrendPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() - i);
    const dateKey = dt.toISOString().slice(0, 10);
    const label = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const dayOrders = orders.filter((o) => (o.createdAt || '').slice(0, 10) === dateKey && o.orderStatus !== 'cancelled');
    const revenue = dayOrders.reduce((acc, o) => acc + (o.currency === 'USD' ? o.totalAmount * 84 : o.totalAmount), 0);

    points.push({
      label,
      dateKey,
      orders: dayOrders.length,
      revenue,
    });
  }

  return points;
}

export async function getAilmentById(id: string): Promise<AilmentCategory> {
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      const snap = await getDoc(doc(db, 'ailments', id));
      if (snap.exists()) {
        return { ...(snap.data() as AilmentCategory), id: snap.id as any };
      }
    } catch (err) {
      console.warn(`Firestore getAilmentById("${id}") notice:`, err);
    }
  }
  const all = mockStore.getCategories();
  const found = all.find((c) => c.id === id || c.slug === id);
  if (!found) {
    throw new Error(`NOT_FOUND: Category "${id}" does not exist.`);
  }
  return found;
}

export async function getSupportTicketById(id: string): Promise<SupportTicketRecord> {
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      const snap = await getDoc(doc(db, 'supportTickets', id));
      if (snap.exists()) {
        return { ...(snap.data() as SupportTicketRecord), id: snap.id };
      }
    } catch (err) {
      console.warn(`Firestore getSupportTicketById("${id}") notice:`, err);
    }
  }
  const tickets = await getSupportTickets();
  const found = tickets.find((t) => t.id === id);
  if (!found) {
    throw new Error(`NOT_FOUND: Support ticket "${id}" does not exist.`);
  }
  return found;
}

export async function getCustomerById(id: string): Promise<{
  profile: CustomerProfile;
  orders: CustomerOrder[];
  reviews: CustomerReview[];
  tickets: SupportTicketRecord[];
}> {
  const decodedId = decodeURIComponent(id);
  const [customers, allOrders, allReviews, allTickets] = await Promise.all([
    getCustomers(),
    getOrders(),
    getReviews().catch(() => []),
    getSupportTickets().catch(() => []),
  ]);

  const profile = customers.find((c) => c.id === decodedId || c.id === id);
  if (!profile) {
    throw new Error(`NOT_FOUND: Customer "${decodedId}" does not exist.`);
  }

  const normPhone = normalizeSearchPhone(profile.phoneNumber);
  const orders = allOrders.filter(
    (o) =>
      o.customerId === profile.id ||
      (normPhone && normalizeSearchPhone(o.customerPhone) === normPhone)
  );
  const reviews = allReviews.filter(
    (r) =>
      r.customerId === profile.id ||
      (normPhone && r.customerPhone && normalizeSearchPhone(r.customerPhone) === normPhone)
  );
  const tickets = allTickets.filter(
    (t) =>
      t.customerId === profile.id ||
      (normPhone && t.customerPhone && normalizeSearchPhone(t.customerPhone) === normPhone)
  );

  return { profile, orders, reviews, tickets };
}
