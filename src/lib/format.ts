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

type BadgeTone = "neutral" | "emerald" | "amber" | "sky" | "rose" | "violet";

export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  New: "sky",
  Picking: "amber",
  Packed: "violet",
  Shipped: "emerald",
};

export const PRODUCT_STATUS_TONE: Record<ProductStatus, BadgeTone> = {
  active: "emerald",
  quality_hold: "amber",
  discontinued: "neutral",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: "Active",
  quality_hold: "Quality Hold",
  discontinued: "Discontinued",
};

export const PO_STATUS_TONE: Record<POStatus, BadgeTone> = {
  Pending: "sky",
  "In Transit": "violet",
  Delayed: "rose",
  "Partially Received": "amber",
  Received: "emerald",
};

export const QUALITY_HOLD_TONE: Record<QualityHoldStatus, BadgeTone> = {
  "On Hold": "amber",
  Released: "emerald",
  Rejected: "rose",
};

export const TONE_CLASSNAMES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
};

export type { BadgeTone };
