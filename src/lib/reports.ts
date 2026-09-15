import type { DepotData } from "./types";
import type { ReportRow } from "./csv";
import {
  binFillLevel,
  isLowStock,
  productById,
  supplierName,
} from "./selectors";
import { BINS } from "./bins";
import { PRODUCT_STATUS_LABEL } from "./format";

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  columns: string[];
  build: (data: DepotData) => ReportRow[];
}

export const REPORTS: ReportDefinition[] = [
  {
    id: "inventory",
    name: "Inventory",
    description: "Every product on hand: stock, cost, value, bin, and status.",
    columns: [
      "SKU",
      "Product",
      "Category",
      "Manufacturer",
      "Supplier",
      "Bin",
      "Stock",
      "Reorder Point",
      "Unit Cost",
      "Unit Price",
      "Value",
      "Status",
    ],
    build: (data) =>
      data.products.map((p) => ({
        SKU: p.sku,
        Product: p.name,
        Category: p.category,
        Manufacturer: p.manufacturer,
        Supplier: supplierName(data, p.supplierId),
        Bin: p.bin,
        Stock: p.stock,
        "Reorder Point": p.reorderPoint,
        "Unit Cost": p.unitCost.toFixed(2),
        "Unit Price": p.unitPrice.toFixed(2),
        Value: (p.stock * p.unitCost).toFixed(2),
        Status: PRODUCT_STATUS_LABEL[p.status],
      })),
  },
  {
    id: "reorder",
    name: "Reorder Planning",
    description: "Products below their reorder point, with a suggested quantity.",
    columns: [
      "SKU",
      "Product",
      "Stock",
      "Reorder Point",
      "Weekly Demand",
      "Supplier",
      "Lead Time (d)",
      "Suggested Qty",
    ],
    build: (data) =>
      data.products
        .filter(isLowStock)
        .sort((a, b) => a.stock / a.reorderPoint - b.stock / b.reorderPoint)
        .map((p) => {
          const supplier = data.suppliers.find((s) => s.id === p.supplierId);
          return {
            SKU: p.sku,
            Product: p.name,
            Stock: p.stock,
            "Reorder Point": p.reorderPoint,
            "Weekly Demand": p.weeklyDemand,
            Supplier: supplier?.name ?? "—",
            "Lead Time (d)": supplier?.leadTimeDays ?? "",
            "Suggested Qty": p.reorderQty,
          };
        }),
  },
  {
    id: "orders",
    name: "Orders",
    description: "Every customer order: status, team, shipping, and value.",
    columns: [
      "Order #",
      "Customer",
      "Items",
      "Total",
      "Status",
      "Priority",
      "Team",
      "Shipping Method",
      "Verified",
      "Gift",
      "Due Date",
      "Created",
      "Modified",
    ],
    build: (data) =>
      data.orders.map((o) => {
        const total = o.items.reduce((sum, item) => {
          const product = productById(data, item.productId);
          return sum + (product ? product.unitPrice * item.qty : 0);
        }, 0);
        return {
          "Order #": o.orderNumber,
          Customer: o.customer,
          Items: o.items.reduce((s, i) => s + i.qty, 0),
          Total: total.toFixed(2),
          Status: o.status,
          Priority: o.priority,
          Team: o.team,
          "Shipping Method": o.shippingMethod,
          Verified: o.verified ? "Yes" : "No",
          Gift: o.isGift ? "Yes" : "No",
          "Due Date": o.dueDate,
          Created: o.createdAt,
          Modified: o.updatedAt,
        };
      }),
  },
  {
    id: "purchase-orders",
    name: "Purchase Orders",
    description: "Incoming supplier purchase orders and receiving progress.",
    columns: ["PO #", "Supplier", "Status", "Items", "Ordered", "Expected", "Received"],
    build: (data) =>
      data.purchaseOrders.map((po) => ({
        "PO #": po.poNumber,
        Supplier: supplierName(data, po.supplierId),
        Status: po.status,
        Items: po.items
          .map((i) => `${productById(data, i.productId)?.name ?? i.productId} (${i.qtyReceived}/${i.qtyOrdered})`)
          .join("; "),
        Ordered: po.orderedAt,
        Expected: po.expectedAt,
        Received: po.receivedAt ?? "",
      })),
  },
  {
    id: "quality-holds",
    name: "Quality Holds",
    description: "Incoming stock flagged for inspection, released, or rejected.",
    columns: ["Product", "Qty", "Reason", "PO #", "Flagged", "Status"],
    build: (data) =>
      data.qualityHolds.map((q) => {
        const po = data.purchaseOrders.find((p) => p.id === q.poId);
        return {
          Product: productById(data, q.productId)?.name ?? "Unknown product",
          Qty: q.qty,
          Reason: q.reason,
          "PO #": po?.poNumber ?? "—",
          Flagged: q.flaggedAt,
          Status: q.status,
        };
      }),
  },
  {
    id: "warehouse",
    name: "Warehouse Utilization",
    description: "Fill level for every bin, A-01 through D-04.",
    columns: ["Bin", "SKUs", "Units Used", "Capacity", "Fill %"],
    build: (data) =>
      BINS.map((bin) => {
        const fill = binFillLevel(data, bin.id);
        return {
          Bin: bin.id,
          SKUs: fill.items.length,
          "Units Used": fill.used,
          Capacity: fill.capacity,
          "Fill %": fill.pct,
        };
      }),
  },
];
