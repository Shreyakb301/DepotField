"use client";

import { useMemo, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { formatCurrency, formatDate, TONE_HEX, ORDER_STATUS_TONE } from "@/lib/format";
import { orderTotal, productById } from "@/lib/selectors";
import { cn } from "@/lib/utils";

const NEXT_ACTION_LABEL: Record<OrderStatus, string> = {
  New: "Start Picking",
  Picking: "Mark Packed",
  Packed: "Ship Order",
  Shipped: "Shipped",
};

export default function OrdersPage() {
  const { data, advanceOrder } = useDepot();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.orders;
    return data.orders.filter(
      (o) =>
        o.customer.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q),
    );
  }, [data.orders, query]);

  const columns = ORDER_STATUSES.map((status) => ({
    status,
    orders: filtered
      .filter((o) => o.status === status)
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)),
  }));

  const selectedOrder: Order | undefined = data.orders.find(
    (o) => o.id === selected,
  );

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Move customer orders through the fulfillment pipeline."
      />

      <div className="relative mb-5 max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-faint" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customer or order #"
          className="rounded-[3px] border-rule bg-surface pl-8 text-ink placeholder:text-ink-faint focus-visible:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-px bg-rule sm:grid-cols-2 xl:grid-cols-4">
        {columns.map(({ status, orders }) => (
          <div
            key={status}
            className="flex flex-col bg-background"
            style={{ borderTop: `3px solid ${TONE_HEX[ORDER_STATUS_TONE[status]]}` }}
          >
            <div className="flex items-baseline justify-between px-3 py-2.5">
              <h2 className="font-heading text-base font-bold text-ink">{status}</h2>
              <span className="font-mono text-xs text-ink-faint">{orders.length}</span>
            </div>
            <div className="flex flex-col gap-2 px-3 pb-3">
              {orders.length === 0 && (
                <p className="border border-dashed border-rule py-4 text-center text-xs text-ink-faint">
                  No orders
                </p>
              )}
              {orders.map((o) => (
                <div
                  key={o.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(o.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(o.id);
                    }
                  }}
                  className="flex cursor-pointer flex-col gap-1 border border-rule bg-surface p-3 text-left transition-colors hover:border-ink"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-ink">
                      {o.orderNumber}
                    </span>
                    <span className="text-[11px] text-ink-faint">
                      {formatDate(o.updatedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft">{o.customer}</p>
                  <div className="flex items-center justify-between text-[11px] text-ink-faint">
                    <span>{o.items.reduce((s, i) => s + i.qty, 0)} items</span>
                    <span className="font-mono">{formatCurrency(orderTotal(data, o))}</span>
                  </div>
                  {status !== "Shipped" && (
                    <Button
                      size="xs"
                      variant="outline"
                      className="mt-1.5 justify-center gap-1 rounded-[3px] border-ink text-ink hover:bg-ink hover:text-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        advanceOrder(o.id);
                      }}
                    >
                      {NEXT_ACTION_LABEL[status]}
                      <ArrowRight className="size-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="flex flex-col gap-0 rounded-none border-l border-rule bg-background p-0">
          {selectedOrder && (
            <>
              <SheetHeader
                className="border-b-2 border-ink"
                style={{
                  borderLeft: `4px solid ${TONE_HEX[ORDER_STATUS_TONE[selectedOrder.status]]}`,
                }}
              >
                <SheetTitle className="font-mono text-base text-ink">
                  {selectedOrder.orderNumber}
                </SheetTitle>
                <SheetDescription className="text-ink-soft">
                  {selectedOrder.customer}
                  <br />
                  placed {formatDate(selectedOrder.createdAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="mb-2 text-xs font-medium text-ink-soft">Line items</p>
                <ul className="divide-y divide-rule border border-rule">
                  {selectedOrder.items.map((item) => {
                    const product = productById(data, item.productId);
                    return (
                      <li
                        key={item.productId}
                        className="flex items-center justify-between p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-ink">
                            {product?.name ?? "Unknown product"}
                          </p>
                          <p className="font-mono text-[11px] text-ink-faint">
                            {product?.sku} &nbsp; BIN {product?.bin} &nbsp; QTY {item.qty}
                          </p>
                        </div>
                        <p className="font-mono text-sm text-ink-soft">
                          {product ? formatCurrency(product.unitPrice * item.qty) : "—"}
                        </p>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 flex items-center justify-between border border-ink px-3 py-2 text-sm">
                  <span className="font-medium text-ink">Order total</span>
                  <span className="font-mono font-semibold text-ink">
                    {formatCurrency(orderTotal(data, selectedOrder))}
                  </span>
                </div>
              </div>
              {selectedOrder.status !== "Shipped" && (
                <SheetFooter className="border-t border-rule">
                  <Button
                    className={cn(
                      "w-full rounded-[3px] bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                    onClick={() => advanceOrder(selectedOrder.id)}
                  >
                    {NEXT_ACTION_LABEL[selectedOrder.status]}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </SheetFooter>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
