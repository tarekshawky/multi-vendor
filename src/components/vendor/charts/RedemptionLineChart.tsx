"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DataPoint = { label: string; value: number };

export function RedemptionLineChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }} width={32} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-surface-container-lowest)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: 0,
            fontSize: 12,
          }}
        />
        <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
