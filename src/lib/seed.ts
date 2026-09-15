import type {
  DepotData,
  Order,
  Product,
  PurchaseOrder,
  QualityHoldEntry,
  Supplier,
} from "./types";

const suppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Northline Distributors",
    contactName: "Dana Whitfield",
    email: "dana.whitfield@northline-dist.com",
    leadTimeDays: 5,
  },
  {
    id: "sup-2",
    name: "Cascade Supply Co.",
    contactName: "Marco Ibarra",
    email: "marco.ibarra@cascadesupply.com",
    leadTimeDays: 7,
  },
  {
    id: "sup-3",
    name: "Meridian Wholesale",
    contactName: "Priya Nandan",
    email: "priya.nandan@meridianwholesale.com",
    leadTimeDays: 4,
  },
  {
    id: "sup-4",
    name: "Ironclad Logistics",
    contactName: "Tom Reyes",
    email: "tom.reyes@ironcladlog.com",
    leadTimeDays: 10,
  },
  {
    id: "sup-5",
    name: "Brightpeak Goods",
    contactName: "Sarah Colton",
    email: "sarah.colton@brightpeakgoods.com",
    leadTimeDays: 6,
  },
];

const products: Product[] = [
  { id: "p1", name: "Wireless Mouse", sku: "EL-1001", category: "Electronics", supplierId: "sup-1", stock: 180, reorderPoint: 60, reorderQty: 150, weeklyDemand: 40, unitCost: 8.5, unitPrice: 19.99, bin: "A-01", status: "active", lastRestocked: "2026-09-02" },
  { id: "p2", name: "USB-C Hub 6-Port", sku: "EL-1002", category: "Electronics", supplierId: "sup-1", stock: 45, reorderPoint: 50, reorderQty: 120, weeklyDemand: 22, unitCost: 12, unitPrice: 29.99, bin: "A-02", status: "active", lastRestocked: "2026-08-29" },
  { id: "p3", name: "Bluetooth Speaker Mini", sku: "EL-1003", category: "Electronics", supplierId: "sup-2", stock: 96, reorderPoint: 40, reorderQty: 100, weeklyDemand: 18, unitCost: 15, unitPrice: 34.99, bin: "A-03", status: "active", lastRestocked: "2026-09-05" },
  { id: "p4", name: "Noise-Cancelling Headphones", sku: "EL-1004", category: "Electronics", supplierId: "sup-2", stock: 22, reorderPoint: 35, reorderQty: 80, weeklyDemand: 15, unitCost: 42, unitPrice: 89.99, bin: "A-04", status: "quality_hold", lastRestocked: "2026-09-05" },
  { id: "p5", name: "Men's Fleece Jacket", sku: "AP-2001", category: "Apparel", supplierId: "sup-3", stock: 140, reorderPoint: 50, reorderQty: 120, weeklyDemand: 25, unitCost: 18, unitPrice: 44.99, bin: "B-01", status: "active", lastRestocked: "2026-08-30" },
  { id: "p6", name: "Women's Running Shorts", sku: "AP-2002", category: "Apparel", supplierId: "sup-3", stock: 75, reorderPoint: 45, reorderQty: 100, weeklyDemand: 20, unitCost: 9, unitPrice: 24.99, bin: "B-02", status: "active", lastRestocked: "2026-09-01" },
  { id: "p7", name: "Unisex Beanie", sku: "AP-2003", category: "Apparel", supplierId: "sup-4", stock: 28, reorderPoint: 40, reorderQty: 90, weeklyDemand: 30, unitCost: 4, unitPrice: 12.99, bin: "B-03", status: "active", lastRestocked: "2026-08-25" },
  { id: "p8", name: "Ceramic Plant Pot", sku: "HG-3001", category: "Home & Garden", supplierId: "sup-4", stock: 110, reorderPoint: 35, reorderQty: 80, weeklyDemand: 12, unitCost: 6, unitPrice: 16.99, bin: "B-04", status: "active", lastRestocked: "2026-08-27" },
  { id: "p9", name: "LED Desk Lamp", sku: "HG-3002", category: "Home & Garden", supplierId: "sup-5", stock: 64, reorderPoint: 30, reorderQty: 70, weeklyDemand: 10, unitCost: 11, unitPrice: 27.99, bin: "C-01", status: "active", lastRestocked: "2026-08-27" },
  { id: "p10", name: "Memory Foam Pillow", sku: "HG-3003", category: "Home & Garden", supplierId: "sup-5", stock: 18, reorderPoint: 30, reorderQty: 70, weeklyDemand: 14, unitCost: 9.5, unitPrice: 22.99, bin: "C-02", status: "active", lastRestocked: "2026-08-27" },
  { id: "p11", name: "Camping Tent 2-Person", sku: "OD-4001", category: "Outdoor", supplierId: "sup-2", stock: 33, reorderPoint: 20, reorderQty: 40, weeklyDemand: 6, unitCost: 55, unitPrice: 129.99, bin: "C-03", status: "active", lastRestocked: "2026-09-04" },
  { id: "p12", name: "Insulated Water Bottle", sku: "OD-4002", category: "Outdoor", supplierId: "sup-1", stock: 152, reorderPoint: 50, reorderQty: 120, weeklyDemand: 35, unitCost: 5.5, unitPrice: 15.99, bin: "C-04", status: "active", lastRestocked: "2026-09-08" },
  { id: "p13", name: "Trail Backpack 30L", sku: "OD-4003", category: "Outdoor", supplierId: "sup-3", stock: 12, reorderPoint: 25, reorderQty: 50, weeklyDemand: 9, unitCost: 24, unitPrice: 59.99, bin: "D-01", status: "quality_hold", lastRestocked: "2026-08-18" },
  { id: "p14", name: "Ergonomic Office Chair", sku: "OF-5001", category: "Office", supplierId: "sup-4", stock: 26, reorderPoint: 15, reorderQty: 30, weeklyDemand: 5, unitCost: 85, unitPrice: 189.99, bin: "D-02", status: "active", lastRestocked: "2026-08-23" },
  { id: "p15", name: "Standing Desk Converter", sku: "OF-5002", category: "Office", supplierId: "sup-5", stock: 8, reorderPoint: 15, reorderQty: 30, weeklyDemand: 6, unitCost: 60, unitPrice: 149.99, bin: "D-03", status: "active", lastRestocked: "2026-08-20" },
];

