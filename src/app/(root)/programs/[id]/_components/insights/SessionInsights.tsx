import type { DbProgram } from "@/lib/database/get-program-by-id";
import { ProgramInsightsTabs } from "../../../_components/program-insights-tabs";
type Session = NonNullable<DbProgram>["sessions"][number];

interface SessionInsightsProps {
  session?: Session;
}

export function SessionInsights({ session }: SessionInsightsProps) {
  return (
    <>
      <h2 className="mb-4 text-lg font-bold">Insights</h2>
      <ProgramInsightsTabs />
    </>
  );
}
