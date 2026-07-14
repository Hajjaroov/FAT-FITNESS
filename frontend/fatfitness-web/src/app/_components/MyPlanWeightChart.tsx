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

// entryDate is a plain "yyyy-MM-dd" string with no time zone of its own; parse
// it as a UTC calendar date (Date.UTC, not `new Date(string)`) and format it
// back out with the matching UTC getters, so the displayed day never shifts
// depending on the viewer's local time zone.
function toUtcTimestamp(entryDate: string) {
  const [year, month, day] = entryDate.split("-").map((part) => parseInt(part, 10));
  return Date.UTC(year, month - 1, day);
}

function formatDateTickFromTimestamp(timestamp: number) {
  const d = new Date(timestamp);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}`;
}

export function MyPlanWeightChart({
  startWeight,
  goalWeight,
  entries,
  tooltipLabel,
}: MyPlanWeightChartProps) {
  const entryWeights = entries.map((e) => e.weightKg);
  const yMin = Math.min(startWeight, goalWeight, ...entryWeights);
  const yMax = Math.max(startWeight, goalWeight, ...entryWeights);
  const yDomain: [number, number] = [yMin, yMax];

  const data = entries.map((e) => ({ dateValue: toUtcTimestamp(e.entryDate), weight: e.weightKg }));
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
      labelFormatter={(value) => formatDateTickFromTimestamp(value as number)}
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
              dataKey="dateValue"
              type="number"
              domain={["auto", "auto"]}
              scale="time"
              tickFormatter={formatDateTickFromTimestamp}
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
              dataKey="dateValue"
              type="number"
              domain={["auto", "auto"]}
              scale="time"
              tickFormatter={formatDateTickFromTimestamp}
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
