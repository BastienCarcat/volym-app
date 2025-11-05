import { useMemo } from "react";
import { SessionItemType, CircuitType } from "@/generated/prisma";
import type { BaseInsightsParams } from "./types";

export interface IntensityTechniquesMetrics {
  totalExercises: number;
  circuitExercises: number;
  circuitsByType: Record<CircuitType, number>;
  percentage: number;
}

export const useIntensityTechniquesInsights = ({
  program,
  activeSessionId,
  activeSessionFormValues,
  currentWeek = 1,
}: BaseInsightsParams): IntensityTechniquesMetrics => {
  return useMemo(() => {
    let totalExercises = 0;
    let circuitExercises = 0;
    const circuitsByType: Record<CircuitType, number> = {
      [CircuitType.Superset]: 0,
      [CircuitType.Biset]: 0,
      [CircuitType.Triset]: 0,
      [CircuitType.GiantSet]: 0,
      [CircuitType.AMRAP]: 0,
    };

    program.sessions
      .filter((session) => (session.weekNumber ?? 1) === currentWeek)
      .forEach((session) => {
        const isActiveSession = activeSessionId === session.id;
        const sessionData =
          isActiveSession && activeSessionFormValues
            ? activeSessionFormValues
            : session;

        sessionData.sessionItems.forEach((sessionItem) => {
          if (sessionItem.type === SessionItemType.Exercise) {
            totalExercises++;
          } else if (
            sessionItem.type === SessionItemType.Circuit &&
            sessionItem.circuit
          ) {
            const itemCount = sessionItem.circuit.circuitItems?.length || 0;
            circuitExercises += itemCount;
            totalExercises += itemCount;

            if (sessionItem.circuit.type) {
              circuitsByType[sessionItem.circuit.type]++;
            }
          }
        });
      });

    const percentage = totalExercises > 0
      ? (circuitExercises / totalExercises) * 100
      : 0;

    return {
      totalExercises,
      circuitExercises,
      circuitsByType,
      percentage,
    };
  }, [
    program,
    activeSessionId,
    activeSessionFormValues,
    currentWeek,
  ]);
};
