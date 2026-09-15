"use client";

import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
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
import { REPORTS } from "@/lib/reports";
import { toCSV, downloadCSV } from "@/lib/csv";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 50;

export default function ReportsPage() {
  const { data } = useDepot();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = REPORTS.find((r) => r.id === selectedId);
  const rows = useMemo(() => (selected ? selected.build(data) : []), [selected, data]);

  function handleDownload() {
    if (!selected) return;
    const csv = toCSV(selected.columns, rows);
    const filename = `depotfield-${selected.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(filename, csv);
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate a report from live data, preview it, and download a CSV."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => {
          const count = report.build(data).length;
          const active = report.id === selectedId;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedId(report.id)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary",
                active ? "border-primary ring-1 ring-primary" : "border-rule",
              )}
            >
              <FileText className="size-5 text-primary" />
              <p className="font-semibold text-ink">{report.name}</p>
              <p className="text-xs text-ink-soft">{report.description}</p>
              <p className="text-xs font-medium text-ink-faint">{count} row{count === 1 ? "" : "s"}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <Panel
          title={`${selected.name} Report`}
          action={
            <Button size="sm" onClick={handleDownload}>
              <Download className="size-3.5" />
              Download CSV ({rows.length})
            </Button>
          }
        >
          {rows.length === 0 ? (
            <p className="py-6 text-sm text-ink-soft">
              Nothing to report — there&apos;s no data for this report right now.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-ink hover:bg-transparent">
                      {selected.columns.map((c) => (
                        <TableHead key={c} className="text-ink">
                          {c}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, PREVIEW_LIMIT).map((row, i) => (
                      <TableRow key={i} className="border-rule hover:bg-secondary/50">
                        {selected.columns.map((c) => (
                          <TableCell key={c} className="text-ink-soft">
                            {row[c]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {rows.length > PREVIEW_LIMIT && (
                <p className="mt-2 text-xs text-ink-faint">
                  Showing {PREVIEW_LIMIT} of {rows.length} rows. Download the CSV for the full report.
                </p>
              )}
            </>
          )}
        </Panel>
      )}
    </div>
  );
}
