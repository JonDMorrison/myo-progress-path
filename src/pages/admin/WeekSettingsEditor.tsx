import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Save, X, Video, Target, BookOpen, Clock, Check } from "lucide-react";

interface Week {
  id: string;
  number: number;
  title: string | null;
  introduction: string | null;
  overview: string | null;
  objectives: string[] | null;
  video_title: string | null;
  video_url: string | null;
  requires_bolt: boolean | null;
  requires_video_first: boolean | null;
  requires_video_last: boolean | null;
  notes: string | null;
  program_id: string | null;
}

interface WeekUpdate {
  title?: string | null;
  introduction?: string | null;
  overview?: string | null;
  objectives?: string[] | null;
  video_title?: string | null;
  video_url?: string | null;
  requires_bolt?: boolean | null;
  requires_video_first?: boolean | null;
  requires_video_last?: boolean | null;
  notes?: string | null;
}

export default function WeekSettingsEditor() {
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState<Record<string, WeekUpdate>>({});
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  // Fetch all weeks
  const { data: weeks, isLoading } = useQuery({
    queryKey: ["week-settings-editor"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weeks")
        .select("*")
        .not("program_id", "is", null)
        .order("number");
      
      if (error) throw error;
      return data as Week[];
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: { id: string; changes: WeekUpdate }[]) => {
      for (const { id, changes } of updates) {
        const { error } = await supabase
          .from("weeks")
          .update(changes)
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week-settings-editor"] });
      setPendingChanges({});
      toast.success("Week settings saved");
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleChange = (weekId: string, field: keyof WeekUpdate, value: any) => {
    setPendingChanges((prev) => ({
      ...prev,
      [weekId]: { ...prev[weekId], [field]: value },
    }));
  };

  const getStringValue = (week: Week, field: 'title' | 'introduction' | 'overview' | 'video_title' | 'video_url' | 'notes'): string => {
    const value = pendingChanges[week.id]?.[field] ?? week[field];
    return (value as string) || "";
  };

  const getBoolValue = (week: Week, field: 'requires_bolt' | 'requires_video_first' | 'requires_video_last'): boolean => {
    const value = pendingChanges[week.id]?.[field] ?? week[field];
    return Boolean(value);
  };

  const handleObjectivesChange = (weekId: string, value: string) => {
    // Split by newlines, filter empty
    const objectives = value.split("\n").filter(o => o.trim());
    handleChange(weekId, "objectives", objectives.length > 0 ? objectives : null);
  };

  const getObjectivesString = (week: Week) => {
    const objectives = pendingChanges[week.id]?.objectives ?? week.objectives;
    return objectives?.join("\n") || "";
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

  // Quick action to enable BOLT on specific weeks
  const enableBoltOnWeeks = (weekNumbers: number[]) => {
    weeks?.forEach(week => {
      if (weekNumbers.includes(week.number)) {
        handleChange(week.id, "requires_bolt", true);
      }
    });
    toast.info(`BOLT enabled for weeks ${weekNumbers.join(", ")} - click Save to apply`);
  };

  const changesCount = Object.keys(pendingChanges).length;

  if (isLoading) {
    return (
      <AdminLayout title="Week Settings" description="Edit week configurations and requirements">
        <div className="text-center py-12">Loading modules...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Week Settings" description="Edit week configurations and requirements">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Configure week-level settings including BOLT requirements, videos, and objectives
            </p>
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

        {/* Quick Actions */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Batch update settings across multiple weeks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => enableBoltOnWeeks([1, 2])}>
                Enable BOLT for Week 1/2
              </Button>
              <Button variant="outline" size="sm" onClick={() => enableBoltOnWeeks([13, 14])}>
                Enable BOLT for Week 13/14
              </Button>
              <Button variant="outline" size="sm" onClick={() => enableBoltOnWeeks([23, 24])}>
                Enable BOLT for Week 23/24
              </Button>
              <Button variant="outline" size="sm" onClick={() => enableBoltOnWeeks([1, 2, 13, 14, 23, 24])}>
                Enable BOLT for All Key Weeks
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{weeks?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Weeks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-600">
                {weeks?.filter(w => w.requires_bolt).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Require BOLT</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-blue-600">
                {weeks?.filter(w => w.video_url).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">With Week Video</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-purple-600">
                {weeks?.filter(w => w.requires_video_first || w.requires_video_last).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Video First/Last</p>
            </CardContent>
          </Card>
        </div>

        {/* Week List */}
        <Card>
          <CardContent className="pt-4">
            <Accordion type="single" collapsible value={expandedWeek || undefined} onValueChange={(v) => setExpandedWeek(v || null)}>
              {weeks?.map((week) => {
                const hasChanges = !!pendingChanges[week.id];
                const requiresBolt = getBoolValue(week, "requires_bolt");
                
                return (
                  <AccordionItem key={week.id} value={week.id} className={hasChanges ? "border-primary/50" : ""}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left flex-1">
                        <span className="font-medium">Week {week.number}</span>
                        {week.title && (
                          <span className="text-muted-foreground text-sm truncate max-w-[200px]">
                            {week.title}
                          </span>
                        )}
                        <div className="flex gap-1 ml-auto mr-4">
                          {requiresBolt && (
                            <Badge variant="secondary" className="text-xs">BOLT</Badge>
                          )}
                          {week.video_url && (
                            <Video className="h-4 w-4 text-blue-600" />
                          )}
                          {hasChanges && (
                            <Badge className="bg-primary text-primary-foreground text-xs">Modified</Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 pt-4">
                        {/* Title & Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Week Title</Label>
                            <Input
                              placeholder="e.g., Nasal Breathing Foundations"
                              value={getStringValue(week, "title")}
                              onChange={(e) => handleChange(week.id, "title", e.target.value || null)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Overview (Short)</Label>
                            <Input
                              placeholder="Brief overview of week focus"
                              value={getStringValue(week, "overview")}
                              onChange={(e) => handleChange(week.id, "overview", e.target.value || null)}
                            />
                          </div>
                        </div>

                        {/* Introduction */}
                        <div className="space-y-2">
                          <Label>Introduction</Label>
                          <Textarea
                            placeholder="Detailed week introduction..."
                            rows={3}
                            value={getStringValue(week, "introduction")}
                            onChange={(e) => handleChange(week.id, "introduction", e.target.value || null)}
                          />
                        </div>

                        {/* Objectives */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Learning Objectives (one per line)
                          </Label>
                          <Textarea
                            placeholder="Establish nasal breathing habit&#10;Complete daily BOLT test&#10;Practice tongue posture"
                            rows={4}
                            value={getObjectivesString(week)}
                            onChange={(e) => handleObjectivesChange(week.id, e.target.value)}
                          />
                        </div>

                        {/* Week Video */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Week Video URL
                            </Label>
                            <Input
                              placeholder="https://..."
                              value={getStringValue(week, "video_url")}
                              onChange={(e) => handleChange(week.id, "video_url", e.target.value || null)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Video Title</Label>
                            <Input
                              placeholder="e.g., Week 1 Introduction"
                              value={getStringValue(week, "video_title")}
                              onChange={(e) => handleChange(week.id, "video_title", e.target.value || null)}
                            />
                          </div>
                        </div>

                        {/* Requirements */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-muted/50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={getBoolValue(week, "requires_bolt")}
                              onCheckedChange={(checked) => handleChange(week.id, "requires_bolt", checked)}
                            />
                            <Label className="cursor-pointer">Requires BOLT Test</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={getBoolValue(week, "requires_video_first")}
                              onCheckedChange={(checked) => handleChange(week.id, "requires_video_first", checked)}
                            />
                            <Label className="cursor-pointer">Video First</Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={getBoolValue(week, "requires_video_last")}
                              onCheckedChange={(checked) => handleChange(week.id, "requires_video_last", checked)}
                            />
                            <Label className="cursor-pointer">Video Last</Label>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Admin Notes
                          </Label>
                          <Textarea
                            placeholder="Internal notes about this week..."
                            rows={2}
                            value={getStringValue(week, "notes")}
                            onChange={(e) => handleChange(week.id, "notes", e.target.value || null)}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
