import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DbProgram } from "@/lib/database/get-program-by-id";
import { ProgramInsightsTabs } from "../../_components/program-insights-tabs";

type Session = NonNullable<DbProgram>["sessions"][number];

interface SessionInsightsProps {
  session?: Session;
}

export function SessionInsights({ session }: SessionInsightsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ProgramInsightsTabs />
      </CardContent>
    </Card>
  );
}
