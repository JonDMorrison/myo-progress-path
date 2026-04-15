import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Video, MessageSquare, CheckCircle, Loader, UserX } from "lucide-react";
import { 
  calculateTriageLevel, 
  getTriageBorderClass, 
  formatWaitingTime,
  type TriageLevel,
} from "@/lib/triageUtils";
import { cn } from "@/lib/utils";
import { isFrenectomyVariant } from "@/lib/constants";

interface ReviewCardProps {
  id: string;
  patientId: string;
  patientName: string;
  weekNumber: number;
  weekId: string;
  weekTitle: string;
  programVariant: string;
  submittedAt: string | null;
  status: string;
  consecutiveNeedsMore: number;
  videoCount: number;
  messageCount: number;
  isUnassigned?: boolean;
  uploads?: { ai_feedback?: any; ai_feedback_status?: string | null }[]; // Kept for API compatibility
  onReview?: (progressId: string, patientId: string, weekNumber: number, weekId: string) => void;
  onApprove?: (progressId: string) => void;
  onSendNote?: (patientId: string, weekNumber: number) => void;
  isApproving?: boolean;
  isExiting?: boolean;
  // Batch selection
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const ReviewCard = ({
  id,
  patientId,
  patientName,
  weekNumber,
  weekId,
  weekTitle,
  programVariant,
  submittedAt,
  status,
  consecutiveNeedsMore,
  videoCount,
  messageCount,
  isUnassigned,
  uploads = [],
  onReview,
  onApprove,
  onSendNote,
  isApproving,
  isExiting,
  selectable,
  selected,
  onSelect,
}: ReviewCardProps) => {
  // AI-based triage has been disabled - triage based on time and status only
  const triage = calculateTriageLevel(status, submittedAt, consecutiveNeedsMore);
  const borderClass = getTriageBorderClass(triage.level);
  const waitingTime = formatWaitingTime(submittedAt);
  
  const canApprove = triage.level !== 'red';
  const isGreen = triage.level === 'green';
  
  return (
    <Card
      className={cn(
        "bg-card shadow-card hover:shadow-elevated transition-shadow duration-200 cursor-pointer hover:bg-slate-50",
        borderClass,
        isExiting && "opacity-0 scale-[0.98] transition-all duration-200",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onClick={(e) => {
        // Don't navigate if clicking a button, checkbox, or label
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[role="checkbox"]') || target.closest('label')) return;
        onReview?.(id, patientId, weekNumber, weekId);
      }}
    >
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Checkbox for batch selection (GREEN cards only) */}
          {selectable && isGreen && (
            <div className="shrink-0 pt-1">
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onSelect?.(id, !!checked)}
                aria-label={`Select ${patientName} Week ${weekNumber}`}
              />
            </div>
          )}
          
          {/* Left: Patient info */}
          <div className="flex-1 min-w-0">
            {/* Patient name - strongest visual anchor */}
            <h3 className="text-lg font-semibold truncate mb-1">
              {patientName}
            </h3>
            
            {/* Module info - muted */}
            <p className="text-sm text-muted-foreground mb-2">
              Module {Math.ceil(weekNumber / 2)} · {weekTitle}
            </p>
            
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Unassigned badge — flags submissions from patients with no therapist */}
              {isUnassigned && (
                <Badge
                  variant="outline"
                  className="text-xs bg-destructive/10 text-destructive border-destructive/30"
                  title="This patient has no assigned therapist — assign one from the Master Patient List."
                >
                  <UserX className="h-3 w-3 mr-1" />
                  Unassigned
                </Badge>
              )}

              {/* Program variant badge */}
              <Badge variant="secondary" className="text-xs">
                {isFrenectomyVariant(programVariant)
                  ? 'Frenectomy'
                  : 'Non-Frenectomy'}
              </Badge>
              
              {/* Status badge for needs_more */}
              {status === 'needs_more' && (
                <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                  Needs More
                </Badge>
              )}
              
              {/* Waiting time */}
              <span className="text-xs text-muted-foreground">
                Submitted {waitingTime}
              </span>
            </div>
            
            {/* Icons row - muted indicators */}
            <div className="flex items-center gap-4 text-muted-foreground">
              {videoCount > 0 && (
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  <span className="text-xs">{videoCount}</span>
                </div>
              )}
              
              {messageCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">{messageCount}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Action buttons - always visible */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => onReview?.(id, patientId, weekNumber, weekId)}
            >
              Review
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              disabled={!canApprove || isApproving}
              onClick={() => onApprove?.(id)}
              className={!canApprove ? 'opacity-50' : ''}
            >
              {isApproving ? (
                <Loader className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              Approve
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSendNote?.(patientId, weekNumber)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Note
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Export triage level getter for parent components
export const getCardTriageLevel = (
  status: string,
  submittedAt: string | null,
  consecutiveNeedsMore: number,
  _uploads?: { ai_feedback?: any; ai_feedback_status?: string | null }[] // Kept for API compatibility
): TriageLevel => {
  return calculateTriageLevel(status, submittedAt, consecutiveNeedsMore).level;
};

export default ReviewCard;
