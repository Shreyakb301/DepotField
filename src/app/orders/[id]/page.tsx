"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Pencil, Printer, Save, Truck, X } from "lucide-react";
import { useDepot } from "@/lib/store";
import { AvatarBadge } from "@/components/avatar-badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { LookupField } from "@/components/lookup-field";
import {
  ORDER_STATUSES,
  ORDER_PRIORITIES,
  FULFILLMENT_TEAMS,
  SHIPPING_METHODS,
  STAFF,
  type OrderStatus,
  type OrderPriority,
  type FulfillmentTeam,
  type ShippingMethod,
  type StaffMember,
} from "@/lib/types";
import { formatCurrency, formatDate, ORDER_STATUS_TONE, TONE_TEXT_CLASS } from "@/lib/format";
import { orderTotal, productById } from "@/lib/selectors";
import { cn } from "@/lib/utils";

const NEXT_ACTION_LABEL: Record<OrderStatus, string> = {
  New: "Start Picking",
  Picking: "Mark Packed",
  Packed: "Ship Order",
  Shipped: "Shipped",
};

const selectClass =
  "h-9 border border-rule bg-background px-2.5 text-sm text-ink outline-none focus-visible:border-primary";

function isOverdue(dueDate: string, status: OrderStatus): boolean {
  if (status === "Shipped") return false;
  return dueDate < new Date().toISOString().slice(0, 10);
}

function staffOptions(query: string) {
  const q = query.trim().toLowerCase();
  return STAFF.filter((s) => !q || s.toLowerCase().includes(q)).map((s) => ({ id: s, label: s }));
}

