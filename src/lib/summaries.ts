import type { ChildProfile, PracticeSession, SpeechTarget } from "../types";

export function generateClinicianSummary(
  child: ChildProfile,
  target: SpeechTarget,
  sessions: PracticeSession[]
): string {
  const targetSessions = sessions.filter((s) => s.targetId === target.id);
  if (targetSessions.length === 0) return "No practice sessions recorded yet.";

  const totalAttempts = targetSessions.reduce((sum, s) => sum + s.attempts.length, 0);
  const completedAttempts = targetSessions.reduce(
    (sum, s) => sum + s.attempts.filter((a) => a.completed).length,
    0
  );
  const completionRate = totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0;

  const avgHolds = targetSessions
    .flatMap((s) => s.attempts)
    .filter((a) => a.holdDurationMs != null)
    .map((a) => a.holdDurationMs!);
  const avgHoldMs = avgHolds.length > 0 ? Math.round(avgHolds.reduce((a, b) => a + b, 0) / avgHolds.length) : null;

  const parentNotes = targetSessions
    .filter((s) => s.parentNote)
    .map((s) => s.parentNote!)
    .join(" | ");

  const ratings = targetSessions.filter((s) => s.parentDifficultyRating).map((s) => s.parentDifficultyRating!);
  const ratingStr = ratings.length > 0 ? ratings[ratings.length - 1] : "not rated";

  const firstDate = new Date(targetSessions[0].startedAt).toLocaleDateString();
  const lastDate = new Date(targetSessions[targetSessions.length - 1].startedAt).toLocaleDateString();
  const dateRange = firstDate === lastDate ? firstDate : `${firstDate} – ${lastDate}`;

  const feedbackLabel: Record<string, string> = {
    audio_only: "Audio only (low-visibility target)",
    audio_plus_visual: "Audio + visual movement support",
    visual_movement_only: "Visual movement only",
  };

  const therapyStageLabel: Record<string, string> = {
    establishment: "Establishment",
    word_level: "Word level",
  };

  let observation = "";
  if (completionRate >= 80) {
    observation = `${child.nickname} completed most attempts and demonstrated consistent effort throughout the sessions.`;
  } else if (completionRate >= 50) {
    observation = `${child.nickname} completed a moderate proportion of attempts. Consistency varied across sessions.`;
  } else {
    observation = `${child.nickname} had some difficulty completing attempts. Further support or target adjustment may be worth discussing.`;
  }

  const holdNote =
    avgHoldMs != null
      ? `Average hold duration: ${(avgHoldMs / 1000).toFixed(1)} seconds.`
      : "";

  const suggestProgress =
    completionRate >= 80 && targetSessions.length >= 3
      ? `Suggested discussion: Consider whether ${child.nickname} is ready to practise ${target.ipa} in short words or phrases.`
      : `Suggested discussion: Continue practising ${target.ipa} at the ${therapyStageLabel[target.therapyStage] ?? target.therapyStage} stage.`;

  return [
    `SpeechSprout Practice Summary`,
    `──────────────────────────────`,
    `Child: ${child.nickname} (age ${child.ageRange})`,
    `Target: ${target.label} ${target.ipa}`,
    `Classification: ${target.place} ${target.manner}, ${target.voicing}`,
    `Feedback mode: ${feedbackLabel[target.feedbackMode] ?? target.feedbackMode}`,
    `Therapy stage: ${therapyStageLabel[target.therapyStage] ?? target.therapyStage}`,
    ``,
    `Practice period: ${dateRange}`,
    `Sessions completed: ${targetSessions.length}`,
    `Total attempts: ${totalAttempts}`,
    `Completion rate: ${completionRate}%`,
    holdNote,
    ``,
    `Observation: ${observation}`,
    parentNotes ? `Parent notes: ${parentNotes}` : "",
    `Most recent session difficulty: ${ratingStr}`,
    ``,
    suggestProgress,
    ``,
    `──────────────────────────────`,
    `This summary describes home-practice behaviour only. It is not a clinical assessment and should not be used for diagnosis or treatment planning.`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function generateParentSummary(
  child: ChildProfile,
  sessions: PracticeSession[]
): string {
  if (sessions.length === 0) return `No sessions yet for ${child.nickname}.`;

  const totalAttempts = sessions.reduce((sum, s) => sum + s.attempts.length, 0);
  const completed = sessions.reduce((sum, s) => sum + s.attempts.filter((a) => a.completed).length, 0);
  const rate = totalAttempts > 0 ? Math.round((completed / totalAttempts) * 100) : 0;
  const lastSession = sessions[sessions.length - 1];

  return `This week, ${child.nickname} completed ${sessions.length} practice session${sessions.length !== 1 ? "s" : ""} and made ${totalAttempts} attempt${totalAttempts !== 1 ? "s" : ""}. ${child.nickname} completed ${rate}% of attempts. Most recent practice was for the ${lastSession.targetLabel} target.`;
}
