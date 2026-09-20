"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendChartProps = {
  data: Record<string, unknown>[];
  dataKey: string;
  unit: string;
  color?: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function TrendTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { value: number; payload: { date: string } }[];
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="bg-popover text-popover-foreground border-border rounded-lg border px-3 py-2 text-xs shadow-lg backdrop-blur-xl">
      <p className="text-muted-foreground mb-0.5">
        {formatDate(point.payload.date)}
      </p>
      <p className="font-medium">
        {point.value} {unit}
      </p>
    </div>
  );
}

export function TrendChart({ data, dataKey, unit, color }: TrendChartProps) {
  if (data.length < 2) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        Log a couple more sessions to see a trend.
      </div>
    );
  }

  const strokeColor = color ?? "var(--chart-1)";

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<TrendTooltip unit={unit} />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={strokeColor}
          strokeWidth={2}
          dot={{ r: 3, fill: strokeColor, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
