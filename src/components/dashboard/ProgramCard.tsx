import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProgramCardProps {
  firstName?: string;
  weekNumber: number;
  weekTitle?: string;
  status?: string;
  completedWeeks: number;
  totalWeeks: number;
  hasWeekVideo?: boolean;
  videoUrl?: string;
  onContinue: () => void;
}

export function ProgramCard({
  firstName = "there",
  weekNumber,
  weekTitle,
  status = "open",
  completedWeeks,
  totalWeeks,
  hasWeekVideo = false,
  videoUrl,
  onContinue,
}: ProgramCardProps) {
  const progressPercent = Math.round((completedWeeks / totalWeeks) * 100);
  const navigate = useNavigate();

  const getStatusDisplay = () => {
    switch (status) {
      case "approved":
        return { icon: CheckCircle2, text: "Review Week", variant: "success" as const };
      case "submitted":
        return { icon: Clock, text: "Awaiting Review", variant: "warning" as const };
      default:
        return { icon: ArrowRight, text: "Continue Week", variant: "default" as const };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col bg-white/90 dark:bg-card/90 backdrop-blur">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-1">Welcome back, {firstName} 👋</CardTitle>
            <p className="text-muted-foreground">
              You're on <span className="font-medium">Week {weekNumber}</span>
              {weekTitle && <span> — {weekTitle}</span>}
            </p>
          </div>
          {status && status !== "open" && (
            <Badge
              variant="outline"
              className={
                status === "approved"
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-warning/10 text-warning border-warning/20"
              }
            >
              {status === "approved" ? "Completed" : "Pending Review"}
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Program Progress</span>
            <span className="font-medium">
              {completedWeeks} / {totalWeeks} weeks • {progressPercent}%
            </span>
          </div>
          <ProgressBar value={progressPercent} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {hasWeekVideo && videoUrl && (
          <div className="aspect-video rounded-xl border overflow-hidden bg-muted relative group cursor-pointer"
               onClick={onContinue}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-lg group-hover:scale-105 transition-transform">
                <Play className="h-4 w-4" />
                <span className="text-sm font-medium">Play preview</span>
              </div>
            </div>
          </div>
        )}
        <div className="mt-auto">
          <Button onClick={onContinue} className="w-full h-12 rounded-xl" size="lg">
            <StatusIcon className="mr-2 h-5 w-5" />
            {statusDisplay.text} {weekNumber}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
