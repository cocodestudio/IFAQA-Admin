import React from 'react';

export function NotchedBadge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'sand' | 'plum' | 'alert';
  className?: string;
}) {
  const variantStyles = {
    default: 'border border-ifaqa-plum/15 bg-ifaqa-cashmere text-ifaqa-plum',
    sand: 'border border-ifaqa-sand/60 bg-[#FAF5EC] text-ifaqa-plum',
    plum: 'border border-ifaqa-plum bg-ifaqa-plum text-ifaqa-linen',
    alert: 'border border-red-700/25 bg-red-50 text-red-900',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-sans font-medium whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function ChamferBadge({
  children,
  status = 'default',
  className = '',
}: {
  children: React.ReactNode;
  status?: 'placed' | 'confirmed' | 'dispensing' | 'dispatched' | 'delivered' | 'cancelled' | 'default';
  className?: string;
}) {
  const statusStyles: Record<string, string> = {
    placed: 'bg-ifaqa-cashmere text-ifaqa-plum border border-ifaqa-plum/15',
    confirmed: 'bg-[#FAF5EC] text-[#7A591C] border border-[#DFBA73]',
    dispensing: 'bg-[#EEF4F1] text-[#165A45] border border-[#165A45]/30',
    dispatched: 'bg-[#165A45] text-ifaqa-linen border border-[#165A45]',
    delivered: 'bg-ifaqa-plum text-ifaqa-linen border border-ifaqa-plum',
    cancelled: 'bg-red-50 text-red-800 border border-red-200',
    default: 'bg-ifaqa-plum text-ifaqa-linen border border-ifaqa-plum',
  };

  return (
    <span
      className={`chamfer-badge inline-flex items-center px-2.5 py-0.5 text-xs font-sans font-medium capitalize ${
        statusStyles[status] || statusStyles.default
      } ${className}`}
      style={{
        clipPath:
          'polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)',
      }}
    >
      {children}
    </span>
  );
}

export function RuledBadge({
  children,
  accentColor = 'plum',
  className = '',
}: {
  children: React.ReactNode;
  accentColor?: 'plum' | 'sand' | 'emerald' | 'amber' | 'rose';
  className?: string;
}) {
  const borderColors = {
    plum: 'border-l-2 border-l-ifaqa-plum bg-ifaqa-cashmere text-ifaqa-plum',
    sand: 'border-l-2 border-l-ifaqa-mauve bg-[#FAF5EC] text-ifaqa-plum',
    emerald: 'border-l-2 border-l-[#165A45] bg-[#EEF4F1] text-[#0B2D22]',
    amber: 'border-l-2 border-l-amber-600 bg-amber-50 text-amber-900',
    rose: 'border-l-2 border-l-red-700 bg-red-50 text-red-900',
  };

  return (
    <span
      className={`inline-flex items-center pl-2 pr-2.5 py-0.5 rounded-r text-xs font-mono tabular-nums whitespace-nowrap ${borderColors[accentColor]} ${className}`}
    >
      {children}
    </span>
  );
}

export function DiamondStamp({
  children,
  glyphColor = 'text-ifaqa-mauve',
  className = '',
}: {
  children: React.ReactNode;
  glyphColor?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border border-ifaqa-plum/10 bg-white text-ifaqa-plum ${className}`}
    >
      <span className={glyphColor}>◆</span>
      <span>{children}</span>
    </span>
  );
}

export function ArchitecturalBadge({
  children,
  variant = 'notched',
  status = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'notched' | 'chamfered' | 'ruled' | 'diamond';
  status?: 'placed' | 'confirmed' | 'dispensing' | 'dispatched' | 'delivered' | 'cancelled' | 'default';
  className?: string;
}) {
  if (variant === 'chamfered') {
    return (
      <ChamferBadge status={status} className={className}>
        {children}
      </ChamferBadge>
    );
  }
  if (variant === 'ruled') {
    return <RuledBadge className={className}>{children}</RuledBadge>;
  }
  if (variant === 'diamond') {
    return <DiamondStamp className={className}>{children}</DiamondStamp>;
  }
  return <NotchedBadge className={className}>{children}</NotchedBadge>;
}
