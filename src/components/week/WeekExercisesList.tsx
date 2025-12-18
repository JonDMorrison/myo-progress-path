import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";
import { ResponsiveVideo } from "./ResponsiveVideo";
import { ExerciseVideoUpload } from "./ExerciseVideoUpload";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

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

// Check if exercise is an elastic hold type that should show "The Spot" reference
const isElasticHoldExercise = (title: string): boolean => {
  const lowerTitle = title.toLowerCase();
  return lowerTitle.includes('elastic') && lowerTitle.includes('hold');
};

export function WeekExercisesList({ 
  exercises,
  patientId,
  weekId,
  existingCompletions = {},
  onUpdate
}: WeekExercisesListProps) {
  const [completions, setCompletions] = useState<Record<string, number>>(existingCompletions);

  useEffect(() => {
    setCompletions(existingCompletions);
  }, [existingCompletions]);

  const handleMarkDone = async (exerciseId: string, target: number) => {
    if (!patientId || !weekId) return;

    const currentCount = completions[exerciseId] || 0;
    if (currentCount >= target) return;

    // Complete in one click
    const updatedCompletions = { ...completions, [exerciseId]: target };
    
    setCompletions(updatedCompletions);

    const { error } = await supabase
      .from('patient_week_progress')
      .update({ exercise_completions: updatedCompletions })
      .eq('patient_id', patientId)
      .eq('week_id', weekId);

    if (error) {
      console.error('Error saving exercise completion:', error);
      setCompletions(completions);
    } else {
      onUpdate?.();
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No exercises for this week
      </div>
    );
  }

  const hasActiveExercises = exercises.some(e => e.type === 'active');

  // Render media section with tabbed videos when modified_video_url exists
  const renderMedia = (exercise: any) => {
    const hasImage = isImageUrl(exercise.demo_video_url);
    const hasModifiedVideo = exercise.modified_video_url && !isImageUrl(exercise.modified_video_url);
    const showSpotReference = isElasticHoldExercise(exercise.title);

    // If we have both regular and modified videos, show tabbed interface
    if (!hasImage && exercise.demo_video_url && hasModifiedVideo) {
      return (
        <div className="space-y-4">
          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular">Regular</TabsTrigger>
              <TabsTrigger value="modified">Modified (with bite block)</TabsTrigger>
            </TabsList>
            <TabsContent value="regular" className="mt-3">
              <ResponsiveVideo 
                src={exercise.demo_video_url} 
                title={`${exercise.title} demonstration`}
                portrait={true}
              />
            </TabsContent>
            <TabsContent value="modified" className="mt-3">
              <ResponsiveVideo 
                src={exercise.modified_video_url} 
                title={`${exercise.title} modified demonstration`}
                portrait={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      );
    }

    // If it's an image (e.g., elastic hold photo)
    if (hasImage) {
      return (
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden">
            <img 
              src={exercise.demo_video_url} 
              alt={`${exercise.title} demonstration`}
              className="w-full object-contain"
            />
          </div>
          {/* Show "The Spot" reference for elastic hold exercises */}
          {showSpotReference && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">Reference: The Spot (incisive papilla)</p>
              <img 
                src="/images/learn/the-spot.jpg" 
                alt="The Spot - incisive papilla location"
                className="w-full object-contain rounded"
              />
            </div>
          )}
        </div>
      );
    }

    // Regular video without modified version
    if (exercise.demo_video_url) {
      return (
        <ResponsiveVideo 
          src={exercise.demo_video_url} 
          title={`${exercise.title} demonstration`}
          portrait={true}
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {hasActiveExercises && (
        <Alert className="border-primary/20 bg-primary/5">
          <AlertDescription className="flex items-center gap-2">
            <span className="text-lg">🪞</span>
            <span>
              <strong>Active exercises (🏃) require a mirror</strong> to ensure proper form and minimize compensations.
            </span>
          </AlertDescription>
        </Alert>
      )}
      <Accordion type="single" collapsible className="w-full space-y-2">
      {exercises.map((exercise, index) => {
        const mediaBadge = getMediaStatusBadge(exercise.media_status);
        const hasMedia = exercise.demo_video_url || exercise.modified_video_url;
        const target = Math.max(1, exercise.completion_target || 0);
        const currentCount = completions[exercise.id] || 0;
        const isComplete = currentCount >= target;
        const isActiveExercise = exercise.type === 'active';
        
        return (
          <AccordionItem
            key={exercise.id}
            value={`exercise-${index}`}
            className={`border rounded-lg px-4 ${isComplete ? 'border-success bg-success/5' : ''}`}
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left flex-1">
                <span className="text-2xl">{getExerciseIcon(exercise.type)}</span>
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    {exercise.title}
                    {isComplete && <CheckCircle2 className="h-4 w-4 text-success" />}
                  </h4>
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
              {hasMedia ? (
                /* 50/50 Grid Layout for exercises with media */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Text Content */}
                  <div className="space-y-4 order-2 md:order-1">
                    {exercise.instructions && (
                      <div>
                        <h5 className="font-medium mb-2">Instructions</h5>
                        <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground prose-p:my-1">
                          <ReactMarkdown>{exercise.instructions}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {exercise.props && (
                      <div>
                        <h5 className="font-medium mb-2">Props Needed</h5>
                        <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground">
                          <ReactMarkdown>{exercise.props}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {exercise.duration && (
                      <div>
                        <h5 className="font-medium mb-2">Duration</h5>
                        <p className="text-sm text-muted-foreground">{exercise.duration}</p>
                      </div>
                    )}

                    {exercise.compensations && (
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                        <h5 className="font-medium text-warning mb-2">Watch Out For</h5>
                        <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground">
                          <ReactMarkdown>{exercise.compensations}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Media */}
                  <div className="order-1 md:order-2">
                    {renderMedia(exercise)}
                  </div>
                </div>
              ) : (
                /* Stacked layout for exercises without media */
                <div className="space-y-4">
                  {exercise.instructions && (
                    <div>
                      <h5 className="font-medium mb-2">Instructions</h5>
                      <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground prose-p:my-1">
                        <ReactMarkdown>{exercise.instructions}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {exercise.props && (
                    <div>
                      <h5 className="font-medium mb-2">Props Needed</h5>
                      <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground">
                        <ReactMarkdown>{exercise.props}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {exercise.duration && (
                    <div>
                      <h5 className="font-medium mb-2">Duration</h5>
                      <p className="text-sm text-muted-foreground">{exercise.duration}</p>
                    </div>
                  )}

                  {exercise.compensations && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                      <h5 className="font-medium text-warning mb-2">Watch Out For</h5>
                      <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground">
                        <ReactMarkdown>{exercise.compensations}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Per-Exercise Video Upload for Active Exercises */}
              {isActiveExercise && patientId && weekId && (
                <ExerciseVideoUpload
                  patientId={patientId}
                  weekId={weekId}
                  exerciseId={exercise.id}
                  exerciseTitle={exercise.title}
                  onUploadComplete={onUpdate}
                />
              )}

              {/* Mark Done Button - inline */}
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {currentCount} of {target} completed
                </span>
                <Button
                  size="sm"
                  onClick={() => handleMarkDone(exercise.id, target)}
                  disabled={isComplete}
                  variant={isComplete ? "outline" : "default"}
                >
                  {isComplete ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </span>
                  ) : (
                    "Mark Done"
                  )}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
      </Accordion>
    </div>
  );
}
