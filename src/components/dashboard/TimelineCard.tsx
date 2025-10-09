import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DotTimeline } from "@/components/ui/DotTimeline";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TimelineCardProps {
  completedWeeks: number;
  currentWeek: number;
  totalWeeks?: number;
}

export function TimelineCard({ completedWeeks, currentWeek, totalWeeks = 24 }: TimelineCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col bg-white/90 dark:bg-card/90 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Progress Timeline</CardTitle>
            <CardDescription className="mt-1">Your 24-week journey</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/patient")}
            className="text-sm"
          >
            View all
          </Button>
        </div>
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
