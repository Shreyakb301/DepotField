"use client";

import { PackagePlus, CheckCircle2 } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { lowStockProducts } from "@/lib/selectors";
import { PO_STATUS_TONE } from "@/lib/format";
import type { PurchaseOrder } from "@/lib/types";

function openPOFor(purchaseOrders: PurchaseOrder[], productId: string) {
  return purchaseOrders.find(
    (po) =>
      po.status !== "Received" &&
      po.items.some((i) => i.productId === productId),
  );
}

export default function ReorderPlanningPage() {
  const { data, createPurchaseOrder } = useDepot();
  const candidates = lowStockProducts(data).sort(
    (a, b) => a.stock / a.reorderPoint - b.stock / b.reorderPoint,
  );

  return (
    <div>
      <PageHeader
        title="Reorder Planning"
        description="Products below their reorder point, with a suggested quantity based on recent demand."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Reorder Pt.</TableHead>
              <TableHead className="text-right">Weekly Demand</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Lead Time</TableHead>
              <TableHead className="text-right">Suggested Qty</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((p) => {
              const supplier = data.suppliers.find((s) => s.id === p.supplierId);
              const existingPO = openPOFor(data.purchaseOrders, p.id);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-amber-700">
                    {p.stock}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {p.reorderPoint}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {p.weeklyDemand}/wk
                  </TableCell>
                  <TableCell className="text-muted-foreground">{supplier?.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {supplier?.leadTimeDays}d
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {p.reorderQty}
                  </TableCell>
                  <TableCell className="text-right">
                    {existingPO ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <StatusBadge
                          label={`${existingPO.poNumber} · ${existingPO.status}`}
                          tone={PO_STATUS_TONE[existingPO.status]}
                        />
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => createPurchaseOrder(p.id, p.reorderQty)}
                      >
                        <PackagePlus className="size-3.5" />
                        Create PO
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {candidates.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="size-5 text-emerald-600" />
                    Every product is stocked above its reorder point.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
