import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian currency (₹1,23,456)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to readable Indian format
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}

/**
 * Generate a random booking ID
 */
export function generateBookingId(): string {
  return `BK${Math.floor(Math.random() * 9000) + 1000}`
}

/**
 * Calculate discount percentage
 */
export function discountPercent(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100)
}

/**
 * Validate mobile number (India: 10 digits starting 6-9, Nepal: 10 digits starting 97/98)
 */
export function isValidMobile(phone: string): boolean {
  // Broad 10-digit validation to support both IN and NP
  return /^[6-9]\d{9}$/.test(phone) || /^9[78]\d{8}$/.test(phone);
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return function (...args: Parameters<T>) {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (seconds < 60) return 'Just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  })
}
