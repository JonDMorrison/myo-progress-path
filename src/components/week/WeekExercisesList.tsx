import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertTriangle } from "lucide-react";
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
  readOnly?: boolean;
  showVideoUpload?: boolean;
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
      return null;
  }
};

const normalizeProps = (props: unknown): string => {
  if (Array.isArray(props)) {
    const cleaned = props.map(String).map(p => p.trim()).filter(Boolean);
    return cleaned.length > 0 ? cleaned.join(', ') : 'None';
  }
  if (typeof props === 'string' && props.trim().length > 0) return props.trim();
  return 'None';
};

const isImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

const hasMultipleImages = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.includes(',') && url.split(',').every(u => isImageUrl(u.trim()));
};

const isElasticHoldExercise = (title: string): boolean => {
  const lowerTitle = title.toLowerCase();
  return lowerTitle.includes('elastic') && lowerTitle.includes('hold');
};

const isClinicianReviewPlaceholder = (title: string): boolean => {
  return title === 'Clinician Review Required';
};

export function WeekExercisesList({
  exercises,
  patientId,
  weekId,
  existingCompletions = {},
  onUpdate,
  readOnly = false,
  showVideoUpload = true
}: WeekExercisesListProps) {
  const [completions, setCompletions] = useState<Record<string, number>>(existingCompletions);

  useEffect(() => {
    setCompletions(existingCompletions);
  }, [existingCompletions]);

  const handleMarkDone = async (exerciseId: string, target: number) => {
    if (!patientId || !weekId || readOnly) return;

    const currentCount = completions[exerciseId] || 0;
    if (currentCount >= target) return;

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
    return <div className="text-center py-8 text-muted-foreground">No exercises for this module</div>;
  }

  const hasActiveExercises = exercises.some(e => e.type === 'active');
  const hasClinicianReviewPlaceholder = exercises.some(e => isClinicianReviewPlaceholder(e.title));

  const renderClinicianReviewCard = (exercise: any) => (
    <Card key={exercise.id} className="border-warning bg-warning/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <CardTitle className="text-base font-semibold text-warning">{exercise.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground">
          <ReactMarkdown>{exercise.instructions}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );

  const renderMedia = (exercise: any) => {
    const hasImage = isImageUrl(exercise.demo_video_url);
    const hasMultiImages = hasMultipleImages(exercise.demo_video_url);
    const hasModifiedVideo = exercise.modified_video_url && !isImageUrl(exercise.modified_video_url);

    if (!hasImage && !hasMultiImages && exercise.demo_video_url && hasModifiedVideo) {
      return (
        <div className="space-y-4">
          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular">Regular</TabsTrigger>
              <TabsTrigger value="modified">Modified (with bite block)</TabsTrigger>
            </TabsList>
            <TabsContent value="regular" className="mt-3">
              <ResponsiveVideo src={exercise.demo_video_url} title={`${exercise.title} demonstration`} portrait={true} />
            </TabsContent>
            <TabsContent value="modified" className="mt-3">
              <ResponsiveVideo src={exercise.modified_video_url} title={`${exercise.title} modified demonstration`} portrait={true} />
            </TabsContent>
          </Tabs>
        </div>
      );
    }

    if (hasMultiImages) {
      const imageUrls = exercise.demo_video_url.split(',').map((url: string) => url.trim());
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {imageUrls.map((url: string, idx: number) => (
              <div key={idx} className="rounded-lg overflow-hidden border">
                <img src={url} alt={`${exercise.title} demonstration ${idx + 1}`} className="w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (hasImage) {
      return (
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden">
            <img src={exercise.demo_video_url} alt={`${exercise.title} demonstration`} className="w-full object-contain" />
          </div>
        </div>
      );
    }

    if (exercise.demo_video_url) {
      return <ResponsiveVideo src={exercise.demo_video_url} title={`${exercise.title} demonstration`} portrait={true} />;
    }

    return null;
  };

  const renderPropsBlock = (exercise: any) => (
    <div>
      <h5 className="font-medium mb-2">Props Needed</h5>
      <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground">
        <ReactMarkdown>{normalizeProps(exercise.props)}</ReactMarkdown>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {hasClinicianReviewPlaceholder && (
        <Alert className="border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning font-medium">Awaiting clinician confirmation.</AlertDescription>
        </Alert>
      )}

      {hasActiveExercises && !hasClinicianReviewPlaceholder && (
        <Alert className="border-primary/20 bg-primary/5">
          <AlertDescription className="flex items-center gap-2">
            <span className="text-lg">🪞</span>
            <span><strong>Active exercises (🏃) require a mirror</strong> to ensure proper form and minimize compensations.</span>
          </AlertDescription>
        </Alert>
      )}

      {exercises.filter(e => isClinicianReviewPlaceholder(e.title)).map(exercise => renderClinicianReviewCard(exercise))}

      <Accordion type="single" collapsible className="w-full space-y-2" data-testid="exercises-accordion" data-scroll-lock="true">
        {exercises.filter(e => !isClinicianReviewPlaceholder(e.title)).map((exercise, index) => {
          const mediaBadge = getMediaStatusBadge(exercise.media_status);
          const hasMedia = exercise.demo_video_url || exercise.modified_video_url;
          const target = Math.max(1, exercise.completion_target || 0);
          const currentCount = completions[exercise.id] || 0;
          const isComplete = currentCount >= target;

          return (
            <AccordionItem key={exercise.id} value={`exercise-${index}`} className={`border rounded-lg px-4 ${isComplete ? 'border-success bg-success/5' : ''}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left flex-1">
                  <span className="text-2xl">{getExerciseIcon(exercise.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      {exercise.title}
                      {isComplete && <CheckCircle2 className="h-4 w-4 text-success" />}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{exercise.type}</Badge>
                      {exercise.frequency && <span className="text-xs text-muted-foreground">{exercise.frequency}</span>}
                      {mediaBadge && <Badge variant={mediaBadge.variant} className="text-xs">{mediaBadge.icon} {mediaBadge.text}</Badge>}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {hasMedia ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 order-2 md:order-1">
                      {exercise.instructions && (
                        <div>
                          <h5 className="font-medium mb-2">Instructions</h5>
                          <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground prose-p:my-1">
                            <ReactMarkdown>{exercise.instructions}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      {renderPropsBlock(exercise)}

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

                    <div className="order-1 md:order-2">{renderMedia(exercise)}</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exercise.instructions && (
                      <div>
                        <h5 className="font-medium mb-2">Instructions</h5>
                        <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-strong:font-semibold prose-strong:text-foreground prose-p:my-1">
                          <ReactMarkdown>{exercise.instructions}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {renderPropsBlock(exercise)}

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

                {showVideoUpload && exercise.type === 'active' && patientId && weekId && (
                  <ExerciseVideoUpload patientId={patientId} weekId={weekId} exerciseId={exercise.id} exerciseTitle={exercise.title} onUploadComplete={onUpdate} />
                )}

                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{currentCount} of {target} completed</span>
                  {readOnly ? (
                    <Badge variant={isComplete ? "default" : "secondary"} className={isComplete ? "bg-success" : ""}>{isComplete ? "Completed" : "Not completed"}</Badge>
                  ) : (
                    <Button size="sm" onClick={() => handleMarkDone(exercise.id, target)} disabled={isComplete} variant={isComplete ? "outline" : "default"}>
                      {isComplete ? <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" />Completed</span> : "Mark Done"}
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
