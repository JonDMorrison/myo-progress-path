import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero Skeleton */}
      <div className="rounded-2xl border p-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-6" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Week Cards Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
