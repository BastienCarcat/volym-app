import { ProgramWithFullSessions } from "../../../_hooks/use-programs";
import { MuscleDistribution } from "./muscle-distribution";

interface ProgramInsightsProps {
  program: ProgramWithFullSessions;
}

export function ProgramInsights({ program }: ProgramInsightsProps) {
  return (
    <>
      <h2 className="mb-4 text-lg font-bold">Insights</h2>
      <MuscleDistribution program={program} />
    </>
  );
}
