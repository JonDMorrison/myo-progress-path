import { Wind, Target, Activity, TrendingUp } from "lucide-react";

interface QuickStatsBarProps {
  nasalBreathing: number;
  tonguePosture: number;
  boltScore: number;
  weekProgress: number;
}

export function QuickStatsBar({
  nasalBreathing,
  tonguePosture,
  boltScore,
  weekProgress,
}: QuickStatsBarProps) {
  const stats = [
    {
      label: "Nasal Breathing",
      value: `${nasalBreathing}%`,
      icon: Wind,
      color: "text-blue-500",
    },
    {
      label: "Tongue Posture",
      value: `${tonguePosture}%`,
      icon: Target,
      color: "text-green-500",
    },
    {
      label: "BOLT Score",
      value: boltScore.toFixed(0),
      icon: Activity,
      color: "text-purple-500",
    },
    {
      label: "Week Progress",
      value: `${weekProgress}%`,
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-card border rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
