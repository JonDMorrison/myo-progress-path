import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekCompletionChecklistProps {
  progress: any;
  week: any;
  uploads: any[];
  exercises?: any[];
}

export function WeekCompletionChecklist({ 
  progress, 
  week, 
  uploads,
  exercises = []
}: WeekCompletionChecklistProps) {
  // Calculate exercise completion
  const exerciseCompletions = progress?.exercise_completions || {};
  const completedExercises = Object.values(exerciseCompletions).filter(
    (count): count is number => typeof count === 'number' && count > 0
  ).length;
  const totalExercises = exercises.length;
  const allExercisesComplete = totalExercises > 0 && completedExercises === totalExercises;

  const requirements = [
    {
      label: 'First Video Uploaded',
      complete: week.requires_video_first && uploads.some((u: any) => u.kind === 'first_attempt'),
      required: week.requires_video_first
    },
    {
      label: 'Last Video Uploaded',
      complete: week.requires_video_last && uploads.some((u: any) => u.kind === 'last_attempt'),
      required: week.requires_video_last
    },
    {
      label: 'BOLT Score Entered',
      complete: week.requires_bolt && !!progress.bolt_score,
      required: week.requires_bolt
    },
    {
      label: 'Nasal Breathing %',
      complete: progress.nasal_breathing_pct !== null && progress.nasal_breathing_pct !== undefined,
      required: true
    },
    {
      label: 'Tongue Posture %',
      complete: progress.tongue_on_spot_pct !== null && progress.tongue_on_spot_pct !== undefined,
      required: true
    },
    {
      label: `Exercises Completed (${completedExercises}/${totalExercises})`,
      complete: allExercisesComplete,
      required: totalExercises > 0
    }
  ];

  const requiredItems = requirements.filter(r => r.required);
  const completedCount = requiredItems.filter(r => r.complete).length;
  const requiredCount = requiredItems.length;
  const percentComplete = requiredCount > 0 
    ? Math.round((completedCount / requiredCount) * 100) 
    : 0;

  return (
    <Card className="sticky top-24 rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Completion</CardTitle>
        <Progress value={percentComplete} className="mt-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {completedCount} of {requiredCount} completed
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {requiredItems.map((req, index) => (
            <li key={index} className="flex items-center gap-2">
              {req.complete ? (
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={cn(
                "text-sm",
                req.complete && "line-through text-muted-foreground"
              )}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
