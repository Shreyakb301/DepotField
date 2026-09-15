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

const STATUS_COLORS: Record<string, string> = {
  New: "#0EA5E9",
  Picking: "#F59E0B",
  Packed: "#8B5CF6",
  Shipped: "#059669",
};

export function OrdersByStatusChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E4" vertical={false} />
        <XAxis
          dataKey="status"
          tick={{ fontSize: 11, fill: "#64748B" }}
          tickLine={false}
          axisLine={{ stroke: "#E2E8E4" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748B" }}
          tickLine={false}
          axisLine={false}
          width={30}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "#F1F5F4" }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #E2E8E4",
            boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
          }}
          formatter={(value) => [`${value} orders`, "Count"]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#059669"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
