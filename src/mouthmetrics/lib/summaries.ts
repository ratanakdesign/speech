import type { ExerciseRep, ExerciseSession, ExerciseType } from "../types/exercise";
import { mean } from "./geometry";

export function generateSessionSummary(reps: ExerciseRep[], exerciseType: ExerciseType): string {
  if (reps.length === 0) return "No reps completed.";

  const scores = reps.map((r) => r.score);
  const avg = Math.round(mean(scores));
  const best = Math.max(...scores);
  const first = scores[0];
  const last = scores[scores.length - 1];
  const improvement = last - first;

  const avgStability = Math.round(mean(reps.map((r) => r.stabilityScore)));
  const avgSymmetry = Math.round(mean(reps.map((r) => r.symmetryScore)));

  const exerciseLabels: Record<ExerciseType, string> = {
    lip_rounding: "lip rounding",
    wide_smile: "wide smile",
    mouth_opening: "mouth opening",
    lip_closure: "lip closure",
  };

  const label = exerciseLabels[exerciseType];

  let summary = `You completed ${reps.length} rep${reps.length !== 1 ? "s" : ""} of ${label}. `;
  summary += `Best score: ${best}. Average: ${avg}. `;

  if (improvement > 8) {
    summary += `You showed clear improvement across the reps (+${improvement} from first to last). `;
  } else if (improvement > 0) {
    summary += `Scores were consistent across reps. `;
  } else if (improvement < -5) {
    summary += `Hold duration became more challenging toward the end — keep practising. `;
  }

  if (avgStability >= 75) {
    summary += `Hold stability was strong (${avgStability}).`;
  } else if (avgStability >= 55) {
    summary += `Hold stability was moderate (${avgStability}) — focus on keeping the shape still.`;
  } else {
    summary += `Hold stability needs more practice (${avgStability}) — try holding the shape still.`;
  }

  if (avgSymmetry < 65) {
    summary += ` Both sides of the mouth may be moving unevenly — watch in the mirror.`;
  }

  return summary;
}

export function generateTherapistSummary(sessions: ExerciseSession[]): string {
  if (sessions.length === 0) return "No practice sessions recorded yet.";

  const sessionsByType: Partial<Record<ExerciseType, ExerciseSession[]>> = {};
  for (const s of sessions) {
    if (!sessionsByType[s.exerciseType]) sessionsByType[s.exerciseType] = [];
    sessionsByType[s.exerciseType]!.push(s);
  }

  const totalReps = sessions.reduce((sum, s) => sum + s.reps.length, 0);
  const allScores = sessions.map((s) => s.averageScore);
  const overallAvg = Math.round(mean(allScores));
  const bestOverall = Math.max(...sessions.map((s) => s.bestScore));

  const dateRange = (() => {
    const dates = sessions.map((s) => new Date(s.createdAt));
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
    if (earliest.toDateString() === latest.toDateString()) {
      return earliest.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
    }
    return `${earliest.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} – ${latest.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`;
  })();

  let report = `MouthMetrics Practice Summary\n`;
  report += `Generated: ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}\n`;
  report += `Period: ${dateRange}\n\n`;
  report += `Total sessions: ${sessions.length}\n`;
  report += `Total reps completed: ${totalReps}\n`;
  report += `Overall best score: ${bestOverall}\n`;
  report += `Overall average score: ${overallAvg}\n\n`;

  for (const [type, typeSessions] of Object.entries(sessionsByType) as [ExerciseType, ExerciseSession[]][]) {
    const scores = typeSessions.flatMap((s) => s.reps.map((r) => r.score));
    if (scores.length === 0) continue;

    const sessionScores = typeSessions.map((s) => s.averageScore);
    const firstAvg = sessionScores[0];
    const lastAvg = sessionScores[sessionScores.length - 1];
    const trend = lastAvg - firstAvg;

    report += `--- ${typeSessions[0].exerciseName} ---\n`;
    report += `Sessions: ${typeSessions.length} | Reps: ${typeSessions.reduce((s, ss) => s + ss.reps.length, 0)}\n`;
    report += `Best score: ${Math.max(...typeSessions.map((s) => s.bestScore))}\n`;
    report += `Average score: ${Math.round(mean(sessionScores))}\n`;

    if (typeSessions.length > 1) {
      if (trend > 5) {
        report += `Trend: Improving (+${Math.round(trend)} points over sessions)\n`;
      } else if (trend < -5) {
        report += `Trend: Variable — continued practice recommended\n`;
      } else {
        report += `Trend: Consistent across sessions\n`;
      }
    }
    report += "\n";
  }

  report += `---\nNote: This summary describes visible movement practice behaviour only. It is not a clinical assessment and does not replace a speech pathology evaluation.\n`;
  report += `MouthMetrics tracks observable mouth and lip movement during therapist-prescribed practice exercises.`;

  return report;
}
