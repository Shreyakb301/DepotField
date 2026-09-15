import type { OrderStatus, POStatus, ProductStatus, QualityHoldStatus } from "./types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
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

/** A small set of solid dashboard colors. Each one means the same thing everywhere it appears. */
export type StatusTone = "blue" | "amber" | "green" | "red" | "purple" | "teal" | "slate";

export const TONE_HEX: Record<StatusTone, string> = {
  blue: "#2563EB",
  amber: "#D97706",
  green: "#16A34A",
  red: "#DC2626",
  purple: "#7C3AED",
  teal: "#0D9488",
  slate: "#475569",
};

export const TONE_BG_CLASS: Record<StatusTone, string> = {
  blue: "bg-solid-blue",
  amber: "bg-solid-amber",
  green: "bg-solid-green",
  red: "bg-solid-red",
  purple: "bg-solid-purple",
  teal: "bg-solid-teal",
  slate: "bg-solid-slate",
};

export const TONE_TEXT_CLASS: Record<StatusTone, string> = {
  blue: "text-solid-blue",
  amber: "text-solid-amber",
  green: "text-solid-green",
  red: "text-solid-red",
  purple: "text-solid-purple",
  teal: "text-solid-teal",
  slate: "text-solid-slate",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, StatusTone> = {
  New: "blue",
  Picking: "amber",
  Packed: "purple",
  Shipped: "green",
};

export const PRODUCT_STATUS_TONE: Record<ProductStatus, StatusTone> = {
  active: "green",
  quality_hold: "red",
  discontinued: "slate",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: "Active",
  quality_hold: "Quality Hold",
  discontinued: "Discontinued",
};

export const PO_STATUS_TONE: Record<POStatus, StatusTone> = {
  Pending: "blue",
  "In Transit": "purple",
  Delayed: "red",
  "Partially Received": "amber",
  Received: "green",
};

export const QUALITY_HOLD_TONE: Record<QualityHoldStatus, StatusTone> = {
  "On Hold": "amber",
  Released: "green",
  Rejected: "red",
};
