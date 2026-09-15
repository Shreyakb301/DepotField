"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/dashboard-box";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { binFillLevel, supplierName } from "@/lib/selectors";
import { toCSV, downloadCSV, type ReportRow } from "@/lib/csv";
import { WarehouseMap } from "@/components/warehouse-map";

const BIN_COLUMNS = ["SKU", "Product", "Category", "Manufacturer", "Supplier", "Qty", "Unit Cost", "Value"];

export default function WarehousePage() {
  const { data } = useDepot();
  const [selectedBin, setSelectedBin] = useState<string | null>(null);

  const selected = selectedBin ? binFillLevel(data, selectedBin) : null;
  const rows: ReportRow[] =
    selected?.items.map(({ product, qty }) => ({
      SKU: product.sku,
      Product: product.name,
      Category: product.category,
      Manufacturer: product.manufacturer,
      Supplier: supplierName(data, product.supplierId),
      Qty: qty,
      "Unit Cost": product.unitCost.toFixed(2),
      Value: (qty * product.unitCost).toFixed(2),
    })) ?? [];

  function handleDownload() {
    if (!selectedBin) return;
    const csv = toCSV(BIN_COLUMNS, rows);
    downloadCSV(`depotfield-bin-${selectedBin}-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div>
      <PageHeader
        title="Warehouse"
        description="Floor plan of the facility. Click a storage rack to see what's stored there."
      />

      <div className="mb-6">
        <Panel title="Floor Plan">
          <div className="overflow-x-auto">
            <div className="mx-auto w-[620px]">
              <WarehouseMap data={data} selectedBin={selectedBin} onSelectBin={setSelectedBin} />
            </div>
          </div>
        </Panel>
      </div>

      {selectedBin && (
        <div className="mt-4">
          <Panel
            title={`Bin ${selectedBin}`}
            action={
              <Button size="sm" onClick={handleDownload} disabled={rows.length === 0}>
                <Download className="size-3.5" />
                Download CSV ({rows.length})
              </Button>
            }
          >
            {rows.length === 0 ? (
              <p className="py-6 text-sm text-ink-soft">This bin is currently empty.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-ink hover:bg-transparent">
                      {BIN_COLUMNS.map((c) => (
                        <TableHead key={c} className="text-ink">
                          {c}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <TableRow key={i} className="border-rule hover:bg-secondary/50">
                        {BIN_COLUMNS.map((c) => (
                          <TableCell key={c} className="text-ink-soft">
                            {row[c]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
