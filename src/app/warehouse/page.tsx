"use client";

import { useState } from "react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/dashboard-box";
import { SolidBar } from "@/components/solid-bar";
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

      <Panel title="Bin Map">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BINS.map((bin) => {
            const fill = binFillLevel(data, bin.id);
            const bad = fill.pct >= 90;
            return (
              <button
                key={bin.id}
                onClick={() => setSelectedBin(bin.id)}
                className="flex flex-col gap-1.5 border border-rule p-2.5 text-left text-sm transition-colors hover:border-primary hover:bg-secondary/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{bin.id}</span>
                  <span className={cn(bad ? "font-bold text-solid-red" : "text-ink-faint")}>
                    {fill.pct}%
                  </span>
                </div>
                <SolidBar value={fill.used} max={BIN_CAPACITY} tone={bad ? "red" : "green"} />
                <span className="text-xs text-ink-faint">
                  {fill.items.length} sku{fill.items.length === 1 ? "" : "s"}, {fill.used}/{BIN_CAPACITY} units
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedBin(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && selectedBin && (
            <>
              <DialogHeader>
                <DialogTitle className="text-ink">{selectedBin}</DialogTitle>
                <DialogDescription className="text-ink-soft">
                  {selected.used} of {BIN_CAPACITY} units used ({selected.pct}% full)
                </DialogDescription>
              </DialogHeader>
              <SolidBar
                value={selected.used}
                max={BIN_CAPACITY}
                tone={selected.pct >= 90 ? "red" : "green"}
                className="h-3"
              />
              <ul className="max-h-64 divide-y divide-rule overflow-y-auto border border-rule">
                {selected.items.length === 0 && (
                  <li className="p-3 text-sm text-ink-soft">This bin is currently empty.</li>
                )}
                {selected.items.map(({ product, qty }) => (
                  <li key={product.id} className="flex items-center justify-between p-3 text-sm">
                    <div>
                      <p className="text-ink">{product.name}</p>
                      <p className="text-[11px] text-ink-faint">
                        {product.sku} &nbsp; {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-ink">{qty} units</p>
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
