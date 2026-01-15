import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Save, Search, Filter, Video, Image, FileText, Check, X, ChevronDown, ExternalLink, Upload } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ExerciseType = Database["public"]["Enums"]["exercise_type"];

interface ExerciseWithWeek {
  id: string;
  title: string;
  type: ExerciseType;
  instructions: string | null;
  props: string | null;
  compensations: string | null;
  demo_video_url: string | null;
  modified_video_url: string | null;
  video_required: boolean;
  duration: string | null;
  frequency: string | null;
  completion_target: number | null;
  week_id: string | null;
  week_number: number;
  week_title: string | null;
}

interface ExerciseUpdate {
  instructions?: string | null;
  props?: string | null;
  compensations?: string | null;
  demo_video_url?: string | null;
  modified_video_url?: string | null;
  video_required?: boolean;
  duration?: string | null;
  frequency?: string | null;
}

export default function ExerciseContentEditor() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [weekFilter, setWeekFilter] = useState<string>("all");
  const [pendingChanges, setPendingChanges] = useState<Record<string, ExerciseUpdate>>({});
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Fetch all exercises with week info
  const { data: exercises, isLoading } = useQuery({
    queryKey: ["exercise-content-editor"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select(`
          id, title, type, instructions, props, compensations,
          demo_video_url, modified_video_url, video_required,
          duration, frequency, completion_target, week_id,
          weeks!inner(number, title)
        `)
        .order("title");
      
      if (error) throw error;
      
      return data.map((ex: any) => ({
        ...ex,
        week_number: ex.weeks?.number,
        week_title: ex.weeks?.title,
      })) as ExerciseWithWeek[];
    },
  });

  // Get unique weeks for filter
  const weeks = exercises
    ? [...new Set(exercises.map(e => e.week_number))].sort((a, b) => a - b)
    : [];

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: { id: string; changes: ExerciseUpdate }[]) => {
      for (const { id, changes } of updates) {
        const { error } = await supabase
          .from("exercises")
          .update(changes)
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercise-content-editor"] });
      setPendingChanges({});
      toast.success("Changes saved successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleChange = (exerciseId: string, field: keyof ExerciseUpdate, value: any) => {
    setPendingChanges((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], [field]: value },
    }));
  };

  const getStringValue = (exercise: ExerciseWithWeek, field: 'instructions' | 'props' | 'compensations' | 'demo_video_url' | 'modified_video_url' | 'duration' | 'frequency'): string => {
    const value = pendingChanges[exercise.id]?.[field] ?? exercise[field];
    return (value as string) || "";
  };

  const getBoolValue = (exercise: ExerciseWithWeek, field: 'video_required'): boolean => {
    const value = pendingChanges[exercise.id]?.[field] ?? exercise[field];
    return Boolean(value);
  };

  const saveChanges = () => {
    const updates = Object.entries(pendingChanges).map(([id, changes]) => ({ id, changes }));
    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }
    updateMutation.mutate(updates);
  };

  const discardChanges = () => {
    setPendingChanges({});
    toast.info("Changes discarded");
  };

  // Filter exercises
  const filteredExercises = exercises?.filter((ex) => {
    const matchesSearch = searchTerm === "" || 
      ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.instructions?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = weekFilter === "all" || ex.week_number === parseInt(weekFilter);
    return matchesSearch && matchesWeek;
  });

  // Group by week
  const groupedExercises = filteredExercises?.reduce((acc, ex) => {
    const weekKey = `Week ${ex.week_number}`;
    if (!acc[weekKey]) acc[weekKey] = [];
    acc[weekKey].push(ex);
    return acc;
  }, {} as Record<string, ExerciseWithWeek[]>);

  const changesCount = Object.keys(pendingChanges).length;

  if (isLoading) {
    return (
      <AdminLayout title="Exercise Content Editor" description="Edit exercise videos, instructions, and settings">
        <div className="text-center py-12">Loading exercises...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Exercise Content Editor" description="Edit exercise videos, instructions, and settings">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={weekFilter} onValueChange={setWeekFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {weeks.map((w) => (
                  <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            {changesCount > 0 && (
              <Button variant="outline" onClick={discardChanges}>
                <X className="h-4 w-4 mr-2" /> Discard
              </Button>
            )}
            <Button onClick={saveChanges} disabled={changesCount === 0}>
              <Save className="h-4 w-4 mr-2" /> Save ({changesCount})
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{exercises?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Exercises</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">
                {exercises?.filter(e => e.demo_video_url).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">With Demo Video</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">
                {exercises?.filter(e => e.modified_video_url).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">With Modified Video</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-purple-600">
                {exercises?.filter(e => e.video_required).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Video Required</p>
            </CardContent>
          </Card>
        </div>

        {/* Exercise List grouped by week */}
        <div className="space-y-4">
          {groupedExercises && Object.entries(groupedExercises).sort(([a], [b]) => {
            const weekA = parseInt(a.replace("Week ", ""));
            const weekB = parseInt(b.replace("Week ", ""));
            return weekA - weekB;
          }).map(([weekLabel, weekExercises]) => (
            <Card key={weekLabel}>
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {weekLabel}
                  <Badge variant="secondary" className="ml-2">{weekExercises.length} exercises</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="single" collapsible value={expandedExercise || undefined} onValueChange={(v) => setExpandedExercise(v || null)}>
                  {weekExercises.map((exercise) => {
                    const hasChanges = !!pendingChanges[exercise.id];
                    return (
                      <AccordionItem key={exercise.id} value={exercise.id} className={hasChanges ? "border-primary/50" : ""}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left flex-1">
                            <span className="font-medium">{exercise.title}</span>
                            <Badge variant="outline" className="text-xs">{exercise.type}</Badge>
                            {exercise.demo_video_url && (
                              <Video className="h-4 w-4 text-green-600" />
                            )}
                            {exercise.modified_video_url && (
                              <Video className="h-4 w-4 text-blue-600" />
                            )}
                            {hasChanges && (
                              <Badge className="bg-primary text-primary-foreground text-xs">Modified</Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-6 pt-4">
                            {/* Video URLs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Video className="h-4 w-4 text-green-600" />
                                  Demo Video URL
                                </Label>
                                <Input
                                  placeholder="https://... or /public/videos/..."
                                  value={getStringValue(exercise, "demo_video_url")}
                                  onChange={(e) => handleChange(exercise.id, "demo_video_url", e.target.value || null)}
                                />
                                {exercise.demo_video_url && (
                                  <a 
                                    href={exercise.demo_video_url.startsWith("http") ? exercise.demo_video_url : exercise.demo_video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" /> Preview current
                                  </a>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <Video className="h-4 w-4 text-blue-600" />
                                  Modified Video URL
                                </Label>
                                <Input
                                  placeholder="https://... or /public/videos/..."
                                  value={getStringValue(exercise, "modified_video_url")}
                                  onChange={(e) => handleChange(exercise.id, "modified_video_url", e.target.value || null)}
                                />
                                {exercise.modified_video_url && (
                                  <a 
                                    href={exercise.modified_video_url.startsWith("http") ? exercise.modified_video_url : exercise.modified_video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" /> Preview current
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Instructions */}
                            <div className="space-y-2">
                              <Label>Instructions</Label>
                              <Textarea
                                placeholder="Exercise instructions..."
                                rows={4}
                                value={getStringValue(exercise, "instructions")}
                                onChange={(e) => handleChange(exercise.id, "instructions", e.target.value || null)}
                              />
                            </div>

                            {/* Props & Compensations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Props</Label>
                                <Textarea
                                  placeholder="Required props..."
                                  rows={2}
                                  value={getStringValue(exercise, "props")}
                                  onChange={(e) => handleChange(exercise.id, "props", e.target.value || null)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Compensations</Label>
                                <Textarea
                                  placeholder="Things to watch out for..."
                                  rows={2}
                                  value={getStringValue(exercise, "compensations")}
                                  onChange={(e) => handleChange(exercise.id, "compensations", e.target.value || null)}
                                />
                              </div>
                            </div>

                            {/* Duration & Frequency */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Duration</Label>
                                <Input
                                  placeholder="e.g., 2 minutes"
                                  value={getStringValue(exercise, "duration")}
                                  onChange={(e) => handleChange(exercise.id, "duration", e.target.value || null)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Frequency</Label>
                                <Input
                                  placeholder="e.g., 2x/day"
                                  value={getStringValue(exercise, "frequency")}
                                  onChange={(e) => handleChange(exercise.id, "frequency", e.target.value || null)}
                                />
                              </div>
                              <div className="flex items-center gap-3 pt-6">
                                <Switch
                                  checked={getBoolValue(exercise, "video_required")}
                                  onCheckedChange={(checked) => handleChange(exercise.id, "video_required", checked)}
                                />
                                <Label className="cursor-pointer">Video Required</Label>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No exercises found matching your search
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
