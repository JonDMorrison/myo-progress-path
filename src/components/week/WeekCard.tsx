import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, AlertCircle, ChevronRight, Clock, RotateCcw } from "lucide-react";
import { WeekProgress } from "@/lib/userProgress";
import { getModuleInfo } from "@/lib/moduleUtils";

interface WeekCardProps {
  week: WeekProgress;
  weekTitle?: string;
  programVariant?: string;
  onNavigate: (weekNumber: number) => void;
}

export function WeekCard({ week, weekTitle, programVariant = 'frenectomy', onNavigate }: WeekCardProps) {
  const moduleInfo = getModuleInfo(week.weekNumber, programVariant);
  
  const getStatusBadge = () => {
    if (week.isComplete) {
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    if (week.status === "submitted") {
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20">
          <Clock className="w-3 h-3 mr-1" />
          Awaiting Approval
        </Badge>
      );
    }
    if (week.status === "needs_more") {
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          <RotateCcw className="w-3 h-3 mr-1" />
          More Practice Needed
        </Badge>
      );
    }
    if (week.isLocked) {
      return (
        <Badge variant="secondary" className="opacity-60">
          <Lock className="w-3 h-3 mr-1" />
          Locked
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-primary/5 border-primary/20">
        In Progress
      </Badge>
    );
  };

  const isUnderReview = week.status === "submitted";
  const needsMorePractice = week.status === "needs_more";

  // Determine the lock reason message
  const getLockMessage = () => {
    if (week.awaitingApproval) {
      return "Awaiting therapist approval for previous module";
    }
    return "Complete and get approval for previous module to unlock";
  };
  
  // Get display label - use module label for all, with week position for biweekly
  const getDisplayTitle = () => {
    return moduleInfo.moduleLabel;
  };
  
  const getSubtitle = () => {
    if (moduleInfo.isWeekly) {
      // Post-op days/weeks - show title if available
      return weekTitle || undefined;
    }
    // For biweekly modules, show Week 1 / Week 2 within the module
    const weekPosition = week.weekNumber === moduleInfo.weekRange[0] ? 'Week 1' : 'Week 2';
    return weekTitle ? `${weekPosition} • ${weekTitle}` : weekPosition;
  };

  return (
    <Card
      className={`rounded-2xl transition-all ${
        week.isLocked
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      } ${
        isUnderReview
          ? "bg-warning/5 border-warning/30"
          : needsMorePractice
          ? "bg-destructive/5 border-destructive/30"
          : moduleInfo.isWeekly
          ? "border-warning/30"
          : ""
      }`}
      onClick={() => !week.isLocked && onNavigate(week.weekNumber)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getDisplayTitle()}</CardTitle>
          {getStatusBadge()}
        </div>
        {getSubtitle() && (
          <p className="text-sm text-muted-foreground mt-1">{getSubtitle()}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {week.isLocked ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>{getLockMessage()}</span>
          </div>
        ) : (
          <Button
            variant={
              isUnderReview
                ? "secondary"
                : needsMorePractice
                ? "destructive"
                : week.isComplete
                ? "outline"
                : "default"
            }
            size="sm"
            className={`w-full ${
              isUnderReview 
                ? "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" 
                : needsMorePractice
                ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(week.weekNumber);
            }}
          >
            {isUnderReview
              ? "View Submission"
              : needsMorePractice
              ? "Continue Practice"
              : week.isComplete
              ? "Review"
              : "Continue"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
        {week.completedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            {week.isComplete ? "Approved" : "Submitted"} {new Date(week.completedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
