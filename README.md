# DepotField

DepotField is a warehouse operations demo for a fictional online retailer. It's an **ERP-style workflow demo** — it models the kind of inventory, fulfillment, receiving, and reorder-planning screens you'd find in a real warehouse management / ERP system, built as a static, client-only web app. It is not affiliated with, and does not claim to be, any commercial ERP or e-commerce product.

Everything runs in the browser: there's no backend, database, authentication, or external API. All state (inventory, orders, purchase orders, quality holds) lives in `localStorage` and is seeded on first load.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS
- [shadcn/ui](https://ui.shadcn.com) components (built on [Base UI](https://base-ui.com))
- [Lucide](https://lucide.dev) icons (used sparingly, inside a couple of UI primitives)
- JetBrains Mono, the only typeface in the app
- Browser `localStorage` for persistence — no server, no database, no charting library (the two charts on Overview and the bin fill levels on Warehouse are hand-built ASCII bars)

## Pages

- **Overview** — a manifest-style stat line (orders open, low-stock items, inventory value, warehouse capacity), ASCII-bar breakdowns of inventory by category and orders by status, and a "needs attention" panel for delayed shipments and quality holds.
- **Inventory** — searchable, filterable product table. Stock and status are editable inline.
- **Orders** — a board that moves orders through `New → Picking → Packed → Shipped`.
- **Warehouse** — a 4×4 bin grid (`A-01` through `D-04`); click a bin to see what's stored there and how full it is.
- **Receiving** — incoming supplier purchase orders. Receive a shipment into a bin, or flag it for quality hold; approve or reject held stock from the inspection queue.
- **Reorder Planning** — products below their reorder point, with a suggested reorder quantity based on recent demand, and a one-click "Create Purchase Order" action.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Data is seeded automatically on first load — use "reset demo data" in the top bar to restore the original seed at any time.

## About the seed data

Product names, SKUs (stock codes), prices, and order line items are sourced from the [UCI "Online Retail" dataset](https://archive.ics.uci.edu/dataset/352/online+retail) — real transactions from a UK gift & homeware e-commerce retailer, Dec 2010–Dec 2011. Order customers are the dataset's real (anonymized) customer IDs.

Everything a public sales dataset doesn't have — suppliers, warehouse bins, reorder points, purchase orders, and quality holds — is invented for the demo, defined in `src/lib/seed.ts`. Order dates are shifted to be recent rather than the original 2011 timestamps, so the app reads as "today."

- No login, backend, database, or payment integration — this is a front-end demo only.
