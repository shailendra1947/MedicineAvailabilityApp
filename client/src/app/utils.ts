import { Medicine } from './models';

export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(`${expiryDate}T00:00:00`);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(expiryDate: string): boolean {
  return daysUntilExpiry(expiryDate) < 30;
}

export function isLowStock(quantity: number): boolean {
  return quantity < 10;
}

export function rowClass(medicine: Medicine): string {
  if (isExpiringSoon(medicine.expiryDate)) {
    return 'row-expiring';
  }
  if (isLowStock(medicine.quantity)) {
    return 'row-low-stock';
  }
  return '';
}

export function formatCurrency(value: number): string {
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
