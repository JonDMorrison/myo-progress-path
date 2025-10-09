import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularGauge } from "@/components/ui/CircularGauge";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HabitsCardProps {
  nasalBreathingPercent?: number;
  tonguePosturePercent?: number;
  avgBoltScore?: number;
}

export function HabitsCard({
  nasalBreathingPercent = 0,
  tonguePosturePercent = 0,
  avgBoltScore = 0,
}: HabitsCardProps) {
  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col bg-white/90 dark:bg-card/90 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Habits at a Glance</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Habits information</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">Track your daily practice consistency across key habits</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-6 w-full max-sm:grid-cols-1 max-sm:gap-8">
          <CircularGauge value={nasalBreathingPercent} label="Nasal Breathing" size={88} strokeWidth={8} />
          <CircularGauge value={tonguePosturePercent} label="Tongue Posture" size={88} strokeWidth={8} />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-[88px] w-[88px] rounded-full border-8 border-primary/20 flex items-center justify-center">
              <span className="text-3xl font-bold">{avgBoltScore}s</span>
            </div>
            <div className="text-sm font-medium text-muted-foreground text-center">Avg BOLT Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
