"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

// Each category gets a color that means something, not a rainbow cycle.
const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "#375A7F", // steel / wire blue
  Apparel: "#6E4A3F", // leather brown
  "Home & Garden": "#2F5D3A", // garden green
  Outdoor: "#C2410C", // hazard orange
  Office: "#C98A12", // brass gold
};

export function InventoryByCategoryChart({
  data,
}: {
  data: { category: string; stock: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="0" stroke="#D9CFB8" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: "#6E6656", fontFamily: "var(--font-plex-mono)" }}
          tickLine={false}
          axisLine={{ stroke: "#B8AA88" }}
          interval={0}
          angle={-12}
          textAnchor="end"
          height={44}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6E6656", fontFamily: "var(--font-plex-mono)" }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          cursor={{ fill: "#E8E0CC" }}
          contentStyle={{
            fontSize: 12,
            fontFamily: "var(--font-plex-sans)",
            borderRadius: 2,
            border: "1px solid #D9CFB8",
            background: "#FAF6EC",
            boxShadow: "none",
          }}
          formatter={(value) => [`${value} units`, "Stock on hand"]}
        />
        <Bar dataKey="stock" radius={[1, 1, 0, 0]} maxBarSize={40}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? "#6E6656"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
