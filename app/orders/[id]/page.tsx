'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CustomerOrder, OrderStatus, PaymentStatus } from '@/lib/types';
import {
  getOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderFulfillment,
} from '@/lib/data-service';
import { formatOrderAmount, formatShortDate, formatShortTime } from '@/lib/formatters';
import { StatusStepper } from '@/components/ui/StatusStepper';
import { ChamferBadge, NotchedBadge } from '@/components/ui/ArchitecturalBadge';
import {
  ArrowLeft,
  Printer,
  Truck,
  FileText,
  User,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Save,
} from 'lucide-react';

const COURIER_PRESETS = ['Delhivery', 'BlueDart', 'DTDC', 'India Post', 'TCS Express'];

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getOrderById(id);
      setOrder(data);
      setCourierName(data.courierName || 'Delhivery');
      setTrackingNumber(data.trackingNumber || '');
      setAdminNotes(data.adminNotes || '');
      setError(null);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(`Order "${id}" could not be found.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleAdvanceStatus = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setError(null);
    setActionSuccess(null);
    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      setOrder(updated);
      setActionSuccess(`Order moved to ${nextStatus}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Cancel this order?')) return;
    setError(null);
    setActionSuccess(null);
    try {
      const updated = await updateOrderStatus(order.id, 'cancelled');
      setOrder(updated);
      setActionSuccess('Order cancelled');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Cancellation failed');
    }
  };

  const handlePaymentStatusChange = async (paymentStatus: PaymentStatus) => {
    if (!order) return;
    setError(null);
    setActionSuccess(null);
    try {
      const updated = await updateOrderPaymentStatus(order.id, paymentStatus);
      setOrder(updated);
      setActionSuccess(`Payment marked ${paymentStatus}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment update failed');
    }
  };

  const handleSaveFulfillmentNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSavingNotes(true);
    setError(null);
    setActionSuccess(null);
    try {
      const updated = await updateOrderFulfillment(order.id, {
        courierName,
        trackingNumber,
        adminNotes,
      });
      setOrder(updated);
      setActionSuccess('Dispatch and tracking details saved');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save details');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-ifaqa-plum/15 border-t-ifaqa-plum animate-spin mx-auto" />
        <p className="text-sm text-[#5A6962]">Loading order details</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-900 space-y-4 max-w-xl mx-auto my-8">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-700" strokeWidth={1.5} />
          <h2 className="font-serif text-lg">Order not found</h2>
        </div>
        <p className="text-sm">{error}</p>
        <Link
          href="/orders"
          className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Back to orders</span>
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="w-9 h-9 rounded-lg border border-ifaqa-plum/15 bg-white flex items-center justify-center text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors shrink-0"
            title="Back to orders"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-serif font-normal text-2xl text-ifaqa-plum tabular-nums">
                {order.orderNumber}
              </h2>
              <ChamferBadge status={order.orderStatus}>{order.orderStatus}</ChamferBadge>
            </div>
            <p className="text-xs text-[#5A6962] mt-0.5">
              Placed {formatShortDate(order.createdAt)} at {formatShortTime(order.createdAt)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="h-9 px-4 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-[#5A6962]" strokeWidth={1.5} />
          <span>Print packing slip</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs flex items-center gap-2.5 print:hidden">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" strokeWidth={1.5} />
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 rounded-xl border border-[#165A45]/25 bg-[#EEF4F1] text-ifaqa-plum text-xs flex items-center gap-2.5 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-[#165A45] shrink-0" strokeWidth={1.5} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stage Stepper */}
      <div className="print:hidden">
        <StatusStepper
          currentStatus={order.orderStatus}
          onAdvanceStatus={handleAdvanceStatus}
          onCancelOrder={handleCancelOrder}
        />
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer & Payment Card */}
        <div className="lg:col-span-5 p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-5">
          <div className="flex items-center gap-2 border-b border-ifaqa-plum/10 pb-3">
            <User className="w-4 h-4 text-[#5A6962]" strokeWidth={1.5} />
            <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
              Customer & delivery
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-[#5A6962] block">Recipient</span>
              <span className="font-medium text-ifaqa-plum">{order.customerName}</span>
            </div>
            <div>
              <span className="text-xs text-[#5A6962] block">Phone</span>
              <span className="font-mono text-xs tabular-nums text-ifaqa-plum">
                {order.customerPhone}
              </span>
            </div>
            {order.customerEmail && (
              <div>
                <span className="text-xs text-[#5A6962] block">Email</span>
                <span className="text-xs text-ifaqa-plum">{order.customerEmail}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-ifaqa-plum/10 space-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-xs text-[#5A6962]">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Shipping address</span>
            </div>
            <p className="text-sm text-[#3E524A] leading-relaxed">
              {order.shippingAddress.streetAddress}
              {order.shippingAddress.apartmentSuite && `, ${order.shippingAddress.apartmentSuite}`}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.stateProvince}{' '}
              <span className="font-mono">{order.shippingAddress.postalCode}</span>
              <br />
              <span className="font-medium text-ifaqa-plum">{order.shippingAddress.country}</span>
            </p>
          </div>

          <div className="pt-4 border-t border-ifaqa-plum/10 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5A6962]">Payment</span>
              <NotchedBadge variant={order.paymentStatus === 'verified' ? 'sand' : 'default'}>
                {order.paymentStatus}
              </NotchedBadge>
            </div>
            <div className="text-xs text-ifaqa-plum capitalize">
              Method: {order.paymentMethod.replace(/_/g, ' ')}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1 print:hidden">
              {(['pending', 'verified', 'refunded'] as PaymentStatus[]).map((ps) => (
                <button
                  key={ps}
                  type="button"
                  onClick={() => handlePaymentStatusChange(ps)}
                  className={`h-7 px-2.5 rounded-md text-xs font-medium capitalize border transition-colors ${
                    order.paymentStatus === ps
                      ? 'bg-ifaqa-plum text-ifaqa-linen border-ifaqa-plum'
                      : 'bg-ifaqa-linen text-[#5A6962] border-ifaqa-plum/10 hover:text-ifaqa-plum'
                  }`}
                >
                  {ps}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ordered Items Card */}
        <div className="lg:col-span-7 p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-5">
          <div className="flex items-center gap-2 border-b border-ifaqa-plum/10 pb-3">
            <FileText className="w-4 h-4 text-[#5A6962]" strokeWidth={1.5} />
            <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
              Items ({order.items.length})
            </h3>
          </div>

          <div className="divide-y divide-ifaqa-plum/10">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg border border-ifaqa-plum/10 bg-ifaqa-cashmere overflow-hidden shrink-0">
                    <img
                      src={item.image || '/images/remedies/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-ifaqa-plum truncate">{item.name}</h4>
                    <div className="text-xs text-[#5A6962] flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="font-mono">{item.sku}</span>
                      <span>•</span>
                      <span dir="rtl" className="font-urdu">
                        {item.urduName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="sm:text-right font-mono tabular-nums shrink-0 flex sm:block items-center justify-between pt-1 sm:pt-0">
                  <div className="text-xs text-[#5A6962]">
                    {item.quantity} × {formatOrderAmount(item.unitPrice, order.currency)}
                  </div>
                  <div className="text-sm font-medium text-ifaqa-plum sm:mt-0.5">
                    {formatOrderAmount(item.totalPrice, order.currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-ifaqa-plum/15 space-y-2 text-xs font-mono tabular-nums">
            <div className="flex justify-between text-[#5A6962]">
              <span>Subtotal</span>
              <span>{formatOrderAmount(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex justify-between text-[#5A6962]">
              <span>Shipping</span>
              <span>{formatOrderAmount(order.shippingFee, order.currency)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#165A45]">
                <span>Discount</span>
                <span>-{formatOrderAmount(order.discount, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-sans font-medium text-ifaqa-plum pt-2.5 border-t border-ifaqa-plum/10">
              <span>Grand total</span>
              <span className="font-mono tabular-nums">
                {formatOrderAmount(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Courier & Dispatch Form */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4 print:hidden">
        <div className="flex items-center gap-2 border-b border-ifaqa-plum/10 pb-3">
          <Truck className="w-4 h-4 text-[#5A6962]" strokeWidth={1.5} />
          <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
            Courier & dispatch notes
          </h3>
        </div>

        <form onSubmit={handleSaveFulfillmentNotes} className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {COURIER_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCourierName(c)}
                className={`h-7 px-2.5 rounded-md text-xs border transition-colors ${
                  courierName === c
                    ? 'bg-ifaqa-plum text-ifaqa-linen border-ifaqa-plum'
                    : 'bg-ifaqa-linen text-[#5A6962] border-ifaqa-plum/10 hover:text-ifaqa-plum'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ifaqa-plum">Courier partner</label>
              <input
                type="text"
                placeholder="Delhivery / BlueDart"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white border border-ifaqa-plum/15 text-ifaqa-plum focus:outline-none focus:border-ifaqa-plum"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ifaqa-plum">
                Tracking number
              </label>
              <input
                type="text"
                placeholder="AWB or consignment reference"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm font-mono bg-white border border-ifaqa-plum/15 text-ifaqa-plum focus:outline-none focus:border-ifaqa-plum"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-ifaqa-plum">
              Staff & batch notes
            </label>
            <textarea
              rows={3}
              placeholder="Internal batch notes or delivery instructions"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white border border-ifaqa-plum/15 text-ifaqa-plum focus:outline-none focus:border-ifaqa-plum"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingNotes}
              className="h-9 px-5 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium hover:bg-[#165A45] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{savingNotes ? 'Saving...' : 'Save dispatch details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
