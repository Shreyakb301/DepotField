import type {
  DepotData,
  Order,
  Product,
  PurchaseOrder,
  QualityHoldEntry,
  Supplier,
} from "./types";

/**
 * Product names, SKUs (stock codes), prices, and order line items below are
 * sourced from the UCI "Online Retail" dataset (a real UK gift & homeware
 * e-commerce retailer, Dec 2010–Dec 2011): archive.ics.uci.edu/dataset/352.
 * Warehouse-specific fields that no public dataset has — suppliers, bins,
 * reorder points, purchase orders, quality holds — are invented for the
 * demo, and order dates are shifted to be recent rather than the original
 * 2011 timestamps so the whole app reads as "today."
 */

const suppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Cotswold Home & Gift",
    contactName: "Alice Fenwick",
    email: "alice.fenwick@cotswoldhg.co.uk",
    leadTimeDays: 6,
  },
  {
    id: "sup-2",
    name: "Blackthorn Wholesale",
    contactName: "James Carrow",
    email: "james.carrow@blackthornws.co.uk",
    leadTimeDays: 8,
  },
  {
    id: "sup-3",
    name: "Ridgeway Trading Co.",
    contactName: "Sonia Patel",
    email: "sonia.patel@ridgewaytrading.co.uk",
    leadTimeDays: 5,
  },
  {
    id: "sup-4",
    name: "Meadowcroft Imports",
    contactName: "Owen Hargrave",
    email: "owen.hargrave@meadowcroftimports.co.uk",
    leadTimeDays: 7,
  },
  {
    id: "sup-5",
    name: "Harrowgate Distribution",
    contactName: "Freya Sutcliffe",
    email: "freya.sutcliffe@harrowgatedist.co.uk",
    leadTimeDays: 9,
  },
];

