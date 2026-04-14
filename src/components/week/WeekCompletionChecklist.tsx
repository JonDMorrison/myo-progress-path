import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFrenectomyVariant, requiresVideo } from "@/lib/constants";

interface WeekCompletionChecklistProps {
  progress: any;
  week: any;
  uploads: any[];
  exercises?: any[];
  weekNumber?: number;
  programVariant?: string;
  requiresVideoUpload?: boolean;
  layout?: 'sidebar' | 'horizontal';
}

export function WeekCompletionChecklist({
  progress,
  week,
  uploads,
  exercises = [],
  weekNumber = 0,
  programVariant,
  requiresVideoUpload,
  layout = 'sidebar'
}: WeekCompletionChecklistProps) {
  // Handle null week or progress (therapist preview mode)
  if (!week) return null;
  if (!progress) {
    return (
      <Card className="rounded-[2.5rem] border-none shadow-premium bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 px-6 py-4 border-b border-slate-100">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Preview Mode</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Progress tracking unavailable in preview mode.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate exercise completion based on specific targets
  const exerciseCompletions = progress?.exercise_completions || {};
  const exerciseStatus = exercises.map(ex => {
    const count = exerciseCompletions[ex.id] || 0;
    const target = ex.completion_target || 1; // Default to 1 if not specified
    return {
      id: ex.id,
      complete: count >= target,
      count,
      target
    };
  });

  const completedSessions = exerciseStatus.reduce((acc, s) => acc + s.count, 0);
  const totalSessionsTarget = exerciseStatus.reduce((acc, s) => acc + s.target, 0);
  const allExercisesComplete = totalSessionsTarget > 0 && completedSessions >= totalSessionsTarget;

  // Check if frenectomy consult is required (Module 1, frenectomy pathway only)
  const isFrenectomyModule1 = (weekNumber === 1 || weekNumber === 2) && isFrenectomyVariant(programVariant);

  // Build requirements array (video uploads are now per-exercise, not week-level)
  const requirements = [];

  // Video submission items — only for pathways that require video AND patient has video enabled
  const videoRequired = requiresVideoUpload !== undefined ? requiresVideoUpload : requiresVideo(programVariant);
  if (videoRequired) {
    // Check that ALL active exercises have uploads, not just any one
    const activeExercises = exercises.filter(ex => ex.type === 'active' && ex.id);
    const uploadsList = uploads || [];

    const hasFirstForAll = activeExercises.length > 0 && activeExercises.every(ex =>
      uploadsList.some(u => u.kind === 'first_attempt' &&
        (u.exercise_key === ex.id || u.exercise_id === ex.id))
    );
    const hasLastForAll = activeExercises.length > 0 && activeExercises.every(ex =>
      uploadsList.some(u => u.kind === 'last_attempt' &&
        (u.exercise_key === ex.id || u.exercise_id === ex.id))
    );

    if (week.requires_video_first) {
      requirements.push({
        label: 'First attempt videos submitted',
        complete: hasFirstForAll,
        required: true,
        icon: "🎥"
      });
    }
    if (week.requires_video_last) {
      requirements.push({
        label: 'Last attempt videos submitted',
        complete: hasLastForAll,
        required: true,
        icon: "🎬"
      });
    }
  }

  // Add remaining requirements
  requirements.push(
    {
      label: 'BOLT Test done',
      complete: week.requires_bolt && !!progress.bolt_score,
      required: week.requires_bolt,
      icon: "📊"
    },
    {
      label: 'Nasal Breathing chart completed',
      complete: progress.nasal_breathing_pct !== null && progress.nasal_breathing_pct !== undefined,
      required: true,
      icon: "💨"
    },
    {
      label: 'Tongue on Spot chart completed',
      complete: progress.tongue_on_spot_pct !== null && progress.tongue_on_spot_pct !== undefined,
      required: true,
      icon: "👅"
    },
    {
      label: `Exercise sessions (${completedSessions}/${totalSessionsTarget})`,
      complete: allExercisesComplete,
      required: totalSessionsTarget > 0,
      icon: "🏃"
    },
    {
      label: 'Frenectomy consultation with Dr Laura Caylor',
      complete: progress?.frenectomy_consult_booked === true,
      required: isFrenectomyModule1,
      icon: "📅"
    }
  );

  const requiredItems = requirements.filter(r => r.required);
  const completedCount = requiredItems.filter(r => r.complete).length;
  const requiredCount = requiredItems.length;
  const percentComplete = requiredCount > 0
    ? Math.round((completedCount / requiredCount) * 100)
    : 0;

  if (layout === 'horizontal') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {requiredItems.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-300",
              req.complete
                ? "bg-emerald-500/20 shadow-lg shadow-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-white/60"
            )}
          >
            <span className="text-lg">{req.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
              {req.label}
            </span>
            {req.complete ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-white/20" />
            )}
          </div>
        ))}
        {/* Overall Indicator */}
        <div className="ml-2 pl-4 border-l border-white/10 flex flex-col items-center">
          <span className="text-xl font-black italic text-primary-light leading-none">{percentComplete}%</span>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Done</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="lg:sticky lg:top-24 rounded-2xl border shadow-sm">
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
