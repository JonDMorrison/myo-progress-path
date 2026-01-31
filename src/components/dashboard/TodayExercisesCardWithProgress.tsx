import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import { TodayExercisesCard } from "./TodayExercisesCard";
import { getModuleInfo, cleanWeekTitle } from "@/lib/moduleUtils";

interface TodayExercisesCardWithProgressProps {
  patientId: string | undefined;
  currentWeek: any;
  progress: any;
  programVariant?: string;
  onStartSession: (weekNumber: number) => void;
}

export function TodayExercisesCardWithProgress({
  patientId,
  currentWeek,
  progress,
  programVariant = 'frenectomy',
  onStartSession
}: TodayExercisesCardWithProgressProps) {
  const { progress: exerciseProgress, loading } = useExerciseProgress(
    patientId,
    currentWeek?.number
  );

  const moduleInfo = currentWeek ? getModuleInfo(currentWeek.number, programVariant) : null;
  const moduleLabel = moduleInfo?.moduleLabel;
  const displayTitle = currentWeek ? cleanWeekTitle(currentWeek.title) : 'Foundation & Breathing';

  if (loading) {
    return (
      <div className="animate-fade-in">
        <TodayExercisesCard
          moduleLabel={moduleLabel}
          weekNumber={currentWeek?.number || 1}
          weekTitle={displayTitle || `Module ${currentWeek?.number || 1}`}
          exercisesCompleted={0}
          totalExercises={0}
          status={progress?.status}
          onStartSession={() => onStartSession(currentWeek?.number || 1)}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <TodayExercisesCard
        moduleLabel={moduleLabel}
        weekNumber={currentWeek?.number || 1}
        weekTitle={displayTitle || `Module ${currentWeek?.number || 1}`}
        exercisesCompleted={exerciseProgress.completedToday}
        totalExercises={exerciseProgress.totalToday}
        status={progress?.status}
        onStartSession={() => onStartSession(currentWeek?.number || 1)}
      />
    </div>
  );
}