const orders: Order[] = [
  { id: "o1", orderNumber: "ORD-3001", customer: "Elena Brooks", items: [{ productId: "p1", qty: 2 }, { productId: "p12", qty: 1 }], status: "Shipped", createdAt: "2026-08-30", updatedAt: "2026-09-02" },
  { id: "o2", orderNumber: "ORD-3002", customer: "Marcus Yun", items: [{ productId: "p5", qty: 1 }], status: "Shipped", createdAt: "2026-08-31", updatedAt: "2026-09-03" },
  { id: "o3", orderNumber: "ORD-3003", customer: "Priya Shah", items: [{ productId: "p9", qty: 1 }, { productId: "p8", qty: 2 }], status: "Shipped", createdAt: "2026-09-01", updatedAt: "2026-09-04" },
  { id: "o4", orderNumber: "ORD-3004", customer: "Jordan Blake", items: [{ productId: "p3", qty: 1 }], status: "Shipped", createdAt: "2026-09-02", updatedAt: "2026-09-05" },
  { id: "o5", orderNumber: "ORD-3005", customer: "Sofia Martins", items: [{ productId: "p6", qty: 2 }, { productId: "p7", qty: 1 }], status: "Shipped", createdAt: "2026-09-03", updatedAt: "2026-09-06" },
  { id: "o6", orderNumber: "ORD-3006", customer: "Ken Osei", items: [{ productId: "p11", qty: 1 }], status: "Packed", createdAt: "2026-09-06", updatedAt: "2026-09-10" },
  { id: "o7", orderNumber: "ORD-3007", customer: "Grace Liu", items: [{ productId: "p1", qty: 1 }, { productId: "p2", qty: 1 }], status: "Packed", createdAt: "2026-09-07", updatedAt: "2026-09-11" },
  { id: "o8", orderNumber: "ORD-3008", customer: "Diego Fernandez", items: [{ productId: "p14", qty: 1 }], status: "Packed", createdAt: "2026-09-08", updatedAt: "2026-09-11" },
  { id: "o9", orderNumber: "ORD-3009", customer: "Amara Johnson", items: [{ productId: "p12", qty: 3 }], status: "Packed", createdAt: "2026-09-08", updatedAt: "2026-09-12" },
  { id: "o10", orderNumber: "ORD-3010", customer: "Liam O'Connor", items: [{ productId: "p4", qty: 1 }], status: "Picking", createdAt: "2026-09-10", updatedAt: "2026-09-12" },
  { id: "o11", orderNumber: "ORD-3011", customer: "Nina Petrov", items: [{ productId: "p5", qty: 1 }, { productId: "p6", qty: 1 }], status: "Picking", createdAt: "2026-09-10", updatedAt: "2026-09-12" },
  { id: "o12", orderNumber: "ORD-3012", customer: "Owen Clarke", items: [{ productId: "p15", qty: 1 }], status: "Picking", createdAt: "2026-09-11", updatedAt: "2026-09-13" },
  { id: "o13", orderNumber: "ORD-3013", customer: "Maya Singh", items: [{ productId: "p3", qty: 2 }], status: "Picking", createdAt: "2026-09-11", updatedAt: "2026-09-13" },
  { id: "o14", orderNumber: "ORD-3014", customer: "Tyler Brooks", items: [{ productId: "p13", qty: 1 }], status: "New", createdAt: "2026-09-12", updatedAt: "2026-09-12" },
  { id: "o15", orderNumber: "ORD-3015", customer: "Hana Kobayashi", items: [{ productId: "p9", qty: 1 }, { productId: "p10", qty: 1 }], status: "New", createdAt: "2026-09-13", updatedAt: "2026-09-13" },
  { id: "o16", orderNumber: "ORD-3016", customer: "Felix Moreau", items: [{ productId: "p1", qty: 3 }], status: "New", createdAt: "2026-09-13", updatedAt: "2026-09-13" },
  { id: "o17", orderNumber: "ORD-3017", customer: "Ava Thompson", items: [{ productId: "p7", qty: 2 }, { productId: "p8", qty: 1 }], status: "New", createdAt: "2026-09-14", updatedAt: "2026-09-14" },
  { id: "o18", orderNumber: "ORD-3018", customer: "Noah Kim", items: [{ productId: "p14", qty: 1 }, { productId: "p2", qty: 1 }], status: "New", createdAt: "2026-09-14", updatedAt: "2026-09-14" },
];

