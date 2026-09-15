"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Panel } from "@/components/dashboard-box";
import { SolidBar } from "@/components/solid-bar";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  inventoryByCategory,
  inventoryValue,
  lowStockProducts,
  ordersByStatus,
  ordersToFulfill,
  orderTotal,
  warehouseCapacityPct,
} from "@/lib/selectors";
import { formatCurrency, formatDate, ORDER_STATUS_TONE } from "@/lib/format";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_TONE = ["blue", "amber", "green", "purple", "slate", "red"] as const;

type SortKey = "orderNumber" | "customer" | "items" | "total" | "status" | "team" | "dueDate" | "updatedAt";
type SortState = { key: SortKey; dir: "asc" | "desc" };

function SortHead({
  label,
  k,
  align,
  sort,
  onSort,
}: {
  label: string;
  k: SortKey;
  align?: "right";
  sort: SortState;
  onSort: (key: SortKey) => void;
}) {
  const active = sort.key === k;
  const Icon = active ? (sort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        onClick={() => onSort(k)}
        className={cn("flex items-center gap-1 font-bold text-ink hover:text-primary", align === "right" && "ml-auto")}
      >
        {label}
        <Icon className={cn("size-3", active ? "text-primary" : "text-ink-faint")} />
      </button>
    </TableHead>
  );
}

