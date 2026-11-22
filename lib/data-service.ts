import {
  HerbalRemedy,
  PromotionalBanner,
  CustomerOrder,
  OrderStatus,
  AilmentCategory,
  DispensaryKPIs
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
  orderBy
} from 'firebase/firestore';

// Allowed forward-only state machine transitions
const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['dispensing', 'cancelled'],
  dispensing: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
};

export function validateStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
  if (currentStatus === nextStatus) return true;
  const validNext = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!validNext || !validNext.includes(nextStatus)) {
    throw new Error(`INVALID_STATUS_TRANSITION: Cannot transition order status from "${currentStatus}" to "${nextStatus}".`);
  }
  return true;
}

export function normalizeSearchPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('03')) {
    return '+92' + clean.slice(1);
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
  if (banner.priorityOrder !== undefined && (typeof banner.priorityOrder !== 'number' || banner.priorityOrder < 0)) {
    throw new Error(`BANNER_ERROR: priorityOrder must be non-negative number, got ${banner.priorityOrder}`);
  }
  if (banner.endDate && new Date(banner.endDate).getTime() < Date.now()) {
    throw new Error('BANNER_ERROR: Cannot schedule a promotional banner with an expired end-date in the past.');
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
  if (typeof payload.pricePKR !== 'number' || payload.pricePKR <= 0 || typeof payload.priceUSD !== 'number' || payload.priceUSD <= 0) {
    throw new Error('VALIDATION_ERROR: Prices must be positive numbers');
  }
  if (!Array.isArray(payload.herbalIngredients) || payload.herbalIngredients.length === 0) {
    throw new Error('VALIDATION_ERROR: Must include at least one herbal ingredient');
  }
  return true;
}

// Resequence banners deterministically
export function resequenceBanners(existingBanners: PromotionalBanner[], targetBannerId: string, newPriority: number): PromotionalBanner[] {
  const target = existingBanners.find(b => b.id === targetBannerId);
  if (!target) return existingBanners;

  const filtered = existingBanners.filter(b => b.id !== targetBannerId);
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

  // Re-index to ensure strictly increasing priorities
  return result.map((b, idx) => ({ ...b, priorityOrder: idx + 1 }));
}

// ==================== REMEDIES SERVICE ====================

export async function getRemedies(filter?: {
  categoryId?: string;
  search?: string;
  stockFilter?: string;
}): Promise<HerbalRemedy[]> {
  const db = getFirestoreDb();
  let remedies: HerbalRemedy[] = [];

  if (db && !isMockFallback) {
    try {
      const colRef = collection(db, 'remedies');
      const q = filter?.categoryId
        ? query(colRef, where('categoryId', '==', filter.categoryId), orderBy('pricePKR', 'desc'))
        : query(colRef, orderBy('pricePKR', 'desc'));
      const snapshot = await getDocs(q);
      remedies = snapshot.docs.map(d => ({ ...(d.data() as HerbalRemedy), id: d.id }));
    } catch (err) {
      console.warn('Firestore getRemedies failed; using mock store fallback:', err);
      remedies = mockStore.getRemedies();
    }
  } else {
    remedies = mockStore.getRemedies();
  }

  // Apply filters in memory
  if (filter?.categoryId) {
    remedies = remedies.filter(r => r.categoryId === filter.categoryId);
  }

  if (filter?.search) {
    const term = filter.search.toLowerCase().trim();
    remedies = remedies.filter(r =>
      r.name.toLowerCase().includes(term) ||
      r.urduName.includes(term) ||
      r.romanUrduName.toLowerCase().includes(term) ||
      r.sku.toLowerCase().includes(term)
    );
  }

  if (filter?.stockFilter) {
    if (filter.stockFilter === 'low') {
      remedies = remedies.filter(r => r.stockQuantity > 0 && r.stockQuantity <= 10);
    } else if (filter.stockFilter === 'out') {
      remedies = remedies.filter(r => r.stockQuantity === 0);
    } else if (filter.stockFilter === 'inactive') {
      remedies = remedies.filter(r => !r.isAvailable);
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
      console.warn(`Firestore getRemedyById("${id}") failed:`, err);
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

  // Check unique SKU
  const existingRemedies = await getRemedies();
  const duplicate = existingRemedies.find(r => r.sku.toUpperCase() === data.sku?.toUpperCase());
  if (duplicate) {
    throw new Error(`CONFLICT_ERROR: Remedy with SKU "${data.sku}" already exists.`);
  }

  const id = data.id || data.slug || data.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
      anupana: 'Water',
      contraindications: []
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
    images: data.images && data.images.length > 0 ? data.images : ['/images/remedies/placeholder.jpg'],
    primaryImage: data.primaryImage || data.images?.[0] || '/images/remedies/placeholder.jpg',
    createdAt: now,
    updatedAt: now
  };

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await setDoc(doc(db, 'remedies', newRemedy.id), newRemedy);
    } catch (err) {
      console.warn('Firestore setDoc failed; updating mock store:', err);
    }
  }

  mockStore.addRemedy(newRemedy);
  return newRemedy;
}

