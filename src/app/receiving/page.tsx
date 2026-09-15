"use client";

import { useState } from "react";
import { PackageCheck, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PurchaseOrder } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  PO_STATUS_TONE,
  QUALITY_HOLD_TONE,
} from "@/lib/format";
import { productById, supplierName } from "@/lib/selectors";
import { cn } from "@/lib/utils";

interface ReceiptFormLine {
  productId: string;
  remaining: number;
  qty: number;
  destination: "stock" | "hold";
  reason: string;
}

export default function ReceivingPage() {
  const { data, receivePO, releaseQualityHold, rejectQualityHold } = useDepot();
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [lines, setLines] = useState<ReceiptFormLine[]>([]);

  function openReceive(po: PurchaseOrder) {
    setReceivingPO(po);
    setLines(
      po.items.map((item) => {
        const remaining = item.qtyOrdered - item.qtyReceived;
        return {
          productId: item.productId,
          remaining,
          qty: remaining,
          destination: "stock",
          reason: "",
        };
      }),
    );
  }

  function submitReceive() {
    if (!receivingPO) return;
    receivePO(
      receivingPO.id,
      lines
        .filter((l) => l.qty > 0)
        .map((l) => ({
          productId: l.productId,
          qty: l.qty,
          destination: l.destination,
          reason: l.reason,
        })),
    );
    setReceivingPO(null);
  }

  const openHolds = data.qualityHolds.filter((q) => q.status === "On Hold");
  const resolvedHolds = data.qualityHolds.filter((q) => q.status !== "On Hold");

  const sortedPOs = [...data.purchaseOrders].sort((a, b) => {
    const rank = (s: PurchaseOrder["status"]) =>
      s === "Delayed" ? 0 : s === "In Transit" ? 1 : s === "Pending" ? 2 : s === "Partially Received" ? 3 : 4;
    return rank(a.status) - rank(b.status) || a.expectedAt.localeCompare(b.expectedAt);
  });

  return (
    <div>
      <PageHeader
        title="Receiving"
        description="Incoming supplier purchase orders and quality-hold inspection queue."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold text-foreground">Purchase Orders</h2>
        </div>
        <ul className="divide-y divide-border">
          {sortedPOs.map((po) => {
            const totalOrdered = po.items.reduce((s, i) => s + i.qtyOrdered, 0);
            const totalReceived = po.items.reduce((s, i) => s + i.qtyReceived, 0);
            const canReceive = po.status !== "Received";
            return (
              <li key={po.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{po.poNumber}</p>
                    <StatusBadge label={po.status} tone={PO_STATUS_TONE[po.status]} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {supplierName(data, po.supplierId)} &middot; expected {formatDate(po.expectedAt)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {po.items
                      .map((i) => `${productById(data, i.productId)?.name ?? i.productId} (${i.qtyReceived}/${i.qtyOrdered})`)
                      .join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-muted-foreground">
                    {totalReceived}/{totalOrdered} units received
                  </div>
                  <Button
                    size="sm"
                    variant={canReceive ? "default" : "secondary"}
                    disabled={!canReceive}
                    onClick={() => openReceive(po)}
                  >
                    <PackageCheck className="size-3.5" />
                    {po.status === "Received" ? "Received" : "Receive"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <ShieldAlert className="size-4 text-amber-600" />
          <h2 className="text-sm font-semibold text-foreground">
            Quality Hold Queue
          </h2>
          <span className="text-xs text-muted-foreground">
            {openHolds.length} awaiting inspection
          </span>
        </div>
        <ul className="divide-y divide-border">
          {openHolds.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">
              Nothing currently on quality hold.
            </li>
          )}
          {openHolds.map((entry) => {
            const product = productById(data, entry.productId);
            const po = data.purchaseOrders.find((p) => p.id === entry.poId);
            return (
              <li key={entry.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {product?.name ?? "Unknown product"}{" "}
                    <span className="font-normal text-muted-foreground">&middot; {entry.qty} units</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.reason} &middot; {po?.poNumber ?? "—"} &middot; flagged {formatDate(entry.flaggedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => releaseQualityHold(entry.id)}>
                    <CheckCircle2 className="size-3.5" />
                    Release to Stock
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => rejectQualityHold(entry.id)}>
                    <XCircle className="size-3.5" />
                    Reject
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        {resolvedHolds.length > 0 && (
          <div className="border-t border-border p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Resolved history</p>
            <ul className="flex flex-col gap-2">
              {resolvedHolds.map((entry) => {
                const product = productById(data, entry.productId);
                return (
                  <li key={entry.id} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {product?.name ?? "Unknown product"} &middot; {entry.qty} units &middot; {entry.reason}
                    </span>
                    <StatusBadge label={entry.status} tone={QUALITY_HOLD_TONE[entry.status]} />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <Dialog open={!!receivingPO} onOpenChange={(o) => !o && setReceivingPO(null)}>
        <DialogContent className="sm:max-w-lg">
          {receivingPO && (
            <>
              <DialogHeader>
                <DialogTitle>Receive {receivingPO.poNumber}</DialogTitle>
                <DialogDescription>
                  {supplierName(data, receivingPO.supplierId)} &middot; choose where each line item goes.
                </DialogDescription>
              </DialogHeader>
              <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
                {lines.map((line, idx) => {
                  const product = productById(data, line.productId);
                  return (
                    <div key={line.productId} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{product?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.remaining} remaining
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          Qty
                          <input
                            type="number"
                            min={0}
                            max={line.remaining}
                            value={line.qty}
                            onChange={(e) => {
                              const qty = Math.max(0, Math.min(line.remaining, Number(e.target.value)));
                              setLines((prev) =>
                                prev.map((l, i) => (i === idx ? { ...l, qty } : l)),
                              );
                            }}
                            className="w-16 rounded-md border border-input bg-transparent px-1.5 py-1 text-sm outline-none focus-visible:border-ring"
                          />
                        </label>
                        <div className="flex overflow-hidden rounded-md border border-input">
                          <button
                            type="button"
                            onClick={() =>
                              setLines((prev) =>
                                prev.map((l, i) => (i === idx ? { ...l, destination: "stock" } : l)),
                              )
                            }
                            className={cn(
                              "px-2 py-1 text-xs font-medium",
                              line.destination === "stock"
                                ? "bg-emerald-600 text-white"
                                : "bg-transparent text-muted-foreground hover:bg-muted",
                            )}
                          >
                            Add to Stock
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setLines((prev) =>
                                prev.map((l, i) => (i === idx ? { ...l, destination: "hold" } : l)),
                              )
                            }
                            className={cn(
                              "px-2 py-1 text-xs font-medium",
                              line.destination === "hold"
                                ? "bg-amber-500 text-white"
                                : "bg-transparent text-muted-foreground hover:bg-muted",
                            )}
                          >
                            Quality Hold
                          </button>
                        </div>
                      </div>
                      {line.destination === "hold" && (
                        <input
                          type="text"
                          placeholder="Reason (e.g. damaged packaging)"
                          value={line.reason}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((l, i) => (i === idx ? { ...l, reason: e.target.value } : l)),
                            )
                          }
                          className="mt-2 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:border-ring"
                        />
                      )}
                      {product && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Bin {product.bin} &middot; {formatCurrency(product.unitCost)} / unit
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                <Button className="w-full" onClick={submitReceive}>
                  Confirm Receipt
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
