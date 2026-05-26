import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian currency (₹)
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Truncate a string to a given length
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * Format a number to compact notation (1.2K, 1.5M)
 */
export function formatCompact(num: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Delay execution (used for simulated async operations)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get a random element from an array
 */
export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Check if a URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculate platform commission
 */
export function calculateCommission(
  subtotal: number,
  commissionRate = 10
): number {
  return Math.round((subtotal * commissionRate) / 100);
}

/**
 * Get order status color
 */
export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:    "bg-amber-100 text-amber-700",
    CONFIRMED:  "bg-blue-100 text-blue-700",
    PROCESSING: "bg-indigo-100 text-indigo-700",
    SHIPPED:    "bg-purple-100 text-purple-700",
    DELIVERED:  "bg-green-100 text-green-700",
    CANCELLED:  "bg-red-100 text-red-700",
    REFUNDED:   "bg-gray-100 text-gray-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

/**
 * Get seller status color
 */
export function getSellerStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:   "bg-amber-100 text-amber-700",
    APPROVED:  "bg-green-100 text-green-700",
    REJECTED:  "bg-red-100 text-red-700",
    SUSPENDED: "bg-gray-100 text-gray-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

/**
 * Get refund status color
 */
export function getRefundStatusColor(status: string): string {
  const map: Record<string, string> = {
    INITIATED:    "bg-blue-100 text-blue-700",
    UNDER_REVIEW: "bg-amber-100 text-amber-700",
    APPROVED:     "bg-indigo-100 text-indigo-700",
    PROCESSED:    "bg-green-100 text-green-700",
    REJECTED:     "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}
