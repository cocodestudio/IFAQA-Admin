import { HerbalRemedy, PromotionalBanner, CustomerOrder, AilmentCategory } from './types';
import seedData from './seed-data.json';

const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'ord_lahore_1001',
    orderNumber: 'IFA-2026-1001',
    customerId: 'cust_user_01',
    customerName: 'Muhammad Salman Khan',
    customerPhone: '+923001234567',
    customerEmail: 'salman.khan@example.com',
    shippingAddress: {
      recipientName: 'Muhammad Salman Khan',
      streetAddress: 'House 42, Sector Y, Phase 3, DHA',
      city: 'Lahore',
      stateProvince: 'Punjab',
      postalCode: '54000',
      country: 'Pakistan'
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
        image: '/images/remedies/jawarish-kamuni-kabir.jpg'
      },
      {
        remedyId: 'sharbat-toot-siah',
        sku: 'IFA-SUA-001',
        name: 'Sharbat Toot Siah',
        urduName: 'شربت توت سیاہ',
        unitPrice: 650,
        quantity: 1,
        totalPrice: 650,
        image: '/images/remedies/sharbat-toot-siah.jpg'
      }
    ],
    subtotal: 3150,
    shippingFee: 250,
    discount: 0,
    totalAmount: 3400,
    currency: 'PKR',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    orderStatus: 'placed',
    createdAt: '2026-11-21T10:30:00Z',
    updatedAt: '2026-11-21T10:30:00Z'
  },
  {
    id: 'ord_london_1002',
    orderNumber: 'IFA-2026-1002',
    customerId: 'cust_user_02',
    customerName: 'Amina Begum',
    customerPhone: '+447911123456',
    customerEmail: 'amina.b@example.co.uk',
    shippingAddress: {
      recipientName: 'Amina Begum',
      streetAddress: 'Flat 4B, 18 Kensington Gardens Square',
      city: 'London',
      stateProvince: 'Greater London',
      postalCode: 'W2 4BH',
      country: 'United Kingdom'
    },
    items: [
      {
        remedyId: 'majun-shabab-awar',
        sku: 'IFA-MUQ-001',
        name: 'Majun Shabab Awar',
        urduName: 'معجون شباب آور',
        unitPrice: 39.99,
        quantity: 1,
        totalPrice: 39.99,
        image: '/images/remedies/majun-shabab-awar.jpg'
      },
      {
        remedyId: 'khamira-marwareed',
        sku: 'IFA-QUD-001',
        name: 'Khamira Marwareed Khas',
        urduName: 'خمیرہ مروارید خاص',
        unitPrice: 49.99,
        quantity: 1,
        totalPrice: 49.99,
        image: '/images/remedies/khamira-marwareed.jpg'
      }
    ],
    subtotal: 89.98,
    shippingFee: 15.00,
    discount: 0,
    totalAmount: 104.98,
    currency: 'USD',
    paymentMethod: 'credit_card',
    paymentStatus: 'verified',
    orderStatus: 'confirmed',
    createdAt: '2026-11-20T14:15:00Z',
    updatedAt: '2026-11-21T09:00:00Z'
  }
];

class MockDispensaryStore {
  private remedies: HerbalRemedy[] = [];
  private banners: PromotionalBanner[] = [];
  private orders: CustomerOrder[] = [];
  private categories: AilmentCategory[] = [];
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

        if (storedRemedies) this.remedies = JSON.parse(storedRemedies);
        if (storedBanners) this.banners = JSON.parse(storedBanners);
        if (storedOrders) this.orders = JSON.parse(storedOrders);
        if (storedCategories) this.categories = JSON.parse(storedCategories);
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
      } catch (_) {}
    }
  }

  // Remedies
  public getRemedies(): HerbalRemedy[] {
    return [...this.remedies];
  }

  public getRemedyById(id: string): HerbalRemedy | undefined {
    return this.remedies.find(r => r.id === id || r.slug === id);
  }

  public addRemedy(remedy: HerbalRemedy): HerbalRemedy {
    this.remedies.unshift(remedy);
    this.persist();
    return remedy;
  }

  public updateRemedy(id: string, updates: Partial<HerbalRemedy>): HerbalRemedy {
    const idx = this.remedies.findIndex(r => r.id === id || r.slug === id);
    if (idx === -1) {
      throw new Error(`NOT_FOUND: Remedy "${id}" does not exist.`);
    }
    this.remedies[idx] = {
      ...this.remedies[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.remedies[idx];
  }

  public deleteRemedy(id: string): void {
    const idx = this.remedies.findIndex(r => r.id === id || r.slug === id);
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
    return this.banners.find(b => b.id === id);
  }

  public addBanner(banner: PromotionalBanner): PromotionalBanner {
    this.banners.push(banner);
    this.persist();
    return banner;
  }

  public updateBanner(id: string, updates: Partial<PromotionalBanner>): PromotionalBanner {
    const idx = this.banners.findIndex(b => b.id === id);
    if (idx === -1) {
      throw new Error(`NOT_FOUND: Banner "${id}" does not exist.`);
    }
    this.banners[idx] = {
      ...this.banners[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.banners[idx];
  }

  public deleteBanner(id: string): void {
    const idx = this.banners.findIndex(b => b.id === id);
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
    return this.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public updateOrder(id: string, updates: Partial<CustomerOrder>): CustomerOrder {
    const idx = this.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (idx === -1) {
      throw new Error(`NOT_FOUND: Order "${id}" does not exist.`);
    }
    this.orders[idx] = {
      ...this.orders[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.orders[idx];
  }

  // Categories
  public getCategories(): AilmentCategory[] {
    return [...this.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }
}

export const mockStore = new MockDispensaryStore();
