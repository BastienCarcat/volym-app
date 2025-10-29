import type { SessionWithExercises } from "@/hooks/use-sessions";

/**
 * Calculates the estimated duration of a session
 *
 * Formula:
 * - Each rep takes 10 seconds
 * - Add rest time after each set (in seconds)
 * - Total = sum of all exercise times
 *
 * @param session - Session with exercises and sets
 * @returns Estimated duration in minutes (rounded)
 */
export function calculateSessionDuration(
  session: SessionWithExercises
): number {
  if (!session.exercises || session.exercises.length === 0) {
    return 0;
  }

  let totalSeconds = 0;

  for (const exercise of session.exercises) {
    if (!exercise.sets || exercise.sets.length === 0) {
      continue;
    }

    for (const set of exercise.sets) {
      // Each rep takes 10 seconds
      const reps = set.reps || 0;
      const repTime = reps * 10;

      // Add rest time (already in seconds)
      const restTime = set.rest || 0;

      totalSeconds += repTime + restTime;
    }
  }

  // Convert to minutes and round
  return Math.round(totalSeconds / 60);
}

/**
 * Formats the duration for display
 *
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "~45 min" or "~1h 30min")
 */
export function formatSessionDuration(minutes: number): string {
  if (minutes === 0) {
    return "~0 min";
  }

  if (minutes < 60) {
    return `~${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `~${hours}h`;
  }

  return `~${hours}h ${remainingMinutes}min`;
}
