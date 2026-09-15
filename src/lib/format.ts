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

/**
 * Ink colors, the way a warehouse stamp pad has a handful of colors and
 * each one means something specific — not a decorative rainbow.
 */
type BadgeTone = "neutral" | "ok" | "flag" | "danger" | "info" | "cardboard";

export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  New: "info",
  Picking: "flag",
  Packed: "cardboard",
  Shipped: "ok",
};

export const PRODUCT_STATUS_TONE: Record<ProductStatus, BadgeTone> = {
  active: "ok",
  quality_hold: "flag",
  discontinued: "neutral",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: "Active",
  quality_hold: "Quality Hold",
  discontinued: "Discontinued",
};

export const PO_STATUS_TONE: Record<POStatus, BadgeTone> = {
  Pending: "info",
  "In Transit": "cardboard",
  Delayed: "danger",
  "Partially Received": "flag",
  Received: "ok",
};

export const QUALITY_HOLD_TONE: Record<QualityHoldStatus, BadgeTone> = {
  "On Hold": "flag",
  Released: "ok",
  Rejected: "danger",
};

export const TONE_CLASSNAMES: Record<BadgeTone, string> = {
  neutral: "bg-secondary text-ink-soft border-rule-strong",
  ok: "bg-stamp-ok-soft text-stamp-ok border-stamp-ok/45",
  flag: "bg-stamp-flag-soft text-stamp-flag border-stamp-flag/45",
  danger: "bg-stamp-danger-soft text-stamp-danger border-stamp-danger/45",
  info: "bg-stamp-info-soft text-stamp-info border-stamp-info/45",
  cardboard: "bg-stamp-cardboard-soft text-stamp-cardboard border-stamp-cardboard/45",
};

/** Hex values for contexts that can't take Tailwind classes (Recharts). */
export const TONE_HEX: Record<BadgeTone, string> = {
  neutral: "#6E6656",
  ok: "#2F5D3A",
  flag: "#C98A12",
  danger: "#A6321E",
  info: "#375A7F",
  cardboard: "#8B6A4F",
};

export type { BadgeTone };
