"use client";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/types";

/** Small 6-month score trend (§3.3 item 3). */
export default function TrendChart({ data, height = 90 }: { data: TrendPoint[]; height?: number }) {
  if (!data.length) return null;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
          <XAxis
            dataKey="month"
            tick={{ fill: "#6a6e77", fontSize: 9, fontFamily: "Consolas, Menlo, monospace" }}
            axisLine={{ stroke: "#2a2c31" }}
            tickLine={false}
          />
          <YAxis
            domain={["dataMin - 4", "dataMax + 4"]}
            tick={{ fill: "#6a6e77", fontSize: 9, fontFamily: "Consolas, Menlo, monospace" }}
            axisLine={{ stroke: "#2a2c31" }}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#121316",
              border: "1px solid #3a3d44",
              borderRadius: 0,
              fontSize: 11,
            }}
            labelStyle={{ color: "#969aa3" }}
          />
          <Line type="monotone" dataKey="score" stroke="#2f6fc9" strokeWidth={2} dot={{ r: 2.5, fill: "#2f6fc9" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
