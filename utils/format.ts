export function formatMoney(value?: number | null) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
}
export function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value); if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}
