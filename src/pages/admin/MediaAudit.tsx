import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Download, Save, Filter, CheckCircle2, AlertCircle, Video, Image, FileText, Clock, ExternalLink, Link2Off, Eye } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { AdminLayout } from "@/components/layout/AdminLayout";

type MediaStatus = Database["public"]["Enums"]["media_status"];

const MEDIA_STATUS_OPTIONS: { value: MediaStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "has_video", label: "Has Video", icon: <Video className="h-4 w-4" />, color: "bg-green-500/10 text-green-600" },
  { value: "needs_ai_video", label: "Needs AI Video", icon: <Video className="h-4 w-4" />, color: "bg-blue-500/10 text-blue-600" },
  { value: "needs_photo", label: "Needs Photo", icon: <Image className="h-4 w-4" />, color: "bg-purple-500/10 text-purple-600" },
  { value: "description_only", label: "Description Only", icon: <FileText className="h-4 w-4" />, color: "bg-gray-500/10 text-gray-600" },
  { value: "pending", label: "Pending Review", icon: <Clock className="h-4 w-4" />, color: "bg-yellow-500/10 text-yellow-600" },
];

interface Exercise {
  id: string;
  title: string;
  type: string;
  instructions: string | null;
  media_status: MediaStatus | null;
  media_waiting_on_clinician: boolean | null;
  requires_clinician_confirmation: boolean | null;
  media_approved: boolean | null;
  demo_video_url: string | null;
  admin_notes: string | null;
  week_id: string | null;
  week_number?: number;
}

