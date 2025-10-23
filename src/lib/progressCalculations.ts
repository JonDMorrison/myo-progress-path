export function calculateDailyProgress(
  exerciseCompletions: Record<string, number>,
  exercises: any[]
): { completed: number; total: number; percentage: number } {
  if (!exercises || exercises.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const completed = Object.values(exerciseCompletions || {}).filter(
    count => count > 0
  ).length;
  
  const total = exercises.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

export function calculateWeeklyTrend(
  allProgress: any[]
): { trend: 'up' | 'down' | 'stable'; percentage: number } {
  if (allProgress.length < 2) {
    return { trend: 'stable', percentage: 0 };
  }

  // Get last 2 weeks of approved progress
  const sortedProgress = allProgress
    .filter(p => p.status === 'approved' && p.completed_at)
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 2);

  if (sortedProgress.length < 2) {
    return { trend: 'stable', percentage: 0 };
  }

  const [latest, previous] = sortedProgress;
  const latestAvg = ((latest.nasal_breathing_pct || 0) + (latest.tongue_on_spot_pct || 0)) / 2;
  const previousAvg = ((previous.nasal_breathing_pct || 0) + (previous.tongue_on_spot_pct || 0)) / 2;

  const change = latestAvg - previousAvg;
  const percentageChange = previousAvg > 0 ? Math.round((change / previousAvg) * 100) : 0;

  let trend: 'up' | 'down' | 'stable';
  if (Math.abs(percentageChange) < 5) {
    trend = 'stable';
  } else if (percentageChange > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  return { trend, percentage: Math.abs(percentageChange) };
}

export function calculateOverallCompletion(
  completedWeeks: number,
  totalWeeks: number = 24
): { completedWeeks: number; totalWeeks: number; percentage: number } {
  const percentage = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  return {
    completedWeeks,
    totalWeeks,
    percentage
  };
}
