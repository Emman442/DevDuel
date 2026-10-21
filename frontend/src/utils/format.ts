/**
 * Utilities for formatting values according to DevDuel terminal specification.
 */

export function formatGEN(amount: number): string {
  return new Intl.NumberFormat('en-US').format(Math.floor(amount)) + ' GEN';
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(Math.floor(val));
}

export function formatPercent(part: number, total: number): string {
  if (total <= 0) return '50%';
  const pct = Math.round((part / total) * 100);
  return `${pct}%`;
}

export function calculateOdds(pool: number, total: number): string {
  if (pool <= 0 || total <= 0) return '2.00x';
  const multiplier = (total * 0.98) / pool; // 2% protocol fee
  return `${multiplier.toFixed(2)}x`;
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function truncateUrl(url: string, maxLength = 44): string {
  if (!url) return '';
  const cleaned = url.replace(/^https?:\/\//, '');
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 3)}...`;
}

export function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return 'api.github.com';
  }
}

/**
 * Returns formatted time remaining or "resolvable" / "finalized".
 * Baseline time is 2026-10-20T10:58:10Z.
 */
export function formatTimeRemaining(deadlineIso: number, status: string): {
  text: string;
  isResolvable: boolean;
  isPast: boolean;
} {
  if (status === 'finalized') {
    return { text: 'finalized', isResolvable: false, isPast: true };
  }
  if (status === 'resolved') {
    return { text: 'resolved', isResolvable: false, isPast: true };
  }

  const deadline = new Date(deadlineIso).getTime();
  const now = new Date(Date.now()).getTime();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return { text: 'resolvable', isResolvable: true, isPast: true };
  }

  const diffSec = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSec / 86400);
  const hours = Math.floor((diffSec % 86400) / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);

  if (days > 0) {
    return { text: `${days}d ${hours}h`, isResolvable: false, isPast: false };
  }
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m`, isResolvable: false, isPast: false };
  }
  return { text: `${minutes}m`, isResolvable: false, isPast: false };
}
