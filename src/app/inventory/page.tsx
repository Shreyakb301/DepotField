"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useDepot } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/dashboard-box";
import { AvatarBadge } from "@/components/avatar-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Category, type Product, type ProductStatus } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUS_TONE,
  TONE_TEXT_CLASS,
} from "@/lib/format";
import { isLowStock, supplierName } from "@/lib/selectors";

const STATUS_OPTIONS: ProductStatus[] = ["active", "quality_hold", "discontinued"];

const selectClass =
  "h-8 border border-rule bg-background px-2 text-sm text-ink outline-none focus-visible:border-ink";

type SortKey = "name" | "category" | "supplier" | "stock" | "reorderPoint" | "value";

function SortableHead({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1 font-bold text-ink hover:text-primary",
          align === "right" && "ml-auto",
        )}
      >
        {label}
        <Icon className={cn("size-3", active ? "text-primary" : "text-ink-faint")} />
      </button>
    </TableHead>
  );
}

export default function InventoryPage() {
  const { data, updateProductStock, updateProductStatus } = useDepot();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  function sortValue(p: Product, key: SortKey) {
    switch (key) {
      case "name":
        return p.name;
      case "category":
        return p.category;
      case "supplier":
        return supplierName(data, p.supplierId);
      case "stock":
        return p.stock;
      case "reorderPoint":
        return p.reorderPoint;
      case "value":
        return p.stock * p.unitCost;
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = data.products.filter((p) => {
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
    const sorted = [...rows].sort((a, b) => {
      const av = sortValue(a, sort.key);
      const bv = sortValue(b, sort.key);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, query, category, status, lowOnly, sort]);

  const selected = data.products.find((p) => p.id === selectedId);
  const selectedSupplier = selected ? data.suppliers.find((s) => s.id === selected.supplierId) : undefined;

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Search, filter, and adjust stock levels across every SKU. Click a product to open its detail."
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
            className="size-3.5 accent-primary"
          />
          low stock only
        </label>
      </div>

      <Panel title={`Products (${filtered.length})`}>
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-ink hover:bg-transparent">
              <SortableHead
                label="Product"
                active={sort.key === "name"}
                dir={sort.dir}
                onClick={() => toggleSort("name")}
              />
              <SortableHead
                label="Category"
                active={sort.key === "category"}
                dir={sort.dir}
                onClick={() => toggleSort("category")}
              />
              <SortableHead
                label="Supplier"
                active={sort.key === "supplier"}
                dir={sort.dir}
                onClick={() => toggleSort("supplier")}
              />
              <TableHead className="text-ink">Bin</TableHead>
              <SortableHead
                label="Stock"
                active={sort.key === "stock"}
                dir={sort.dir}
                onClick={() => toggleSort("stock")}
                align="right"
              />
              <SortableHead
                label="Reorder Pt."
                active={sort.key === "reorderPoint"}
                dir={sort.dir}
                onClick={() => toggleSort("reorderPoint")}
                align="right"
              />
              <SortableHead
                label="Value"
                active={sort.key === "value"}
                dir={sort.dir}
                onClick={() => toggleSort("value")}
                align="right"
              />
              <TableHead className="text-ink">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const low = isLowStock(p);
              return (
                <TableRow key={p.id} className="border-rule hover:bg-secondary/50">
                  <TableCell>
                    <button
                      onClick={() => setSelectedId(p.id)}
                      className="font-semibold text-primary hover:underline"
                    >
                      {p.name}
                    </button>
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
                        low && "font-bold text-solid-red",
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
                        "h-7 border-2 bg-background px-1.5 text-xs font-bold outline-none",
                        TONE_TEXT_CLASS[PRODUCT_STATUS_TONE[p.status]],
                      )}
                      style={{ borderColor: "currentColor" }}
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
      </Panel>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="flex flex-col gap-0 bg-background p-0 data-[side=right]:sm:max-w-2xl">
          {selected && (
            <>
              <SheetHeader className="border-b border-rule pb-3">
                <div className="flex items-start justify-between gap-3">
                  <SheetTitle className="text-2xl font-semibold text-ink">{selected.name}</SheetTitle>
                  <span
                    className={cn(
                      "shrink-0 text-lg font-bold",
                      TONE_TEXT_CLASS[PRODUCT_STATUS_TONE[selected.status]],
                    )}
                  >
                    {PRODUCT_STATUS_LABEL[selected.status]}
                  </span>
                </div>
                <p className="text-sm text-ink-soft">
                  SKU: <span className="font-mono text-ink">{selected.sku}</span>
                </p>
              </SheetHeader>

              <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <h3 className="mb-2 border-b border-rule pb-1.5 text-base font-semibold text-ink">
                    Details
                  </h3>
                  <dl className="mb-4 grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-ink-faint">Category</dt>
                    <dd className="text-ink">{selected.category}</dd>
                    <dt className="text-ink-faint">Bin</dt>
                    <dd className="text-ink">
                      <Link href="/warehouse" className="text-primary hover:underline">
                        {selected.bin}
                      </Link>
                    </dd>
                    <dt className="text-ink-faint">Reorder Point</dt>
                    <dd className="text-ink">{selected.reorderPoint}</dd>
                    <dt className="text-ink-faint">Weekly Demand</dt>
                    <dd className="text-ink">{selected.weeklyDemand}/wk</dd>
                    <dt className="text-ink-faint">Unit Cost</dt>
                    <dd className="text-ink">{formatCurrency(selected.unitCost)}</dd>
                    <dt className="text-ink-faint">Unit Price</dt>
                    <dd className="text-ink">{formatCurrency(selected.unitPrice)}</dd>
                    <dt className="text-ink-faint">Last Restocked</dt>
                    <dd className="text-ink">{formatDate(selected.lastRestocked)}</dd>
                  </dl>

                  <h3 className="mb-2 border-b border-rule pb-1.5 text-base font-semibold text-ink">
                    Update
                  </h3>
                  <div className="flex flex-wrap items-end gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-ink-soft">Stock</label>
                      <input
                        type="number"
                        min={0}
                        defaultValue={selected.stock}
                        key={selected.stock}
                        onBlur={(e) => {
                          const next = Number(e.target.value);
                          if (Number.isFinite(next) && next !== selected.stock) {
                            updateProductStock(selected.id, next);
                          }
                        }}
                        className="h-9 w-28 border border-rule bg-background px-2.5 text-sm text-ink outline-none focus-visible:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-ink-soft">Status</label>
                      <select
                        value={selected.status}
                        onChange={(e) => updateProductStatus(selected.id, e.target.value as ProductStatus)}
                        className="h-9 border border-rule bg-background px-2.5 text-sm text-ink outline-none focus-visible:border-primary"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {PRODUCT_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="border border-rule bg-card p-3">
                    <h3 className="mb-3 text-sm font-bold text-ink">Supplier</h3>
                    {selectedSupplier ? (
                      <div className="flex items-center gap-3">
                        <AvatarBadge name={selectedSupplier.name} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{selectedSupplier.name}</p>
                          <p className="truncate text-xs text-ink-faint">{selectedSupplier.email}</p>
                          <p className="text-xs text-ink-faint">{selectedSupplier.leadTimeDays}d lead time</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-ink-soft">No supplier on file.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
