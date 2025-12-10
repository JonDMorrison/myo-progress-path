import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseProgress {
  completedToday: number;
  totalToday: number;
  weeklyProgress: number;
  exerciseDetails: Record<string, number>;
}

export function useExerciseProgress(
  patientId: string | undefined, 
  currentWeekNumber: number | undefined,
  programVariant?: string
) {
  const [progress, setProgress] = useState<ExerciseProgress>({
    completedToday: 0,
    totalToday: 0,
    weeklyProgress: 0,
    exerciseDetails: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId || !currentWeekNumber) {
      setLoading(false);
      return;
    }

    loadProgress();
  }, [patientId, currentWeekNumber, programVariant]);

  const loadProgress = async () => {
    if (!patientId || !currentWeekNumber) return;

    try {
      // Get week filtered by program variant
      const variant = programVariant || 'frenectomy';
      const programTitle = variant === 'non_frenectomy' 
        ? 'Non-Frenectomy Program' 
        : 'Frenectomy Program';

      const { data: weekData } = await supabase
        .from('weeks')
        .select('id, programs!inner(title)')
        .eq('number', currentWeekNumber)
        .eq('programs.title', programTitle)
        .single();

      if (!weekData) {
        setLoading(false);
        return;
      }

      // Get patient progress for this week
      const { data: progressData } = await supabase
        .from('patient_week_progress')
        .select('exercise_completions')
        .eq('patient_id', patientId)
        .eq('week_id', weekData.id)
        .maybeSingle();

      const completions = (progressData?.exercise_completions as Record<string, number>) || {};
      
      // Count total exercises from completions object
      const totalExercises = Object.keys(completions).length;

      // Calculate completed exercises
      const completedCount = Object.values(completions).filter(count => count > 0).length;
      const weeklyProgress = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

      setProgress({
        completedToday: completedCount,
        totalToday: totalExercises,
        weeklyProgress,
        exerciseDetails: completions
      });
    } catch (error) {
      console.error('Error loading exercise progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return { progress, loading, refresh: loadProgress };
}
