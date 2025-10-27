import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { DayOfWeek } from "@/generated/prisma";
import { SessionCardSkeleton } from "./session-card-skeleton";
import { ContentContainer } from "@/components/layout/page/content";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function ProgramHeaderSkeleton() {
  return (
    <header>
      <Skeleton className="h-9 w-64" />
    </header>
  );
}

function WeekTabsSkeleton() {
  return (
    <Tabs defaultValue="Monday" className="min-h-0 flex-1">
      <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-7 gap-1 p-1">
        {DAYS_OF_WEEK.map((day) => (
          <TabsTrigger
            key={day}
            value={day}
            disabled
            className="data-[state=active]:bg-background data-[state=active]:ring-primary/20 relative h-auto cursor-pointer rounded-lg px-2 py-3 transition-all hover:bg-gray-100 data-[state=active]:shadow-sm data-[state=active]:ring-2"
          >
            <div className="flex min-h-[3rem] flex-col items-center gap-1.5">
              <span className="text-muted-foreground data-[state=active]:text-primary text-xs font-medium tracking-wider uppercase">
                {day}
              </span>
              <Skeleton className="h-4 w-16" />
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      {DAYS_OF_WEEK.map((day) => (
        <TabsContent key={day} value={day} className="mt-6 min-h-0">
          <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>

            <div className="min-h-0 lg:col-span-2">
              <SessionCardSkeleton />
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function ProgramPageSkeleton() {
  return (
    <ContentContainer>
      <ProgramHeaderSkeleton />
      <WeekTabsSkeleton />
    </ContentContainer>
  );
}
