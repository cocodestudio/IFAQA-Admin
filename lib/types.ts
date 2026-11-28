/**
 * IFAQA Herbal Remedies — Shared Domain Models & Schema Contracts
 * Location: admin/lib/types.ts
 */

// --- Classical Unani Pharmaceutical Forms ---
export type RemedyForm =
  | 'Majun'
  | 'Safoof'
  | 'Sharbat'
  | 'Arq'
  | 'Hab'
  | 'Khamira'
  | 'Kushta'
  | 'Raughan'
  | 'Marham';

// --- Botanical Ingredient Interface ---
export interface HerbalIngredient {
  botanicalName: string;
  commonName: string;
  partUsed: string;
  proportion: string;
}

// --- Dosage Instructions Interface ---
export interface DosageInstructions {
  amount: string;
  timing: string;
  anupana: string;
  contraindications: string[];
}

// --- Packaging Specifications ---
export interface RemedyPackaging {
  size: string;
  containerType: string;
}

// --- Master Herbal Remedy Contract ---
export interface HerbalRemedy {
  id: string;
  sku: string;
  name: string;
  urduName: string;
  romanUrduName: string;
  slug: string;
  categoryId: AilmentCategoryId;
  categoryName: string;
  shortDescription: string;
  longDescription: string;
  therapeuticIndications: string[];
  herbalIngredients: HerbalIngredient[];
  dosageInstructions: DosageInstructions;
  form: RemedyForm;
  packaging: RemedyPackaging;
  pricePKR: number;
  comparePricePKR?: number;
  priceUSD: number;
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  primaryImage: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Ailment Category IDs ---
export type AilmentCategoryId =
  | 'hazim'
  | 'muqawwi'
  | 'sual'
  | 'mafasil'
  | 'jild'
  | 'quwwat-e-mudafiat';

// --- Ailment Category Contract ---
export interface AilmentCategory {
  id: AilmentCategoryId | (string & {});
  name: string;
  urduName: string;
  romanName: string;
  slug: string;
  tagline: string;
  description: string;
  iconIdentifier: string;
  bannerImage: string;
  displayOrder: number;
  remedyCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Promotional Hero Banners Contract ---
export type BannerPlacement = 'hero' | 'announcement_bar' | 'mid_page_feature';
export type BannerGradient = 'mauve-reserve' | 'steel-night' | 'none';
export type BannerTextAlignment = 'left' | 'center' | 'right';

export interface PromotionalBanner {
  id: string;
  headline: string;
  subheadline: string;
  badgeText: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  gradientOverlay: BannerGradient;
  textAlignment: BannerTextAlignment;
  placement: BannerPlacement;
  isActive: boolean;
  priorityOrder: number;
  startsAt?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Customer Order Item Contract ---
export interface OrderItem {
  remedyId: string;
  sku: string;
  name: string;
  urduName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image: string;
  size?: string;
}

// --- Shipping Address Contract ---
export interface ShippingAddress {
  recipientName: string;
  streetAddress: string;
  apartmentSuite?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  deliveryInstructions?: string;
}

// --- Order Lifecycle & Payment Status ---
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'dispensing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'cash_on_delivery'
  | 'bank_transfer'
  | 'credit_card';

export type PaymentStatus =
  | 'pending'
  | 'verified'
  | 'failed'
  | 'refunded';

// --- Master Customer Order Contract ---
export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  currency: 'PKR' | 'USD';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Customer Profile Contract ---
export interface SavedAddress extends ShippingAddress {
  id: string;
  label: string;
  isDefault: boolean;
  phone?: string;
}

export interface CustomerProfile {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  savedAddresses: SavedAddress[];
  totalOrdersCount: number;
  lifetimeSpend: number;
  supportTicketCount?: number;
  createdAt: string;
  lastActiveAt: string;
}

// --- Customer Review Contract ---
export interface CustomerReview {
  id: string;
  remedyId: string;
  remedySlug?: string;
  remedyName?: string;
  remedyImage?: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: string;
}

// --- Customer Support Ticket Contract ---
export interface SupportTicketRecord {
  id: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  category: string;
  orderNumber?: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Review' | 'Resolved';
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

// --- Admin System User Contract ---
export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'chief_hakeem' | 'dispensary_staff';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface DispensaryKPIs {
  totalRemedies: number;
  lowStockRemedies: number;
  activeBanners: number;
  pendingOrders: number;
  totalRevenuePKR: number;
  totalRevenueUSD: number;
  pendingReviews?: number;
  openTickets?: number;
  totalCustomers?: number;
}

export interface OrderTrendPoint {
  label: string;
  dateKey: string;
  orders: number;
  revenue: number;
}

export interface AdminSession {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  phoneNumber?: string;
  tokenExpiresAt?: number;
}