// StockCode / Description / price are real (UCI Online Retail dataset).
const products: Product[] = [
  { id: "p1", name: "White Hanging Heart T-Light Holder", sku: "85123A", category: "Home Decor", supplierId: "sup-1", manufacturer: "Chalk & Hearth", warrantyMonths: 12, stock: 210, reorderPoint: 70, reorderQty: 180, weeklyDemand: 45, unitCost: 1.55, unitPrice: 3.15, bin: "A-01", status: "active", lastRestocked: "2026-09-03" },
  { id: "p2", name: "Victorian Glass Hanging T-Light", sku: "22178", category: "Home Decor", supplierId: "sup-1", manufacturer: "Chalk & Hearth", warrantyMonths: 12, stock: 38, reorderPoint: 45, reorderQty: 100, weeklyDemand: 28, unitCost: 0.8, unitPrice: 1.65, bin: "A-02", status: "active", lastRestocked: "2026-08-27" },
  { id: "p3", name: "Rabbit Night Light", sku: "23084", category: "Home Decor", supplierId: "sup-1", manufacturer: "Little Burrow Lighting", warrantyMonths: 12, stock: 30, reorderPoint: 40, reorderQty: 90, weeklyDemand: 26, unitCost: 1.15, unitPrice: 2.38, bin: "A-03", status: "active", lastRestocked: "2026-08-29" },
  { id: "p4", name: "Regency Cakestand 3 Tier", sku: "22423", category: "Kitchen & Dining", supplierId: "sup-2", manufacturer: "Regency Tableware Co.", warrantyMonths: 24, stock: 14, reorderPoint: 25, reorderQty: 40, weeklyDemand: 12, unitCost: 7.0, unitPrice: 13.99, bin: "B-01", status: "quality_hold", lastRestocked: "2026-08-18" },
  { id: "p5", name: "Set Of 3 Cake Tins Pantry Design", sku: "22720", category: "Kitchen & Dining", supplierId: "sup-2", manufacturer: "Pantry & Co.", warrantyMonths: 12, stock: 86, reorderPoint: 30, reorderQty: 70, weeklyDemand: 15, unitCost: 2.9, unitPrice: 5.85, bin: "B-02", status: "active", lastRestocked: "2026-08-24" },
  { id: "p6", name: "Retrospot Tea Set Ceramic 11 Pc", sku: "22139", category: "Kitchen & Dining", supplierId: "sup-2", manufacturer: "Retrospot Living", warrantyMonths: 24, stock: 9, reorderPoint: 20, reorderQty: 35, weeklyDemand: 8, unitCost: 2.85, unitPrice: 5.75, bin: "B-03", status: "quality_hold", lastRestocked: "2026-09-05" },
  { id: "p7", name: "Jumbo Bag Red Retrospot", sku: "85099B", category: "Bags & Totes", supplierId: "sup-3", manufacturer: "Retrospot Living", stock: 165, reorderPoint: 55, reorderQty: 130, weeklyDemand: 38, unitCost: 1.2, unitPrice: 2.5, bin: "C-01", status: "active", lastRestocked: "2026-09-01" },
  { id: "p8", name: "Lunch Bag Red Retrospot", sku: "20725", category: "Bags & Totes", supplierId: "sup-3", manufacturer: "Retrospot Living", stock: 33, reorderPoint: 40, reorderQty: 90, weeklyDemand: 24, unitCost: 1.0, unitPrice: 2.15, bin: "C-02", status: "active", lastRestocked: "2026-08-22" },
  { id: "p9", name: "Jumbo Storage Bag Suki", sku: "21931", category: "Bags & Totes", supplierId: "sup-3", manufacturer: "Suki Textiles", stock: 71, reorderPoint: 30, reorderQty: 70, weeklyDemand: 14, unitCost: 1.3, unitPrice: 2.75, bin: "C-03", status: "active", lastRestocked: "2026-08-28" },
  { id: "p10", name: "Party Bunting", sku: "47566", category: "Stationery & Gift", supplierId: "sup-4", manufacturer: "Bunting & Co.", stock: 58, reorderPoint: 25, reorderQty: 60, weeklyDemand: 16, unitCost: 2.75, unitPrice: 5.8, bin: "D-01", status: "active", lastRestocked: "2026-08-26" },
  { id: "p11", name: "Paper Chain Kit 50's Christmas", sku: "22086", category: "Stationery & Gift", supplierId: "sup-4", manufacturer: "Vintage Christmas Co.", stock: 19, reorderPoint: 30, reorderQty: 70, weeklyDemand: 22, unitCost: 1.6, unitPrice: 3.35, bin: "D-02", status: "active", lastRestocked: "2026-08-20" },
  { id: "p12", name: "Vintage Snap Cards", sku: "21790", category: "Stationery & Gift", supplierId: "sup-4", manufacturer: "Vintage Playthings", stock: 96, reorderPoint: 35, reorderQty: 80, weeklyDemand: 20, unitCost: 0.45, unitPrice: 1.0, bin: "D-03", status: "active", lastRestocked: "2026-08-30" },
  { id: "p13", name: "Recipe Box Pantry Yellow Design", sku: "22666", category: "Storage & Organisation", supplierId: "sup-5", manufacturer: "Pantry & Co.", warrantyMonths: 12, stock: 44, reorderPoint: 20, reorderQty: 45, weeklyDemand: 9, unitCost: 1.75, unitPrice: 3.7, bin: "A-04", status: "active", lastRestocked: "2026-08-25" },
  { id: "p14", name: "Wooden Picture Frame White Finish", sku: "82482", category: "Storage & Organisation", supplierId: "sup-5", manufacturer: "Chalk & Hearth", warrantyMonths: 12, stock: 11, reorderPoint: 20, reorderQty: 45, weeklyDemand: 7, unitCost: 1.5, unitPrice: 3.1, bin: "B-04", status: "active", lastRestocked: "2026-08-19" },
  { id: "p15", name: "Set/5 Red Retrospot Lid Glass Bowls", sku: "20914", category: "Storage & Organisation", supplierId: "sup-5", manufacturer: "Retrospot Living", warrantyMonths: 12, stock: 27, reorderPoint: 25, reorderQty: 55, weeklyDemand: 11, unitCost: 1.6, unitPrice: 3.3, bin: "C-04", status: "active", lastRestocked: "2026-08-21" },
];

