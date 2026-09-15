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
  New: "#375A7F",
  Picking: "#C98A12",
  Packed: "#8B6A4F",
  Shipped: "#2F5D3A",
};

export function OrdersByStatusChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="0" stroke="#D9CFB8" vertical={false} />
        <XAxis
          dataKey="status"
          tick={{ fontSize: 11, fill: "#6E6656", fontFamily: "var(--font-plex-mono)" }}
          tickLine={false}
          axisLine={{ stroke: "#B8AA88" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6E6656", fontFamily: "var(--font-plex-mono)" }}
          tickLine={false}
          axisLine={false}
          width={28}
          allowDecimals={false}
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
          formatter={(value) => [`${value} orders`, "Count"]}
        />
        <Bar dataKey="count" radius={[1, 1, 0, 0]} maxBarSize={52}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#6E6656"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
