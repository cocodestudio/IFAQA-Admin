'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getDispensaryKPIs,
  getRemedies,
  getOrders,
  getOrderTrendSeries,
} from '@/lib/data-service';
import { DispensaryKPIs, HerbalRemedy, CustomerOrder, OrderTrendPoint } from '@/lib/types';
import { formatPriceINR, formatOrderAmount, formatShortDate } from '@/lib/formatters';
import { StatCard } from '@/components/ui/StatCard';
import { ChamferBadge, RuledBadge } from '@/components/ui/ArchitecturalBadge';
import { DataTable } from '@/components/ui/DataTable';
import { OrdersRevenueChart } from '@/components/dashboard/OrdersRevenueChart';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import {
  AlertTriangle,
  Plus,
  RefreshCw,
  Eye,
  Package,
  MessageSquareHeart,
  LifeBuoy,
  ChevronRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<DispensaryKPIs | null>(null);
  const [lowStockRemedies, setLowStockRemedies] = useState<HerbalRemedy[]>([]);
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);
  const [trend, setTrend] = useState<OrderTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, allRemedies, allOrders, trendData] = await Promise.all([
        getDispensaryKPIs(),
        getRemedies(),
        getOrders(),
        getOrderTrendSeries(7),
      ]);

      setKpis(kpiData);
      setLowStockRemedies(allRemedies.filter((r) => r.stockQuantity <= 10 || !r.isAvailable));
      setRecentOrders(allOrders.slice(0, 6));
      setTrend(trendData);
    } catch (err) {
      console.error('Failed to load dispensary overview:', err);
      setError('Unable to load dispensary records. Check Firebase connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !kpis) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 rounded-xl border border-red-200 bg-red-50 text-red-900 space-y-4 max-w-xl mx-auto my-8">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-700" strokeWidth={1.6} />
          <h2 className="font-serif text-lg text-red-950">Connection notice</h2>
        </div>
        <p className="text-sm">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="h-9 px-4 rounded-lg bg-red-900 text-white text-xs font-medium hover:bg-red-800 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.6} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  const totalRevenue =
    (kpis?.totalRevenuePKR || 0) + Math.round((kpis?.totalRevenueUSD || 0) * 84);

  const attentionItems = [
    {
      label: 'Orders awaiting fulfillment',
      count: kpis?.pendingOrders || 0,
      href: '/orders',
      icon: Package,
    },
    {
      label: 'Reviews pending moderation',
      count: kpis?.pendingReviews || 0,
      href: '/reviews',
      icon: MessageSquareHeart,
    },
    {
      label: 'Open support tickets',
      count: kpis?.openTickets || 0,
      href: '/support',
      icon: LifeBuoy,
    },
    {
      label: 'Low stock or hidden remedies',
      count: lowStockRemedies.length,
      href: '/remedies',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6 w-full admin-enter">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-[#5A6962]">
          Daily storefront revenue, order compounding, and stock health
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="h-9 px-3.5 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
            <span>Refresh</span>
          </button>
          <Link
            href="/orders"
            className="h-9 px-4 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5"
          >
            <span>Orders pipeline</span>
          </Link>
          <Link
            href="/remedies/new"
            className="h-9 px-4 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium hover:bg-[#165A45] transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.6} />
            <span>Add remedy</span>
          </Link>
        </div>
      </div>

      {/* 4 Compact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Dispensary revenue"
          value={formatPriceINR(totalRevenue)}
          subtitle="Confirmed & active orders"
          accentDot="brass"
          href="/orders"
          linkLabel="Orders"
        />
        <StatCard
          title="Pending orders"
          value={kpis?.pendingOrders ?? 0}
          subtitle="Placed, confirmed, dispensing"
          accentDot="amber"
          href="/orders"
          linkLabel="Fulfill"
        />
        <StatCard
          title="Active remedies"
          value={kpis?.totalRemedies ?? 0}
          subtitle={`${kpis?.activeBanners ?? 0} active banners`}
          accentDot="green"
          href="/remedies"
          linkLabel="Catalog"
        />
        <StatCard
          title="Customers"
          value={kpis?.totalCustomers ?? 0}
          subtitle={`${lowStockRemedies.length} stock alerts`}
          accentDot="plum"
          href="/customers"
          linkLabel="Directory"
        />
      </div>

      {/* Asymmetric Chart + Needs Attention Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <OrdersRevenueChart data={trend} />
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
                Needs attention
              </h3>
              <p className="text-xs text-[#5A6962]">
                Items waiting for staff action across the store
              </p>
            </div>

            <div className="divide-y divide-ifaqa-plum/10">
              {attentionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="py-3 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-ifaqa-cashmere flex items-center justify-center text-ifaqa-plum shrink-0 group-hover:bg-ifaqa-plum group-hover:text-ifaqa-linen transition-colors">
                        <Icon className="w-4 h-4 text-[#5A6962] group-hover:text-ifaqa-mauve transition-colors" strokeWidth={1.6} />
                      </span>
                      <span className="text-sm text-[#3E524A] group-hover:text-ifaqa-plum truncate transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-sm tabular-nums text-ifaqa-plum font-medium">
                        {item.count}
                      </span>
                      <ChevronRight
                        className="w-4 h-4 text-[#5A6962] group-hover:translate-x-0.5 transition-transform"
                        strokeWidth={1.6}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-ifaqa-plum/10 flex items-center justify-between text-xs">
            <Link href="/categories" className="text-ifaqa-plum font-medium hover:underline">
              Manage health categories
            </Link>
            <Link href="/banners" className="text-[#5A6962] hover:text-ifaqa-plum">
              Edit banners
            </Link>
          </div>
        </div>
      </div>

      {/* Low Stock Watch */}
      {lowStockRemedies.length > 0 && (
        <section className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-ifaqa-plum/10 pb-3">
            <div>
              <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
                Inventory attention ({lowStockRemedies.length})
              </h3>
              <p className="text-xs text-[#5A6962]">
                Formulations with 10 or fewer units remaining or paused from sale
              </p>
            </div>
            <Link
              href="/remedies"
              className="text-xs font-medium text-ifaqa-plum hover:underline shrink-0"
            >
              View all remedies
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockRemedies.slice(0, 6).map((rem) => (
              <div
                key={rem.id}
                className="p-3.5 rounded-lg border border-ifaqa-plum/10 bg-ifaqa-linen flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ifaqa-plum truncate">{rem.name}</div>
                  <div className="text-xs font-mono text-[#5A6962] mt-0.5">{rem.sku}</div>
                  <div className="mt-2">
                    <RuledBadge accentColor={rem.stockQuantity === 0 ? 'rose' : 'amber'}>
                      {rem.stockQuantity === 0
                        ? 'Out of stock'
                        : `${rem.stockQuantity} units left`}
                    </RuledBadge>
                  </div>
                </div>
                <Link
                  href={`/remedies/${rem.id}/edit`}
                  className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors shrink-0 inline-flex items-center"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Orders */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
            Recent orders
          </h3>
          <Link href="/orders" className="text-xs font-medium text-ifaqa-plum hover:underline">
            View all orders
          </Link>
        </div>

        <DataTable
          data={recentOrders}
          keyExtractor={(o) => o.id}
          emptyMessage="No orders recorded yet"
          renderMobileCard={(o) => (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-medium text-ifaqa-plum tabular-nums">
                    {o.orderNumber}
                  </span>
                  <div className="text-sm font-medium text-ifaqa-plum mt-0.5">
                    {o.customerName}
                  </div>
                  <div className="text-xs text-[#5A6962]">{formatShortDate(o.createdAt)}</div>
                </div>
                <ChamferBadge status={o.orderStatus}>{o.orderStatus}</ChamferBadge>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-ifaqa-plum/10">
                <span className="font-mono text-sm font-medium tabular-nums text-ifaqa-plum">
                  {formatOrderAmount(o.totalAmount, o.currency)}
                </span>
                <Link
                  href={`/orders/${o.id}`}
                  className="h-8 px-3 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.6} />
                  <span>Inspect</span>
                </Link>
              </div>
            </div>
          )}
          columns={[
            {
              header: 'Order',
              accessor: (o) => (
                <div>
                  <span className="font-mono text-xs font-medium tabular-nums text-ifaqa-plum">
                    {o.orderNumber}
                  </span>
                  <div className="text-xs text-[#5A6962]">{formatShortDate(o.createdAt)}</div>
                </div>
              ),
            },
            {
              header: 'Customer',
              accessor: (o) => (
                <div>
                  <div className="text-sm font-medium text-ifaqa-plum">{o.customerName}</div>
                  <div className="text-xs font-mono text-[#5A6962] tabular-nums">
                    {o.customerPhone}
                  </div>
                </div>
              ),
            },
            {
              header: 'Items',
              accessor: (o) => (
                <div className="text-xs text-[#3E524A] max-w-[260px] truncate">
                  {o.items?.length || 0} item(s) • {o.items?.map((i) => i.name).join(', ')}
                </div>
              ),
            },
            {
              header: 'Total',
              className: 'text-right',
              accessor: (o) => (
                <span className="font-mono text-sm font-medium tabular-nums text-ifaqa-plum">
                  {formatOrderAmount(o.totalAmount, o.currency)}
                </span>
              ),
            },
            {
              header: 'Status',
              accessor: (o) => (
                <ChamferBadge status={o.orderStatus}>{o.orderStatus}</ChamferBadge>
              ),
            },
            {
              header: 'Action',
              className: 'text-right',
              accessor: (o) => (
                <Link
                  href={`/orders/${o.id}`}
                  className="h-8 px-3 rounded-lg border border-ifaqa-plum/15 bg-white text-xs font-medium text-ifaqa-plum hover:bg-ifaqa-cashmere transition-colors inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#5A6962]" strokeWidth={1.6} />
                  <span>Inspect</span>
                </Link>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
