import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MatchCardSkeleton() {
  return (
    <Card className="glass border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-3 flex-1 pr-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-5 w-6 bg-white/10" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-5 w-6 bg-white/10" />
            </div>
          </div>
          <div className="w-px h-12 bg-border mx-4" />
          <div className="flex flex-col items-center gap-2 min-w-[60px]">
            <Skeleton className="h-3 w-8 bg-white/10" />
            <Skeleton className="h-3 w-12 bg-white/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeaturedMatchSkeleton() {
  return (
    <Card className="glass-elevated border-primary/30 overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-6 md:p-8 flex items-center justify-between md:justify-center gap-4">
            <div className="flex-1 md:text-right flex flex-col items-start md:items-end gap-2">
              <Skeleton className="h-6 w-32 bg-white/10" />
              <Skeleton className="h-4 w-24 bg-white/10" />
            </div>
            <Skeleton className="w-16 h-16 rounded-full bg-white/10 shrink-0" />
          </div>
          
          <div className="p-6 md:p-8 flex flex-col items-center justify-center bg-black/20">
            <Skeleton className="h-4 w-16 mb-4 bg-white/10 rounded-full" />
            <Skeleton className="h-16 w-32 bg-white/10" />
            <Skeleton className="h-4 w-12 mt-4 bg-white/10" />
          </div>

          <div className="p-6 md:p-8 flex items-center justify-between md:justify-center gap-4 md:flex-row-reverse">
            <div className="flex-1 md:text-left flex flex-col items-start gap-2">
              <Skeleton className="h-6 w-32 bg-white/10" />
              <Skeleton className="h-4 w-24 bg-white/10" />
            </div>
            <Skeleton className="w-16 h-16 rounded-full bg-white/10 shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
