import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface DotTimelineProps {
  completed?: number;
  current?: number;
  total?: number;
}

export function DotTimeline({ completed = 0, current = 1, total = 24 }: DotTimelineProps) {
  const navigate = useNavigate();
  
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
                <button
                  onClick={() => navigate(`/week/${week}`)}
                  className={`
                    h-4 w-4 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isDone && "bg-success border-success scale-110 hover:scale-125"}
                    ${isCurrent && "bg-primary border-primary ring-2 ring-primary/30 ring-offset-2 scale-125 animate-pulse"}
                    ${isUpcoming && "bg-muted border-border opacity-60 hover:opacity-80 hover:scale-110"}
                  `}
                  role="button"
                  aria-label={`Week ${week}: ${isDone ? "Completed" : isCurrent ? "Current" : "Upcoming"}`}
                  tabIndex={0}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-medium">Week {week}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