export default function MediaAudit() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<MediaStatus | "all">("all");
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<Exercise>>>({});

  const { data: exercises, isLoading } = useQuery({
    queryKey: ["media-audit-exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select(`
          id, title, type, instructions, media_status, 
          media_waiting_on_clinician, requires_clinician_confirmation,
          media_approved, demo_video_url, admin_notes, week_id,
          weeks!inner(number)
        `)
        .order("title");
      
      if (error) throw error;
      return data.map((ex: any) => ({
        ...ex,
        week_number: ex.weeks?.number,
      })) as Exercise[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: { id: string; changes: Partial<Exercise> }[]) => {
      for (const { id, changes } of updates) {
        const { error } = await supabase
          .from("exercises")
          .update({
            media_status: changes.media_status,
            media_waiting_on_clinician: changes.media_waiting_on_clinician,
            requires_clinician_confirmation: changes.requires_clinician_confirmation,
            media_approved: changes.media_approved,
            admin_notes: changes.admin_notes,
          })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-audit-exercises"] });
      setPendingChanges({});
      toast.success("Changes saved successfully");
    },
    onError: () => {
      toast.error("Failed to save changes");
    },
  });

  const handleStatusChange = (exerciseId: string, status: MediaStatus) => {
    setPendingChanges((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], media_status: status },
    }));
  };

  const handleCheckboxChange = (exerciseId: string, field: "media_waiting_on_clinician" | "requires_clinician_confirmation" | "media_approved", value: boolean) => {
    setPendingChanges((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], [field]: value },
    }));
  };

  const handleApprovedToggle = async (exerciseId: string, value: boolean) => {
    const { error } = await supabase
      .from("exercises")
      .update({ media_approved: value })
      .eq("id", exerciseId);
    
    if (error) {
      toast.error("Failed to update approval status");
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ["media-audit-exercises"] });
    toast.success(value ? "Exercise approved" : "Approval removed");
  };

  const handleNotesChange = (exerciseId: string, notes: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], admin_notes: notes },
    }));
  };

  const saveAllChanges = () => {
    const updates = Object.entries(pendingChanges).map(([id, changes]) => ({ id, changes }));
    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }
    updateMutation.mutate(updates);
  };

  const exportCSV = () => {
    if (!exercises) return;
    const headers = ["Title", "Type", "Week", "Current Status", "Media URL", "Waiting on Clinician", "Requires Confirmation", "Admin Notes", "Instructions"];
    const rows = exercises.map((ex) => [
      ex.title,
      ex.type,
      ex.week_number || "N/A",
      ex.media_status || "pending",
      ex.demo_video_url || "",
      ex.media_waiting_on_clinician ? "Yes" : "No",
      ex.requires_clinician_confirmation ? "Yes" : "No",
      (ex.admin_notes || "").replace(/,/g, ";").replace(/\n/g, " "),
      (ex.instructions || "").replace(/,/g, ";").replace(/\n/g, " "),
    ]);
    
    const csv = [headers.join(","), ...rows.map((r) => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-audit-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMediaPreviewUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  const filteredExercises = exercises?.filter((ex) => 
    filter === "all" || ex.media_status === filter || (filter === "pending" && !ex.media_status)
  );

  const statusCounts = exercises?.reduce((acc, ex) => {
    const status = ex.media_status || "pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return (
      <AdminLayout title="Media Audit" description="Review and classify exercise media requirements">
        <div className="text-center py-12">Loading exercises...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Media Audit" description="Review and classify exercise media requirements">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={saveAllChanges} disabled={Object.keys(pendingChanges).length === 0}>
              <Save className="h-4 w-4 mr-2" /> Save Changes ({Object.keys(pendingChanges).length})
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MEDIA_STATUS_OPTIONS.map((opt) => (
            <Card 
              key={opt.value} 
              className={`cursor-pointer transition-all ${filter === opt.value ? "ring-2 ring-primary" : ""}`}
              onClick={() => setFilter(filter === opt.value ? "all" : opt.value)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${opt.color}`}>{opt.icon}</div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts[opt.value] || 0}</p>
                  <p className="text-xs text-muted-foreground">{opt.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => setFilter(v as MediaStatus | "all")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exercises ({exercises?.length})</SelectItem>
              {MEDIA_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} ({statusCounts[opt.value] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filter !== "all" && (
            <Button variant="ghost" size="sm" onClick={() => setFilter("all")}>
              Clear filter
            </Button>
          )}
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {filteredExercises?.map((exercise) => {
            const currentStatus = pendingChanges[exercise.id]?.media_status ?? exercise.media_status ?? "pending";
            const currentNotes = pendingChanges[exercise.id]?.admin_notes ?? exercise.admin_notes ?? "";
            const hasChanges = !!pendingChanges[exercise.id];
            const mediaUrl = getMediaPreviewUrl(exercise.demo_video_url);

            return (
              <Card key={exercise.id} className={`${hasChanges ? "ring-2 ring-primary/50" : ""}`}>
                <CardContent className="p-4 space-y-4">
                  {/* Top Row: Title, Type, Week, Link */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{exercise.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{exercise.type}</Badge>
                        <span className="text-xs text-muted-foreground">Week {exercise.week_number}</span>
                        {exercise.week_number && (
                          <Link 
                            to={`/week/${exercise.week_number}`}
                            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View in context
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Media URL Display */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Media Location</label>
                    {exercise.demo_video_url ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <code className="text-xs bg-background px-2 py-1 rounded border flex-1 truncate">
                          {exercise.demo_video_url}
                        </code>
                        {mediaUrl && (
                          <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs flex-shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Preview
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Link2Off className="h-4 w-4" />
                        <span className="text-xs">No media URL set</span>
                      </div>
                    )}
                  </div>

                  {/* Controls Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Media Status Selector */}
                    <div className="md:col-span-3">
                      <label className="text-xs text-muted-foreground mb-1 block">Media Status</label>
                      <Select value={currentStatus} onValueChange={(v) => handleStatusChange(exercise.id, v as MediaStatus)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDIA_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                {opt.icon}
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Checkboxes */}
                    <div className="md:col-span-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`approved-${exercise.id}`}
                          checked={exercise.media_approved ?? false}
                          onCheckedChange={(v) => handleApprovedToggle(exercise.id, !!v)}
                        />
                        <label htmlFor={`approved-${exercise.id}`} className="text-sm font-medium text-green-600">
                          ✓ Media Approved
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`waiting-${exercise.id}`}
                          checked={pendingChanges[exercise.id]?.media_waiting_on_clinician ?? exercise.media_waiting_on_clinician ?? false}
                          onCheckedChange={(v) => handleCheckboxChange(exercise.id, "media_waiting_on_clinician", !!v)}
                        />
                        <label htmlFor={`waiting-${exercise.id}`} className="text-sm">
                          Waiting on clinician
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`confirm-${exercise.id}`}
                          checked={pendingChanges[exercise.id]?.requires_clinician_confirmation ?? exercise.requires_clinician_confirmation ?? false}
                          onCheckedChange={(v) => handleCheckboxChange(exercise.id, "requires_clinician_confirmation", !!v)}
                        />
                        <label htmlFor={`confirm-${exercise.id}`} className="text-sm">
                          Requires confirmation
                        </label>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="md:col-span-5">
                      <label className="text-xs text-muted-foreground mb-1 block">Admin Notes</label>
                      <Textarea
                        placeholder="Add notes about media requirements, clinician feedback, etc."
                        value={currentNotes}
                        onChange={(e) => handleNotesChange(exercise.id, e.target.value)}
                        className="text-sm min-h-[60px] resize-none"
                      />
                    </div>
                  </div>

                  {/* Instructions Preview */}
                  {exercise.instructions && (
                    <div className="border-t pt-3">
                      <label className="text-xs text-muted-foreground mb-1 block">Instructions</label>
                      <p className="text-xs text-muted-foreground line-clamp-2">{exercise.instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredExercises?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No exercises found with the selected filter
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
