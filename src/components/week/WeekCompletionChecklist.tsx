import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekCompletionChecklistProps {
  progress: any;
  week: any;
  uploads: any[];
  exercises?: any[];
  weekNumber?: number;
  programVariant?: string;
}

export function WeekCompletionChecklist({ 
  progress, 
  week, 
  uploads,
  exercises = [],
  weekNumber = 0,
  programVariant
}: WeekCompletionChecklistProps) {
  // Handle null week
  if (!week) {
    return null;
  }

  // Calculate exercise completion
  const exerciseCompletions = progress?.exercise_completions || {};
  const completedExercises = Object.values(exerciseCompletions).filter(
    (count): count is number => typeof count === 'number' && count > 0
  ).length;
  const totalExercises = exercises.length;
  const allExercisesComplete = totalExercises > 0 && completedExercises === totalExercises;

  // Check if frenectomy consult is required (Week 1, frenectomy pathway only)
  const isFrenectomyWeek1 = weekNumber === 1 && programVariant === 'frenectomy';

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
    },
    // Frenectomy consult task - only for Week 1 frenectomy pathway
    {
      label: 'Frenectomy Consult Booked',
      complete: progress?.frenectomy_consult_booked === true,
      required: isFrenectomyWeek1
    }
  ];

  const requiredItems = requirements.filter(r => r.required);
  const completedCount = requiredItems.filter(r => r.complete).length;
  const requiredCount = requiredItems.length;
  const percentComplete = requiredCount > 0 
    ? Math.round((completedCount / requiredCount) * 100) 
    : 0;

  return (
    <Card className="lg:sticky lg:top-24 rounded-xl sm:rounded-2xl border shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Completion</CardTitle>
        <Progress value={percentComplete} className="mt-2" />
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          {completedCount} of {requiredCount} completed
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <ul className="space-y-2 sm:space-y-3">
          {requiredItems.map((req, index) => (
            <li key={index} className="flex items-center gap-2">
              {req.complete ? (
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={cn(
                "text-xs sm:text-sm",
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
