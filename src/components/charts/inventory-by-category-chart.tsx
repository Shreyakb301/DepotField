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

const COLORS = ["#059669", "#0EA5E9", "#F59E0B", "#8B5CF6", "#E11D48"];

export function InventoryByCategoryChart({
  data,
}: {
  data: { category: string; stock: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E4" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: "#64748B" }}
          tickLine={false}
          axisLine={{ stroke: "#E2E8E4" }}
          interval={0}
          angle={-12}
          textAnchor="end"
          height={44}
        />
        <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          cursor={{ fill: "#F1F5F4" }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #E2E8E4",
            boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
          }}
          formatter={(value) => [`${value} units`, "Stock on hand"]}
        />
        <Bar dataKey="stock" radius={[4, 4, 0, 0]} maxBarSize={44}>
          {data.map((entry, i) => (
            <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
