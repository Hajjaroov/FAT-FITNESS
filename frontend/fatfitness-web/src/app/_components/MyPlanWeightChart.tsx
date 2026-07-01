"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightEntry } from "@/types/myplan";

type MyPlanWeightChartProps = {
  startWeight: number;
  goalWeight: number;
  entries: WeightEntry[];
  tooltipLabel: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDateTick(date: string) {
  const [year, month, day] = date.split("-");
  return `${parseInt(day, 10)} ${MONTHS[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}

export function MyPlanWeightChart({
  startWeight,
  goalWeight,
  entries,
  tooltipLabel,
}: MyPlanWeightChartProps) {
  const yMin = Math.min(startWeight, goalWeight);
  const yMax = Math.max(startWeight, goalWeight);
  const yDomain: [number, number] = [yMin, yMax];

  const data = entries.map((e) => ({ date: e.entryDate, weight: e.weightKg }));
  const hasLine = entries.length >= 2;

  const cartesianGrid = (
    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
  );
  const yAxis = (
    <YAxis
      domain={yDomain}
      tickFormatter={(v) => `${v}`}
      tick={{ fontSize: 11, fill: "var(--color-subtle)" }}
      tickLine={false}
      axisLine={false}
      width={40}
    />
  );
  const tooltip = (
    <Tooltip
      contentStyle={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        fontSize: "12px",
        color: "var(--color-text)",
        boxShadow: "var(--shadow-card)",
      }}
      formatter={(value) => [`${value} kg`, tooltipLabel]}
      labelFormatter={(date) => formatDateTick(date as string)}
    />
  );
  const goalLine = (
    <ReferenceLine
      y={goalWeight}
      stroke="var(--color-accent)"
      strokeDasharray="5 4"
      strokeWidth={1.5}
      strokeOpacity={0.7}
    />
  );
  const dataLine = (
    <Line
      type="monotone"
      dataKey="weight"
      stroke="var(--color-accent)"
      strokeWidth={hasLine ? 2 : 0}
      dot={{ r: 3, fill: "var(--color-accent)", strokeWidth: 0 }}
      activeDot={{ r: 5, fill: "var(--color-accent)", strokeWidth: 0 }}
      connectNulls={false}
    />
  );

  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
            {cartesianGrid}
            <XAxis
              dataKey="date"
              tickFormatter={formatDateTick}
              padding={{ right: 20 }}
              tick={{ fontSize: 10, fill: "var(--color-subtle)", textAnchor: "end" }}
              angle={-35}
              height={44}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            {yAxis}
            {tooltip}
            {goalLine}
            {dataLine}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 24, bottom: 4, left: 4 }}>
            {cartesianGrid}
            <XAxis
              dataKey="date"
              tickFormatter={formatDateTick}
              padding={{ right: 60 }}
              tick={{ fontSize: 11, fill: "var(--color-subtle)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            {yAxis}
            {tooltip}
            {goalLine}
            {dataLine}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
