import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ResponsiveVideo } from "./ResponsiveVideo";
import { ExerciseCompletionTracker } from "./ExerciseCompletionTracker";

interface WeekExercisesListProps {
  exercises: any[];
  patientId: string;
  weekId: string;
  existingCompletions?: Record<string, number>;
  onUpdate?: () => void;
}

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

export function WeekExercisesList({ 
  exercises,
  patientId,
  weekId,
  existingCompletions,
  onUpdate
}: WeekExercisesListProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No exercises for this week
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {exercises.map((exercise, index) => (
        <AccordionItem
          key={exercise.id}
          value={`exercise-${index}`}
          className="border rounded-lg px-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <span className="text-2xl">{getExerciseIcon(exercise.type)}</span>
              <div className="flex-1">
                <h4 className="font-semibold">{exercise.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {exercise.type}
                  </Badge>
                  {exercise.frequency && (
                    <span className="text-xs text-muted-foreground">
                      {exercise.frequency}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {/* Demo Video */}
            {exercise.demo_video_url && (
              <ResponsiveVideo 
                src={exercise.demo_video_url} 
                title={`${exercise.title} demonstration`} 
              />
            )}

            {/* Instructions */}
            {exercise.instructions && (
              <div>
                <h5 className="font-medium mb-2">Instructions</h5>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {exercise.instructions}
                </p>
              </div>
            )}

            {/* Props */}
            {exercise.props && (
              <div>
                <h5 className="font-medium mb-2">Props Needed</h5>
                <p className="text-sm text-muted-foreground">{exercise.props}</p>
              </div>
            )}

            {/* Duration */}
            {exercise.duration && (
              <div>
                <h5 className="font-medium mb-2">Duration</h5>
                <p className="text-sm text-muted-foreground">{exercise.duration}</p>
              </div>
            )}

            {/* Compensations */}
            {exercise.compensations && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <h5 className="font-medium text-warning mb-2">Watch Out For</h5>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {exercise.compensations}
                </p>
              </div>
            )}

            {/* Completion Tracker */}
            <ExerciseCompletionTracker
              patientId={patientId}
              weekId={weekId}
              exercises={[exercise]}
              existingCompletions={existingCompletions}
              onUpdate={onUpdate}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
