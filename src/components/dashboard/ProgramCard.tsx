import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock, RotateCcw } from "lucide-react";

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
        return { icon: Clock, text: "Awaiting Approval", variant: "warning" as const };
      case "needs_more":
        return { icon: RotateCcw, text: "Continue Practice", variant: "destructive" as const };
      default:
        return { icon: ArrowRight, text: "Continue Week", variant: "default" as const };
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "approved":
        return {
          className: "bg-success/10 text-success border-success/20",
          label: "Approved"
        };
      case "submitted":
        return {
          className: "bg-warning/10 text-warning border-warning/20",
          label: "Awaiting Therapist Approval"
        };
      case "needs_more":
        return {
          className: "bg-destructive/10 text-destructive border-destructive/20",
          label: "More Practice Needed"
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;
  const badgeConfig = getStatusBadge();

  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-1">Welcome back, {firstName} 👋</CardTitle>
            <p className="text-muted-foreground">
              You're on Week {weekNumber} {weekTitle && `— ${weekTitle}`}
            </p>
          </div>
          {badgeConfig && (
            <Badge
              variant="outline"
              className={badgeConfig.className}
            >
              {badgeConfig.label}
            </Badge>
          )}
        </div>
        
        {/* Show helpful message based on status */}
        {status === "submitted" && (
          <p className="text-sm text-warning bg-warning/10 p-3 rounded-lg">
            🕐 Your Week {weekNumber} submission is being reviewed by your therapist. 
            You'll be notified when it's approved.
          </p>
        )}
        {status === "needs_more" && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            ⚠️ Your therapist has requested additional practice for Week {weekNumber}. 
            Check their feedback and continue practicing.
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Program Progress</span>
            <span className="font-medium">
              {completedWeeks} / {totalWeeks} weeks approved
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-end">
        <div className="w-full">
          <Button 
            onClick={onContinue} 
            className={`w-full h-12 rounded-xl ${
              status === "needs_more" 
                ? "bg-destructive hover:bg-destructive/90" 
                : status === "submitted"
                ? "bg-warning hover:bg-warning/90 text-warning-foreground"
                : ""
            }`} 
            size="lg"
          >
            <StatusIcon className="mr-2 h-5 w-5" />
            {statusDisplay.text} {weekNumber}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
