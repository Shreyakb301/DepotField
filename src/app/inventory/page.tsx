"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Category, type ProductStatus } from "@/lib/types";
import {
  formatCurrency,
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUS_TONE,
  TONE_CLASSNAMES,
} from "@/lib/format";
import { isLowStock, supplierName } from "@/lib/selectors";

const STATUS_OPTIONS: ProductStatus[] = ["active", "quality_hold", "discontinued"];

export default function InventoryPage() {
  const { data, updateProductStock, updateProductStatus } = useDepot();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [lowOnly, setLowOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (status !== "all" && p.status !== status) return false;
      if (lowOnly && !isLowStock(p)) return false;
      if (!q) return true;
      const supplier = supplierName(data, p.supplierId).toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        supplier.includes(q)
      );
    });
  }, [data, query, category, status, lowOnly]);

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Search, filter, and adjust stock levels across every SKU."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, SKU, or supplier"
            className="pl-8"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "all")}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus | "all")}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {PRODUCT_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground select-none">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="size-3.5 accent-emerald-600"
          />
          Low stock only
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Bin</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Reorder Pt.</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const low = isLowStock(p);
              return (
                <TableRow
                  key={p.id}
                  className={cn(low && "bg-amber-50/60 hover:bg-amber-50")}
                >
                  <TableCell>
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {supplierName(data, p.supplierId)}
                  </TableCell>
                  <TableCell>
                    <span className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-xs">
                      {p.bin}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="number"
                      min={0}
                      defaultValue={p.stock}
                      key={p.stock}
                      onBlur={(e) => {
                        const next = Number(e.target.value);
                        if (Number.isFinite(next) && next !== p.stock) {
                          updateProductStock(p.id, next);
                        }
                      }}
                      className={cn(
                        "w-16 rounded-md border border-input bg-transparent px-1.5 py-1 text-right text-sm outline-none focus-visible:border-ring",
                        low && "font-semibold text-amber-700",
                      )}
                    />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {p.reorderPoint}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(p.stock * p.unitCost)}
                  </TableCell>
                  <TableCell>
                    <select
                      value={p.status}
                      onChange={(e) =>
                        updateProductStatus(p.id, e.target.value as ProductStatus)
                      }
                      className={cn(
                        "h-6 rounded-full border px-2 text-xs font-medium outline-none focus-visible:border-ring",
                        TONE_CLASSNAMES[PRODUCT_STATUS_TONE[p.status]],
                      )}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {PRODUCT_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No products match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
