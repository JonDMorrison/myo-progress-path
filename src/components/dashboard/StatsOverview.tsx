import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularGauge } from "@/components/ui/CircularGauge";
import { Wind, Target, Activity } from "lucide-react";

interface StatsOverviewProps {
  nasalBreathing: number;
  tonguePosture: number;
  boltScore: number;
}

export function StatsOverview({ nasalBreathing, tonguePosture, boltScore }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wind className="h-4 w-4 text-primary" />
            Nasal Breathing
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center pb-4">
          <CircularGauge
            value={nasalBreathing}
            label="Consistency"
            size={120}
            strokeWidth={10}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Tongue Posture
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center pb-4">
          <CircularGauge
            value={tonguePosture}
            label="Compliance"
            size={120}
            strokeWidth={10}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            BOLT Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center pb-4">
          <div className="inline-flex flex-col items-center gap-2">
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
