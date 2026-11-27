import {
  HerbalRemedy,
  PromotionalBanner,
  CustomerOrder,
  AilmentCategory,
  CustomerReview,
  SupportTicketRecord,
  CustomerProfile,
} from './types';
import seedData from './seed-data.json';

const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'ord_saharanpur_1001',
    orderNumber: 'IFA202610001',
    customerId: 'cust_user_01',
    customerName: 'Zaid Farooqui',
    customerPhone: '+919845757272',
    customerEmail: 'zaid.farooqui@example.in',
    shippingAddress: {
      recipientName: 'Zaid Farooqui',
      streetAddress: '42 Hakikat Nagar, Near Clock Tower',
      city: 'Saharanpur',
      stateProvince: 'Uttar Pradesh',
      postalCode: '247001',
      country: 'India',
    },
    items: [
      {
        remedyId: 'jawarish-kamuni-kabir',
        sku: 'IFA-HAZ-001',
        name: 'Jawarish Kamuni Kabir',
        urduName: 'جوارش کمونی کبیر',
        unitPrice: 1250,
        quantity: 2,
        totalPrice: 2500,
        image: '/images/remedies/jawarish-kamuni-kabir.jpg',
      },
      {
        remedyId: 'sharbat-toot-siah',
        sku: 'IFA-SUA-001',
        name: 'Sharbat Toot Siah',
        urduName: 'شربت توت سیاہ',
        unitPrice: 650,
        quantity: 1,
        totalPrice: 650,
        image: '/images/remedies/sharbat-toot-siah.jpg',
      },
    ],
    subtotal: 3150,
    shippingFee: 120,
    discount: 0,
    totalAmount: 3270,
    currency: 'PKR',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    orderStatus: 'placed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord_delhi_1002',
    orderNumber: 'IFA202610002',
    customerId: 'cust_user_02',
    customerName: 'Amina Siddiqui',
    customerPhone: '+919811234567',
    customerEmail: 'amina.s@example.in',
    shippingAddress: {
      recipientName: 'Amina Siddiqui',
      streetAddress: 'B-18 Nizamuddin West',
      city: 'New Delhi',
      stateProvince: 'Delhi',
      postalCode: '110013',
      country: 'India',
    },
    items: [
      {
        remedyId: 'majun-shabab-awar',
        sku: 'IFA-MUQ-001',
        name: 'Majun Shabab Awar',
        urduName: 'معجون شباب آور',
        unitPrice: 1850,
        quantity: 1,
        totalPrice: 1850,
        image: '/images/remedies/majun-shabab-awar.jpg',
      },
      {
        remedyId: 'khamira-marwareed',
        sku: 'IFA-QUD-001',
        name: 'Khamira Marwareed Khas',
        urduName: 'خمیرہ مروارید خاص',
        unitPrice: 2200,
        quantity: 1,
        totalPrice: 2200,
        image: '/images/remedies/khamira-marwareed.jpg',
      },
    ],
    subtotal: 4050,
    shippingFee: 0,
    discount: 0,
    totalAmount: 4050,
    currency: 'PKR',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'verified',
    orderStatus: 'confirmed',
    courierName: 'Delhivery Express',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord_lucknow_1003',
    orderNumber: 'IFA202610003',
    customerId: 'cust_user_03',
    customerName: 'Imran Qureshi',
    customerPhone: '+919935112233',
    customerEmail: 'imran.q@example.in',
    shippingAddress: {
      recipientName: 'Imran Qureshi',
      streetAddress: '14 Chowk Kotwali Road',
      city: 'Lucknow',
      stateProvince: 'Uttar Pradesh',
      postalCode: '226003',
      country: 'India',
    },
    items: [
      {
        remedyId: 'jawarish-kamuni-kabir',
        sku: 'IFA-HAZ-001',
        name: 'Jawarish Kamuni Kabir',
        urduName: 'جوارش کمونی کبیر',
        unitPrice: 1250,
        quantity: 1,
        totalPrice: 1250,
        image: '/images/remedies/jawarish-kamuni-kabir.jpg',
      },
    ],
    subtotal: 1250,
    shippingFee: 120,
    discount: 0,
    totalAmount: 1370,
    currency: 'PKR',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'verified',
    orderStatus: 'delivered',
    courierName: 'BlueDart Surface',
    trackingNumber: 'BD-88291044',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev_initial_01',
    remedyId: 'jawarish-kamuni-kabir',
    remedySlug: 'jawarish-kamuni-kabir',
    remedyName: 'Jawarish Kamuni Kabir',
    remedyImage: '/images/remedies/jawarish-kamuni-kabir.jpg',
    customerId: 'cust_user_03',
    customerName: 'Imran Qureshi',
    customerPhone: '+919935112233',
    rating: 5,
    title: 'Reliable relief after heavy meals',
    comment: 'Clean glass jar seal and authentic aroma of roasted caraway and ginger.',
    verifiedPurchase: true,
    approved: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev_initial_02',
    remedyId: 'khamira-marwareed',
    remedySlug: 'khamira-marwareed',
    remedyName: 'Khamira Marwareed Khas',
    remedyImage: '/images/remedies/khamira-marwareed.jpg',
    customerId: 'cust_user_02',
    customerName: 'Amina Siddiqui',
    customerPhone: '+919811234567',
    rating: 5,
    title: 'Pure consistency and prompt packing',
    comment: 'Prepared cleanly in small batch without any synthetic scent.',
    verifiedPurchase: true,
    approved: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_TICKETS: SupportTicketRecord[] = [
  {
    id: 'SUP-482910',
    customerId: 'cust_user_01',
    customerName: 'Zaid Farooqui',
    customerPhone: '+919845757272',
    category: 'Order Status & Tracking',
    orderNumber: 'IFA-2026-1001',
    subject: 'Same-day Saharanpur pickup inquiry',
    message: 'Can I collect my sealed parcel directly from the Saharanpur dispensary counter today evening?',
    status: 'Open',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

class MockDispensaryStore {
  private remedies: HerbalRemedy[] = [];
  private banners: PromotionalBanner[] = [];
  private orders: CustomerOrder[] = [];
  private categories: AilmentCategory[] = [];
  private reviews: CustomerReview[] = [];
  private tickets: SupportTicketRecord[] = [];
  private customers: CustomerProfile[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    if (typeof window !== 'undefined') {
      try {
        const storedRemedies = localStorage.getItem('ifaqa_mock_remedies');
        const storedBanners = localStorage.getItem('ifaqa_mock_banners');
        const storedOrders = localStorage.getItem('ifaqa_mock_orders');
        const storedCategories = localStorage.getItem('ifaqa_mock_categories');
        const storedReviews = localStorage.getItem('ifaqa_mock_reviews');
        const storedTickets = localStorage.getItem('ifaqa_mock_tickets');
        const storedCustomers = localStorage.getItem('ifaqa_mock_customers');

        if (storedRemedies) this.remedies = JSON.parse(storedRemedies);
        if (storedBanners) this.banners = JSON.parse(storedBanners);
        if (storedOrders) this.orders = JSON.parse(storedOrders);
        if (storedCategories) this.categories = JSON.parse(storedCategories);
        if (storedReviews) this.reviews = JSON.parse(storedReviews);
        if (storedTickets) this.tickets = JSON.parse(storedTickets);
        if (storedCustomers) this.customers = JSON.parse(storedCustomers);
      } catch (e) {
        console.warn('Could not read mock store from localStorage:', e);
      }
    }

    if (this.remedies.length === 0) {
      this.remedies = (seedData.remedies as unknown) as HerbalRemedy[];
    }
    if (this.banners.length === 0) {
      this.banners = (seedData.banners as unknown) as PromotionalBanner[];
    }
    if (this.orders.length === 0) {
      this.orders = [...INITIAL_ORDERS];
    }
    if (this.categories.length === 0) {
      this.categories = (seedData.categories as unknown) as AilmentCategory[];
    }
    if (this.reviews.length === 0) {
      this.reviews = [...INITIAL_REVIEWS];
    }
    if (this.tickets.length === 0) {
      this.tickets = [...INITIAL_TICKETS];
    }

    this.initialized = true;
    this.persist();
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ifaqa_mock_remedies', JSON.stringify(this.remedies));
        localStorage.setItem('ifaqa_mock_banners', JSON.stringify(this.banners));
        localStorage.setItem('ifaqa_mock_orders', JSON.stringify(this.orders));
        localStorage.setItem('ifaqa_mock_categories', JSON.stringify(this.categories));
        localStorage.setItem('ifaqa_mock_reviews', JSON.stringify(this.reviews));
        localStorage.setItem('ifaqa_mock_tickets', JSON.stringify(this.tickets));
        localStorage.setItem('ifaqa_mock_customers', JSON.stringify(this.customers));
      } catch (_) {}
    }
  }

  // Remedies
  public getRemedies(): HerbalRemedy[] {
    return [...this.remedies];
  }

  public getRemedyById(id: string): HerbalRemedy | undefined {
    return this.remedies.find((r) => r.id === id || r.slug === id);
  }

  public addRemedy(remedy: HerbalRemedy): HerbalRemedy {
    this.remedies.unshift(remedy);
    this.persist();
    return remedy;
  }

  public updateRemedy(id: string, updates: Partial<HerbalRemedy>): HerbalRemedy {
    const idx = this.remedies.findIndex((r) => r.id === id || r.slug === id);
    if (idx === -1) {
      throw new Error(`NOT_FOUND: Remedy "${id}" does not exist.`);
    }
    this.remedies[idx] = {
      ...this.remedies[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.remedies[idx];
  }

  public deleteRemedy(id: string): void {
    const idx = this.remedies.findIndex((r) => r.id === id || r.slug === id);
    if (idx !== -1) {
      this.remedies.splice(idx, 1);
      this.persist();
    }
  }

  // Banners
  public getBanners(): PromotionalBanner[] {
    return [...this.banners].sort((a, b) => a.priorityOrder - b.priorityOrder);
  }

  public getBannerById(id: string): PromotionalBanner | undefined {
    return this.banners.find((b) => b.id === id);
  }

  public addBanner(banner: PromotionalBanner): PromotionalBanner {
    this.banners.push(banner);
    this.persist();
    return banner;
  }

  public updateBanner(id: string, updates: Partial<PromotionalBanner>): PromotionalBanner {
    const idx = this.banners.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new Error(`NOT_FOUND: Banner "${id}" does not exist.`);
    }
    this.banners[idx] = {
      ...this.banners[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.banners[idx];
  }

  public deleteBanner(id: string): void {
    const idx = this.banners.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.banners.splice(idx, 1);
      this.persist();
    }
  }

  public setBanners(banners: PromotionalBanner[]): void {
    this.banners = banners;
    this.persist();
  }

  // Orders
  public getOrders(): CustomerOrder[] {
    return [...this.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderById(id: string): CustomerOrder | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public updateOrder(id: string, updates: Partial<CustomerOrder>): CustomerOrder {
    const idx = this.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx === -1) {
      throw new Error(`NOT_FOUND: Order "${id}" does not exist.`);
    }
    this.orders[idx] = {
      ...this.orders[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.orders[idx];
  }

  // Categories
  public getCategories(): AilmentCategory[] {
    return [...this.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addCategory(cat: AilmentCategory): AilmentCategory {
    this.categories.push(cat);
    this.persist();
    return cat;
  }

  public updateCategory(id: string, updates: Partial<AilmentCategory>): AilmentCategory {
    const idx = this.categories.findIndex((c) => c.id === id || c.slug === id);
    if (idx === -1) {
      throw new Error(`NOT_FOUND: Category "${id}" does not exist.`);
    }
    this.categories[idx] = {
      ...this.categories[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.categories[idx];
  }

  // Reviews
  public getReviews(): CustomerReview[] {
    return [...this.reviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateReview(id: string, updates: Partial<CustomerReview>): CustomerReview | null {
    const idx = this.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.reviews[idx] = { ...this.reviews[idx], ...updates };
    this.persist();
    return this.reviews[idx];
  }

  public deleteReview(id: string): void {
    this.reviews = this.reviews.filter((r) => r.id !== id);
    this.persist();
  }

  // Support Tickets
  public getTickets(): SupportTicketRecord[] {
    return [...this.tickets].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateTicket(
    id: string,
    updates: Partial<SupportTicketRecord>
  ): SupportTicketRecord | null {
    const idx = this.tickets.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.tickets[idx] = {
      ...this.tickets[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.tickets[idx];
  }

  // Customers
  public getCustomers(): CustomerProfile[] {
    return [...this.customers];
  }
}

export const mockStore = new MockDispensaryStore();
