"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#131928",
  border: "1px solid #232B40",
  borderRadius: 8,
  fontSize: 12,
  color: "#E8EBF3",
};

const tickStyle = { fontSize: 11, fill: "#8992A8" };

export default function AnalyticsCharts({
  weekly,
  perMember,
}: {
  weekly: { week: string; completed: number }[];
  perMember: { name: string; total: number; done: number }[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-medium uppercase text-ink/40 mb-3">
          Tasks completed per week
        </div>
        <div className="border border-line rounded-lg p-3 bg-surface" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232B40" />
              <XAxis dataKey="week" tick={tickStyle} axisLine={{ stroke: "#232B40" }} />
              <YAxis allowDecimals={false} tick={tickStyle} axisLine={{ stroke: "#232B40" }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(47,111,240,0.08)" }} />
              <Bar dataKey="completed" fill="#2F6FF0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="text-xs font-medium uppercase text-ink/40 mb-3">
          Workload by member
        </div>
        <div className="border border-line rounded-lg p-3 bg-surface" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perMember}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232B40" />
              <XAxis dataKey="name" tick={tickStyle} axisLine={{ stroke: "#232B40" }} />
              <YAxis allowDecimals={false} tick={tickStyle} axisLine={{ stroke: "#232B40" }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(47,111,240,0.08)" }} />
              <Bar dataKey="total" name="Assigned" fill="#8992A8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="done" name="Done" fill="#2F6FF0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}