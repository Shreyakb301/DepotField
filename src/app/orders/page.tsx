"use client";

import { useMemo, useState } from "react";
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
import { formatCurrency, formatDate } from "@/lib/format";
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

  const selectedOrder: Order | undefined = data.orders.find((o) => o.id === selected);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Move customer orders through the fulfillment pipeline."
      />

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search customer or order #"
        className="mb-5 max-w-xs border-rule bg-background text-ink placeholder:text-ink-faint focus-visible:border-ink"
      />

      <div className="grid grid-cols-1 divide-y divide-rule border-t-2 border-ink sm:grid-cols-2 sm:divide-y-0 sm:divide-x sm:border-l sm:border-r xl:grid-cols-4">
        {columns.map(({ status, orders }) => (
          <div key={status} className="flex flex-col">
            <div className="flex items-baseline justify-between border-b border-rule px-3 py-2">
              <h2 className="text-sm font-bold text-ink">{status.toUpperCase()}</h2>
              <span className="text-xs text-ink-faint">{orders.length}</span>
            </div>
            <div className="flex flex-col divide-y divide-rule">
              {orders.length === 0 && (
                <p className="px-3 py-4 text-xs text-ink-faint">no orders</p>
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
                  className="flex cursor-pointer flex-col gap-1 px-3 py-3 text-sm transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{o.orderNumber}</span>
                    <span className="text-xs text-ink-faint">{formatDate(o.updatedAt)}</span>
                  </div>
                  <p className="text-ink-soft">{o.customer}</p>
                  <div className="flex items-center justify-between text-xs text-ink-faint">
                    <span>{o.items.reduce((s, i) => s + i.qty, 0)} items</span>
                    <span>{formatCurrency(orderTotal(data, o))}</span>
                  </div>
                  {status !== "Shipped" && (
                    <Button
                      size="xs"
                      variant="outline"
                      className="mt-1 justify-center border-ink text-ink hover:bg-ink hover:text-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        advanceOrder(o.id);
                      }}
                    >
                      {NEXT_ACTION_LABEL[status]} &gt;
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="flex flex-col gap-0 border-l-2 border-ink bg-background p-0">
          {selectedOrder && (
            <>
              <SheetHeader className="border-b-2 border-ink">
                <SheetTitle className="text-ink">{selectedOrder.orderNumber}</SheetTitle>
                <SheetDescription className="text-ink-soft">
                  {selectedOrder.customer}
                  <br />
                  placed {formatDate(selectedOrder.createdAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="mb-2 text-xs font-bold text-ink">LINE ITEMS</p>
                <ul className="divide-y divide-rule border border-rule">
                  {selectedOrder.items.map((item) => {
                    const product = productById(data, item.productId);
                    return (
                      <li
                        key={item.productId}
                        className="flex items-center justify-between p-3 text-sm"
                      >
                        <div>
                          <p className="text-ink">{product?.name ?? "Unknown product"}</p>
                          <p className="text-[11px] text-ink-faint">
                            {product?.sku} bin {product?.bin} qty {item.qty}
                          </p>
                        </div>
                        <p className="text-ink-soft">
                          {product ? formatCurrency(product.unitPrice * item.qty) : "—"}
                        </p>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 flex items-center justify-between border border-ink px-3 py-2 text-sm">
                  <span className="font-bold text-ink">ORDER TOTAL</span>
                  <span className="font-bold text-ink">
                    {formatCurrency(orderTotal(data, selectedOrder))}
                  </span>
                </div>
              </div>
              {selectedOrder.status !== "Shipped" && (
                <SheetFooter className="border-t border-rule">
                  <Button
                    className="w-full bg-ink text-background hover:bg-ink/85"
                    onClick={() => advanceOrder(selectedOrder.id)}
                  >
                    {NEXT_ACTION_LABEL[selectedOrder.status]} &gt;
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