export default function OrderTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    data,
    advanceOrder,
    setOrderStatus,
    updateOrderPriority,
    updateOrderNotes,
    updateOrderDueDate,
    setOrderVerified,
    updateOrderTeam,
    updateOrderRequestedBy,
    updateOrderAssignedTo,
    updateOrderShippingMethod,
    updateOrderGift,
  } = useDepot();
  const order = data.orders.find((o) => o.id === id);

  const [editing, setEditing] = useState(false);
  const [draftStatus, setDraftStatus] = useState<OrderStatus>(order?.status ?? "New");
  const [draftPriority, setDraftPriority] = useState<OrderPriority>(order?.priority ?? "Medium");
  const [draftNotes, setDraftNotes] = useState(order?.notes ?? "");
  const [draftDueDate, setDraftDueDate] = useState(order?.dueDate ?? "");
  const [draftVerified, setDraftVerified] = useState(order?.verified ?? false);
  const [draftTeam, setDraftTeam] = useState<FulfillmentTeam>(order?.team ?? "Team Alpha");
  const [draftRequestedBy, setDraftRequestedBy] = useState<StaffMember>(order?.requestedBy ?? "Unassigned");
  const [draftRequestedByQuery, setDraftRequestedByQuery] = useState<string>(order?.requestedBy ?? "Unassigned");
  const [draftAssignedTo, setDraftAssignedTo] = useState<StaffMember>(order?.assignedTo ?? "Unassigned");
  const [draftAssignedToQuery, setDraftAssignedToQuery] = useState<string>(order?.assignedTo ?? "Unassigned");
  const [draftShipping, setDraftShipping] = useState<ShippingMethod>(order?.shippingMethod ?? "Standard");
  const [draftGift, setDraftGift] = useState(order?.isGift ?? false);
  const [draftGiftMessage, setDraftGiftMessage] = useState(order?.giftMessage ?? "");

  function startEdit() {
    if (!order) return;
    setDraftStatus(order.status);
    setDraftPriority(order.priority);
    setDraftNotes(order.notes ?? "");
    setDraftDueDate(order.dueDate);
    setDraftVerified(order.verified);
    setDraftTeam(order.team);
    setDraftRequestedBy(order.requestedBy);
    setDraftRequestedByQuery(order.requestedBy);
    setDraftAssignedTo(order.assignedTo);
    setDraftAssignedToQuery(order.assignedTo);
    setDraftShipping(order.shippingMethod);
    setDraftGift(order.isGift);
    setDraftGiftMessage(order.giftMessage ?? "");
    setEditing(true);
  }

  function saveEdit() {
    if (!order) return;
    if (draftStatus !== order.status) setOrderStatus(order.id, draftStatus);
    if (draftPriority !== order.priority) updateOrderPriority(order.id, draftPriority);
    if (draftNotes !== (order.notes ?? "")) updateOrderNotes(order.id, draftNotes);
    if (draftDueDate !== order.dueDate) updateOrderDueDate(order.id, draftDueDate);
    if (draftVerified !== order.verified) setOrderVerified(order.id, draftVerified);
    if (draftTeam !== order.team) updateOrderTeam(order.id, draftTeam);
    if (draftRequestedBy !== order.requestedBy) updateOrderRequestedBy(order.id, draftRequestedBy);
    if (draftAssignedTo !== order.assignedTo) updateOrderAssignedTo(order.id, draftAssignedTo);
    if (draftShipping !== order.shippingMethod) updateOrderShippingMethod(order.id, draftShipping);
    if (draftGift !== order.isGift || draftGiftMessage !== (order.giftMessage ?? "")) {
      updateOrderGift(order.id, draftGift, draftGiftMessage);
    }
    setEditing(false);
  }

  if (!order) {
    return (
      <div>
        <Link href="/orders" className="flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="size-3.5" />
          Back to Orders
        </Link>
        <p className="mt-6 text-sm text-ink-soft">
          This order doesn&apos;t exist &mdash; it may have been reset. Head back to Orders to pick another one.
        </p>
      </div>
    );
  }

  const overdue = isOverdue(order.dueDate, order.status);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/orders" className="mb-4 flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-3.5" />
        Back to Orders
      </Link>

      <div className="flex flex-col gap-1 border-b border-rule pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-ink">
            {order.customer}
            {order.isGift && <Gift className="size-5 text-solid-purple" aria-label="Gift order" />}
          </h1>
          <p className="text-sm text-ink-soft">
            Order #: <span className="font-mono text-ink">{order.orderNumber}</span>
          </p>
        </div>
        <span className={cn("shrink-0 text-lg font-bold", TONE_TEXT_CLASS[ORDER_STATUS_TONE[order.status]])}>
          {order.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!editing ? (
          <>
            <Button size="sm" variant="outline" onClick={startEdit}>
              <Pencil className="size-3.5" />
              Edit
            </Button>
            {order.status !== "Shipped" && (
              <Button size="sm" onClick={() => advanceOrder(order.id)}>
                {NEXT_ACTION_LABEL[order.status]} &gt;
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="size-3.5" />
              Print View
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" onClick={saveEdit}>
              <Save className="size-3.5" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              <X className="size-3.5" />
              Cancel
            </Button>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="mb-2 border-b border-rule pb-1.5 text-base font-semibold text-ink">Details</h2>
          <dl className="mb-4 grid grid-cols-2 gap-y-3 text-sm">
            <dt className="self-center text-ink-faint">Status</dt>
            <dd>
              {editing ? (
                <select
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as OrderStatus)}
                  className={selectClass}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge label={order.status} tone={ORDER_STATUS_TONE[order.status]} />
              )}
            </dd>
            <dt className="self-center text-ink-faint">Priority</dt>
            <dd>
              {editing ? (
                <select
                  value={draftPriority}
                  onChange={(e) => setDraftPriority(e.target.value as OrderPriority)}
                  className={selectClass}
                >
                  {ORDER_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-ink">{order.priority}</span>
              )}
            </dd>
            <dt className="self-center text-ink-faint">Due Date</dt>
            <dd className="flex items-center gap-2">
              {editing ? (
                <input
                  type="date"
                  value={draftDueDate}
                  onChange={(e) => setDraftDueDate(e.target.value)}
                  className={selectClass}
                />
              ) : (
                <>
                  <span className={overdue ? "font-bold text-solid-red" : "text-ink"}>
                    {formatDate(order.dueDate)}
                  </span>
                  {overdue && <StatusBadge label="Overdue" tone="red" />}
                </>
              )}
            </dd>
            <dt className="self-center text-ink-faint">Verified</dt>
            <dd>
              {editing ? (
                <label className="flex items-center gap-1.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={draftVerified}
                    onChange={(e) => setDraftVerified(e.target.checked)}
                    className="size-3.5 accent-primary"
                  />
                  Payment verified
                </label>
              ) : (
                <StatusBadge label={order.verified ? "Verified" : "Unverified"} tone={order.verified ? "green" : "slate"} />
              )}
            </dd>
            <dt className="self-center text-ink-faint">Assigned Team</dt>
            <dd>
              {editing ? (
                <select
                  value={draftTeam}
                  onChange={(e) => setDraftTeam(e.target.value as FulfillmentTeam)}
                  className={selectClass}
                >
                  {FULFILLMENT_TEAMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-ink">{order.team}</span>
              )}
            </dd>
            <dt className="self-center text-ink-faint">Requested By</dt>
            <dd>
              {editing ? (
                <LookupField
                  query={draftRequestedByQuery}
                  onQueryChange={setDraftRequestedByQuery}
                  placeholder="Start typing a name..."
                  options={staffOptions(draftRequestedByQuery)}
                  onSelect={(opt) => {
                    setDraftRequestedBy(opt.id as StaffMember);
                    setDraftRequestedByQuery(opt.label);
                  }}
                  onClear={() => {
                    setDraftRequestedBy("Unassigned");
                    setDraftRequestedByQuery("Unassigned");
                  }}
                  className="max-w-xs"
                />
              ) : (
                <span className="text-ink">{order.requestedBy}</span>
              )}
            </dd>
            <dt className="self-center text-ink-faint">Assigned To</dt>
            <dd>
              {editing ? (
                <LookupField
                  query={draftAssignedToQuery}
                  onQueryChange={setDraftAssignedToQuery}
                  placeholder="Start typing a name..."
                  options={staffOptions(draftAssignedToQuery)}
                  onSelect={(opt) => {
                    setDraftAssignedTo(opt.id as StaffMember);
                    setDraftAssignedToQuery(opt.label);
                  }}
                  onClear={() => {
                    setDraftAssignedTo("Unassigned");
                    setDraftAssignedToQuery("Unassigned");
                  }}
                  className="max-w-xs"
                />
              ) : order.assignedTo === "Unassigned" ? (
                <StatusBadge label="Unassigned" tone="slate" />
              ) : (
                <span className="text-ink">{order.assignedTo}</span>
              )}
            </dd>
            <dt className="self-center text-ink-faint">Shipping Method</dt>
            <dd>
              {editing ? (
                <select
                  value={draftShipping}
                  onChange={(e) => setDraftShipping(e.target.value as ShippingMethod)}
                  className={selectClass}
                >
                  {SHIPPING_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-ink">{order.shippingMethod}</span>
              )}
            </dd>
            <dt className="text-ink-faint">Created</dt>
            <dd className="text-ink">{formatDate(order.createdAt)}</dd>
            <dt className="text-ink-faint">Last Modified</dt>
            <dd className="text-ink">{formatDate(order.updatedAt)}</dd>
          </dl>

          {(order.carrier || editing) && (
            <div className="mb-4 flex items-center gap-2 border border-rule bg-secondary/40 px-3 py-2 text-sm">
              <Truck className="size-4 shrink-0 text-ink-soft" />
              {order.carrier ? (
                <span className="text-ink">
                  {order.carrier} &nbsp; <span className="font-mono">{order.trackingNumber}</span>
                </span>
              ) : (
                <span className="text-ink-faint">Tracking is assigned automatically once shipped.</span>
              )}
            </div>
          )}

          <div className="mb-4">
            <p className="mb-1 text-xs font-bold text-ink">Gift</p>
            {editing ? (
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={draftGift}
                    onChange={(e) => setDraftGift(e.target.checked)}
                    className="size-3.5 accent-primary"
                  />
                  This is a gift order
                </label>
                {draftGift && (
                  <input
                    type="text"
                    value={draftGiftMessage}
                    onChange={(e) => setDraftGiftMessage(e.target.value)}
                    placeholder="Gift message..."
                    className="w-full border border-rule bg-background px-2.5 py-1.5 text-sm text-ink outline-none focus-visible:border-primary"
                  />
                )}
              </div>
            ) : order.isGift ? (
              <p className="text-sm text-ink-soft">
                Gift order{order.giftMessage ? `: "${order.giftMessage}"` : ""}
              </p>
            ) : (
              <p className="text-sm text-ink-soft">Not a gift order.</p>
            )}
          </div>

          <div className="mb-4">
            <p className="mb-1 text-xs font-bold text-ink">Notes</p>
            {editing ? (
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={3}
                placeholder="Add a note for this order..."
                className="w-full border border-rule bg-background px-2.5 py-2 text-sm text-ink outline-none focus-visible:border-primary"
              />
            ) : (
              <p className="text-sm text-ink-soft">{order.notes || "No notes."}</p>
            )}
          </div>

          <p className="mb-2 text-xs font-bold text-ink">Line Items</p>
          <ul className="divide-y divide-rule rounded-md border border-rule">
            {order.items.map((item) => {
              const product = productById(data, item.productId);
              return (
                <li key={item.productId} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <p className="text-ink">{product?.name ?? "Unknown product"}</p>
                    <p className="text-[11px] text-ink-faint">
                      {product?.sku} bin {product?.bin} qty {item.qty}
                    </p>
                  </div>
                  <p className="text-ink-soft">
                    {product ? formatCurrency(product.unitPrice * item.qty) : "—"}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm">
            <span className="font-bold text-ink">Order Total</span>
            <span className="font-bold text-ink">{formatCurrency(orderTotal(data, order))}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="border border-rule bg-card p-3">
            <h2 className="mb-3 text-sm font-bold text-ink">Customer</h2>
            <div className="flex items-center gap-3">
              <AvatarBadge name={order.customer} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{order.customer}</p>
                <p className="text-xs text-ink-faint">
                  {data.orders.filter((o) => o.customer === order.customer).length} order(s) total
                </p>
              </div>
            </div>
          </div>

          <div className="border border-rule bg-card p-3">
            <h2 className="mb-3 text-sm font-bold text-ink">Assigned To</h2>
            {order.assignedTo === "Unassigned" ? (
              <p className="text-sm text-ink-soft">Nobody is working this ticket yet.</p>
            ) : (
              <div className="flex items-center gap-3">
                <AvatarBadge name={order.assignedTo} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{order.assignedTo}</p>
                  <p className="text-xs text-ink-faint">{order.team}</p>
                </div>
              </div>
            )}
            <p className="mt-3 text-xs text-ink-faint">Requested by {order.requestedBy}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
