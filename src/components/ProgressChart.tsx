import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { PracticeSession } from "../types";

interface ProgressChartProps {
  sessions: PracticeSession[];
}

export function ProgressChart({ sessions }: ProgressChartProps) {
  const data = sessions.map((s, i) => {
    const completed = s.attempts.filter((a) => a.completed).length;
    const total = s.attempts.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgVisual = s.attempts
      .filter((a) => a.visualScore != null)
      .map((a) => a.visualScore!);
    const avgScore = avgVisual.length > 0
      ? Math.round(avgVisual.reduce((a, b) => a + b, 0) / avgVisual.length)
      : null;

    return {
      session: `S${i + 1}`,
      completion: rate,
      score: avgScore,
      label: new Date(s.startedAt).toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
    };
  });

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="session" tick={{ fontSize: 12, fill: "#94A3B8" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#94A3B8" }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}
          formatter={(value: number, name: string) => [
            `${value}%`,
            name === "completion" ? "Completion rate" : "Avg visual score",
          ]}
          labelFormatter={(label) => `Session ${label.replace("S", "")}`}
        />
        <Line
          type="monotone"
          dataKey="completion"
          stroke="#F97316"
          strokeWidth={2.5}
          dot={{ fill: "#F97316", r: 4 }}
          activeDot={{ r: 6 }}
        />
        {data.some((d) => d.score != null) && (
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ fill: "#3B82F6", r: 3 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
