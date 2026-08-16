"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Tabs } from "@/components/ui/Tabs";

type DataPoint = { label: string; value: number };

type SalesBarChartProps = {
  monthly: DataPoint[];
  quarterly: DataPoint[];
  yearly: DataPoint[];
  labels: { month: string; quarter: string; year: string };
};

export function SalesBarChart({ monthly, quarterly, yearly, labels }: SalesBarChartProps) {
  const [range, setRange] = useState("month");
  const data = range === "month" ? monthly : range === "quarter" ? quarterly : yearly;

  return (
    <div>
      <Tabs
        variant="pill"
        value={range}
        onChange={setRange}
        tabs={[
          { value: "month", label: labels.month },
          { value: "quarter", label: labels.quarter },
          { value: "year", label: labels.year },
        ]}
        className="mb-8"
      />
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--color-surface-container-high)" }}
            contentStyle={{
              backgroundColor: "var(--color-surface-container-lowest)",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: 0,
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" fill="var(--color-primary)" radius={0} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
