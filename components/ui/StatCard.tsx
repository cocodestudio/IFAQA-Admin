import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  accentColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  accentColor = 'border-l-[#6B5560]'
}: StatCardProps) {
  return (
    <div className={`p-6 bg-[#F7EFE7] border border-[#C7A9A3]/50 border-l-4 ${accentColor} shadow-sm relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6B5560]">
            {title}
          </span>
          <div className="mt-2 text-3xl font-serif font-bold text-[#3E3239]">
            {value}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-[#9E8189]">
              {subtitle}
            </p>
          )}
        </div>
        <div className="w-10 h-10 border border-[#C7A9A3]/60 bg-[#E8D2C4]/30 flex items-center justify-center text-[#3E3239]">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badge && (
        <div className="mt-4 pt-3 border-t border-[#C7A9A3]/30">
          {badge}
        </div>
      )}
    </div>
  );
}
