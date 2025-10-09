import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";

interface ProgramCardProps {
  firstName?: string;
  weekNumber: number;
  weekTitle?: string;
  status?: string;
  completedWeeks: number;
  totalWeeks: number;
  onContinue: () => void;
}

export function ProgramCard({
  firstName = "there",
  weekNumber,
  weekTitle,
  status = "open",
  completedWeeks,
  totalWeeks,
  onContinue,
}: ProgramCardProps) {
  const progressPercent = (completedWeeks / totalWeeks) * 100;

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
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-1">Welcome back, {firstName} 👋</CardTitle>
            <p className="text-muted-foreground">
              You're on Week {weekNumber} {weekTitle && `— ${weekTitle}`}
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
              {completedWeeks} / {totalWeeks} weeks
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={onContinue} className="w-full h-12 rounded-xl" size="lg">
          <StatusIcon className="mr-2 h-5 w-5" />
          {statusDisplay.text} {weekNumber}
        </Button>
      </CardContent>
    </Card>
  );
}
