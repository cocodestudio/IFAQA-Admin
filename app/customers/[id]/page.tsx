'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CustomerOrder,
  CustomerProfile,
  CustomerReview,
  SupportTicketRecord,
} from '@/lib/types';
import { getCustomerById } from '@/lib/data-service';
import { formatOrderAmount, formatPriceINR, formatShortDate } from '@/lib/formatters';
import { ChamferBadge, NotchedBadge, RuledBadge } from '@/components/ui/ArchitecturalBadge';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Package,
  Star,
  LifeBuoy,
  Eye,
  AlertCircle,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCustomerById(id)
      .then((res) => {
        setProfile(res.profile);
        setOrders(res.orders);
        setReviews(res.reviews);
        setTickets(res.tickets);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Customer record not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-ifaqa-plum/15 border-t-ifaqa-plum animate-spin mx-auto" />
        <p className="text-sm text-[#5A6962]">Loading customer profile</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-900 space-y-4 max-w-xl mx-auto my-8">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-700" strokeWidth={1.6} />
          <h2 className="font-serif text-lg">Customer not found</h2>
        </div>
        <p className="text-sm">{error}</p>
        <Link
          href="/customers"
          className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.6} />
          <span>Back to customers</span>
        </Link>
      </div>
    );
  }

  const initials = (profile.fullName || 'C')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="space-y-6 w-full">
      {/* Header Navigation & Summary */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/customers"
            className="w-9 h-9 rounded-lg border border-ifaqa-plum/15 bg-ifaqa-linen flex items-center justify-center text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors shrink-0"
            title="Back to customers"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.6} />
          </Link>
          <div className="w-12 h-12 rounded-xl bg-ifaqa-plum text-ifaqa-linen flex items-center justify-center font-serif text-lg shrink-0">
            {initials || 'C'}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-serif font-normal text-2xl text-ifaqa-plum truncate">
                {profile.fullName}
              </h2>
              <NotchedBadge variant={orders.length > 1 ? 'sand' : 'default'}>
                {orders.length} order{orders.length === 1 ? '' : 's'}
              </NotchedBadge>
            </div>
            <p className="text-xs text-[#5A6962] mt-0.5 font-mono tabular-nums">
              {profile.phoneNumber} • Active {formatShortDate(profile.lastActiveAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-ifaqa-plum/10">
          <div>
            <div className="text-xs text-[#5A6962]">Lifetime spend</div>
            <div className="font-serif text-xl text-ifaqa-plum tabular-nums mt-0.5">
              {formatPriceINR(profile.lifetimeSpend)}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#5A6962]">Reviews</div>
            <div className="font-serif text-xl text-ifaqa-plum tabular-nums mt-0.5">
              {reviews.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#5A6962]">Tickets</div>
            <div className="font-serif text-xl text-ifaqa-plum tabular-nums mt-0.5">
              {tickets.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main 12-Col Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Contact & Saved Delivery Addresses */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <h3 className="font-serif font-normal text-lg text-ifaqa-plum border-b border-ifaqa-plum/10 pb-3">
              Contact details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-ifaqa-plum">
                <Phone className="w-4 h-4 text-[#5A6962] shrink-0" strokeWidth={1.6} />
                <span className="font-mono text-xs tabular-nums">{profile.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2.5 text-ifaqa-plum">
                <Mail className="w-4 h-4 text-[#5A6962] shrink-0" strokeWidth={1.6} />
                <span className="text-xs text-[#3E524A]">
                  {profile.email || 'Not provided'}
                </span>
              </div>
              <div className="pt-2 border-t border-ifaqa-plum/10 text-xs text-[#5A6962]">
                Account ID: <span className="font-mono text-ifaqa-plum">{profile.id}</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <div className="flex items-center justify-between border-b border-ifaqa-plum/10 pb-3">
              <h3 className="font-serif font-normal text-lg text-ifaqa-plum flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
                <span>Saved addresses</span>
              </h3>
              <span className="font-mono text-xs text-[#5A6962]">
                {profile.savedAddresses.length}
              </span>
            </div>

            {profile.savedAddresses.length === 0 ? (
              <p className="text-xs text-[#5A6962]">No saved shipping addresses recorded.</p>
            ) : (
              <div className="space-y-3">
                {profile.savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3.5 rounded-lg border border-ifaqa-plum/10 bg-ifaqa-linen text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-medium text-ifaqa-plum">
                      <span>{addr.label || 'Delivery address'}</span>
                      {addr.isDefault && <NotchedBadge variant="sand">Default</NotchedBadge>}
                    </div>
                    <p className="text-[#3E524A] leading-relaxed">
                      {addr.streetAddress}
                      {addr.apartmentSuite ? `, ${addr.apartmentSuite}` : ''}
                      <br />
                      {addr.city}, {addr.stateProvince} {addr.postalCode}
                      <br />
                      {addr.country}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Order History, Product Reviews, Support History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Orders History */}
          <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <div className="flex items-center justify-between border-b border-ifaqa-plum/10 pb-3">
              <h3 className="font-serif font-normal text-lg text-ifaqa-plum flex items-center gap-2">
                <Package className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
                <span>Order history ({orders.length})</span>
              </h3>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-[#5A6962]">No orders placed by this customer yet.</p>
            ) : (
              <div className="divide-y divide-ifaqa-plum/10">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-medium text-ifaqa-plum tabular-nums">
                          {o.orderNumber}
                        </span>
                        <ChamferBadge status={o.orderStatus}>{o.orderStatus}</ChamferBadge>
                      </div>
                      <div className="text-xs text-[#5A6962]">
                        {formatShortDate(o.createdAt)} •{' '}
                        {o.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm font-medium tabular-nums text-ifaqa-plum">
                        {formatOrderAmount(o.totalAmount, o.currency)}
                      </span>
                      <Link
                        href={`/orders/${o.id}`}
                        className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
                        <span>Manage</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Reviews & Support Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
              <h3 className="font-serif font-normal text-lg text-ifaqa-plum flex items-center gap-2 border-b border-ifaqa-plum/10 pb-3">
                <Star className="w-4 h-4 text-ifaqa-mauve" strokeWidth={1.6} />
                <span>Product reviews ({reviews.length})</span>
              </h3>
              {reviews.length === 0 ? (
                <p className="text-xs text-[#5A6962]">No product reviews submitted.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-lg bg-ifaqa-linen border border-ifaqa-plum/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-ifaqa-plum truncate">
                          {rev.remedyName || rev.remedyId}
                        </span>
                        <span className="text-xs font-mono text-ifaqa-mauve tabular-nums">
                          {rev.rating}/5 ★
                        </span>
                      </div>
                      <p className="text-xs text-[#3E524A]">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
              <h3 className="font-serif font-normal text-lg text-ifaqa-plum flex items-center gap-2 border-b border-ifaqa-plum/10 pb-3">
                <LifeBuoy className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
                <span>Support history ({tickets.length})</span>
              </h3>
              {tickets.length === 0 ? (
                <p className="text-xs text-[#5A6962]">No support inquiries recorded.</p>
              ) : (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <Link
                      key={t.id}
                      href={`/support/${t.id}`}
                      className="block p-3.5 rounded-lg bg-ifaqa-linen border border-ifaqa-plum/10 hover:border-ifaqa-plum/25 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-ifaqa-plum">{t.id}</span>
                        <RuledBadge
                          accentColor={t.status === 'Resolved' ? 'emerald' : 'amber'}
                        >
                          {t.status}
                        </RuledBadge>
                      </div>
                      <div className="text-xs font-medium text-ifaqa-plum truncate">
                        {t.subject}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