// Line items (product + qty) and customer IDs are real invoices/customers
// from the dataset; order status, dates, and order numbers are simulated.
const orders: Order[] = [
  { id: "o1", orderNumber: "ORD-4001", customer: "Customer #18109", items: [{ productId: "p1", qty: 3 }], status: "Shipped", priority: "Low", verified: true, dueDate: "2026-09-09", team: "Team Alpha", shippingMethod: "Standard", isGift: false, carrier: "DepotXpress", trackingNumber: "DF384920175", createdAt: "2026-08-30", updatedAt: "2026-09-02" },
  { id: "o2", orderNumber: "ORD-4002", customer: "Customer #14064", items: [{ productId: "p2", qty: 6 }], status: "Shipped", priority: "Low", verified: true, dueDate: "2026-09-09", team: "Team Bravo", shippingMethod: "Standard", isGift: false, carrier: "Northbound Freight", trackingNumber: "NF119284733", createdAt: "2026-08-30", updatedAt: "2026-09-02" },
  { id: "o3", orderNumber: "ORD-4003", customer: "Customer #16496", items: [{ productId: "p3", qty: 6 }], status: "Shipped", priority: "Medium", verified: true, dueDate: "2026-09-05", team: "Team Charlie", shippingMethod: "Expedited", isGift: true, giftMessage: "Happy birthday — hope you love it!", carrier: "DepotXpress", trackingNumber: "DF384920211", createdAt: "2026-08-31", updatedAt: "2026-09-03" },
  { id: "o4", orderNumber: "ORD-4004", customer: "Customer #14247", items: [{ productId: "p4", qty: 1 }], status: "Shipped", priority: "Low", verified: true, dueDate: "2026-09-11", team: "Team Delta", shippingMethod: "Standard", isGift: false, carrier: "Swift Parcel Co.", trackingNumber: "SP778241905", createdAt: "2026-09-01", updatedAt: "2026-09-04" },
  { id: "o5", orderNumber: "ORD-4005", customer: "Customer #16923", items: [{ productId: "p5", qty: 3 }], status: "Shipped", priority: "Medium", verified: true, dueDate: "2026-09-07", team: "Team Alpha", shippingMethod: "Expedited", isGift: false, carrier: "DepotXpress", trackingNumber: "DF384920388", createdAt: "2026-09-02", updatedAt: "2026-09-05" },
  { id: "o6", orderNumber: "ORD-4006", customer: "Customer #14862", items: [{ productId: "p6", qty: 6 }], status: "Packed", priority: "Medium", verified: true, dueDate: "2026-09-10", team: "Team Bravo", shippingMethod: "Standard", isGift: false, createdAt: "2026-09-05", updatedAt: "2026-09-09" },
  { id: "o7", orderNumber: "ORD-4007", customer: "Customer #14903", items: [{ productId: "p7", qty: 3 }], status: "Packed", priority: "Low", verified: true, dueDate: "2026-09-16", team: "Team Charlie", shippingMethod: "Standard", isGift: false, createdAt: "2026-09-06", updatedAt: "2026-09-10" },
  { id: "o8", orderNumber: "ORD-4008", customer: "Customer #14587", items: [{ productId: "p8", qty: 1 }], status: "Packed", priority: "Low", verified: true, dueDate: "2026-09-16", team: "Team Delta", shippingMethod: "Standard", isGift: true, giftMessage: "Congrats on the new home!", createdAt: "2026-09-06", updatedAt: "2026-09-10" },
  { id: "o9", orderNumber: "ORD-4009", customer: "Customer #16686", items: [{ productId: "p9", qty: 2 }], status: "Packed", priority: "Medium", verified: true, dueDate: "2026-09-12", team: "Team Alpha", shippingMethod: "Expedited", isGift: false, createdAt: "2026-09-07", updatedAt: "2026-09-11" },
  { id: "o10", orderNumber: "ORD-4010", customer: "Customer #13614", items: [{ productId: "p10", qty: 1 }], status: "Packed", priority: "High", verified: true, dueDate: "2026-09-10", team: "Team Bravo", shippingMethod: "Same-Day", isGift: false, createdAt: "2026-09-08", updatedAt: "2026-09-11" },
  { id: "o11", orderNumber: "ORD-4011", customer: "Customer #16369", items: [{ productId: "p11", qty: 4 }], status: "Picking", priority: "Medium", verified: true, dueDate: "2026-09-14", team: "Team Charlie", shippingMethod: "Standard", isGift: false, createdAt: "2026-09-09", updatedAt: "2026-09-12" },
  { id: "o12", orderNumber: "ORD-4012", customer: "Customer #15068", items: [{ productId: "p12", qty: 3 }], status: "Picking", priority: "Low", verified: false, dueDate: "2026-09-20", team: "Team Delta", shippingMethod: "Standard", isGift: false, createdAt: "2026-09-10", updatedAt: "2026-09-12" },
  { id: "o13", orderNumber: "ORD-4013", customer: "Customer #15640", items: [{ productId: "p13", qty: 6 }], status: "Picking", priority: "Medium", verified: true, dueDate: "2026-09-15", team: "Team Alpha", shippingMethod: "Expedited", isGift: false, createdAt: "2026-09-10", updatedAt: "2026-09-13" },
  { id: "o14", orderNumber: "ORD-4014", customer: "Customer #17894", items: [{ productId: "p14", qty: 2 }], status: "Picking", priority: "High", verified: false, dueDate: "2026-09-13", team: "Team Bravo", shippingMethod: "Same-Day", isGift: false, createdAt: "2026-09-11", updatedAt: "2026-09-13" },
  { id: "o15", orderNumber: "ORD-4015", customer: "Customer #17338", items: [{ productId: "p15", qty: 2 }], status: "Picking", priority: "Low", verified: true, dueDate: "2026-09-21", team: "Team Charlie", shippingMethod: "Standard", isGift: true, giftMessage: "Thinking of you!", createdAt: "2026-09-11", updatedAt: "2026-09-13" },
  { id: "o16", orderNumber: "ORD-4016", customer: "Customer #14001", items: [{ productId: "p13", qty: 6 }, { productId: "p10", qty: 12 }], status: "New", priority: "Medium", verified: false, dueDate: "2026-09-17", team: "Team Delta", shippingMethod: "Standard", isGift: false, createdAt: "2026-09-12", updatedAt: "2026-09-12" },
  { id: "o17", orderNumber: "ORD-4017", customer: "Customer #14056", items: [{ productId: "p15", qty: 1 }, { productId: "p8", qty: 2 }], status: "New", priority: "Low", verified: false, dueDate: "2026-09-23", team: "Team Alpha", shippingMethod: "Standard", isGift: false, createdAt: "2026-09-13", updatedAt: "2026-09-13" },
  { id: "o18", orderNumber: "ORD-4018", customer: "Customer #14214", items: [{ productId: "p4", qty: 2 }, { productId: "p12", qty: 12 }, { productId: "p5", qty: 3 }], status: "New", priority: "High", verified: false, dueDate: "2026-09-15", team: "Team Bravo", shippingMethod: "Same-Day", isGift: false, createdAt: "2026-09-13", updatedAt: "2026-09-13" },
  { id: "o19", orderNumber: "ORD-4019", customer: "Customer #12886", items: [{ productId: "p11", qty: 12 }, { productId: "p4", qty: 2 }], status: "New", priority: "Medium", verified: false, dueDate: "2026-09-19", team: "Team Charlie", shippingMethod: "Expedited", isGift: false, createdAt: "2026-09-14", updatedAt: "2026-09-14" },
  { id: "o20", orderNumber: "ORD-4020", customer: "Customer #18158", items: [{ productId: "p8", qty: 10 }, { productId: "p7", qty: 10 }], status: "New", priority: "Low", verified: false, dueDate: "2026-09-24", team: "Team Delta", shippingMethod: "Standard", isGift: false, createdAt: "2026-09-14", updatedAt: "2026-09-14" },
];