export async function updateRemedy(id: string, updates: Partial<HerbalRemedy>): Promise<HerbalRemedy> {
  // Check existence
  await getRemedyById(id);

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await updateDoc(doc(db, 'remedies', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore updateDoc failed; updating mock store:', err);
    }
  }

  return mockStore.updateRemedy(id, updates);
}

export async function deleteRemedy(id: string): Promise<void> {
  // Safety check: Cannot delete remedy referenced in active orders
  const orders = await getOrders();
  const activeOrderStatuses: OrderStatus[] = ['placed', 'confirmed', 'dispensing', 'dispatched'];

  let hasActiveOrder = false;
  for (const ord of orders) {
    if (activeOrderStatuses.includes(ord.orderStatus)) {
      if (ord.items && ord.items.some(item => item.remedyId === id)) {
        hasActiveOrder = true;
        break;
      }
    }
  }

  if (hasActiveOrder) {
    throw new Error(`SAFETY_LOCK: Cannot delete remedy "${id}" with pending customer orders. Deactivate remedy instead.`);
  }

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await deleteDoc(doc(db, 'remedies', id));
    } catch (err) {
      console.warn('Firestore deleteDoc failed; deleting from mock store:', err);
    }
  }

  mockStore.deleteRemedy(id);
}

export function validateBatchDelete(remedyIds: string[]): { count: number; allowed: boolean } {
  if (!Array.isArray(remedyIds) || remedyIds.length === 0) {
    throw new Error('BATCH_ERROR: No remedy IDs specified for deletion.');
  }
  if (remedyIds.length > 20) {
    throw new Error(`BATCH_LIMIT_EXCEEDED: Cannot delete ${remedyIds.length} remedies at once. Max allowed batch is 20.`);
  }
  return { count: remedyIds.length, allowed: true };
}

export async function batchDeleteRemedies(ids: string[]): Promise<void> {
  validateBatchDelete(ids);
  for (const id of ids) {
    await deleteRemedy(id);
  }
}

// ==================== BANNERS SERVICE ====================

export async function getBanners(): Promise<PromotionalBanner[]> {
  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      const colRef = collection(db, 'banners');
      const q = query(colRef, orderBy('priorityOrder', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...(d.data() as PromotionalBanner), id: d.id }));
    } catch (err) {
      console.warn('Firestore getBanners failed; using mock store fallback:', err);
    }
  }
  return mockStore.getBanners();
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

export async function createBanner(data: Partial<PromotionalBanner> & { endDate?: string }): Promise<PromotionalBanner> {
  validateBannerPayload(data);

  const id = data.id || `banner-${Date.now()}`;
  const now = new Date().toISOString();

  const newBanner: PromotionalBanner = {
    id,
    headline: data.headline!.trim(),
    subheadline: data.subheadline || '',
    badgeText: data.badgeText || 'Exclusive',
    ctaText: data.ctaText || 'Explore',
    ctaLink: data.ctaLink || '/catalog',
    imageUrl: data.imageUrl || '',
    gradientOverlay: data.gradientOverlay || 'mauve-reserve',
    textAlignment: data.textAlignment || 'left',
    placement: data.placement || 'hero',
    isActive: data.isActive !== false,
    priorityOrder: data.priorityOrder ?? 1,
    createdAt: now,
    updatedAt: now
  };

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await setDoc(doc(db, 'banners', newBanner.id), newBanner);
    } catch (err) {
      console.warn('Firestore setDoc banner failed:', err);
    }
  }

  mockStore.addBanner(newBanner);
  return newBanner;
}

