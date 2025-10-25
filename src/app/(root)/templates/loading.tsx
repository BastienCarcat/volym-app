import { ContentContainer } from "@/components/layout/page/content";
import { Skeleton } from "@/components/ui/skeleton";

export default function TemplatesLoading() {
  return (
    <ContentContainer>
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="mb-2 h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="overflow-hidden rounded-md border">
          <div className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
