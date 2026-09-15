"use client";

import { useMemo, useState } from "react";
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
import { formatCurrency, PRODUCT_STATUS_LABEL } from "@/lib/format";
import { isLowStock, supplierName } from "@/lib/selectors";

const STATUS_OPTIONS: ProductStatus[] = ["active", "quality_hold", "discontinued"];

const selectClass =
  "h-8 border border-rule bg-background px-2 text-sm text-ink outline-none focus-visible:border-ink";

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
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search product, sku, or supplier"
          className="border-rule bg-background text-ink placeholder:text-ink-faint focus-visible:border-ink sm:max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "all")}
          className={selectClass}
        >
          <option value="all">all categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus | "all")}
          className={selectClass}
        >
          <option value="all">all statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {PRODUCT_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-ink-soft select-none">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="size-3.5 accent-ink"
          />
          low stock only
        </label>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-ink hover:bg-transparent">
            <TableHead className="text-ink">Product</TableHead>
            <TableHead className="text-ink">Category</TableHead>
            <TableHead className="text-ink">Supplier</TableHead>
            <TableHead className="text-ink">Bin</TableHead>
            <TableHead className="text-right text-ink">Stock</TableHead>
            <TableHead className="text-right text-ink">Reorder Pt.</TableHead>
            <TableHead className="text-right text-ink">Value</TableHead>
            <TableHead className="text-ink">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((p) => {
            const low = isLowStock(p);
            return (
              <TableRow key={p.id} className="border-rule hover:bg-secondary/50">
                <TableCell>
                  <p className="text-ink">{p.name}</p>
                  <p className="text-[11px] text-ink-faint">{p.sku}</p>
                </TableCell>
                <TableCell className="text-ink-soft">{p.category}</TableCell>
                <TableCell className="text-ink-soft">
                  {supplierName(data, p.supplierId)}
                </TableCell>
                <TableCell className="text-ink-soft">{p.bin}</TableCell>
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
                      "w-16 border border-rule bg-background px-1.5 py-1 text-right text-sm text-ink outline-none focus-visible:border-ink",
                      low && "font-bold text-bad",
                    )}
                  />
                </TableCell>
                <TableCell className="text-right text-ink-soft">{p.reorderPoint}</TableCell>
                <TableCell className="text-right text-ink-soft">
                  {formatCurrency(p.stock * p.unitCost)}
                </TableCell>
                <TableCell>
                  <select
                    value={p.status}
                    onChange={(e) => updateProductStatus(p.id, e.target.value as ProductStatus)}
                    className={cn(
                      "h-7 border border-rule bg-background px-1.5 text-xs outline-none focus-visible:border-ink",
                      p.status === "quality_hold" ? "font-bold text-bad" : "text-ink",
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
            <TableRow className="border-rule hover:bg-transparent">
              <TableCell colSpan={8} className="py-8 text-center text-ink-soft">
                No products match your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
