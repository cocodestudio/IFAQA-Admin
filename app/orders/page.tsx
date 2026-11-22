'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CustomerOrder, OrderStatus } from '@/lib/types';
import { getOrders } from '@/lib/data-service';
import { DataTable } from '@/components/ui/DataTable';
import { ChamferBadge } from '@/components/ui/ArchitecturalBadge';
import { Search, Eye } from 'lucide-react';

const STATUS_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'dispensing', label: 'Dispensing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' }
];

export default function OrdersListPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getOrders({
        status: activeTab !== 'all' ? activeTab : undefined,
        search: searchTerm || undefined
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#3E3239] uppercase tracking-wider">
            Customer Orders & Compounding Pipeline
          </h2>
          <p className="text-xs text-[#6B5560]">
            Review incoming orders, verify prescriptions, manage dispatch couriers, and advance fulfillment stages.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs (Sharp rect tabs, ZERO PILLS) */}
      <div className="flex flex-wrap gap-1 border-b border-[#C7A9A3]/50 bg-[#E8D2C4]/20 p-1 text-xs font-serif uppercase tracking-wider">
        {STATUS_TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-semibold transition-colors ${
                isActive
                  ? 'bg-[#3E3239] text-[#F7EFE7]'
                  : 'text-[#6B5560] hover:text-[#3E3239] hover:bg-[#E8D2C4]/40'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="p-4 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search by order number (e.g. IFA-2026-1001), customer name, or Pakistani phone (e.g. 03001234567 or +923001234567)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#F7EFE7] border border-[#C7A9A3] text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
          />
          <Search className="w-4 h-4 text-[#9E8189] absolute left-3 top-3" />
        </form>
      </div>

      {/* Orders Data Table */}
      <DataTable
        data={orders}
        keyExtractor={o => o.id}
        emptyMessage={loading ? 'Loading customer orders pipeline...' : 'No orders found matching the criteria.'}
        columns={[
          {
            header: 'Order Reference',
            accessor: o => (
              <div>
                <span className="font-mono font-bold text-xs text-[#3E3239]">
                  {o.orderNumber}
                </span>
                <div className="text-[11px] text-[#9E8189]">
                  {new Date(o.createdAt).toLocaleDateString()} &bull; {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
          },
          {
            header: 'Customer Details',
            accessor: o => (
              <div>
                <div className="font-serif font-bold text-xs text-[#3E3239]">{o.customerName}</div>
                <div className="text-[11px] font-mono text-[#6B5560]">{o.customerPhone}</div>
                <div className="text-[10px] text-[#9E8189]">{o.shippingAddress?.city}, {o.shippingAddress?.country}</div>
              </div>
            )
          },
          {
            header: 'Compounding Items',
            accessor: o => (
              <div className="text-xs text-[#6B5560] max-w-xs">
                <span className="font-medium text-[#3E3239]">{o.items?.length || 0} formulation(s):</span>{' '}
                {o.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
              </div>
            )
          },
          {
            header: 'Grand Total',
            accessor: o => (
              <div className="text-xs font-mono">
                <div className="font-bold text-[#3E3239]">{o.currency} {o.totalAmount.toLocaleString()}</div>
                <div className="text-[10px] text-[#9E8189] uppercase tracking-wider">{o.paymentMethod.replace(/_/g, ' ')}</div>
              </div>
            )
          },
          {
            header: 'Pipeline State',
            accessor: o => (
              <ChamferBadge status={o.orderStatus}>
                {o.orderStatus}
              </ChamferBadge>
            )
          },
          {
            header: 'Action',
            className: 'text-right',
            accessor: o => (
              <Link
                href={`/orders/${o.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider hover:bg-[#6B5560] transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Fulfill</span>
              </Link>
            )
          }
        ]}
      />
    </div>
  );
}
