import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekHeaderProps {
  week: any;
  progress: any;
  onBack: () => void;
}

export function WeekHeader({ week, progress, onBack }: WeekHeaderProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success/10 text-success border-success/20';
      case 'submitted':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'needs_more':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="rounded-xl -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          {progress && (
            <Badge
              variant="outline"
              className={cn("rounded-full", getStatusVariant(progress.status))}
            >
              {progress.status}
            </Badge>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">
            {week?.title || `Week ${week?.number}`}
          </h1>
        </div>
      </div>
    </header>
  );
}
