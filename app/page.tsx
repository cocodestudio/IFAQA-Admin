'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getDispensaryKPIs,
  getRemedies,
  getOrders
} from '@/lib/data-service';
import { DispensaryKPIs, HerbalRemedy, CustomerOrder } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';
import { ChamferBadge, RuledBadge } from '@/components/ui/ArchitecturalBadge';
import { DataTable } from '@/components/ui/DataTable';
import {
  FlaskConical,
  ImageIcon,
  Package,
  Coins,
  AlertTriangle,
  Plus,
  ArrowRight,
  RefreshCw,
  Eye
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<DispensaryKPIs | null>(null);
  const [lowStockRemedies, setLowStockRemedies] = useState<HerbalRemedy[]>([]);
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, allRemedies, allOrders] = await Promise.all([
        getDispensaryKPIs(),
        getRemedies(),
        getOrders()
      ]);

      setKpis(kpiData);
      setLowStockRemedies(allRemedies.filter(r => r.stockQuantity <= 10 || !r.isAvailable));
      setRecentOrders(allOrders.slice(0, 5));
    } catch (err: unknown) {
      console.error('Failed to load dispensary overview:', err);
      setError('Unable to Load Dispensary Overview. Verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <div className="p-8 border border-red-300 bg-red-50 text-red-950 space-y-4 max-w-2xl mx-auto my-12">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-700" />
          <h2 className="font-serif text-lg font-bold">Dispensary Governance Alert</h2>
        </div>
        <p className="text-sm font-mono">{error}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 border border-red-900 bg-red-900 text-red-50 text-xs font-serif uppercase tracking-wider hover:bg-red-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Data Synchronization</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Action Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-[#C7A9A3]/50 bg-[#E8D2C4]/20">
        <div>
          <h2 className="font-serif text-base font-bold text-[#3E3239] uppercase tracking-wider">
            Chief Hakeem Dispensary Governance
          </h2>
          <p className="text-xs text-[#6B5560]">
            Autonomous Classical Unani Operations &bull; Port 3001
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/remedies/new"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#6B5560] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Compound Formulation</span>
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#C7A9A3] bg-[#F7EFE7] text-[#3E3239] text-xs font-serif uppercase tracking-wider font-semibold hover:bg-[#E8D2C4]/40 transition-colors shadow-sm"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Fulfill Orders</span>
          </Link>
        </div>
      </div>

      {/* 4 StatCards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Classical Formulations"
          value={loading ? '...' : (kpis?.totalRemedies || 0)}
          subtitle="Registered Classical Remedies"
          icon={FlaskConical}
          accentColor="border-l-[#3E3239]"
          badge={
            <Link href="/remedies" className="text-xs font-serif text-[#6B5560] hover:text-[#3E3239] flex items-center justify-between">
              <span>View Formulation Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        />
        <StatCard
          title="Active Banners"
          value={loading ? '...' : (kpis?.activeBanners || 0)}
          subtitle="Storefront Promotional Banners"
          icon={ImageIcon}
          accentColor="border-l-[#6B5560]"
          badge={
            <Link href="/banners" className="text-xs font-serif text-[#6B5560] hover:text-[#3E3239] flex items-center justify-between">
              <span>Manage Storefront Displays</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        />
        <StatCard
          title="Fulfillment Pipeline"
          value={loading ? '...' : (kpis?.pendingOrders || 0)}
          subtitle="Orders Placed or Dispensing"
          icon={Package}
          accentColor="border-l-amber-700"
          badge={
            <Link href="/orders" className="text-xs font-serif text-[#6B5560] hover:text-[#3E3239] flex items-center justify-between">
              <span>Review Incoming Pipeline</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        />
        <StatCard
          title="Dispensary Revenue"
          value={loading ? '...' : `PKR ${(kpis?.totalRevenuePKR || 0).toLocaleString()}`}
          subtitle={`+ USD $${(kpis?.totalRevenueUSD || 0).toFixed(2)}`}
          icon={Coins}
          accentColor="border-l-emerald-700"
          badge={
            <span className="text-[11px] font-mono text-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-600" /> All-Time Authenticated Gross
            </span>
          }
        />
      </div>

      {/* Critical Low Stock / Inventory Alerts */}
      <div className="p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#C7A9A3]/30 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <h3 className="font-serif text-sm font-bold text-[#3E3239] uppercase tracking-wider">
              Dispensary Inventory & Stock Critical Alerts ({lowStockRemedies.length})
            </h3>
          </div>
          <Link href="/remedies" className="text-xs font-serif text-[#6B5560] hover:text-[#3E3239] underline">
            Manage All Remedies
          </Link>
        </div>

        {lowStockRemedies.length === 0 ? (
          <p className="text-xs font-mono text-emerald-800">
            All formulations are stocked above minimum dispensary threshold.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockRemedies.map(rem => (
              <div
                key={rem.id}
                className="p-4 border border-[#C7A9A3]/50 bg-[#E8D2C4]/20 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#3E3239]">
                    {rem.name}
                  </h4>
                  <p className="text-xs text-[#6B5560] font-mono">
                    SKU: {rem.sku}
                  </p>
                  <div className="mt-2">
                    <RuledBadge accentColor={rem.stockQuantity === 0 ? 'rose' : 'amber'}>
                      {rem.stockQuantity === 0 ? 'OUT OF STOCK' : `Stock: ${rem.stockQuantity} remaining`}
                    </RuledBadge>
                  </div>
                </div>
                <Link
                  href={`/remedies/${rem.id}/edit`}
                  className="px-3 py-1.5 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-wider hover:bg-[#6B5560] transition-colors"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#3E3239] uppercase tracking-wider">
            Recent Customer Orders Queue
          </h3>
          <Link
            href="/orders"
            className="text-xs font-serif text-[#6B5560] hover:text-[#3E3239] flex items-center gap-1"
          >
            <span>View Full Pipeline</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <DataTable
          data={recentOrders}
          keyExtractor={o => o.id}
          emptyMessage="No customer orders recorded in dispensary queue."
          columns={[
            {
              header: 'Order Reference',
              accessor: o => (
                <div>
                  <span className="font-mono font-bold text-xs text-[#3E3239]">
                    {o.orderNumber}
                  </span>
                  <div className="text-[11px] text-[#9E8189]">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )
            },
            {
              header: 'Customer Contact',
              accessor: o => (
                <div>
                  <div className="font-medium text-xs text-[#3E3239]">{o.customerName}</div>
                  <div className="text-[11px] font-mono text-[#6B5560]">{o.customerPhone}</div>
                </div>
              )
            },
            {
              header: 'Formulations',
              accessor: o => (
                <div className="text-xs text-[#6B5560]">
                  {o.items?.length || 0} formulation(s) &bull; {o.items?.map(i => i.name).join(', ').slice(0, 35)}...
                </div>
              )
            },
            {
              header: 'Amount',
              accessor: o => (
                <span className="font-mono font-bold text-xs text-[#3E3239]">
                  {o.currency} {o.totalAmount.toLocaleString()}
                </span>
              )
            },
            {
              header: 'Dispensary Status',
              accessor: o => (
                <ChamferBadge status={o.orderStatus}>
                  {o.orderStatus}
                </ChamferBadge>
              )
            },
            {
              header: 'Action',
              accessor: o => (
                <Link
                  href={`/orders/${o.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1 border border-[#C7A9A3] text-xs font-serif uppercase tracking-wider hover:bg-[#E8D2C4]/40 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect</span>
                </Link>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
