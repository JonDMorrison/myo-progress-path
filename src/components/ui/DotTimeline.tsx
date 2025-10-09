import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DotTimelineProps {
  completed?: number;
  current?: number;
  total?: number;
}

export function DotTimeline({ completed = 0, current = 1, total = 24 }: DotTimelineProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-12 gap-2 sm:gap-3">
        {Array.from({ length: total }, (_, i) => i + 1).map((week) => {
          const isDone = week <= completed;
          const isCurrent = week === current;
          const isUpcoming = week > current;

          return (
            <Tooltip key={week}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <div
                    className={`
                      h-3 w-3 rounded-full border-2 transition-all duration-200
                      ${isDone && "bg-success border-success scale-110"}
                      ${isCurrent && "bg-primary border-primary ring-2 ring-primary/30 ring-offset-2 scale-125"}
                      ${isUpcoming && "bg-muted border-border opacity-60"}
                    `}
                    role="status"
                    aria-label={`Week ${week}: ${isDone ? "Completed" : isCurrent ? "Current" : "Upcoming"}`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Week {week}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