const purchaseOrders: PurchaseOrder[] = [
  { id: "po-1", poNumber: "PO-1001", supplierId: "sup-1", items: [{ productId: "p1", qtyOrdered: 150, qtyReceived: 0 }], status: "In Transit", orderedAt: "2026-09-10", expectedAt: "2026-09-16" },
  { id: "po-2", poNumber: "PO-1002", supplierId: "sup-2", items: [{ productId: "p4", qtyOrdered: 80, qtyReceived: 22 }, { productId: "p3", qtyOrdered: 40, qtyReceived: 40 }], status: "Partially Received", orderedAt: "2026-08-28", expectedAt: "2026-09-04", receivedAt: "2026-09-05" },
  { id: "po-3", poNumber: "PO-1003", supplierId: "sup-3", items: [{ productId: "p7", qtyOrdered: 90, qtyReceived: 0 }], status: "Pending", orderedAt: "2026-09-12", expectedAt: "2026-09-19" },
  { id: "po-4", poNumber: "PO-1004", supplierId: "sup-4", items: [{ productId: "p13", qtyOrdered: 40, qtyReceived: 0 }], status: "Delayed", orderedAt: "2026-08-30", expectedAt: "2026-09-08" },
  { id: "po-5", poNumber: "PO-1005", supplierId: "sup-5", items: [{ productId: "p10", qtyOrdered: 70, qtyReceived: 70 }], status: "Received", orderedAt: "2026-08-20", expectedAt: "2026-08-27", receivedAt: "2026-08-27" },
  { id: "po-6", poNumber: "PO-1006", supplierId: "sup-1", items: [{ productId: "p12", qtyOrdered: 120, qtyReceived: 60 }], status: "Partially Received", orderedAt: "2026-09-01", expectedAt: "2026-09-08", receivedAt: "2026-09-08" },
  { id: "po-7", poNumber: "PO-1007", supplierId: "sup-2", items: [{ productId: "p2", qtyOrdered: 120, qtyReceived: 0 }], status: "In Transit", orderedAt: "2026-09-11", expectedAt: "2026-09-18" },
  { id: "po-8", poNumber: "PO-0998", supplierId: "sup-4", items: [{ productId: "p14", qtyOrdered: 30, qtyReceived: 30 }], status: "Received", orderedAt: "2026-08-15", expectedAt: "2026-08-22", receivedAt: "2026-08-23" },
  { id: "po-9", poNumber: "PO-0997", supplierId: "sup-3", items: [{ productId: "p13", qtyOrdered: 40, qtyReceived: 12 }], status: "Partially Received", orderedAt: "2026-08-10", expectedAt: "2026-08-17", receivedAt: "2026-08-18" },
];

const qualityHolds: QualityHoldEntry[] = [
  { id: "qh-1", productId: "p14", poId: "po-8", qty: 5, reason: "Packaging damaged in transit", flaggedAt: "2026-08-23", status: "Released" },
  { id: "qh-2", productId: "p4", poId: "po-2", qty: 22, reason: "Damaged cartons found during unloading", flaggedAt: "2026-09-05", status: "On Hold" },
  { id: "qh-3", productId: "p13", poId: "po-9", qty: 12, reason: "Failed incoming inspection — torn fabric", flaggedAt: "2026-08-18", status: "On Hold" },
  { id: "qh-4", productId: "p12", poId: "po-6", qty: 8, reason: "Bottles arrived with cracked lids", flaggedAt: "2026-09-08", status: "Rejected" },
];

export function createSeedData(): DepotData {
  return {
    products: structuredClone(products),
    suppliers: structuredClone(suppliers),
    orders: structuredClone(orders),
    purchaseOrders: structuredClone(purchaseOrders),
    qualityHolds: structuredClone(qualityHolds),
  };
}
