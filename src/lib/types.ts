export type Category =
  | "Home Decor"
  | "Kitchen & Dining"
  | "Bags & Totes"
  | "Stationery & Gift"
  | "Storage & Organisation";

export const CATEGORIES: Category[] = [
  "Home Decor",
  "Kitchen & Dining",
  "Bags & Totes",
  "Stationery & Gift",
  "Storage & Organisation",
];

export type ProductStatus = "active" | "quality_hold" | "discontinued";

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  leadTimeDays: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  supplierId: string;
  stock: number;
  reorderPoint: number;
  reorderQty: number;
  weeklyDemand: number;
  unitCost: number;
  unitPrice: number;
  bin: string;
  status: ProductStatus;
  lastRestocked: string;
}

export type OrderStatus = "New" | "Picking" | "Packed" | "Shipped";

export const ORDER_STATUSES: OrderStatus[] = [
  "New",
  "Picking",
  "Packed",
  "Shipped",
];

export type OrderPriority = "Low" | "Medium" | "High";

export const ORDER_PRIORITIES: OrderPriority[] = ["Low", "Medium", "High"];

export interface OrderItem {
  productId: string;
  qty: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: OrderItem[];
  status: OrderStatus;
  priority: OrderPriority;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type POStatus =
  | "Pending"
  | "In Transit"
  | "Delayed"
  | "Partially Received"
  | "Received";

export interface POItem {
  productId: string;
  qtyOrdered: number;
  qtyReceived: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  items: POItem[];
  status: POStatus;
  orderedAt: string;
  expectedAt: string;
  receivedAt?: string;
}

export type QualityHoldStatus = "On Hold" | "Released" | "Rejected";

export interface QualityHoldEntry {
  id: string;
  productId: string;
  poId: string;
  qty: number;
  reason: string;
  flaggedAt: string;
  status: QualityHoldStatus;
}

export interface DepotData {
  products: Product[];
  suppliers: Supplier[];
  orders: Order[];
  purchaseOrders: PurchaseOrder[];
  qualityHolds: QualityHoldEntry[];
}
