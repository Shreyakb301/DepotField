"use client";

import { useState } from "react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Gauge } from "@/components/gauge";
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

export default function WarehousePage() {
  const { data } = useDepot();
  const [selectedBin, setSelectedBin] = useState<string | null>(null);

  const selected = selectedBin ? binFillLevel(data, selectedBin) : null;

  return (
    <div>
      <PageHeader
        title="Warehouse"
        description="Bin map A-01 through D-04. Click a bin to see what's stored there."
      />

      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 border border-dashed border-rule-strong" /> Empty
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 bg-ink" /> Stocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 bg-stamp-flag" /> 70%+ full
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 bg-stamp-danger" /> 90%+ full
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BINS.map((bin) => {
          const fill = binFillLevel(data, bin.id);
          const flagColor =
            fill.pct >= 90 ? "border-l-stamp-danger" : fill.pct >= 70 ? "border-l-stamp-flag" : "border-l-transparent";
          return (
            <button
              key={bin.id}
              onClick={() => setSelectedBin(bin.id)}
              className={cn(
                "flex flex-col gap-2.5 border border-rule border-l-[3px] bg-surface p-3.5 text-left transition-colors hover:border-ink",
                fill.pct === 0 && "border-dashed",
                flagColor,
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-ink">{bin.id}</span>
                <span className="font-mono text-xs text-ink-faint">{fill.pct}%</span>
              </div>
              <Gauge pct={fill.pct} segments={12} />
              <span className="text-[11px] text-ink-faint">
                {fill.items.length} SKU{fill.items.length === 1 ? "" : "s"} &nbsp; {fill.used}/{BIN_CAPACITY} units
              </span>
            </button>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedBin(null)}>
        <DialogContent className="rounded-none border border-ink ring-0 sm:max-w-md">
          {selected && selectedBin && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono text-ink">{selectedBin}</DialogTitle>
                <DialogDescription className="text-ink-soft">
                  {selected.used} of {BIN_CAPACITY} units used ({selected.pct}% full)
                </DialogDescription>
              </DialogHeader>
              <Gauge pct={selected.pct} segments={24} />
              <ul className="max-h-64 divide-y divide-rule overflow-y-auto border border-rule">
                {selected.items.length === 0 && (
                  <li className="p-3 text-sm text-ink-soft">
                    This bin is currently empty.
                  </li>
                )}
                {selected.items.map(({ product, qty }) => (
                  <li key={product.id} className="flex items-center justify-between p-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{product.name}</p>
                      <p className="font-mono text-[11px] text-ink-faint">
                        {product.sku} &nbsp; {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium text-ink">{qty} units</p>
                      <p className="text-[11px] text-ink-faint">
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
