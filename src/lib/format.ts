import type { OrderStatus, POStatus, ProductStatus, QualityHoldStatus } from "./types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  return Math.round((target - today) / 86_400_000);
}

/** Two signals, nothing decorative: something needs attention, or something's done. */
export type StatusTone = "default" | "good" | "bad";

export const ORDER_STATUS_TONE: Record<OrderStatus, StatusTone> = {
  New: "default",
  Picking: "default",
  Packed: "default",
  Shipped: "good",
};

export const PRODUCT_STATUS_TONE: Record<ProductStatus, StatusTone> = {
  active: "default",
  quality_hold: "bad",
  discontinued: "default",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: "Active",
  quality_hold: "Quality Hold",
  discontinued: "Discontinued",
};

export const PO_STATUS_TONE: Record<POStatus, StatusTone> = {
  Pending: "default",
  "In Transit": "default",
  Delayed: "bad",
  "Partially Received": "default",
  Received: "good",
};

export const QUALITY_HOLD_TONE: Record<QualityHoldStatus, StatusTone> = {
  "On Hold": "bad",
  Released: "good",
  Rejected: "bad",
};