const purchaseOrders: PurchaseOrder[] = [
  { id: "po-1", poNumber: "PO-2101", supplierId: "sup-1", items: [{ productId: "p2", qtyOrdered: 100, qtyReceived: 0 }], status: "In Transit", orderedAt: "2026-09-10", expectedAt: "2026-09-16" },
  { id: "po-2", poNumber: "PO-2102", supplierId: "sup-2", items: [{ productId: "p6", qtyOrdered: 35, qtyReceived: 9 }], status: "Partially Received", orderedAt: "2026-08-28", expectedAt: "2026-09-04", receivedAt: "2026-09-05" },
  { id: "po-3", poNumber: "PO-2103", supplierId: "sup-4", items: [{ productId: "p11", qtyOrdered: 70, qtyReceived: 0 }], status: "Pending", orderedAt: "2026-09-12", expectedAt: "2026-09-19" },
  { id: "po-4", poNumber: "PO-2104", supplierId: "sup-5", items: [{ productId: "p14", qtyOrdered: 45, qtyReceived: 0 }], status: "Delayed", orderedAt: "2026-08-30", expectedAt: "2026-09-08" },
  { id: "po-5", poNumber: "PO-2105", supplierId: "sup-3", items: [{ productId: "p8", qtyOrdered: 90, qtyReceived: 90 }], status: "Received", orderedAt: "2026-08-20", expectedAt: "2026-08-27", receivedAt: "2026-08-27" },
  { id: "po-6", poNumber: "PO-2106", supplierId: "sup-1", items: [{ productId: "p3", qtyOrdered: 90, qtyReceived: 45 }], status: "Partially Received", orderedAt: "2026-09-01", expectedAt: "2026-09-08", receivedAt: "2026-09-08" },
  { id: "po-7", poNumber: "PO-2107", supplierId: "sup-5", items: [{ productId: "p15", qtyOrdered: 55, qtyReceived: 0 }], status: "In Transit", orderedAt: "2026-09-11", expectedAt: "2026-09-18" },
  { id: "po-8", poNumber: "PO-2098", supplierId: "sup-5", items: [{ productId: "p14", qtyOrdered: 45, qtyReceived: 45 }], status: "Received", orderedAt: "2026-08-15", expectedAt: "2026-08-22", receivedAt: "2026-08-23" },
  { id: "po-9", poNumber: "PO-2097", supplierId: "sup-2", items: [{ productId: "p4", qtyOrdered: 30, qtyReceived: 14 }], status: "Partially Received", orderedAt: "2026-08-10", expectedAt: "2026-08-17", receivedAt: "2026-08-18" },
];

const qualityHolds: QualityHoldEntry[] = [
  { id: "qh-1", productId: "p14", poId: "po-8", qty: 5, reason: "Frames arrived with scuffed corners", flaggedAt: "2026-08-23", status: "Released" },
  { id: "qh-2", productId: "p4", poId: "po-9", qty: 14, reason: "Cakestands arrived chipped in transit", flaggedAt: "2026-08-18", status: "On Hold" },
  { id: "qh-3", productId: "p6", poId: "po-2", qty: 9, reason: "Teapots found cracked during unboxing", flaggedAt: "2026-09-05", status: "On Hold" },
  { id: "qh-4", productId: "p3", poId: "po-6", qty: 6, reason: "Night lights failed sample safety check", flaggedAt: "2026-09-08", status: "Rejected" },
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
