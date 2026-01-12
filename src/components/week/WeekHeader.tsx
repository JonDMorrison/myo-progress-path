import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, RotateCcw, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface WeekHeaderProps {
  week: any;
  progress: any;
  onBack: () => void;
  action?: ReactNode;
  isReadOnly?: boolean;
}

export function WeekHeader({ week, progress, onBack, action, isReadOnly }: WeekHeaderProps) {
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

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <Button variant="ghost" onClick={onBack} className="rounded-xl -ml-2 gap-1 sm:gap-2 px-2 sm:px-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            {!isReadOnly && action}
            {statusConfig && (
              <Badge
                variant="outline"
                className={cn("rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm flex items-center gap-1", statusConfig.variant)}
              >
                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                <span className="hidden sm:inline">{statusConfig.label}</span>
                <span className="sm:hidden">{statusConfig.label.split(' ')[0]}</span>
              </Badge>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            {week?.title || `Week ${week?.number}`}
          </h1>
          {isReadOnly && (
            <p className="text-sm text-muted-foreground">
              Viewing completed week • Exercises are read-only
            </p>
          )}
          {progress?.status === 'submitted' && !isReadOnly && (
            <p className="text-sm text-warning">
              Your submission is being reviewed. You'll be notified when your therapist approves it.
            </p>
          )}
          {progress?.status === 'needs_more' && !isReadOnly && (
            <p className="text-sm text-destructive">
              Your therapist has requested additional practice. Check their feedback below.
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
