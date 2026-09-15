"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/dashboard-box";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { formatCurrency, formatDate, ORDER_STATUS_TONE } from "@/lib/format";
import { orderTotal } from "@/lib/selectors";

const NEXT_ACTION_LABEL: Record<OrderStatus, string> = {
  New: "Start Picking",
  Picking: "Mark Packed",
  Packed: "Ship Order",
  Shipped: "Shipped",
};

export default function OrdersPage() {
  const { data, advanceOrder } = useDepot();
  const router = useRouter();
  const [query, setQuery] = useState("");

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

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Move customer orders through the fulfillment pipeline. Click an order to open its ticket."
        action={
          <Link href="/orders/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="size-3.5" />
            New Order
          </Link>
        }
      />

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search customer or order #"
        className="mb-5 max-w-xs border-rule bg-background text-ink placeholder:text-ink-faint focus-visible:border-ink"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map(({ status, orders }) => (
          <Panel
            key={status}
            title={status}
            action={<StatusBadge label={String(orders.length)} tone={ORDER_STATUS_TONE[status]} />}
          >
            <div className="flex flex-col gap-2">
              {orders.length === 0 && (
                <p className="py-4 text-center text-xs text-ink-faint">No orders</p>
              )}
              {orders.map((o) => (
                <div
                  key={o.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/orders/${o.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/orders/${o.id}`);
                    }
                  }}
                  className="flex cursor-pointer flex-col gap-1 rounded-md border border-rule p-2.5 text-sm transition-colors hover:border-primary hover:bg-secondary/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{o.orderNumber}</span>
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
                      className="mt-1 justify-center"
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
          </Panel>
        ))}
      </div>
    </div>
  );
}
