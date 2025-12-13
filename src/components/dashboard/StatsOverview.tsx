import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularGauge } from "@/components/ui/CircularGauge";
import { Wind, Target, Activity } from "lucide-react";
import { NasalUnblockModal } from "@/components/learn/NasalUnblockModal";

interface StatsOverviewProps {
  nasalBreathing: number;
  tonguePosture: number;
  boltScore: number;
}

export function StatsOverview({ nasalBreathing, tonguePosture, boltScore }: StatsOverviewProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-3">
      <Card className="rounded-xl sm:rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <CardHeader className="p-3 sm:pb-3 sm:p-6">
          <CardTitle className="text-xs sm:text-base flex items-center gap-1 sm:gap-2">
            <Wind className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="hidden sm:inline">Nasal Breathing</span>
            <span className="sm:hidden">Nasal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-2 sm:pb-4 sm:p-6 pt-0 gap-2 sm:gap-3">
          <CircularGauge
            value={nasalBreathing}
            label="Consistency"
            size={80}
            strokeWidth={8}
            className="sm:hidden"
          />
          <CircularGauge
            value={nasalBreathing}
            label="Consistency"
            size={120}
            strokeWidth={10}
            className="hidden sm:block"
          />
          <div className="hidden sm:block">
            <NasalUnblockModal />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl sm:rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <CardHeader className="p-3 sm:pb-3 sm:p-6">
          <CardTitle className="text-xs sm:text-base flex items-center gap-1 sm:gap-2">
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="hidden sm:inline">Tongue Posture</span>
            <span className="sm:hidden">Tongue</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-2 sm:pb-4 sm:p-6 pt-0">
          <CircularGauge
            value={tonguePosture}
            label="Compliance"
            size={80}
            strokeWidth={8}
            className="sm:hidden"
          />
          <CircularGauge
            value={tonguePosture}
            label="Compliance"
            size={120}
            strokeWidth={10}
            className="hidden sm:block"
          />
        </CardContent>
      </Card>

      <Card className="rounded-xl sm:rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <CardHeader className="p-3 sm:pb-3 sm:p-6">
          <CardTitle className="text-xs sm:text-base flex items-center gap-1 sm:gap-2">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="hidden sm:inline">BOLT Score</span>
            <span className="sm:hidden">BOLT</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-2 sm:pb-4 sm:p-6 pt-0">
          {/* Mobile version */}
          <div className="inline-flex flex-col items-center gap-1 sm:hidden">
            <div className="relative">
              <svg width={80} height={80} className="transform -rotate-90">
                <circle
                  cx={40}
                  cy={40}
                  r={34}
                  strokeWidth={8}
                  className="fill-none stroke-muted opacity-20"
                />
                <circle
                  cx={40}
                  cy={40}
                  r={34}
                  strokeWidth={8}
                  strokeDasharray={213.63}
                  strokeDashoffset={213.63 * (1 - Math.min(boltScore / 40, 1))}
                  strokeLinecap="round"
                  className="fill-none stroke-primary transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{boltScore}s</span>
              </div>
            </div>
            <div className="text-xs font-medium text-muted-foreground text-center">
              {boltScore > 0 ? "Latest" : "No Data"}
            </div>
          </div>
          {/* Desktop version */}
          <div className="hidden sm:inline-flex flex-col items-center gap-2">
            <div className="relative">
              <svg width={120} height={120} className="transform -rotate-90">
                <circle
                  cx={60}
                  cy={60}
                  r={52}
                  strokeWidth={10}
                  className="fill-none stroke-muted opacity-20"
                />
                <circle
                  cx={60}
                  cy={60}
                  r={52}
                  strokeWidth={10}
                  strokeDasharray={326.73}
                  strokeDashoffset={326.73 * (1 - Math.min(boltScore / 40, 1))}
                  strokeLinecap="round"
                  className="fill-none stroke-primary transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{boltScore}s</span>
              </div>
            </div>
            <div className="text-sm font-medium text-muted-foreground text-center">
              {boltScore > 0 ? "Latest Score" : "No Data"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
