import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, ChevronDown, ChevronUp, Play, Dumbbell } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { getModuleInfo } from "@/lib/moduleUtils";
import { getProgramTitle } from "@/lib/constants";

interface Exercise {
  id: string;
  title: string;
  instructions: string | null;
  demo_video_url: string | null;
  modified_video_url: string | null;
  type: string;
  frequency: string | null;
  duration: string | null;
}

interface WeekWithExercises {
  weekNumber: number;
  weekId: string;
  weekTitle: string | null;
  exercises: Exercise[];
}

interface PreviousWeeksReviewProps {
  patientId: string;
  currentWeekNumber: number;
  programVariant: string;
}

export function PreviousWeeksReview({ 
  patientId, 
  currentWeekNumber, 
  programVariant 
}: PreviousWeeksReviewProps) {
  const [previousWeeks, setPreviousWeeks] = useState<WeekWithExercises[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Show for any week that has at least one previous week to review
  const shouldShow = currentWeekNumber >= 3; // Available from Week 3 onwards (can review Module 1)

  useEffect(() => {
    if (shouldShow) {
      loadPreviousWeeks();
    }
  }, [patientId, currentWeekNumber, programVariant, shouldShow]);

  const loadPreviousWeeks = async () => {
    try {
      // Determine program title based on variant
      const programTitle = getProgramTitle(programVariant);

      // Get all previous weeks (up to current week - 2, to show completed modules)
      const maxWeekToShow = currentWeekNumber - 2; // Show weeks from completed modules only
      
      const { data: weeksData, error: weeksError } = await supabase
        .from("weeks")
        .select(`
          id,
          number,
          title,
          programs!inner(title),
          exercises(
            id,
            title,
            instructions,
            demo_video_url,
            modified_video_url,
            type,
            frequency,
            duration
          )
        `)
        .eq("programs.title", programTitle)
        .lte("number", maxWeekToShow)
        .gte("number", 1)
        .order("number", { ascending: true });

      if (weeksError) throw weeksError;

      const formattedWeeks: WeekWithExercises[] = (weeksData || [])
        .filter(week => week.exercises && week.exercises.length > 0)
        .map(week => ({
          weekNumber: week.number,
          weekId: week.id,
          weekTitle: week.title,
          exercises: week.exercises as Exercise[]
        }));

      setPreviousWeeks(formattedWeeks);
      
      // Auto-select the most recent week
      if (formattedWeeks.length > 0) {
        setSelectedWeek(formattedWeeks[formattedWeeks.length - 1].weekId);
      }
    } catch (error) {
      console.error("Error loading previous weeks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!shouldShow) return null;

  const selectedWeekData = previousWeeks.find(w => w.weekId === selectedWeek);

  const getExerciseTypeIcon = (type: string) => {
    switch (type) {
      case "active": return "🎯";
      case "passive": return "🧘";
      case "breathing": return "💨";
      case "posture": return "🧍";
      default: return "📋";
    }
  };

  const getWeekLabel = (weekNumber: number) => {
    const moduleInfo = getModuleInfo(weekNumber, programVariant);
    if (moduleInfo.isWeekly) {
      // Post-op days/weeks
      return moduleInfo.displayLabel;
    }
    return moduleInfo.moduleLabel;
  };

  return (
    <Card className="rounded-xl sm:rounded-2xl border shadow-sm border-primary/20 bg-primary/5">
      <CardHeader 
        className="p-4 sm:p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Review Previous Exercises</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Practice exercises from earlier modules (read-only)
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="p-1">
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : previousWeeks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No previous exercises found.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Week Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Select a module to review:
                </label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a week..." />
                  </SelectTrigger>
                  <SelectContent>
                    {previousWeeks.map((week) => (
                      <SelectItem key={week.weekId} value={week.weekId}>
                        {getWeekLabel(week.weekNumber)}
                        {week.weekTitle && ` - ${week.weekTitle}`}
                        <span className="text-muted-foreground ml-2">
                          ({week.exercises.length} exercises)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Exercises List */}
              {selectedWeekData && (
                <div className="border rounded-lg bg-background">
                  <div className="p-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {getWeekLabel(selectedWeekData.weekNumber)} Exercises
                      </span>
                      <Badge variant="secondary" className="ml-auto">
                        {selectedWeekData.exercises.length} exercises
                      </Badge>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    {selectedWeekData.exercises.map((exercise) => (
                      <AccordionItem key={exercise.id} value={exercise.id}>
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center gap-3 text-left">
                            <span className="text-lg">
                              {getExerciseTypeIcon(exercise.type)}
                            </span>
                            <div>
                              <p className="font-medium text-sm">
                                {exercise.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-xs capitalize">
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
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4 pl-8">
                            {/* Instructions */}
                            {exercise.instructions && (
                              <div className="prose prose-sm max-w-none text-muted-foreground">
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                  {exercise.instructions}
                                </ReactMarkdown>
                              </div>
                            )}

                            {/* Duration */}
                            {exercise.duration && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Duration:</strong> {exercise.duration}
                              </p>
                            )}

                            {/* Demo Video */}
                            {exercise.demo_video_url && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium flex items-center gap-2">
                                  <Play className="h-4 w-4" />
                                  Demo Video
                                </p>
                                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                                  {exercise.demo_video_url.includes("vimeo") ? (
                                    <iframe
                                      src={exercise.demo_video_url.replace(
                                        "vimeo.com/",
                                        "player.vimeo.com/video/"
                                      )}
                                      className="w-full h-full"
                                      allow="autoplay; fullscreen; picture-in-picture"
                                      allowFullScreen
                                    />
                                  ) : exercise.demo_video_url.includes("youtube") ||
                                    exercise.demo_video_url.includes("youtu.be") ? (
                                    <iframe
                                      src={exercise.demo_video_url
                                        .replace("watch?v=", "embed/")
                                        .replace("youtu.be/", "youtube.com/embed/")}
                                      className="w-full h-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <video
                                      src={exercise.demo_video_url}
                                      controls
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Modified Video */}
                            {exercise.modified_video_url && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium flex items-center gap-2">
                                  <Play className="h-4 w-4" />
                                  Modified Version
                                </p>
                                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                                  {exercise.modified_video_url.includes("vimeo") ? (
                                    <iframe
                                      src={exercise.modified_video_url.replace(
                                        "vimeo.com/",
                                        "player.vimeo.com/video/"
                                      )}
                                      className="w-full h-full"
                                      allow="autoplay; fullscreen; picture-in-picture"
                                      allowFullScreen
                                    />
                                  ) : exercise.modified_video_url.includes("youtube") ||
                                    exercise.modified_video_url.includes("youtu.be") ? (
                                    <iframe
                                      src={exercise.modified_video_url
                                        .replace("watch?v=", "embed/")
                                        .replace("youtu.be/", "youtube.com/embed/")}
                                      className="w-full h-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <video
                                      src={exercise.modified_video_url}
                                      controls
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Guidance */}
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <p>
                  <strong>Tip:</strong> Use this section to practice exercises you found 
                  challenging earlier in the program. Focus on proper form and technique.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
