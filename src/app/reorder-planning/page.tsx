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

      {candidates.length === 0 ? (
        <div className="flex items-center gap-2 border border-rule py-10 text-ink-soft">
          <CheckCircle2 className="ml-4 size-5 text-stamp-ok" />
          Every product is stocked above its reorder point.
        </div>
      ) : (
        <div className="border border-rule">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-ink hover:bg-transparent">
                <TableHead className="text-ink">Product</TableHead>
                <TableHead className="text-right text-ink">Stock</TableHead>
                <TableHead className="text-right text-ink">Reorder Pt.</TableHead>
                <TableHead className="text-right text-ink">Weekly Demand</TableHead>
                <TableHead className="text-ink">Supplier</TableHead>
                <TableHead className="text-right text-ink">Lead Time</TableHead>
                <TableHead className="text-right text-ink">Suggested Qty</TableHead>
                <TableHead className="text-right text-ink">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((p) => {
                const supplier = data.suppliers.find((s) => s.id === p.supplierId);
                const existingPO = openPOFor(data.purchaseOrders, p.id);
                return (
                  <TableRow key={p.id} className="border-rule hover:bg-secondary/40">
                    <TableCell>
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="font-mono text-[11px] text-ink-faint">{p.sku}</p>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-stamp-flag">
                      {p.stock}
                    </TableCell>
                    <TableCell className="text-right font-mono text-ink-soft">
                      {p.reorderPoint}
                    </TableCell>
                    <TableCell className="text-right font-mono text-ink-soft">
                      {p.weeklyDemand}/wk
                    </TableCell>
                    <TableCell className="text-ink-soft">{supplier?.name}</TableCell>
                    <TableCell className="text-right font-mono text-ink-soft">
                      {supplier?.leadTimeDays}d
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-ink">
                      {p.reorderQty}
                    </TableCell>
                    <TableCell className="text-right">
                      {existingPO ? (
                        <StatusBadge
                          label={`${existingPO.poNumber} · ${existingPO.status}`}
                          tone={PO_STATUS_TONE[existingPO.status]}
                        />
                      ) : (
                        <Button
                          size="sm"
                          className="rounded-[3px] bg-primary text-primary-foreground hover:bg-primary/90"
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
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
