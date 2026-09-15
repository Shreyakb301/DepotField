"use client";

import Link from "next/link";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { AsciiBar } from "@/components/ascii-bar";
import {
  inventoryByCategory,
  inventoryValue,
  lowStockProducts,
  ordersByStatus,
  ordersToFulfill,
  warehouseCapacityPct,
} from "@/lib/selectors";
import { formatCurrency, formatDate } from "@/lib/format";

export default function OverviewPage() {
  const { data } = useDepot();

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

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Fulfillment, inventory, and warehouse capacity as of today."
      />

      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-rule pb-5 text-sm">
        <div>
          <span className="font-bold text-ink">ORDERS OPEN </span>
          <span className="text-ink">{toFulfill}</span>
          <span className="text-ink-faint"> / {data.orders.length}</span>
        </div>
        <div>
          <span className="font-bold text-ink">LOW STOCK </span>
          <span className={lowStock.length > 0 ? "font-bold text-bad" : "text-ink"}>
            {lowStock.length}
          </span>
        </div>
        <div>
          <span className="font-bold text-ink">INV VALUE </span>
          <span className="text-ink">{formatCurrency(value)}</span>
        </div>
        <div>
          <span className="font-bold text-ink">CAPACITY </span>
          <span className={capacityPct >= 85 ? "font-bold text-bad" : "text-ink"}>
            {capacityPct}%
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 overflow-x-auto lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-bold text-ink">INVENTORY BY CATEGORY</h2>
          <div className="flex flex-col gap-1.5 text-sm">
            {byCategory.map((c) => (
              <div key={c.category} className="flex items-center gap-2">
                <span className="w-32 shrink-0 truncate text-ink-soft">{c.category}</span>
                <AsciiBar value={c.stock} max={maxCategory} width={20} />
                <span className="w-10 shrink-0 text-right text-ink">{c.stock}</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-bold text-ink">ORDERS BY STATUS</h2>
          <div className="flex flex-col gap-1.5 text-sm">
            {byStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-2">
                <span className="w-16 shrink-0 truncate text-ink-soft">{s.status}</span>
                <AsciiBar
                  value={s.count}
                  max={maxStatus}
                  width={20}
                  tone={s.status === "Shipped" ? "good" : "default"}
                />
                <span className="w-10 shrink-0 text-right text-ink">{s.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between border-b border-rule pb-1.5">
            <h2 className="text-sm font-bold text-ink">LOW STOCK</h2>
            <Link href="/reorder-planning" className="text-xs text-ink-soft hover:text-ink hover:underline">
              reorder plan &gt;
            </Link>
          </div>
          <ul className="divide-y divide-rule text-sm">
            {lowStock.length === 0 && (
              <li className="py-3 text-ink-soft">Nothing is below its reorder point.</li>
            )}
            {lowStock.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="text-ink">{p.name}</span>
                  <span className="ml-2 text-xs text-ink-faint">
                    {p.sku} bin {p.bin}
                  </span>
                </div>
                <span className="font-bold text-bad">
                  {p.stock}/{p.reorderPoint}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-baseline justify-between border-b border-rule pb-1.5">
            <h2 className="text-sm font-bold text-ink">NEEDS ATTENTION</h2>
            <Link href="/receiving" className="text-xs text-ink-soft hover:text-ink hover:underline">
              receiving &gt;
            </Link>
          </div>
          <ul className="divide-y divide-rule text-sm">
            {delayedPOs.length === 0 && onHold.length === 0 && (
              <li className="py-3 text-ink-soft">No delayed shipments or quality holds right now.</li>
            )}
            {delayedPOs.map((po) => (
              <li key={po.id} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="text-ink">{po.poNumber}</span>
                  <span className="ml-2 text-xs text-ink-faint">
                    expected {formatDate(po.expectedAt)}
                  </span>
                </div>
                <StatusBadge label="Delayed" tone="bad" />
              </li>
            ))}
            {onHold.map((q) => {
              const product = data.products.find((p) => p.id === q.productId);
              return (
                <li key={q.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <span className="text-ink">{product?.name ?? "Unknown product"}</span>
                    <span className="ml-2 text-xs text-ink-faint">
                      {q.qty} units, {q.reason}
                    </span>
                  </div>
                  <StatusBadge label="Hold" tone="bad" />
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