export default function OverviewPage() {
  const { data } = useDepot();
  const router = useRouter();
  const [sort, setSort] = useState<SortState>({
    key: "updatedAt",
    dir: "desc",
  });

  const toFulfill = ordersToFulfill(data);
  const lowStock = lowStockProducts(data);
  const value = inventoryValue(data);
  const capacityPct = warehouseCapacityPct(data);
  const byCategory = inventoryByCategory(data).sort((a, b) => b.stock - a.stock);
  const byStatus = ordersByStatus(data);

  const maxCategory = Math.max(1, ...byCategory.map((c) => c.stock));
  const maxStatus = Math.max(1, ...byStatus.map((s) => s.count));

  const delayedPOs = data.purchaseOrders.filter((po) => po.status === "Delayed");
  const onHold = data.qualityHolds.filter((q) => q.status === "On Hold");

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  function sortValue(o: Order, key: SortKey) {
    switch (key) {
      case "orderNumber":
        return o.orderNumber;
      case "customer":
        return o.customer;
      case "items":
        return o.items.reduce((s, i) => s + i.qty, 0);
      case "total":
        return orderTotal(data, o);
      case "status":
        return o.status;
      case "team":
        return o.team;
      case "dueDate":
        return o.dueDate;
      case "updatedAt":
        return o.updatedAt;
    }
  }

  function overdue(o: Order): boolean {
    return o.status !== "Shipped" && o.dueDate < new Date().toISOString().slice(0, 10);
  }

  const sortedOrders = useMemo(() => {
    return [...data.orders].sort((a, b) => {
      const av = sortValue(a, sort.key);
      const bv = sortValue(b, sort.key);
      const cmp =
        typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sort]);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Fulfillment, inventory, and warehouse capacity as of today."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <Panel title="Snapshot">
            <dl className="flex flex-col divide-y divide-rule text-sm">
              <div className="flex items-center justify-between py-2 first:pt-0">
                <dt className="text-ink-soft">Orders open</dt>
                <dd className="font-bold text-solid-blue">
                  {toFulfill} <span className="font-normal text-ink-faint">/ {data.orders.length}</span>
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-ink-soft">Low stock items</dt>
                <dd className={cn("font-bold", lowStock.length > 0 ? "text-solid-red" : "text-solid-green")}>
                  {lowStock.length}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-ink-soft">Inventory value</dt>
                <dd className="font-bold text-solid-green">{formatCurrency(value)}</dd>
              </div>
              <div className="flex items-center justify-between py-2 last:pb-0">
                <dt className="text-ink-soft">Warehouse capacity</dt>
                <dd className={cn("font-bold", capacityPct >= 85 ? "text-solid-red" : "text-solid-blue")}>
                  {capacityPct}%
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Quick Actions">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-ink">New Order</p>
                <p className="text-xs text-ink-soft">Create a new customer order.</p>
                <Link href="/orders/new" className={cn(buttonVariants({ size: "sm" }), "mt-2 w-full")}>
                  New Order
                </Link>
              </div>
              <div className="border-t border-rule pt-4">
                <p className="text-sm font-semibold text-ink">Reorder</p>
                <p className="text-xs text-ink-soft">
                  {lowStock.length} product{lowStock.length === 1 ? "" : "s"} below their reorder point.
                </p>
                <Link
                  href="/reorder-planning"
                  className={cn(buttonVariants({ size: "sm" }), "mt-2 w-full")}
                >
                  Reorder Plan
                </Link>
              </div>
              <div className="border-t border-rule pt-4">
                <p className="text-sm font-semibold text-ink">Receiving</p>
                <p className="text-xs text-ink-soft">
                  {delayedPOs.length} delayed, {onHold.length} on quality hold.
                </p>
                <Link
                  href="/receiving"
                  className={cn(buttonVariants({ size: "sm" }), "mt-2 w-full")}
                >
                  Receiving Queue
                </Link>
              </div>
            </div>
          </Panel>

          <Panel
            title="Low Stock"
            action={
              <Link href="/reorder-planning" className="text-xs font-semibold text-primary hover:underline">
                View all &gt;
              </Link>
            }
          >
            <ul className="divide-y divide-rule">
              {lowStock.length === 0 && (
                <li className="py-3 text-sm text-ink-soft">Nothing is below its reorder point.</li>
              )}
              {lowStock.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm first:pt-0">
                  <div className="min-w-0">
                    <p className="truncate text-ink">{p.name}</p>
                    <p className="text-xs text-ink-faint">bin {p.bin}</p>
                  </div>
                  <span className="shrink-0 font-bold text-solid-amber">
                    {p.stock}/{p.reorderPoint}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Needs Attention"
            action={
              <Link href="/receiving" className="text-xs font-semibold text-primary hover:underline">
                View all &gt;
              </Link>
            }
          >
            <ul className="divide-y divide-rule">
              {delayedPOs.length === 0 && onHold.length === 0 && (
                <li className="py-3 text-sm text-ink-soft">Nothing needs attention right now.</li>
              )}
              {delayedPOs.map((po) => (
                <li key={po.id} className="flex items-center justify-between py-2 text-sm first:pt-0">
                  <span className="text-ink">{po.poNumber}</span>
                  <StatusBadge label="Delayed" tone="red" />
                </li>
              ))}
              {onHold.map((q) => {
                const product = data.products.find((p) => p.id === q.productId);
                return (
                  <li key={q.id} className="flex items-center justify-between py-2 text-sm first:pt-0">
                    <span className="truncate text-ink">{product?.name ?? "Unknown product"}</span>
                    <StatusBadge label="Hold" tone="amber" />
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <div className="lg:col-span-2">
          <Panel
            title="All Orders"
            action={
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink-faint">{data.orders.length} total</span>
                <Link href="/orders/new" className={buttonVariants({ size: "sm" })}>
                  New Order
                </Link>
              </div>
            }
          >
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-ink hover:bg-transparent">
                  <SortHead label="Order #" k="orderNumber" sort={sort} onSort={toggleSort} />
                  <SortHead label="Customer" k="customer" sort={sort} onSort={toggleSort} />
                  <SortHead label="Items" k="items" align="right" sort={sort} onSort={toggleSort} />
                  <SortHead label="Total" k="total" align="right" sort={sort} onSort={toggleSort} />
                  <SortHead label="Status" k="status" sort={sort} onSort={toggleSort} />
                  <SortHead label="Team" k="team" sort={sort} onSort={toggleSort} />
                  <SortHead label="Due" k="dueDate" sort={sort} onSort={toggleSort} />
                  <SortHead label="Modified" k="updatedAt" sort={sort} onSort={toggleSort} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((o) => (
                  <TableRow
                    key={o.id}
                    onClick={() => router.push(`/orders/${o.id}`)}
                    className="cursor-pointer border-rule hover:bg-secondary/50"
                  >
                    <TableCell className="font-semibold text-primary">{o.orderNumber}</TableCell>
                    <TableCell className="text-ink-soft">{o.customer}</TableCell>
                    <TableCell className="text-right text-ink-soft">
                      {o.items.reduce((s, i) => s + i.qty, 0)}
                    </TableCell>
                    <TableCell className="text-right text-ink-soft">{formatCurrency(orderTotal(data, o))}</TableCell>
                    <TableCell>
                      <StatusBadge label={o.status} tone={ORDER_STATUS_TONE[o.status]} />
                    </TableCell>
                    <TableCell className="text-ink-soft">{o.team}</TableCell>
                    <TableCell className={overdue(o) ? "font-bold text-solid-red" : "text-ink-faint"}>
                      {formatDate(o.dueDate)}
                    </TableCell>
                    <TableCell className="text-ink-faint">{formatDate(o.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Inventory by Category">
          <div className="flex flex-col gap-2.5">
            {byCategory.map((c, i) => (
              <div key={c.category} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 truncate text-ink-soft">{c.category}</span>
                <SolidBar value={c.stock} max={maxCategory} tone={CATEGORY_TONE[i % CATEGORY_TONE.length]} />
                <span className="w-10 shrink-0 text-right font-bold text-ink">{c.stock}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Orders by Status">
          <div className="flex flex-col gap-2.5">
            {byStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 truncate text-ink-soft">{s.status}</span>
                <SolidBar value={s.count} max={maxStatus} tone={ORDER_STATUS_TONE[s.status]} />
                <span className="w-10 shrink-0 text-right font-bold text-ink">{s.count}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
