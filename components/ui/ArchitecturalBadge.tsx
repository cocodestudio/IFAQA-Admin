import React from 'react';

// Pattern 1: Notched Bevel Badge (Zero-Pills: sharp edges, subtle contrast)
export function NotchedBadge({
  children,
  variant = 'default',
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'default' | 'sand' | 'plum' | 'alert';
  className?: string;
}) {
  const variantStyles = {
    default: 'border border-[#C7A9A3]/60 bg-[#F7EFE7] text-[#3E3239]',
    sand: 'border border-[#C7A9A3] bg-[#E8D2C4]/40 text-[#3E3239]',
    plum: 'border border-[#6B5560] bg-[#3E3239] text-[#F7EFE7]',
    alert: 'border border-red-700/60 bg-red-50 text-red-900'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-serif uppercase tracking-wider shadow-sm ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Pattern 2: Chamfered Heritage Badge (8-sided polygon cut corners)
export function ChamferBadge({
  children,
  status = 'default',
  className = ''
}: {
  children: React.ReactNode;
  status?: 'placed' | 'confirmed' | 'dispensing' | 'dispatched' | 'delivered' | 'cancelled' | 'default';
  className?: string;
}) {
  const statusStyles: Record<string, string> = {
    placed: 'bg-[#C7A9A3]/30 text-[#3E3239] border border-[#C7A9A3]',
    confirmed: 'bg-blue-900/15 text-blue-950 border border-blue-800/40',
    dispensing: 'bg-amber-900/15 text-amber-950 border border-amber-800/40',
    dispatched: 'bg-purple-900/15 text-purple-950 border border-purple-800/40',
    delivered: 'bg-emerald-900 text-[#F7EFE7] border border-emerald-700',
    cancelled: 'bg-stone-900 text-stone-200 border border-stone-700',
    default: 'bg-[#3E3239] text-[#F7EFE7] border border-[#6B5560]'
  };

  return (
    <span
      className={`chamfer-badge inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wide uppercase ${statusStyles[status] || statusStyles.default} ${className}`}
      style={{
        clipPath:
          'polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)'
      }}
    >
      {children}
    </span>
  );
}

// Pattern 3: Ruled Left Border Badge (Sharp border-l-2 with contrasting fill)
export function RuledBadge({
  children,
  accentColor = 'plum',
  className = ''
}: {
  children: React.ReactNode;
  accentColor?: 'plum' | 'sand' | 'emerald' | 'amber' | 'rose';
  className?: string;
}) {
  const borderColors = {
    plum: 'border-l-[#6B5560] bg-[#C7A9A3]/20 text-[#3E3239]',
    sand: 'border-l-[#C7A9A3] bg-[#F7EFE7] text-[#3E3239]',
    emerald: 'border-l-emerald-600 bg-emerald-50 text-emerald-900',
    amber: 'border-l-amber-600 bg-amber-50 text-amber-900',
    rose: 'border-l-rose-700 bg-rose-50 text-rose-900'
  };

  return (
    <span
      className={`inline-flex items-center pl-2 pr-2.5 py-0.5 border-l-2 text-xs font-mono ${borderColors[accentColor]} ${className}`}
    >
      {children}
    </span>
  );
}

// Pattern 4: Diamond Stamp Indicator (Unicode ◆ diamond glyph)
export function DiamondStamp({
  children,
  glyphColor = 'text-[#C7A9A3]',
  className = ''
}: {
  children: React.ReactNode;
  glyphColor?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border border-[#C7A9A3]/40 bg-[#F7EFE7]/80 text-[#3E3239] shadow-sm ${className}`}
    >
      <span className={`font-serif ${glyphColor}`}>◆</span>
      <span>{children}</span>
    </span>
  );
}

// Generic ArchitecturalBadge dispatcher
export function ArchitecturalBadge({
  children,
  variant = 'notched',
  status = 'default',
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'notched' | 'chamfered' | 'ruled' | 'diamond';
  status?: 'placed' | 'confirmed' | 'dispensing' | 'dispatched' | 'delivered' | 'cancelled' | 'default';
  className?: string;
}) {
  if (variant === 'chamfered') {
    return <ChamferBadge status={status} className={className}>{children}</ChamferBadge>;
  }
  if (variant === 'ruled') {
    return <RuledBadge className={className}>{children}</RuledBadge>;
  }
  if (variant === 'diamond') {
    return <DiamondStamp className={className}>{children}</DiamondStamp>;
  }
  return <NotchedBadge className={className}>{children}</NotchedBadge>;
}
