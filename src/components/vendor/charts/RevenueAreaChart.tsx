"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Tabs } from "@/components/ui/Tabs";

type DataPoint = { label: string; revenue: number; orders: number };

export function RevenueAreaChart({ data, labels }: { data: DataPoint[]; labels: { revenue: string; orders: string } }) {
  const [metric, setMetric] = useState("revenue");

  return (
    <div>
      <Tabs
        variant="pill"
        value={metric}
        onChange={setMetric}
        tabs={[
          { value: "revenue", label: labels.revenue },
          { value: "orders", label: labels.orders },
        ]}
        className="mb-8"
      />
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }} width={40} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-container-lowest)",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: 0,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey={metric}
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
