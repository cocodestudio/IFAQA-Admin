'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CustomerOrder, OrderStatus } from '@/lib/types';
import { getOrderById, updateOrderStatus, updateOrderFulfillment } from '@/lib/data-service';
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
  Save
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Fulfillment form fields
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
      setCourierName(data.courierName || 'TCS Express');
      setTrackingNumber(data.trackingNumber || '');
      setAdminNotes(data.adminNotes || '');
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to load order:', err);
      setError(`NOT_FOUND: Order "${id}" does not exist in dispensary records.`);
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
      setActionSuccess(`Order status successfully advanced to "${nextStatus}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status transition failed';
      setError(msg);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you wish to cancel this dispensary order?')) return;
    setError(null);
    setActionSuccess(null);
    try {
      const updated = await updateOrderStatus(order.id, 'cancelled');
      setOrder(updated);
      setActionSuccess('Order has been cancelled.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed';
      setError(msg);
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
        adminNotes
      });
      setOrder(updated);
      setActionSuccess('Fulfillment and dispatch notes saved.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save notes';
      setError(msg);
    } finally {
      setSavingNotes(false);
    }
  };

  const handlePrintPackingSlip = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#3E3239] space-y-3">
        <div className="w-8 h-8 border-2 border-[#C7A9A3] border-t-[#3E3239] animate-spin mx-auto" />
        <p className="font-serif text-sm tracking-wider uppercase">Loading customer order specification...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-8 border border-red-300 bg-red-50 text-red-950 space-y-4 max-w-xl mx-auto my-12">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-700" />
          <h2 className="font-serif text-lg font-bold">Order Not Found</h2>
        </div>
        <p className="text-sm font-mono">{error}</p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 border border-red-900 bg-red-900 text-red-50 text-xs font-serif uppercase tracking-wider hover:bg-red-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Orders Pipeline</span>
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="p-2 border border-[#C7A9A3] text-[#3E3239] hover:bg-[#E8D2C4]/30 transition-colors"
            title="Return to Orders Pipeline"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl font-bold text-[#3E3239]">
                Order {order.orderNumber}
              </h2>
              <ChamferBadge status={order.orderStatus}>
                {order.orderStatus}
              </ChamferBadge>
            </div>
            <p className="text-xs text-[#6B5560] font-mono mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrintPackingSlip}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#C7A9A3] bg-[#F7EFE7] text-[#3E3239] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#E8D2C4]/40 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print Packing Slip</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 border-l-4 border-red-700 bg-red-50 text-red-900 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 border-l-4 border-emerald-700 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-mono">{actionSuccess}</span>
        </div>
      )}

      {/* 5-Stage Status Progression Stepper */}
      <StatusStepper
        currentStatus={order.orderStatus}
        onAdvanceStatus={handleAdvanceStatus}
        onCancelOrder={handleCancelOrder}
      />

      {/* Main Grid: Customer Info & Compounding Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Shipping Information Card */}
        <div className="md:col-span-1 p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#C7A9A3]/30 pb-2">
            <User className="w-4 h-4 text-[#6B5560]" />
            <h3 className="font-serif text-sm font-bold text-[#3E3239] uppercase tracking-wider">
              Customer Profile
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#9E8189] block font-mono text-[10px] uppercase">Recipient Name</span>
              <span className="font-serif font-bold text-[#3E3239] text-sm">{order.customerName}</span>
            </div>
            <div>
              <span className="text-[#9E8189] block font-mono text-[10px] uppercase">Phone Number</span>
              <span className="font-mono text-[#3E3239]">{order.customerPhone}</span>
            </div>
            {order.customerEmail && (
              <div>
                <span className="text-[#9E8189] block font-mono text-[10px] uppercase">Email</span>
                <span className="font-mono text-[#3E3239]">{order.customerEmail}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#C7A9A3]/30 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#6B5560]">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-serif font-bold uppercase tracking-wider text-[11px]">Shipping Destination</span>
            </div>
            <p className="text-[#3E3239] leading-relaxed">
              {order.shippingAddress.streetAddress}
              {order.shippingAddress.apartmentSuite && `, ${order.shippingAddress.apartmentSuite}`}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.stateProvince} {order.shippingAddress.postalCode}
              <br />
              <strong className="font-bold">{order.shippingAddress.country}</strong>
            </p>
          </div>

          <div className="pt-3 border-t border-[#C7A9A3]/30 text-xs">
            <span className="text-[#9E8189] block font-mono text-[10px] uppercase">Payment Terms</span>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-[#3E3239] uppercase font-semibold">
                {order.paymentMethod.replace(/_/g, ' ')}
              </span>
              <NotchedBadge variant={order.paymentStatus === 'verified' ? 'sand' : 'default'}>
                {order.paymentStatus}
              </NotchedBadge>
            </div>
          </div>
        </div>

        {/* Compounding Items Breakdown Card */}
        <div className="md:col-span-2 p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#C7A9A3]/30 pb-2">
            <FileText className="w-4 h-4 text-[#6B5560]" />
            <h3 className="font-serif text-sm font-bold text-[#3E3239] uppercase tracking-wider">
              Compounded Remedies Specification ({order.items.length})
            </h3>
          </div>

          <div className="divide-y divide-[#C7A9A3]/30">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border border-[#C7A9A3]/60 bg-[#E8D2C4]/20 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || '/images/remedies/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#3E3239]">
                      {item.name}
                    </h4>
                    <div className="text-xs text-[#6B5560] font-mono flex items-center gap-2">
                      <span>SKU: {item.sku}</span>
                      <span>&bull;</span>
                      <span dir="rtl">{item.urduName}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="text-[#6B5560]">
                    {item.quantity} &times; {order.currency} {item.unitPrice.toLocaleString()}
                  </div>
                  <div className="font-bold text-[#3E3239] text-sm mt-0.5">
                    {order.currency} {item.totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals Box */}
          <div className="pt-4 border-t-2 border-[#C7A9A3]/50 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[#6B5560]">
              <span>Formulations Subtotal:</span>
              <span>{order.currency} {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#6B5560]">
              <span>Shipping & Compounding Delivery:</span>
              <span>{order.currency} {order.shippingFee.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>Dispensary Privilege Discount:</span>
                <span>-{order.currency} {order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-serif font-bold text-[#3E3239] pt-2 border-t border-[#C7A9A3]/30">
              <span>Grand Total:</span>
              <span>{order.currency} {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courier Dispatch & Clinical Compounding Notes */}
      <div className="p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#C7A9A3]/30 pb-2">
          <Truck className="w-4 h-4 text-[#6B5560]" />
          <h3 className="font-serif text-sm font-bold text-[#3E3239] uppercase tracking-wider">
            Courier Partner Dispatch & Dispensary Records
          </h3>
        </div>

        <form onSubmit={handleSaveFulfillmentNotes} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239] mb-1">
                Designated Courier Partner
              </label>
              <input
                type="text"
                placeholder="e.g. TCS Express / Leopards / DHL Worldwide"
                value={courierName}
                onChange={e => setCourierName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239] mb-1">
                Airway Bill / Tracking Consignment #
              </label>
              <input
                type="text"
                placeholder="e.g. 748291038491"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] font-mono focus:outline-none focus:border-[#3E3239]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239] mb-1">
              Hakeem Compounding & Clinical Dispensing Notes
            </label>
            <textarea
              rows={3}
              placeholder="Internal pharmacy notes, harvest batch citations, or specific patient preparation instructions..."
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingNotes}
              className="inline-flex items-center gap-2 px-5 py-2 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#6B5560] transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingNotes ? 'Saving Records...' : 'Save Fulfillment Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
