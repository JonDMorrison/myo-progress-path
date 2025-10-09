import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DotTimeline } from "@/components/ui/DotTimeline";

interface TimelineCardProps {
  completedWeeks: number;
  currentWeek: number;
  totalWeeks?: number;
}

export function TimelineCard({ completedWeeks, currentWeek, totalWeeks = 24 }: TimelineCardProps) {
  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Progress Timeline</CardTitle>
        <CardDescription>Your 24-week journey</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <DotTimeline completed={completedWeeks} current={currentWeek} total={totalWeeks} />
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary ring-2 ring-primary/30" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-muted border-2 border-border" />
            <span>Upcoming</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
