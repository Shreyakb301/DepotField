"use client";

import { useState } from "react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BINS, BIN_CAPACITY } from "@/lib/bins";
import { binFillLevel } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

function fillTone(pct: number) {
  if (pct === 0) return "border-dashed border-border bg-card text-muted-foreground";
  if (pct < 50) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (pct < 85) return "border-emerald-300 bg-emerald-100 text-emerald-900";
  return "border-amber-300 bg-amber-100 text-amber-900";
}

export default function WarehousePage() {
  const { data } = useDepot();
  const [selectedBin, setSelectedBin] = useState<string | null>(null);

  const selected = selectedBin ? binFillLevel(data, selectedBin) : null;

  return (
    <div>
      <PageHeader
        title="Warehouse"
        description="Bin map A-01–D-04. Click a bin to see what's stored there."
      />

      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-dashed border-border bg-card" /> Empty
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-emerald-200 bg-emerald-50" /> Low fill
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-emerald-300 bg-emerald-100" /> Mid fill
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-amber-300 bg-amber-100" /> Near capacity
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BINS.map((bin) => {
          const fill = binFillLevel(data, bin.id);
          return (
            <button
              key={bin.id}
              onClick={() => setSelectedBin(bin.id)}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-3.5 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md",
                fillTone(fill.pct),
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold">{bin.id}</span>
                <span className="text-xs font-medium">{fill.pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${fill.pct}%` }}
                />
              </div>
              <span className="text-xs opacity-80">
                {fill.items.length} SKU{fill.items.length === 1 ? "" : "s"} &middot; {fill.used}/{BIN_CAPACITY} units
              </span>
            </button>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedBin(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && selectedBin && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono">{selectedBin}</DialogTitle>
                <DialogDescription>
                  {selected.used} of {BIN_CAPACITY} units used ({selected.pct}% full)
                </DialogDescription>
              </DialogHeader>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${selected.pct}%` }}
                />
              </div>
              <ul className="max-h-64 divide-y divide-border overflow-y-auto rounded-lg border border-border">
                {selected.items.length === 0 && (
                  <li className="p-3 text-sm text-muted-foreground">
                    This bin is currently empty.
                  </li>
                )}
                {selected.items.map(({ product, qty }) => (
                  <li key={product.id} className="flex items-center justify-between p-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sku} &middot; {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{qty} units</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(qty * product.unitCost)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
