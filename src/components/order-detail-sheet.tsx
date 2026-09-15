"use client";

import { Printer } from "lucide-react";
import { useDepot } from "@/lib/store";
import { AvatarBadge } from "@/components/avatar-badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  ORDER_STATUSES,
  ORDER_PRIORITIES,
  type Order,
  type OrderStatus,
  type OrderPriority,
} from "@/lib/types";
import { formatCurrency, formatDate, ORDER_STATUS_TONE, TONE_TEXT_CLASS } from "@/lib/format";
import { orderTotal, productById } from "@/lib/selectors";
import { cn } from "@/lib/utils";

const NEXT_ACTION_LABEL: Record<OrderStatus, string> = {
  New: "Start Picking",
  Picking: "Mark Packed",
  Packed: "Ship Order",
  Shipped: "Shipped",
};

const selectClass =
  "h-8 border border-rule bg-background px-2 text-sm text-ink outline-none focus-visible:border-primary";

/** The order "ticket" panel: view + edit status, priority, and notes for one order. */
export function OrderDetailSheet({
  orderId,
  onOpenChange,
}: {
  orderId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, advanceOrder, setOrderStatus, updateOrderPriority, updateOrderNotes } = useDepot();
  const order: Order | undefined = data.orders.find((o) => o.id === orderId);

  return (
    <Sheet open={!!order} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 bg-background p-0 data-[side=right]:sm:max-w-2xl">
        {order && (
          <>
            <SheetHeader className="border-b border-rule pb-3">
              <div className="flex items-start justify-between gap-3">
                <SheetTitle className="text-2xl font-semibold text-ink">{order.customer}</SheetTitle>
                <span
                  className={cn("shrink-0 text-lg font-bold", TONE_TEXT_CLASS[ORDER_STATUS_TONE[order.status]])}
                >
                  {order.status}
                </span>
              </div>
              <p className="flex items-center gap-2 text-sm text-ink-soft">
                Order #: <span className="font-mono text-ink">{order.orderNumber}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {order.status !== "Shipped" && (
                  <Button size="sm" onClick={() => advanceOrder(order.id)}>
                    {NEXT_ACTION_LABEL[order.status]} &gt;
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => window.print()}>
                  <Printer className="size-3.5" />
                  Print View
                </Button>
              </div>
            </SheetHeader>

            <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <h3 className="mb-2 border-b border-rule pb-1.5 text-base font-semibold text-ink">Details</h3>
                <dl className="mb-4 grid grid-cols-2 gap-y-2 text-sm">
                  <dt className="text-ink-faint">Created</dt>
                  <dd className="text-ink">{formatDate(order.createdAt)}</dd>
                  <dt className="text-ink-faint">Last Modified</dt>
                  <dd className="text-ink">{formatDate(order.updatedAt)}</dd>
                </dl>

                <h3 className="mb-2 border-b border-rule pb-1.5 text-base font-semibold text-ink">Edit</h3>
                <div className="mb-4 flex flex-wrap items-end gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink-soft">Status</label>
                    <select
                      value={order.status}
                      onChange={(e) => setOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={selectClass}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink-soft">Priority</label>
                    <select
                      value={order.priority}
                      onChange={(e) => updateOrderPriority(order.id, e.target.value as OrderPriority)}
                      className={selectClass}
                    >
                      {ORDER_PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-1 block text-xs font-semibold text-ink-soft">Notes</label>
                  <textarea
                    key={order.id}
                    defaultValue={order.notes ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== (order.notes ?? "")) {
                        updateOrderNotes(order.id, e.target.value);
                      }
                    }}
                    rows={3}
                    placeholder="Add a note for this order..."
                    className="w-full border border-rule bg-background px-2.5 py-2 text-sm text-ink outline-none focus-visible:border-primary"
                  />
                </div>

                <p className="mb-2 text-xs font-bold text-ink">Line Items</p>
                <ul className="divide-y divide-rule rounded-md border border-rule">
                  {order.items.map((item) => {
                    const product = productById(data, item.productId);
                    return (
                      <li key={item.productId} className="flex items-center justify-between p-3 text-sm">
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
                <div className="mt-3 flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm">
                  <span className="font-bold text-ink">Order Total</span>
                  <span className="font-bold text-ink">{formatCurrency(orderTotal(data, order))}</span>
                </div>
              </div>

              <div>
                <div className="border border-rule bg-card p-3">
                  <h3 className="mb-3 text-sm font-bold text-ink">Customer</h3>
                  <div className="flex items-center gap-3">
                    <AvatarBadge name={order.customer} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{order.customer}</p>
                      <p className="text-xs text-ink-faint">
                        {data.orders.filter((o) => o.customer === order.customer).length} order(s) total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
