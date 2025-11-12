import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from "lucide-react";

interface DotTimelineProps {
  completed?: number;
  current?: number;
  total?: number;
  onWeekClick?: (weekNumber: number) => void;
}

export function DotTimeline({ completed = 0, current = 1, total = 24, onWeekClick }: DotTimelineProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-12 gap-2 sm:gap-3">
        {Array.from({ length: total }, (_, i) => i + 1).map((week) => {
          const isDone = week <= completed;
          const isCurrent = week === current;
          const isUpcoming = week > current;

          const isAccessible = !isUpcoming;
          
          return (
            <Tooltip key={week}>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center justify-center disabled:cursor-not-allowed relative"
                  onClick={() => isAccessible && onWeekClick?.(week)}
                  disabled={!isAccessible || !onWeekClick}
                  aria-label={`Go to week ${week}`}
                >
                  <div
                    className={`
                      h-3 w-3 rounded-full border-2 transition-all duration-200
                      ${isDone && "bg-success border-success scale-110"}
                      ${isCurrent && "bg-primary border-primary ring-2 ring-primary/30 ring-offset-2 scale-125"}
                      ${isUpcoming && "bg-muted border-border opacity-40"}
                      ${isAccessible && onWeekClick && "cursor-pointer hover:scale-150"}
                    `}
                    role="status"
                    aria-label={`Week ${week}: ${isDone ? "Completed" : isCurrent ? "Current" : "Locked"}`}
                  />
                  {isUpcoming && (
                    <Lock className="h-2 w-2 absolute text-muted-foreground opacity-60" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Week {week}
                  {isUpcoming && " (Locked)"}
                  {isAccessible && onWeekClick && " (Click to view)"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
