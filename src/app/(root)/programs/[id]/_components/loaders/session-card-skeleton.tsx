import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, BookmarkPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

function SessionExerciseItemSkeleton() {
  return (
    <Card className="gap-3 overflow-hidden py-3 shadow-none">
      <CardHeader className="px-3">
        <div className="flex h-full gap-4">
          {/* Exercise Image Skeleton */}
          <Skeleton className="aspect-square h-16 w-16 rounded-lg" />

          {/* Exercise Info Skeleton */}
          <div className="flex flex-1 items-center justify-between py-2">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export function SessionCardSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Card className="h-full min-h-0">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex-1">
              <Skeleton className="h-8 w-48" />
            </CardTitle>

            <BookmarkPlus className="h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              <SessionExerciseItemSkeleton />
              <SessionExerciseItemSkeleton />
              <SessionExerciseItemSkeleton />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-shrink-0 justify-end">
          <Button disabled className="shadow-lg">
            <Save className="mr-2 h-4 w-4" />
            Save session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
