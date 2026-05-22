import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ExerciseSession } from "../types/exercise";

interface Props {
  sessions: ExerciseSession[];
}

interface DataPoint {
  session: number;
  score: number;
  label: string;
}

export function ProgressChart({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Complete your first exercise to see progress.
      </div>
    );
  }

  const data: DataPoint[] = sessions.map((s, i) => ({
    session: i + 1,
    score: s.averageScore,
    label: s.exerciseName,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis
          dataKey="session"
          tick={{ fill: "#94A3B8", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          label={{ value: "Session", position: "insideBottom", offset: -3, fill: "#94A3B8", fontSize: 11 }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#94A3B8", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#FFF",
            border: "1px solid #E2E8F0",
            borderRadius: "0.75rem",
            fontSize: 13,
          }}
          formatter={(value) => [`${value}`, "Avg Score"]}
          labelFormatter={(label) => `Session ${label}`}
        />
        <ReferenceLine y={60} stroke="#6366F1" strokeDasharray="4 4" strokeOpacity={0.4} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#6366F1"
          strokeWidth={2.5}
          dot={{ fill: "#6366F1", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#4F46E5" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
