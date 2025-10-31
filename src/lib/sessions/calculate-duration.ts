import type { SessionWithItems } from "@/hooks/use-sessions";
import { SessionItemType } from "@/generated/prisma";

/**
 * Calculates the estimated duration of a session
 *
 * Formula:
 * - Each rep takes 10 seconds
 * - Add rest time after each set (in seconds)
 * - Total = sum of all exercise times (including circuits)
 *
 * @param session - Session with items and sets
 * @returns Estimated duration in minutes (rounded)
 */
export function calculateSessionDuration(session: SessionWithItems): number {
  if (!session.sessionItems || session.sessionItems.length === 0) {
    return 0;
  }

  let totalSeconds = 0;

  for (const item of session.sessionItems) {
    if (item.type === SessionItemType.Exercise && item.exercise) {
      // Calculate time for direct exercise
      totalSeconds += calculateExerciseDuration(item.exercise.sets);
    } else if (item.type === SessionItemType.Circuit && item.circuit) {
      // Calculate time for circuit
      for (const circuitItem of item.circuit.circuitItems || []) {
        if (circuitItem.exercise) {
          totalSeconds += calculateExerciseDuration(circuitItem.exercise.sets);
        }
      }

      // Add circuit-specific time (duration and rest)
      if (item.circuit.duration) {
        totalSeconds += item.circuit.duration;
      }
      if (item.circuit.rest) {
        totalSeconds += item.circuit.rest;
      }
    }
  }

  // Convert to minutes and round
  return Math.round(totalSeconds / 60);
}

/**
 * Helper function to calculate duration for a set of sets
 */
function calculateExerciseDuration(
  sets: Array<{ reps?: number | null; rest?: number | null }>
): number {
  let seconds = 0;

  for (const set of sets) {
    // Each rep takes 10 seconds
    const reps = set.reps || 0;
    const repTime = reps * 10;

    // Add rest time (already in seconds)
    const restTime = set.rest || 0;

    seconds += repTime + restTime;
  }

  return seconds;
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
