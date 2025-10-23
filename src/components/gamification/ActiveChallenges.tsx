import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Target, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActiveChallengesProps {
  patientId: string;
  clinicId: string;
}

export function ActiveChallenges({ patientId, clinicId }: ActiveChallengesProps) {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, [clinicId, patientId]);

  const loadChallenges = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get active challenges for clinic
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('active', true)
        .lte('starts_on', today)
        .gte('ends_on', today);

      if (!challengesData || challengesData.length === 0) {
        setLoading(false);
        return;
      }

      // Get progress for each challenge
      const { data: progressData } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('patient_id', patientId)
        .in('challenge_id', challengesData.map(c => c.id));

      setChallenges(challengesData);
      setProgress(
        (progressData || []).reduce((acc, p) => ({
          ...acc,
          [p.challenge_id]: p
        }), {})
      );
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (challenges.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Active Challenges
        </CardTitle>
        <CardDescription>
          Complete challenges to earn bonus points and badges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map(challenge => {
          const prog = progress[challenge.id] || { progress: 0, completed: false };
          const percentComplete = Math.min(
            (prog.progress / challenge.goal_target) * 100,
            100
          );

          return (
            <div
              key={challenge.id}
              className={cn(
                'p-4 rounded-lg border-2 transition-all',
                prog.completed
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-border'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{challenge.title}</h4>
                    {prog.completed && (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {challenge.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    +{challenge.reward_points}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>

              <div className="space-y-2">
                <Progress value={percentComplete} />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {prog.progress} / {challenge.goal_target}
                  </span>
                  <span className="text-muted-foreground">
                    Ends {format(new Date(challenge.ends_on), 'MMM d')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
