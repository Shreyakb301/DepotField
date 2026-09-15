"use client";

import { useState } from "react";
import { PackageCheck, CheckCircle2, XCircle } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, InkStamp } from "@/components/status-badge";
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
        description="Incoming supplier purchase orders and the quality-hold inspection queue."
      />

      <section>
        <h2 className="border-b-2 border-ink pb-2 font-heading text-lg font-bold text-ink">
          Purchase orders
        </h2>
        <ul className="divide-y divide-rule">
          {sortedPOs.map((po) => {
            const totalOrdered = po.items.reduce((s, i) => s + i.qtyOrdered, 0);
            const totalReceived = po.items.reduce((s, i) => s + i.qtyReceived, 0);
            const canReceive = po.status !== "Received";
            return (
              <li key={po.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-semibold text-ink">{po.poNumber}</p>
                    <StatusBadge label={po.status} tone={PO_STATUS_TONE[po.status]} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {supplierName(data, po.supplierId)}
                    <span className="text-ink-faint"> &nbsp; expected {formatDate(po.expectedAt)}</span>
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-ink-faint">
                    {po.items
                      .map((i) => `${productById(data, i.productId)?.name ?? i.productId} (${i.qtyReceived}/${i.qtyOrdered})`)
                      .join("  ·  ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right font-mono text-xs text-ink-faint">
                    {totalReceived}/{totalOrdered} units
                  </div>
                  <Button
                    size="sm"
                    disabled={!canReceive}
                    onClick={() => openReceive(po)}
                    className={cn(
                      "rounded-[3px]",
                      canReceive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-ink-faint",
                    )}
                  >
                    <PackageCheck className="size-3.5" />
                    {po.status === "Received" ? "Received" : "Receive"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
          <h2 className="font-heading text-lg font-bold text-ink">Quality hold queue</h2>
          <span className="text-xs text-ink-faint">{openHolds.length} awaiting inspection</span>
        </div>
        <ul className="divide-y divide-rule">
          {openHolds.length === 0 && (
            <li className="py-4 text-sm text-ink-soft">
              Nothing currently on quality hold.
            </li>
          )}
          {openHolds.map((entry) => {
            const product = productById(data, entry.productId);
            const po = data.purchaseOrders.find((p) => p.id === entry.poId);
            return (
              <li key={entry.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <InkStamp label="Hold" tone="flag" />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {product?.name ?? "Unknown product"}{" "}
                      <span className="font-mono text-ink-faint">&nbsp;{entry.qty} units</span>
                    </p>
                    <p className="text-xs text-ink-soft">{entry.reason}</p>
                    <p className="font-mono text-[11px] text-ink-faint">
                      {po?.poNumber ?? "—"} &nbsp; flagged {formatDate(entry.flaggedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-[3px] border-stamp-ok text-stamp-ok hover:bg-stamp-ok hover:text-white"
                    onClick={() => releaseQualityHold(entry.id)}
                  >
                    <CheckCircle2 className="size-3.5" />
                    Release to stock
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-[3px] border-stamp-danger text-stamp-danger hover:bg-stamp-danger hover:text-white"
                    onClick={() => rejectQualityHold(entry.id)}
                  >
                    <XCircle className="size-3.5" />
                    Reject
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        {resolvedHolds.length > 0 && (
          <div className="mt-2 border-t border-rule pt-3">
            <p className="mb-2 text-xs font-medium text-ink-soft">Resolved history</p>
            <ul className="flex flex-col gap-2">
              {resolvedHolds.map((entry) => {
                const product = productById(data, entry.productId);
                return (
                  <li key={entry.id} className="flex items-center justify-between text-xs text-ink-faint">
                    <span>
                      {product?.name ?? "Unknown product"}, {entry.qty} units, {entry.reason}
                    </span>
                    <StatusBadge label={entry.status} tone={QUALITY_HOLD_TONE[entry.status]} />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <Dialog open={!!receivingPO} onOpenChange={(o) => !o && setReceivingPO(null)}>
        <DialogContent className="rounded-none border border-ink ring-0 sm:max-w-lg">
          {receivingPO && (
            <>
              <DialogHeader>
                <DialogTitle className="text-ink">
                  Receive <span className="font-mono">{receivingPO.poNumber}</span>
                </DialogTitle>
                <DialogDescription className="text-ink-soft">
                  {supplierName(data, receivingPO.supplierId)}. Choose where each line item goes.
                </DialogDescription>
              </DialogHeader>
              <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
                {lines.map((line, idx) => {
                  const product = productById(data, line.productId);
                  return (
                    <div key={line.productId} className="border border-rule p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink">{product?.name}</p>
                        <p className="font-mono text-xs text-ink-faint">
                          {line.remaining} remaining
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-ink-soft">
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
                            className="w-16 rounded-[3px] border border-rule bg-surface px-1.5 py-1 font-mono text-sm text-ink outline-none focus-visible:border-primary"
                          />
                        </label>
                        <div className="flex overflow-hidden rounded-[3px] border border-ink">
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
                                ? "bg-ink text-background"
                                : "bg-transparent text-ink-soft hover:bg-secondary",
                            )}
                          >
                            Add to stock
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setLines((prev) =>
                                prev.map((l, i) => (i === idx ? { ...l, destination: "hold" } : l)),
                              )
                            }
                            className={cn(
                              "border-l border-ink px-2 py-1 text-xs font-medium",
                              line.destination === "hold"
                                ? "bg-stamp-flag text-white"
                                : "bg-transparent text-ink-soft hover:bg-secondary",
                            )}
                          >
                            Quality hold
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
                          className="mt-2 w-full rounded-[3px] border border-rule bg-surface px-2 py-1 text-xs text-ink outline-none focus-visible:border-primary"
                        />
                      )}
                      {product && (
                        <p className="mt-2 font-mono text-[11px] text-ink-faint">
                          BIN {product.bin} &nbsp; {formatCurrency(product.unitCost)}/unit
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                <Button
                  className="w-full rounded-[3px] bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={submitReceive}
                >
                  Confirm receipt
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
