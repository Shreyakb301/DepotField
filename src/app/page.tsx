"use client";

import Link from "next/link";
import {
  ClipboardList,
  AlertTriangle,
  DollarSign,
  Warehouse as WarehouseIcon,
  ArrowRight,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
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
        description="Real-time snapshot of fulfillment, inventory, and warehouse capacity."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Orders to Fulfill"
          value={String(toFulfill)}
          subtext={`${data.orders.length} total orders`}
          icon={ClipboardList}
        />
        <KpiCard
          label="Low-Stock Items"
          value={String(lowStock.length)}
          subtext={lowStock.length > 0 ? "Below reorder point" : "All stocked"}
          icon={AlertTriangle}
          tone={lowStock.length > 0 ? "warning" : "default"}
        />
        <KpiCard
          label="Inventory Value"
          value={formatCurrency(value)}
          subtext={`${data.products.length} SKUs on hand`}
          icon={DollarSign}
        />
        <KpiCard
          label="Warehouse Capacity"
          value={`${capacityPct}%`}
          subtext="Across 16 bins, A-01–D-04"
          icon={WarehouseIcon}
          tone={capacityPct >= 85 ? "warning" : "default"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">
            Inventory by Category
          </h2>
          <p className="text-xs text-muted-foreground">Units on hand per category</p>
          <div className="mt-2">
            <InventoryByCategoryChart data={byCategory} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">
            Orders by Status
          </h2>
          <p className="text-xs text-muted-foreground">Where open orders stand right now</p>
          <div className="mt-2">
            <OrdersByStatusChart data={byStatus} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-foreground">
                Low-Stock Alerts
              </h2>
            </div>
            <Link
              href="/reorder-planning"
              className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
            >
              Reorder plan <ArrowRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {lowStock.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">
                No products are currently below their reorder point.
              </li>
            )}
            {lowStock.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sku} &middot; Bin {p.bin}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-600">
                    {p.stock} / {p.reorderPoint}
                  </p>
                  <p className="text-xs text-muted-foreground">on hand / reorder pt</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-rose-600" />
              <h2 className="text-sm font-semibold text-foreground">
                Needs Attention
              </h2>
            </div>
            <Link
              href="/receiving"
              className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
            >
              Receiving <ArrowRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {delayedPOs.length === 0 && onHold.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">
                No delayed shipments or quality holds right now.
              </li>
            )}
            {delayedPOs.map((po) => (
              <li key={po.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-rose-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{po.poNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      Expected {formatDate(po.expectedAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge label="Delayed" tone="rose" />
              </li>
            ))}
            {onHold.map((q) => {
              const product = data.products.find((p) => p.id === q.productId);
              return (
                <li key={q.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-3.5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {product?.name ?? "Unknown product"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {q.qty} units — {q.reason}
                      </p>
                    </div>
                  </div>
                  <StatusBadge label="Quality Hold" tone="amber" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
