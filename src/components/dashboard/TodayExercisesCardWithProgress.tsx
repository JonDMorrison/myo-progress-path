import { useExerciseProgress } from "@/hooks/useExerciseProgress";
import { TodayExercisesCard } from "./TodayExercisesCard";

interface TodayExercisesCardWithProgressProps {
  patientId: string | undefined;
  currentWeek: any;
  progress: any;
  onStartSession: (weekNumber: number) => void;
}

export function TodayExercisesCardWithProgress({ 
  patientId, 
  currentWeek, 
  progress,
  onStartSession 
}: TodayExercisesCardWithProgressProps) {
  const { progress: exerciseProgress, loading } = useExerciseProgress(
    patientId, 
    currentWeek?.number
  );

  if (loading) {
    return (
      <div className="animate-fade-in">
        <TodayExercisesCard
          weekNumber={currentWeek?.number || 1}
          weekTitle={currentWeek?.title || `Week ${currentWeek?.number || 1}`}
          exercisesCompleted={0}
          totalExercises={0}
          isCompleted={progress?.status === 'completed'}
          onStartSession={() => onStartSession(currentWeek?.number || 1)}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <TodayExercisesCard
        weekNumber={currentWeek?.number || 1}
        weekTitle={currentWeek?.title || `Week ${currentWeek?.number || 1}`}
        exercisesCompleted={exerciseProgress.completedToday}
        totalExercises={exerciseProgress.totalToday}
        isCompleted={progress?.status === 'completed'}
        onStartSession={() => onStartSession(currentWeek?.number || 1)}
      />
    </div>
  );
}
