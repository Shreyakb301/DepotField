"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSeedData } from "./seed";
import type {
  DepotData,
  FulfillmentTeam,
  OrderItem,
  OrderPriority,
  OrderStatus,
  POStatus,
  ProductStatus,
  ShippingMethod,
} from "./types";
import { FULFILLMENT_TEAMS, ORDER_STATUSES } from "./types";

const DUE_DATE_DAYS: Record<OrderPriority, number> = {
  High: 2,
  Medium: 5,
  Low: 10,
};

const CARRIERS = ["DepotXpress", "Northbound Freight", "Swift Parcel Co."];

function generateTracking(): { carrier: string; trackingNumber: string } {
  const carrier = CARRIERS[Math.floor(Math.random() * CARRIERS.length)];
  const prefix = carrier
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const digits = Math.floor(100000000 + Math.random() * 899999999);
  return { carrier, trackingNumber: `${prefix}${digits}` };
}

const STORAGE_KEY = "depotfield:data:v1";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

interface ReceiptLine {
  productId: string;
  qty: number;
  destination: "stock" | "hold";
  reason?: string;
}

interface DepotContextValue {
  data: DepotData;
  hydrated: boolean;
  updateProductStock: (productId: string, stock: number) => void;
  updateProductStatus: (productId: string, status: ProductStatus) => void;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  advanceOrder: (orderId: string) => void;
  updateOrderPriority: (orderId: string, priority: OrderPriority) => void;
  updateOrderNotes: (orderId: string, notes: string) => void;
  updateOrderDueDate: (orderId: string, dueDate: string) => void;
  setOrderVerified: (orderId: string, verified: boolean) => void;
  updateOrderTeam: (orderId: string, team: FulfillmentTeam) => void;
  updateOrderShippingMethod: (orderId: string, method: ShippingMethod) => void;
  updateOrderGift: (orderId: string, isGift: boolean, giftMessage?: string) => void;
  createOrder: (input: {
    customer: string;
    items: OrderItem[];
    priority: OrderPriority;
    notes?: string;
  }) => string;
  receivePO: (poId: string, receipts: ReceiptLine[]) => void;
  releaseQualityHold: (entryId: string) => void;
  rejectQualityHold: (entryId: string) => void;
  createPurchaseOrder: (productId: string, qty: number) => string;
  resetDemoData: () => void;
}

const DepotContext = createContext<DepotContextValue | null>(null);

