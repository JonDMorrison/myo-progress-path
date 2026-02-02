import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, RotateCcw, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { getWeekDisplayLabel } from "@/lib/moduleUtils";

interface WeekHeaderProps {
  week: any;
  progress: any;
  programVariant?: string;
  onBack: () => void;
  action?: ReactNode;
  isReadOnly?: boolean;
}

export function WeekHeader({ week, progress, programVariant = 'frenectomy', onBack, action, isReadOnly }: WeekHeaderProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          variant: 'bg-success/10 text-success border-success/20',
          icon: CheckCircle2,
          label: isReadOnly ? 'Approved' : 'Approved by Therapist'
        };
      case 'submitted':
        return {
          variant: 'bg-warning/10 text-warning border-warning/20',
          icon: Clock,
          label: 'Awaiting Therapist Approval'
        };
      case 'needs_more':
        return {
          variant: 'bg-destructive/10 text-destructive border-destructive/20',
          icon: RotateCcw,
          label: 'More Practice Needed'
        };
      default:
        return {
          variant: 'bg-primary/10 text-primary border-primary/20',
          icon: Pencil,
          label: 'In Progress'
        };
    }
  };

  const statusConfig = progress ? getStatusConfig(progress.status) : null;
  const StatusIcon = statusConfig?.icon;

  // Get module-aware display labels
  const displayLabels = week ? getWeekDisplayLabel(week.number, week.title, programVariant) : null;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 rounded-lg -ml-1">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1 font-medium">Dashboard</span>
            </Button>

            <div className="flex flex-col min-w-0">
              <h1 className="text-lg sm:text-xl font-black tracking-tight truncate leading-none">
                {displayLabels?.primary || `Module ${Math.ceil((week?.number || 1) / 2)}`}
              </h1>
              {displayLabels?.secondary && (
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate leading-none mt-0.5">
                  {displayLabels.secondary}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isReadOnly && action}
            {statusConfig && (
              <Badge
                variant="outline"
                className={cn("rounded-full px-2 py-0.5 text-[10px] sm:text-xs flex items-center gap-1 border-none font-bold", statusConfig.variant)}
              >
                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                <span>{statusConfig.label}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Urgent Alerts - Only if status is not default */}
        {progress?.status === 'needs_more' && !isReadOnly && (
          <p className="text-[10px] text-destructive font-bold mt-1 animate-pulse">
            ⚠️ therapist has requested additional practice. Check feedback.
          </p>
        )}
      </div>
    </header>
  );
}