export async function updateBanner(id: string, updates: Partial<PromotionalBanner> & { endDate?: string }): Promise<PromotionalBanner> {
  await getBannerById(id);
  validateBannerPayload({ headline: updates.headline || 'Valid', ...updates });

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await updateDoc(doc(db, 'banners', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore updateDoc banner failed:', err);
    }
  }

  return mockStore.updateBanner(id, updates);
}

export async function toggleBannerStatus(id: string, isActive: boolean): Promise<PromotionalBanner> {
  return updateBanner(id, { isActive });
}

export async function reorderBannersInStore(targetId: string, newPriority: number): Promise<PromotionalBanner[]> {
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
}

// ==================== ORDERS SERVICE ====================

export async function getOrders(filter?: { status?: string; search?: string }): Promise<CustomerOrder[]> {
  const db = getFirestoreDb();
  let orders: CustomerOrder[] = [];

  if (db && !isMockFallback) {
    try {
      const colRef = collection(db, 'orders');
      const q = filter?.status && filter.status !== 'all'
        ? query(colRef, where('orderStatus', '==', filter.status), orderBy('createdAt', 'desc'))
        : query(colRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      orders = snapshot.docs.map(d => ({ ...(d.data() as CustomerOrder), id: d.id }));
    } catch (err) {
      console.warn('Firestore getOrders failed; using mock store fallback:', err);
      orders = mockStore.getOrders();
    }
  } else {
    orders = mockStore.getOrders();
  }

  // In-memory filters
  if (filter?.status && filter.status !== 'all') {
    orders = orders.filter(o => o.orderStatus === filter.status);
  }

  if (filter?.search) {
    const term = filter.search.toLowerCase().trim();
    const normalizedPhone = normalizeSearchPhone(term);

    orders = orders.filter(o => {
      const matchesPhone = normalizedPhone && normalizeSearchPhone(o.customerPhone).includes(normalizedPhone);
      const matchesOrderNumber = o.orderNumber.toLowerCase().includes(term);
      const matchesCustomerName = o.customerName.toLowerCase().includes(term);
      return matchesPhone || matchesOrderNumber || matchesCustomerName;
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

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus): Promise<CustomerOrder> {
  const order = await getOrderById(orderId);
  validateStatusTransition(order.orderStatus, nextStatus);

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        orderStatus: nextStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore updateDoc order failed:', err);
    }
  }

  return mockStore.updateOrder(order.id, { orderStatus: nextStatus });
}

export async function updateOrderFulfillment(
  orderId: string,
  updates: { trackingNumber?: string; courierName?: string; adminNotes?: string }
): Promise<CustomerOrder> {
  await getOrderById(orderId);

  const db = getFirestoreDb();
  if (db && !isMockFallback) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (_) {}
  }

  return mockStore.updateOrder(orderId, updates);
}

// ==================== DISPENSARY KPIS & AILMENTS ====================

export async function getDispensaryKPIs(): Promise<DispensaryKPIs> {
  const remedies = await getRemedies();
  const banners = await getBanners();
  const orders = await getOrders();

  const totalRemedies = remedies.length;
  const lowStockRemedies = remedies.filter(r => r.stockQuantity <= 10).length;
  const activeBanners = banners.filter(b => b.isActive).length;
  const pendingOrders = orders.filter(o => ['placed', 'confirmed', 'dispensing'].includes(o.orderStatus)).length;

  let totalRevenuePKR = 0;
  let totalRevenueUSD = 0;

  for (const o of orders) {
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
    totalRevenueUSD
  };
}

export function getAilments(): AilmentCategory[] {
  return mockStore.getCategories();
}