export function DepotProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DepotData>(() => createSeedData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // One-time hydration from localStorage after mount; server and first
        // client render intentionally use seed data to avoid a hydration mismatch.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(JSON.parse(raw) as DepotData);
      }
    } catch {
      // ignore malformed storage, fall back to seed data already in state
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage unavailable (private mode, quota) - fail silently
    }
  }, [data, hydrated]);

  const value = useMemo<DepotContextValue>(() => {
    function updateProductStock(productId: string, stock: number) {
      setData((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId ? { ...p, stock: Math.max(0, stock) } : p,
        ),
      }));
    }

    function updateProductStatus(productId: string, status: ProductStatus) {
      setData((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId ? { ...p, status } : p,
        ),
      }));
    }

    function setOrderStatus(orderId: string, status: OrderStatus) {
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? { ...o, status, updatedAt: todayISO() }
            : o,
        ),
      }));
    }

    function updateOrderPriority(orderId: string, priority: OrderPriority) {
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, priority, updatedAt: todayISO() } : o,
        ),
      }));
    }

    function updateOrderNotes(orderId: string, notes: string) {
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? { ...o, notes: notes.trim() || undefined, updatedAt: todayISO() }
            : o,
        ),
      }));
    }

    function updateOrderDueDate(orderId: string, dueDate: string) {
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, dueDate, updatedAt: todayISO() } : o,
        ),
      }));
    }

    function setOrderVerified(orderId: string, verified: boolean) {
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, verified, updatedAt: todayISO() } : o,
        ),
      }));
    }

    function updateOrderTeam(orderId: string, team: FulfillmentTeam) {
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, team, updatedAt: todayISO() } : o,
        ),
      }));
    }

    function updateOrderShippingMethod(orderId: string, shippingMethod: ShippingMethod) {
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, shippingMethod, updatedAt: todayISO() } : o,
        ),
      }));
    }

    function updateOrderGift(orderId: string, isGift: boolean, giftMessage?: string) {
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                isGift,
                giftMessage: isGift ? giftMessage?.trim() || undefined : undefined,
                updatedAt: todayISO(),
              }
            : o,
        ),
      }));
    }

    function advanceOrder(orderId: string) {
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => {
          if (o.id !== orderId) return o;
          const idx = ORDER_STATUSES.indexOf(o.status);
          if (idx === -1 || idx === ORDER_STATUSES.length - 1) return o;
          const nextStatus = ORDER_STATUSES[idx + 1];
          const shipping =
            nextStatus === "Shipped" && !o.trackingNumber ? generateTracking() : {};
          return {
            ...o,
            status: nextStatus,
            updatedAt: todayISO(),
            ...shipping,
          };
        }),
      }));
    }

    function createOrder(input: {
      customer: string;
      items: OrderItem[];
      priority: OrderPriority;
      notes?: string;
    }): string {
      const id = genId("o");
      setData((prev) => {
        const maxNum = prev.orders.reduce((max, o) => {
          const n = Number(o.orderNumber.split("-")[1]);
          return Number.isFinite(n) ? Math.max(max, n) : max;
        }, 4000);
        const orderNumber = `ORD-${maxNum + 1}`;
        const today = todayISO();
        const team = FULFILLMENT_TEAMS[prev.orders.length % FULFILLMENT_TEAMS.length];
        return {
          ...prev,
          orders: [
            ...prev.orders,
            {
              id,
              orderNumber,
              customer: input.customer.trim(),
              items: input.items,
              status: "New" as const,
              priority: input.priority,
              notes: input.notes?.trim() || undefined,
              verified: false,
              dueDate: addDays(today, DUE_DATE_DAYS[input.priority]),
              team,
              shippingMethod: "Standard" as const,
              isGift: false,
              createdAt: today,
              updatedAt: today,
            },
          ],
        };
      });
      return id;
    }

    function receivePO(poId: string, receipts: ReceiptLine[]) {
      setData((prev) => {
        const po = prev.purchaseOrders.find((p) => p.id === poId);
        if (!po) return prev;

        const products = prev.products.map((p) => {
          const inStock = receipts.find(
            (r) => r.productId === p.id && r.destination === "stock",
          );
          if (!inStock || inStock.qty <= 0) return p;
          return {
            ...p,
            stock: p.stock + inStock.qty,
            lastRestocked: todayISO(),
          };
        });

        const newHolds = receipts
          .filter((r) => r.destination === "hold" && r.qty > 0)
          .map((r) => ({
            id: genId("qh"),
            productId: r.productId,
            poId,
            qty: r.qty,
            reason: r.reason?.trim() || "Pending quality inspection",
            flaggedAt: todayISO(),
            status: "On Hold" as const,
          }));

        const purchaseOrders = prev.purchaseOrders.map((p) => {
          if (p.id !== poId) return p;
          const items = p.items.map((item) => {
            const totalForItem = receipts
              .filter((r) => r.productId === item.productId)
              .reduce((sum, r) => sum + r.qty, 0);
            return totalForItem > 0
              ? {
                  ...item,
                  qtyReceived: Math.min(
                    item.qtyOrdered,
                    item.qtyReceived + totalForItem,
                  ),
                }
              : item;
          });
          const fullyReceived = items.every(
            (i) => i.qtyReceived >= i.qtyOrdered,
          );
          const anyReceived = items.some((i) => i.qtyReceived > 0);
          const status: POStatus = fullyReceived
            ? "Received"
            : anyReceived
              ? "Partially Received"
              : p.status;
          return {
            ...p,
            items,
            status,
            receivedAt: anyReceived ? todayISO() : p.receivedAt,
          };
        });

        return {
          ...prev,
          products,
          purchaseOrders,
          qualityHolds: [...prev.qualityHolds, ...newHolds],
        };
      });
    }

    function releaseQualityHold(entryId: string) {
      setData((prev) => {
        const entry = prev.qualityHolds.find((e) => e.id === entryId);
        if (!entry || entry.status !== "On Hold") return prev;
        return {
          ...prev,
          products: prev.products.map((p) =>
            p.id === entry.productId
              ? { ...p, stock: p.stock + entry.qty, lastRestocked: todayISO() }
              : p,
          ),
          qualityHolds: prev.qualityHolds.map((e) =>
            e.id === entryId ? { ...e, status: "Released" } : e,
          ),
        };
      });
    }

    function rejectQualityHold(entryId: string) {
      setData((prev) => ({
        ...prev,
        qualityHolds: prev.qualityHolds.map((e) =>
          e.id === entryId && e.status === "On Hold"
            ? { ...e, status: "Rejected" }
            : e,
        ),
      }));
    }

    function createPurchaseOrder(productId: string, qty: number): string {
      const id = genId("po");
      setData((prev) => {
        const product = prev.products.find((p) => p.id === productId);
        if (!product) return prev;
        const supplier = prev.suppliers.find(
          (s) => s.id === product.supplierId,
        );
        const maxNum = prev.purchaseOrders.reduce((max, p) => {
          const n = Number(p.poNumber.split("-")[1]);
          return Number.isFinite(n) ? Math.max(max, n) : max;
        }, 1000);
        const poNumber = `PO-${maxNum + 1}`;
        const orderedAt = todayISO();
        const expectedAt = addDays(orderedAt, supplier?.leadTimeDays ?? 7);
        return {
          ...prev,
          purchaseOrders: [
            ...prev.purchaseOrders,
            {
              id,
              poNumber,
              supplierId: product.supplierId,
              items: [{ productId, qtyOrdered: qty, qtyReceived: 0 }],
              status: "Pending",
              orderedAt,
              expectedAt,
            },
          ],
        };
      });
      return id;
    }

    function resetDemoData() {
      setData(createSeedData());
    }

    return {
      data,
      hydrated,
      updateProductStock,
      updateProductStatus,
      setOrderStatus,
      advanceOrder,
      updateOrderPriority,
      updateOrderNotes,
      updateOrderDueDate,
      setOrderVerified,
      updateOrderTeam,
      updateOrderShippingMethod,
      updateOrderGift,
      createOrder,
      receivePO,
      releaseQualityHold,
      rejectQualityHold,
      createPurchaseOrder,
      resetDemoData,
    };
  }, [data, hydrated]);

  return (
    <DepotContext.Provider value={value}>{children}</DepotContext.Provider>
  );
}

export function useDepot(): DepotContextValue {
  const ctx = useContext(DepotContext);
  if (!ctx) throw new Error("useDepot must be used within a DepotProvider");
  return ctx;
}
