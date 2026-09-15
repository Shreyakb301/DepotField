import { BIN_CAPACITY, BINS } from "./bins";
import type { DepotData, Product } from "./types";

export function isLowStock(product: Product): boolean {
  return product.status !== "discontinued" && product.stock <= product.reorderPoint;
}

export function ordersToFulfill(data: DepotData): number {
  return data.orders.filter((o) => o.status !== "Shipped").length;
}

export function lowStockProducts(data: DepotData): Product[] {
  return data.products.filter(isLowStock);
}

export function inventoryValue(data: DepotData): number {
  return data.products.reduce((sum, p) => sum + p.stock * p.unitCost, 0);
}

export function warehouseCapacityPct(data: DepotData): number {
  const totalCapacity = BINS.length * BIN_CAPACITY;
  const totalStock = data.products.reduce((sum, p) => sum + p.stock, 0);
  return Math.min(100, Math.round((totalStock / totalCapacity) * 100));
}

export function inventoryByCategory(data: DepotData) {
  const map = new Map<string, number>();
  for (const p of data.products) {
    map.set(p.category, (map.get(p.category) ?? 0) + p.stock);
  }
  return Array.from(map.entries()).map(([category, stock]) => ({
    category,
    stock,
  }));
}

export function ordersByStatus(data: DepotData) {
  const statuses = ["New", "Picking", "Packed", "Shipped"] as const;
  return statuses.map((status) => ({
    status,
    count: data.orders.filter((o) => o.status === status).length,
  }));
}

export function supplierName(data: DepotData, supplierId: string): string {
  return data.suppliers.find((s) => s.id === supplierId)?.name ?? "Unknown supplier";
}

export function productById(data: DepotData, productId: string): Product | undefined {
  return data.products.find((p) => p.id === productId);
}

export function binFillLevel(data: DepotData, binId: string) {
  const items = data.products
    .filter((p) => p.bin === binId)
    .map((p) => ({ product: p, qty: p.stock }));
  const used = items.reduce((sum, i) => sum + i.qty, 0);
  return { items, used, capacity: BIN_CAPACITY, pct: Math.min(100, Math.round((used / BIN_CAPACITY) * 100)) };
}

export function orderTotal(data: DepotData, order: DepotData["orders"][number]): number {
  return order.items.reduce((sum, item) => {
    const product = productById(data, item.productId);
    return sum + (product ? product.unitPrice * item.qty : 0);
  }, 0);
}
