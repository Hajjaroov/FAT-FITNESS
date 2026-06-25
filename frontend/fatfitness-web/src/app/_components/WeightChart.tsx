"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type WeightChartProps = {
  entries: ReadonlyArray<readonly [string, string, string, string]>;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatTick(date: string) {
  const [year, month] = date.split("-");
  return `${MONTHS[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}

export function WeightChart({ entries }: WeightChartProps) {
  const data = entries.map(([, date, weightStr]) => ({
    date,
    weight: parseFloat(weightStr),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 24, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatTick}
          interval={4}
          padding={{ right: 60 }}
          tick={{ fontSize: 11, fill: "var(--color-subtle)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--color-border)" }}
        />
        <YAxis
          domain={[120, 205]}
          tickFormatter={(v) => `${v}`}
          tick={{ fontSize: 11, fill: "var(--color-subtle)" }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "var(--color-text)",
            boxShadow: "var(--shadow-card)",
          }}
          formatter={(value) => [`${value} kg`, "Weight"]}
          labelFormatter={(date) => formatTick(date as string)}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={{ r: 2.5, fill: "var(--color-accent)", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "var(--color-accent)", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
