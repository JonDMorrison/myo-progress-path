import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  title: string;
  type: string;
  frequency: string | null;
  duration: string | null;
  completion_target: number;
}

interface ExerciseCompletionTrackerProps {
  patientId: string;
  weekId: string;
  exercises: Exercise[];
  existingCompletions?: Record<string, number>;
  onUpdate?: () => void;
}

export function ExerciseCompletionTracker({ 
  patientId, 
  weekId, 
  exercises,
  existingCompletions = {},
  onUpdate 
}: ExerciseCompletionTrackerProps) {
  const [completions, setCompletions] = useState<Record<string, number>>(existingCompletions);
  const { toast } = useToast();

  useEffect(() => {
    setCompletions(existingCompletions);
  }, [existingCompletions]);

  const handleIncrement = async (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const currentCount = completions[exerciseId] || 0;
    if (currentCount >= exercise.completion_target) {
      toast({
        title: "Target reached",
        description: "You've completed all required sessions for this exercise!",
      });
      return;
    }

    const newCount = currentCount + 1;
    const updatedCompletions = { ...completions, [exerciseId]: newCount };
    
    setCompletions(updatedCompletions);

    const { error } = await supabase
      .from('patient_week_progress')
      .update({ exercise_completions: updatedCompletions })
      .eq('patient_id', patientId)
      .eq('week_id', weekId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save completion. Please try again.",
      });
      setCompletions(completions);
    } else {
      if (newCount === exercise.completion_target) {
        toast({
          title: "Exercise completed! 🎉",
          description: `You've finished all ${exercise.completion_target} sessions of ${exercise.title}`,
        });
      }
      onUpdate?.();
    }
  };

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => {
        const currentCount = completions[exercise.id] || 0;
        const target = exercise.completion_target;
        const percentage = target > 0 ? (currentCount / target) * 100 : 0;
        const isComplete = currentCount >= target;

        return (
          <Card key={exercise.id} className={isComplete ? "border-success" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    {exercise.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {exercise.frequency && exercise.duration && (
                      <span>{exercise.duration} • {exercise.frequency}</span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleIncrement(exercise.id)}
                  disabled={isComplete}
                >
                  Mark Done
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {currentCount} / {target} sessions
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
