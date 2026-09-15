"use client";

import { useMemo, useState } from "react";
import { Search, ArrowRight, Package } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
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
import { formatCurrency, formatDate, ORDER_STATUS_TONE } from "@/lib/format";
import { orderTotal, productById } from "@/lib/selectors";

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

      <div className="mb-4 relative max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customer or order #"
          className="pl-8"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map(({ status, orders }) => (
          <div key={status} className="flex flex-col rounded-xl border border-border bg-secondary/40">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <div className="flex items-center gap-2">
                <StatusBadge label={status} tone={ORDER_STATUS_TONE[status]} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {orders.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-2.5">
              {orders.length === 0 && (
                <p className="p-3 text-center text-xs text-muted-foreground">
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
                  className="flex cursor-pointer flex-col gap-1.5 rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {o.orderNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(o.updatedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{o.customer}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {o.items.reduce((s, i) => s + i.qty, 0)} items &middot;{" "}
                      {formatCurrency(orderTotal(data, o))}
                    </span>
                  </div>
                  {status !== "Shipped" && (
                    <Button
                      size="xs"
                      variant="secondary"
                      className="mt-1 justify-center gap-1"
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
        <SheetContent className="flex flex-col gap-0 p-0">
          {selectedOrder && (
            <>
              <SheetHeader className="border-b border-border">
                <SheetTitle className="flex items-center gap-2">
                  <Package className="size-4 text-emerald-600" />
                  {selectedOrder.orderNumber}
                </SheetTitle>
                <SheetDescription>
                  {selectedOrder.customer} &middot; placed {formatDate(selectedOrder.createdAt)}
                </SheetDescription>
                <StatusBadge
                  label={selectedOrder.status}
                  tone={ORDER_STATUS_TONE[selectedOrder.status]}
                  className="mt-1 w-fit"
                />
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Line items
                </p>
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {selectedOrder.items.map((item) => {
                    const product = productById(data, item.productId);
                    return (
                      <li
                        key={item.productId}
                        className="flex items-center justify-between p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {product?.name ?? "Unknown product"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product?.sku} &middot; Bin {product?.bin} &middot; Qty {item.qty}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product ? formatCurrency(product.unitPrice * item.qty) : "—"}
                        </p>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
                  <span className="font-medium text-foreground">Order total</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(orderTotal(data, selectedOrder))}
                  </span>
                </div>
              </div>
              {selectedOrder.status !== "Shipped" && (
                <SheetFooter className="border-t border-border">
                  <Button
                    className="w-full"
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
