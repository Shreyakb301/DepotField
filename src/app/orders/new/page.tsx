"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HelpCircle, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useDepot } from "@/lib/store";
import { AvatarBadge } from "@/components/avatar-badge";
import { Button } from "@/components/ui/button";
import { ORDER_PRIORITIES, type OrderPriority } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DraftLine {
  productId: string;
  qty: number;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 flex items-center gap-1 text-sm font-semibold text-ink">
      {children}
      {required && <span className="text-solid-red">*</span>}
      <HelpCircle className="size-3.5 text-ink-faint" />
    </label>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-8 mb-3 border-b border-rule pb-2 text-lg font-semibold text-ink first:mt-0">
      {children}
    </h2>
  );
}

const inputClass =
  "h-9 w-full border border-rule bg-card px-2.5 text-sm text-ink outline-none focus-visible:border-primary";

/** A TDX-style lookup field: text input plus attached search/clear buttons, with a suggestion dropdown. */
function LookupField({
  value,
  onChange,
  placeholder,
  suggestions,
  onSelectSuggestion,
  onClear,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  suggestions: string[];
  onSelectSuggestion: (v: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const showSuggestions = open && suggestions.length > 0;

  return (
    <div className="relative">
      <div className="flex items-stretch border border-rule bg-card focus-within:border-primary">
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="h-9 min-w-0 flex-1 bg-transparent px-2.5 text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Search"
          className="flex w-9 shrink-0 items-center justify-center border-l border-rule text-solid-blue hover:bg-secondary"
        >
          <Search className="size-4" />
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear"
          className="flex w-9 shrink-0 items-center justify-center border-l border-rule text-solid-red hover:bg-secondary"
        >
          <X className="size-4" />
        </button>
      </div>
      {showSuggestions && (
        <ul className="absolute z-10 mt-0.5 w-full border border-rule bg-card shadow-sm">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectSuggestion(s);
                  setOpen(false);
                }}
                className="block w-full px-2.5 py-1.5 text-left text-sm text-ink hover:bg-secondary"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function NewOrderPage() {
  const { data, createOrder } = useDepot();
  const router = useRouter();

  const [customer, setCustomer] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [priority, setPriority] = useState<OrderPriority>("Medium");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ productId: "", qty: 1 }]);
  const [error, setError] = useState<string | null>(null);

  const recentOrders = useMemo(() => {
    const q = customer.trim().toLowerCase();
    if (!q) return [];
    return data.orders.filter((o) => o.customer.toLowerCase().includes(q)).slice(0, 5);
  }, [data.orders, customer]);

  const customerSuggestions = useMemo(() => {
    const q = customer.trim().toLowerCase();
    if (!q) return [];
    const names = Array.from(new Set(data.orders.map((o) => o.customer)));
    return names.filter((n) => n.toLowerCase().includes(q) && n.toLowerCase() !== q).slice(0, 5);
  }, [data.orders, customer]);

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { productId: "", qty: 1 }]);
  }

  function removeLine(index: number) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  const validLines = lines.filter((l) => l.productId && l.qty > 0);
  const total = validLines.reduce((sum, l) => {
    const product = data.products.find((p) => p.id === l.productId);
    return sum + (product ? product.unitPrice * l.qty : 0);
  }, 0);

  function handleSave() {
    if (!customer.trim()) {
      setError("Customer is required.");
      return;
    }
    if (validLines.length === 0) {
      setError("Add at least one item with a product and quantity.");
      return;
    }
    createOrder({
      customer: customer.trim(),
      items: validLines.map((l) => ({ productId: l.productId, qty: l.qty })),
      priority,
      notes,
    });
    router.push("/orders");
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button onClick={handleSave}>
          <Save className="size-3.5" />
          Save
        </Button>
        <Link href="/orders" className="text-sm text-ink-soft hover:text-ink hover:underline">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-4 border border-solid-red bg-solid-red/10 px-3 py-2 text-sm text-solid-red">
          {error}
        </div>
      )}

      <h1 className="text-2xl font-semibold text-ink">New Order</h1>
      <p className="mt-1 text-sm text-ink-faint">Classification: Customer Order</p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading>Customer Information</SectionHeading>
          <div className="max-w-xl">
            <FieldLabel required>Customer</FieldLabel>
            <LookupField
              value={customer}
              onChange={setCustomer}
              placeholder="Start typing a customer name or ID..."
              suggestions={customerSuggestions}
              onSelectSuggestion={setCustomer}
              onClear={() => setCustomer("")}
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="size-4 accent-primary"
              />
              Notify customer
            </label>
          </div>

          <SectionHeading>Order Information</SectionHeading>
          <div>
            <FieldLabel required>Items</FieldLabel>
            <div className="flex flex-col gap-2">
              {lines.map((line, idx) => {
                const product = data.products.find((p) => p.id === line.productId);
                return (
                  <div key={idx} className="flex flex-wrap items-center gap-2">
                    <select
                      value={line.productId}
                      onChange={(e) => updateLine(idx, { productId: e.target.value })}
                      className={cn(inputClass, "max-w-xs flex-1")}
                    >
                      <option value="">Select a product...</option>
                      {data.products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) => updateLine(idx, { qty: Math.max(1, Number(e.target.value)) })}
                      className={cn(inputClass, "w-20")}
                    />
                    <span className="w-20 shrink-0 text-sm text-ink-faint">
                      {product ? formatCurrency(product.unitPrice * line.qty) : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      disabled={lines.length === 1}
                      className="text-ink-faint hover:text-solid-red disabled:pointer-events-none disabled:opacity-30"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={addLine}>
              <Plus className="size-3.5" />
              Add Item
            </Button>
            {validLines.length > 0 && (
              <p className="mt-2 text-sm text-ink-soft">
                Order total: <span className="font-semibold text-ink">{formatCurrency(total)}</span>
              </p>
            )}
          </div>

          <div className="mt-4 max-w-xl">
            <FieldLabel>Notes</FieldLabel>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Optional notes for this order..."
              className={cn(inputClass, "h-auto py-2")}
            />
          </div>

          <SectionHeading>Fulfillment Details</SectionHeading>
          <div className="grid max-w-md grid-cols-2 gap-4">
            <div>
              <FieldLabel>Priority</FieldLabel>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as OrderPriority)}
                className={inputClass}
              >
                {ORDER_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <div className={cn(inputClass, "flex items-center text-ink-soft")}>New</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="border border-rule bg-card p-4">
            <h2 className="mb-3 text-sm font-bold text-ink">Customer</h2>
            <div className="flex items-center gap-3">
              <AvatarBadge name={customer || "?"} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{customer || "No customer yet"}</p>
                <p className="text-xs text-ink-faint">
                  {recentOrders.length > 0
                    ? `${recentOrders.length} recent order${recentOrders.length === 1 ? "" : "s"}`
                    : "New order"}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-rule bg-card p-4">
            <h2 className="mb-3 text-sm font-bold text-ink">
              Recently Ordered{customer.trim() ? ` by ${customer.trim()}` : ""}
            </h2>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-ink-soft">No recent orders.</p>
            ) : (
              <ul className="divide-y divide-rule">
                {recentOrders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="font-semibold text-primary">{o.orderNumber}</span>
                    <span className="text-ink-faint">{formatDate(o.updatedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/orders"
              className="mt-3 block text-xs font-semibold text-primary hover:underline"
            >
              View All Orders &gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
