import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string): string {
  return `${price.toLocaleString()} ${currency}`;
}

/**
 * Tạo mã đơn hàng ngẫu nhiên
 * Format: EDU-YYYYMMDD-XXXXX (X là ký tự ngẫu nhiên)
 */
export function generateOrderCode(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // Tạo 5 ký tự ngẫu nhiên
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `EDU-${dateStr}-${randomChars}`;
}
