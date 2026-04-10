import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Award, Trophy } from "lucide-react";
import { getGamificationStats, getEarnedBadges, updateStreak } from "@/lib/gamification";
import confetti from "canvas-confetti";

interface StreakBadgeProps {
  patientId: string;
}

export function StreakBadge({ patientId }: StreakBadgeProps) {
  const [stats, setStats] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, [patientId]);

  const loadGamificationData = async () => {
    try {
      // Update streak first (this will check if today is a new day)
      const streakResult = await updateStreak(patientId);
      
      // Load stats
      const statsData = await getGamificationStats(patientId);
      setStats(statsData);

      // Load badges
      const badgesData = await getEarnedBadges(patientId);
      setBadges(badgesData);

      // Check if we just hit a milestone and trigger confetti
      if (streakResult.success && streakResult.newStreak) {
        const streak = streakResult.newStreak;
        if ([7, 14, 28].includes(streak)) {
          triggerConfetti();
        }
      }
    } catch (error) {
      console.error("Error loading gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-24">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStreak = stats?.current_streak || 0;
  const longestStreak = stats?.longest_streak || 0;
  const level = stats?.level || 1;
  const points = stats?.points || 0;

  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak Display */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak {currentStreak > 0 ? '🔥' : ''}</p>
            </div>
          </div>
          {longestStreak > currentStreak && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Best</p>
              <p className="font-semibold text-foreground">{longestStreak} days</p>
            </div>
          )}
        </div>

        {/* Level & Points */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs text-muted-foreground mb-1">Level</p>
            <p className="text-xl font-bold text-primary">{level}</p>
          </div>
          <div className="p-3 bg-success/5 rounded-lg border border-success/10">
            <p className="text-xs text-muted-foreground mb-1">Points</p>
            <p className="text-xl font-bold text-success">{points}</p>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Earned Badges
            </p>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 6).map((earnedBadge) => (
                <Badge
                  key={earnedBadge.id}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm"
                  title={earnedBadge.badge?.description}
                >
                  {earnedBadge.badge?.icon} {earnedBadge.badge?.name}
                </Badge>
              ))}
            </div>
            {badges.length > 6 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{badges.length - 6} more badges
              </p>
            )}
          </div>
        )}

        {/* Milestone Hints */}
        {currentStreak > 0 && currentStreak < 7 && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            {badges.length > 0 || points > 0
              ? `🔥 Great start! Keep up your daily practice to earn streak badges.`
              : `🎯 Keep going! ${7 - currentStreak} more day${7 - currentStreak === 1 ? '' : 's'} to earn your first streak badge.`
            }
          </p>
        )}
        {currentStreak === 0 && (points > 0 || badges.length > 0) && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            💪 Practice today to restart your streak!
          </p>
        )}
        {currentStreak >= 7 && currentStreak < 14 && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            🔥 Amazing! {14 - currentStreak} more day{14 - currentStreak === 1 ? '' : 's'} to the next milestone
          </p>
        )}
      </CardContent>
    </Card>
  );
}
