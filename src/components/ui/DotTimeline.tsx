import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, FileText } from "lucide-react";
import { getTimelineItems, TimelineItem } from "@/lib/moduleUtils";
import { useNavigate } from "react-router-dom";

interface DotTimelineProps {
  completed?: number; // Number of completed weeks
  current?: number; // Current week number
  total?: number;
  programVariant?: string;
  onWeekClick?: (weekNumber: number) => void;
  isSuperAdmin?: boolean;
}

export function DotTimeline({
  completed = 0,
  current = 1,
  programVariant = 'frenectomy',
  onWeekClick,
  isSuperAdmin = false
}: DotTimelineProps) {
  const navigate = useNavigate();
  const items = getTimelineItems(programVariant);

  // Determine item states based on week progress
  const getItemState = (item: TimelineItem) => {
    // Protocol pages are always accessible (informational)
    if (item.isProtocol) {
      return { isDone: false, isCurrent: false, isUpcoming: false, isProtocol: true };
    }

    const maxWeekInItem = Math.max(...item.weekNumbers);
    const minWeekInItem = Math.min(...item.weekNumbers);

    // Item is done if all its weeks are completed
    const isDone = maxWeekInItem <= completed;

    // Item is current if current week falls within it
    const isCurrent = item.weekNumbers.includes(current);

    // Item is upcoming if its minimum week is greater than current
    const isUpcoming = minWeekInItem > current && !isDone;

    return { isDone, isCurrent, isUpcoming, isProtocol: false };
  };

  const handleItemClick = (item: TimelineItem, isAccessible: boolean) => {
    if (item.isProtocol && item.protocolSlug) {
      navigate(`/protocol/${item.protocolSlug}`);
    } else if (isAccessible && item.weekNumbers.length > 0) {
      onWeekClick?.(item.weekNumbers[0]);
    }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-8 sm:grid-cols-15 gap-2 sm:gap-3">
        {items.map((item) => {
          const { isDone, isCurrent, isUpcoming, isProtocol } = getItemState(item);
          const isAccessible = isSuperAdmin || !isUpcoming || isProtocol;
          const primaryWeek = item.weekNumbers[0] || 0;

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  className="flex flex-col items-center justify-center disabled:cursor-not-allowed relative gap-1"
                  onClick={() => handleItemClick(item, isAccessible)}
                  disabled={!isAccessible || (!onWeekClick && !isProtocol)}
                  aria-label={`Go to ${item.label}`}
                >
                  {isProtocol ? (
                    /* Protocol pages show a document icon */
                    <div
                      className={`
                        h-3 w-3 rounded-sm flex items-center justify-center transition-all duration-200
                        bg-primary/20 border-2 border-primary/50
                        cursor-pointer hover:scale-150 hover:bg-primary/30
                      `}
                    >
                      <FileText className="h-2 w-2 text-primary" />
                    </div>
                  ) : (
                    <div
                      className={`
                        h-3 w-3 rounded-full border-2 transition-all duration-200
                        ${isDone && "bg-success border-success scale-110"}
                        ${isCurrent && "bg-primary border-primary ring-2 ring-primary/30 ring-offset-2 scale-125"}
                        ${isUpcoming && !isSuperAdmin && "bg-muted border-border opacity-40"}
                        ${isUpcoming && isSuperAdmin && "bg-muted border-border opacity-70"}
                        ${isAccessible && onWeekClick && "cursor-pointer hover:scale-150"}
                        ${item.isPostOp && "border-warning"}
                      `}
                      role="status"
                      aria-label={`${item.label}: ${isDone ? "Completed" : isCurrent ? "Current" : "Locked"}`}
                    />
                  )}
                  {isUpcoming && !isSuperAdmin && !isProtocol && (
                    <Lock className="h-2 w-2 absolute top-0 text-muted-foreground opacity-60" />
                  )}
                  <span className={`text-[9px] sm:text-[10px] leading-tight ${isProtocol ? "text-primary font-medium" :
                      isDone ? "text-success" :
                        isCurrent ? "text-primary font-medium" :
                          "text-muted-foreground"
                    }`}>
                    {item.shortLabel}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {isProtocol
                    ? "Clinical Protocol (tap to view)"
                    : item.weekNumbers.length > 1
                      ? `${item.label}`
                      : `Module Item ${item.weekNumbers[0]}`
                  }
                  {isUpcoming && !isSuperAdmin && !isProtocol && " • Locked"}
                  {isUpcoming && isSuperAdmin && !isProtocol && " • Admin Access"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
