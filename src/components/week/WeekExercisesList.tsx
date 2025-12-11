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

const getMediaStatusBadge = (mediaStatus: string | null) => {
  switch (mediaStatus) {
    case 'needs_ai_video':
      return { icon: "🎬", text: "Video Coming Soon", variant: "secondary" as const };
    case 'needs_photo':
      return { icon: "📷", text: "Photo Coming Soon", variant: "secondary" as const };
    case 'description_only':
      return { icon: "📝", text: "Text Instructions", variant: "outline" as const };
    case 'pending':
      return { icon: "⏳", text: "Media Pending", variant: "outline" as const };
    default:
      return null; // has_video or null - no badge needed
  }
};

const isImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
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
      {exercises.map((exercise, index) => {
        const mediaBadge = getMediaStatusBadge(exercise.media_status);
        const hasImage = isImageUrl(exercise.demo_video_url);
        
        return (
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
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {exercise.type}
                    </Badge>
                    {exercise.frequency && (
                      <span className="text-xs text-muted-foreground">
                        {exercise.frequency}
                      </span>
                    )}
                    {mediaBadge && (
                      <Badge variant={mediaBadge.variant} className="text-xs">
                        {mediaBadge.icon} {mediaBadge.text}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {exercise.demo_video_url ? (
                /* 50/50 Grid Layout for exercises with media */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Text Content */}
                  <div className="space-y-4 order-2 md:order-1">
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
                  </div>

                  {/* Right: Media */}
                  <div className="order-1 md:order-2">
                    {hasImage ? (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={exercise.demo_video_url} 
                          alt={`${exercise.title} demonstration`}
                          className="w-full object-contain"
                        />
                      </div>
                    ) : (
                      <ResponsiveVideo 
                        src={exercise.demo_video_url} 
                        title={`${exercise.title} demonstration`}
                        portrait={true}
                      />
                    )}
                  </div>
                </div>
              ) : (
                /* Stacked layout for exercises without media */
                <div className="space-y-4">
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
                </div>
              )}

              {/* Completion Tracker - always below */}
              <div className="mt-4">
                <ExerciseCompletionTracker
                  patientId={patientId}
                  weekId={weekId}
                  exercises={[exercise]}
                  existingCompletions={existingCompletions}
                  onUpdate={onUpdate}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
