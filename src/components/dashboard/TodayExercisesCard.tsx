import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TodayExercisesCardProps {
  weekNumber: number;
  weekTitle: string;
  exercisesCompleted?: number;
  totalExercises?: number;
  isCompleted?: boolean;
  onStartSession: () => void;
}

export function TodayExercisesCard({ 
  weekNumber, 
  weekTitle, 
  exercisesCompleted = 0,
  totalExercises = 5,
  isCompleted = false,
  onStartSession 
}: TodayExercisesCardProps) {
  const progressPercent = totalExercises > 0 ? (exercisesCompleted / totalExercises) * 100 : 0;

  return (
    <Card className="rounded-2xl border-2 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary rounded-full blur-2xl" />
      </div>

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Today's Focus</span>
            </div>
            <CardTitle className="text-2xl">
              {weekTitle}
            </CardTitle>
          </div>
          {isCompleted && (
            <Badge variant="default" className="bg-success text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress Today</span>
            <span className="font-semibold">{exercisesCompleted} / {totalExercises} exercises</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onStartSession}
          size="default"
          className="w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Play className="w-5 h-5 mr-2" />
          {isCompleted ? 'Review Week' : 'Start Today\'s Session'}
        </Button>

        {!isCompleted && (
          <p className="text-xs text-center text-muted-foreground">
            ~15 minutes daily • Best done in the morning
          </p>
        )}
      </CardContent>
    </Card>
  );
}
