"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Clock, ShieldAlert } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatStrip } from "@/components/stat-strip";
import { StatusBadge } from "@/components/status-badge";
import { InventoryByCategoryChart } from "@/components/charts/inventory-by-category-chart";
import { OrdersByStatusChart } from "@/components/charts/orders-by-status-chart";
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
  const byCategory = inventoryByCategory(data);
  const byStatus = ordersByStatus(data);

  const delayedPOs = data.purchaseOrders.filter((po) => po.status === "Delayed");
  const onHold = data.qualityHolds.filter((q) => q.status === "On Hold");

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Fulfillment, inventory, and warehouse capacity as of today."
      />

      <StatStrip
        stats={[
          {
            label: "Orders to fulfill",
            value: String(toFulfill),
            hint: `of ${data.orders.length} total`,
          },
          {
            label: "Low-stock items",
            value: String(lowStock.length),
            hint: lowStock.length > 0 ? "below reorder point" : "all stocked",
            warn: lowStock.length > 0,
          },
          {
            label: "Inventory value",
            value: formatCurrency(value),
            hint: `${data.products.length} SKUs on hand`,
          },
          {
            label: "Warehouse capacity",
            value: `${capacityPct}%`,
            hint: "16 bins, A-01 through D-04",
            warn: capacityPct >= 85,
          },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <section>
          <h2 className="font-heading text-lg font-bold text-ink">Inventory by category</h2>
          <p className="text-xs text-ink-soft">Units on hand</p>
          <div className="mt-3">
            <InventoryByCategoryChart data={byCategory} />
          </div>
        </section>
        <section>
          <h2 className="font-heading text-lg font-bold text-ink">Orders by status</h2>
          <p className="text-xs text-ink-soft">Where open orders stand right now</p>
          <div className="mt-3">
            <OrdersByStatusChart data={byStatus} />
          </div>
        </section>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <section>
          <div className="flex items-center justify-between border-b-2 border-ink pb-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="size-4 text-stamp-flag" />
              <h2 className="font-heading text-lg font-bold text-ink">Low-stock alerts</h2>
            </div>
            <Link
              href="/reorder-planning"
              className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
            >
              Reorder plan
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-rule">
            {lowStock.length === 0 && (
              <li className="py-4 text-sm text-ink-soft">
                Nothing is below its reorder point.
              </li>
            )}
            {lowStock.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="font-mono text-[11px] text-ink-faint">
                    {p.sku} &nbsp; BIN {p.bin}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-stamp-flag">
                    {p.stock} / {p.reorderPoint}
                  </p>
                  <p className="text-[11px] text-ink-faint">on hand / reorder pt.</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between border-b-2 border-ink pb-2">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="size-4 text-stamp-danger" />
              <h2 className="font-heading text-lg font-bold text-ink">Needs attention</h2>
            </div>
            <Link
              href="/receiving"
              className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
            >
              Receiving
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-rule">
            {delayedPOs.length === 0 && onHold.length === 0 && (
              <li className="py-4 text-sm text-ink-soft">
                No delayed shipments or quality holds right now.
              </li>
            )}
            {delayedPOs.map((po) => (
              <li key={po.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 shrink-0 text-stamp-danger" />
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">{po.poNumber}</p>
                    <p className="text-[11px] text-ink-faint">
                      expected {formatDate(po.expectedAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge label="Delayed" tone="danger" />
              </li>
            ))}
            {onHold.map((q) => {
              const product = data.products.find((p) => p.id === q.productId);
              return (
                <li key={q.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-3.5 shrink-0 text-stamp-flag" />
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {product?.name ?? "Unknown product"}
                      </p>
                      <p className="text-[11px] text-ink-faint">
                        {q.qty} units, {q.reason}
                      </p>
                    </div>
                  </div>
                  <StatusBadge label="Quality Hold" tone="flag" />
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
