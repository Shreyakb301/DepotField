"use client";

import Link from "next/link";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { KpiBox, Panel } from "@/components/dashboard-box";
import { SolidBar } from "@/components/solid-bar";
import {
  inventoryByCategory,
  inventoryValue,
  lowStockProducts,
  ordersByStatus,
  ordersToFulfill,
  warehouseCapacityPct,
} from "@/lib/selectors";
import { formatCurrency, formatDate, ORDER_STATUS_TONE } from "@/lib/format";

const CATEGORY_TONE = ["blue", "amber", "green", "purple", "slate", "red"] as const;

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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiBox
          label="Orders Open"
          value={String(toFulfill)}
          hint={`of ${data.orders.length} total`}
          tone="blue"
        />
        <KpiBox
          label="Low Stock"
          value={String(lowStock.length)}
          hint={lowStock.length > 0 ? "below reorder point" : "all stocked"}
          tone={lowStock.length > 0 ? "red" : "green"}
        />
        <KpiBox
          label="Inventory Value"
          value={formatCurrency(value)}
          hint={`${data.products.length} SKUs`}
          tone="green"
        />
        <KpiBox
          label="Warehouse Capacity"
          value={`${capacityPct}%`}
          hint="16 bins"
          tone={capacityPct >= 85 ? "red" : "blue"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Inventory by Category">
          <div className="flex flex-col gap-2.5">
            {byCategory.map((c, i) => (
              <div key={c.category} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 truncate text-ink-soft">{c.category}</span>
                <SolidBar
                  value={c.stock}
                  max={maxCategory}
                  tone={CATEGORY_TONE[i % CATEGORY_TONE.length]}
                />
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

        <Panel
          title="Low Stock"
          action={
            <Link href="/reorder-planning" className="text-xs font-semibold text-primary hover:underline">
              Reorder plan &gt;
            </Link>
          }
        >
          <ul className="divide-y divide-rule">
            {lowStock.length === 0 && (
              <li className="py-3 text-sm text-ink-soft">Nothing is below its reorder point.</li>
            )}
            {lowStock.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="text-ink">{p.name}</span>
                  <span className="ml-2 text-xs text-ink-faint">
                    {p.sku} bin {p.bin}
                  </span>
                </div>
                <span className="font-bold text-solid-amber">
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
              Receiving &gt;
            </Link>
          }
        >
          <ul className="divide-y divide-rule">
            {delayedPOs.length === 0 && onHold.length === 0 && (
              <li className="py-3 text-sm text-ink-soft">
                No delayed shipments or quality holds right now.
              </li>
            )}
            {delayedPOs.map((po) => (
              <li key={po.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="text-ink">{po.poNumber}</span>
                  <span className="ml-2 text-xs text-ink-faint">
                    expected {formatDate(po.expectedAt)}
                  </span>
                </div>
                <StatusBadge label="Delayed" tone="red" />
              </li>
            ))}
            {onHold.map((q) => {
              const product = data.products.find((p) => p.id === q.productId);
              return (
                <li key={q.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="text-ink">{product?.name ?? "Unknown product"}</span>
                    <span className="ml-2 text-xs text-ink-faint">
                      {q.qty} units, {q.reason}
                    </span>
                  </div>
                  <StatusBadge label="Hold" tone="amber" />
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
