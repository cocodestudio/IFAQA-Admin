'use client';

import React, { useState } from 'react';
import { OrderTrendPoint } from '@/lib/types';
import { formatPriceINR } from '@/lib/formatters';

interface OrdersRevenueChartProps {
  data: OrderTrendPoint[];
}

export function OrdersRevenueChart({ data }: OrdersRevenueChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const safeData =
    data.length > 0
      ? data
      : [{ label: 'Today', dateKey: '', orders: 0, revenue: 0 }];

  const width = 680;
  const height = 240;
  const padLeft = 56;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxRev = Math.max(1000, ...safeData.map((d) => d.revenue));
  const stepX = safeData.length > 1 ? plotW / (safeData.length - 1) : plotW / 2;

  const coords = safeData.map((pt, i) => {
    const x = safeData.length > 1 ? padLeft + i * stepX : padLeft + plotW / 2;
    const y = padTop + plotH - (pt.revenue / maxRev) * plotH;
    return { x, y, ...pt };
  });

  // Smooth cubic bezier path
  const linePath = coords.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = coords[idx - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x} ${padTop + plotH} L ${coords[0].x} ${
          padTop + plotH
        } Z`
      : '';

  const gridTicks = [0, 0.5, 1].map((ratio) => ({
    y: padTop + plotH * (1 - ratio),
    val: Math.round(maxRev * ratio),
  }));

  const activePoint =
    hoveredIdx !== null ? coords[hoveredIdx] : coords[coords.length - 1];

  const totalRev = safeData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = safeData.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
            Dispensary revenue & orders
          </h3>
          <p className="text-xs text-[#5A6962]">
            Last 7 days • {totalOrders} orders totaling{' '}
            <span className="font-mono tabular-nums text-ifaqa-plum">
              {formatPriceINR(totalRev)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-[#3E524A]">
            <span className="w-2.5 h-0.5 bg-ifaqa-plum inline-block" />
            <span>Revenue</span>
          </div>
          {activePoint && (
            <div className="px-2.5 py-1 rounded-md bg-ifaqa-cashmere text-xs font-mono tabular-nums text-ifaqa-plum">
              {activePoint.label}: {formatPriceINR(activePoint.revenue)} ({activePoint.orders})
            </div>
          )}
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[260px] select-none"
          role="img"
          aria-label="7-day dispensary revenue chart"
        >
          <defs>
            <linearGradient id="revAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B2D22" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#0B2D22" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {gridTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={width - padRight}
                y2={tick.y}
                stroke="rgba(11, 45, 34, 0.08)"
                strokeWidth="1"
              />
              <text
                x={padLeft - 10}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="11"
                className="fill-[#5A6962] font-mono"
              >
                {tick.val >= 1000 ? `₹${(tick.val / 1000).toFixed(1)}k` : `₹${tick.val}`}
              </text>
            </g>
          ))}

          {/* Area & Smooth Line */}
          {areaPath && <path d={areaPath} fill="url(#revAreaFill)" />}
          <path
            d={linePath}
            fill="none"
            stroke="#0B2D22"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Interactive Data Points */}
          {coords.map((pt, i) => {
            const isActive =
              hoveredIdx === i || (hoveredIdx === null && i === coords.length - 1);
            return (
              <g
                key={pt.dateKey || i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {isActive && (
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padTop + plotH}
                    stroke="#C5A059"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 5 : 3.5}
                  fill={isActive ? '#C5A059' : '#0B2D22'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <rect
                  x={pt.x - 24}
                  y={padTop}
                  width="48"
                  height={plotH + padBottom}
                  fill="transparent"
                />
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="11"
                  className={isActive ? 'fill-[#0B2D22] font-mono' : 'fill-[#5A6962] font-mono'}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
