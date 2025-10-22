import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, HelpCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface Exercise {
  id: string;
  title: string;
  type: string;
  frequency: string | null;
  duration: string | null;
  completion_target: number;
  instructions: string | null;
  props: string | null;
  compensations: string | null;
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
    if (!patientId || !weekId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing patient or week information. Please refresh the page.",
      });
      return;
    }

    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const currentCount = completions[exerciseId] || 0;
    const target = Math.max(1, exercise.completion_target || 0);
    if (currentCount >= target) {
      toast({
        title: "Target reached",
        description: "You've completed all required sessions for this exercise!",
        duration: 2000,
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
      console.error('Error saving exercise completion:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save completion. Please try again.",
      });
      setCompletions(completions);
    } else {
      if (newCount === target) {
        toast({
          title: "Exercise completed! 🎉",
          description: `You've finished all ${target} sessions of ${exercise.title}`,
          duration: 2000,
        });
      }
      onUpdate?.();
    }
  };

  const getExerciseIcon = (type: string) => {
    const icons: Record<string, string> = {
      active: "🏃",
      passive: "🧘",
      breathing: "💨",
      posture: "🧍",
      test: "📊",
    };
    return icons[type] || "📝";
  };

  const getExerciseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      active: "Active Exercise",
      passive: "Passive Exercise",
      breathing: "Breathing Exercise",
      posture: "Posture Exercise",
      test: "Test",
    };
    return labels[type] || "Exercise";
  };

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => {
        const currentCount = completions[exercise.id] || 0;
        const target = Math.max(1, exercise.completion_target || 0);
        const isComplete = currentCount >= target;

        return (
          <Card key={exercise.id} className={isComplete ? "border-success" : ""}>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                {/* Exercise Icon */}
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xl">{getExerciseIcon(exercise.type)}</span>
                </div>

                {/* Exercise Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <CardTitle className="text-lg flex items-center gap-2 flex-1">
                      {exercise.title}
                      {(exercise.instructions || exercise.props || exercise.compensations) && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 flex-shrink-0">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <span className="text-xl">{getExerciseIcon(exercise.type)}</span>
                                {exercise.title}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              {exercise.instructions && (
                                <div className="rounded-lg bg-accent/50 p-4">
                                  <h4 className="font-semibold mb-2 text-sm">Instructions</h4>
                                  <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground">
                                    <ReactMarkdown>{exercise.instructions}</ReactMarkdown>
                                  </div>
                                </div>
                              )}
                              {exercise.props && (
                                <div>
                                  <h4 className="font-semibold mb-2 text-sm">Props Needed</h4>
                                  <p className="text-sm text-muted-foreground whitespace-pre-line">{exercise.props}</p>
                                </div>
                              )}
                              {exercise.compensations && (
                                <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                                  <h4 className="font-semibold text-warning flex items-center gap-2 mb-2 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    Watch for compensations
                                  </h4>
                                  <p className="text-sm whitespace-pre-line">{exercise.compensations}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardTitle>
                    {isComplete && (
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getExerciseTypeLabel(exercise.type)}
                    </Badge>
                    {exercise.frequency && exercise.duration && (
                      <CardDescription className="text-xs">
                        {exercise.duration} • {exercise.frequency}
                      </CardDescription>
                    )}
                  </div>
                </div>

                {/* Mark Done Button */}
                <Button
                  size="sm"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleIncrement(exercise.id);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleIncrement(exercise.id);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleIncrement(exercise.id);
                  }}
                  disabled={isComplete}
                  className="flex-shrink-0 pointer-events-auto cursor-pointer relative z-[2]"
                  type="button"
                >
                  Mark Done
                </Button>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
