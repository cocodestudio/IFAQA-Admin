/**
 * Admin Currency & Meta Formatters
 * Aligns cleanly with IFAQA storefront Indian Rupee (INR - ₹) pricing
 * while formatting legacy USD figures cleanly when needed.
 */

export function formatPriceINR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
    return '₹0';
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatOrderAmount(amount: number, currency?: string): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  return formatPriceINR(amount);
}

export function formatShortDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
