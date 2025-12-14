import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Loader,
  Lock,
  MessageSquare,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { approveWeek, requestMorePractice } from "@/lib/reviewActions";
import VideoPlayer from "./VideoPlayer";
import AIReviewSummary from "./AIReviewSummary";

interface ReviewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progressId: string;
  patientId: string;
  patientName: string;
  weekNumber: number;
  weekId: string;
  onComplete: (action: "approved" | "needs_more") => void;
}

interface Upload {
  id: string;
  file_url: string;
  kind: string;
  created_at: string;
  ai_feedback: any;
  ai_feedback_status: string | null;
}

interface Exercise {
  id: string;
  title: string;
  instructions: string | null;
}

interface Message {
  id: string;
  body: string;
  therapist_id: string | null;
  created_at: string;
}

// One-click note templates
const NOTE_TEMPLATES = [
  { label: "Great work", text: "Great work. Keep going!" },
  { label: "Slow down", text: "Slow down and reduce tension." },
  { label: "Watch jaw", text: "Watch jaw compensation." },
];

const ReviewPanel = ({
  open,
  onOpenChange,
  progressId,
  patientId,
  patientName,
  weekNumber,
  weekId,
  onComplete,
}: ReviewPanelProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [note, setNote] = useState("");
  const [showNoteField, setShowNoteField] = useState(false);
  const [exercisesExpanded, setExercisesExpanded] = useState(false);
  const [messagesExpanded, setMessagesExpanded] = useState(false);
  const [reviewingBy, setReviewingBy] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [weekMetrics, setWeekMetrics] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPanelData();
      markAsReviewing();
      setNote("");
      setShowNoteField(false);
    } else {
      clearReviewing();
    }
    
    return () => {
      if (open) clearReviewing();
    };
  }, [open, progressId]);

  const loadPanelData = async () => {
    setLoading(true);
    try {
      // Check user role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        setIsAdmin(userData?.role === "admin" || userData?.role === "super_admin");
      }

      // Load uploads
      const { data: uploadsData } = await supabase
        .from("uploads")
        .select("id, file_url, kind, created_at, ai_feedback, ai_feedback_status")
        .eq("patient_id", patientId)
        .eq("week_id", weekId)
        .order("kind", { ascending: true });

      setUploads(uploadsData || []);

      // Load exercises
      const { data: exercisesData } = await supabase
        .from("exercises")
        .select("id, title, instructions")
        .eq("week_id", weekId)
        .order("title");

      setExercises(exercisesData || []);

      // Load messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("id, body, therapist_id, created_at")
        .eq("patient_id", patientId)
        .eq("week_id", weekId)
        .order("created_at", { ascending: true });

      setMessages(messagesData || []);

      // Load week metrics and check concurrent reviewer
      const { data: progressData } = await supabase
        .from("patient_week_progress")
        .select("bolt_score, nasal_breathing_pct, tongue_on_spot_pct, ai_summary, reviewing_by, reviewing_since")
        .eq("id", progressId)
        .single();

      setWeekMetrics(progressData);

      // Check if someone else is reviewing (with 30-min timeout)
      if (progressData?.reviewing_by && progressData.reviewing_by !== user?.id) {
        const reviewingSince = progressData.reviewing_since ? new Date(progressData.reviewing_since) : null;
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        // Only consider locked if review started within 30 minutes
        if (reviewingSince && reviewingSince > thirtyMinutesAgo) {
          const { data: reviewerData } = await supabase
            .from("users")
            .select("name")
            .eq("id", progressData.reviewing_by)
            .single();
          setReviewingBy(reviewerData?.name || "Another therapist");
        }
      }
    } catch (error) {
      console.error("Error loading panel data:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewing = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("patient_week_progress")
      .update({ 
        reviewing_by: user.id,
        reviewing_since: new Date().toISOString()
      })
      .eq("id", progressId);
  };

  const clearReviewing = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Only clear if this user owns the lock
    await supabase
      .from("patient_week_progress")
      .update({ reviewing_by: null, reviewing_since: null })
      .eq("id", progressId)
      .eq("reviewing_by", user.id);
  };

  const handleApprove = async (withNote: boolean) => {
    if (withNote && !note.trim()) {
      toast({
        title: "Note Required",
        description: "Please add a note before approving with note.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await approveWeek(
        progressId,
        patientId,
        weekNumber,
        withNote ? note : ""
      );

      if (result.success) {
        toast({
          title: "Week Approved",
          description: `Week ${weekNumber} approved for ${patientName}`,
        });
        onComplete("approved");
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve week.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNeedsCorrection = async () => {
    if (!note.trim()) {
      toast({
        title: "Note Required",
        description: "Please provide feedback for the patient.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestMorePractice(
        progressId,
        patientId,
        weekNumber,
        note
      );

      if (result.success) {
        toast({
          title: "Feedback Sent",
          description: "Patient has been notified to practice more.",
        });
        onComplete("needs_more");
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send feedback.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraftWithAI = async () => {
    setDrafting(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-progress-note", {
        body: { patientId, weekId },
      });

      if (error) throw error;

      if (data?.note) {
        setNote(data.note);
        setShowNoteField(true);
        toast({
          title: "Draft Generated",
          description: "Review and edit the AI draft before sending.",
        });
      }
    } catch (error: any) {
      console.error("AI draft error:", error);
      toast({
        title: "Draft Failed",
        description: "Could not generate AI draft. Try again.",
        variant: "destructive",
      });
    } finally {
      setDrafting(false);
    }
  };

  const handleRetryAnalysis = async (uploadId: string) => {
    try {
      // Update status to pending
      await supabase
        .from('uploads')
        .update({ ai_feedback_status: 'pending', ai_feedback: null })
        .eq('id', uploadId);
      
      // Trigger re-analysis
      const { error } = await supabase.functions.invoke('analyze-video', {
        body: { uploadId }
      });

      if (error) throw error;

      toast({
        title: "Analysis Restarted",
        description: "AI video analysis has been re-triggered.",
      });

      // Reload panel data to show updated status
      loadPanelData();
    } catch (error: any) {
      console.error('Retry analysis error:', error);
      toast({
        title: "Retry Failed",
        description: error.message || "Could not restart analysis.",
        variant: "destructive",
      });
    }
  };

  const handleTakeover = async () => {
    setReviewingBy(null);
    await markAsReviewing();
    toast({
      title: "Review Takeover",
      description: "You are now reviewing this submission.",
    });
  };

  const applyTemplate = (text: string) => {
    setNote(text);
    setShowNoteField(true);
  };

  const isLocked = reviewingBy !== null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>{patientName} · Week {weekNumber}</span>
            {isLocked && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                <Lock className="h-3 w-3 mr-1" />
                In review
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isLocked ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
            <Lock className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              This submission is being reviewed by <strong>{reviewingBy}</strong>
            </p>
            {isAdmin && (
              <Button variant="outline" onClick={handleTakeover}>
                Request Takeover
              </Button>
            )}
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-4">
                {/* Video Player */}
                <VideoPlayer uploads={uploads} />

                {/* AI Analysis Status / Retry for Errors */}
                {uploads.some(u => u.ai_feedback_status === 'error') && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span>AI analysis failed for some videos</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const errorUpload = uploads.find(u => u.ai_feedback_status === 'error');
                        if (errorUpload) handleRetryAnalysis(errorUpload.id);
                      }}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                )}

                {/* AI Review Summary (collapsed by default) */}
                <AIReviewSummary uploads={uploads} />

                {/* Exercise Instructions (collapsed) */}
                {exercises.length > 0 && (
                  <Collapsible open={exercisesExpanded} onOpenChange={setExercisesExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between px-4 py-3 h-auto border rounded-lg">
                        <span className="font-medium">Exercise Instructions ({exercises.length})</span>
                        {exercisesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 py-3 space-y-3 border border-t-0 rounded-b-lg -mt-1">
                      {exercises.map((ex) => (
                        <div key={ex.id}>
                          <p className="text-sm font-medium">{ex.title}</p>
                          {ex.instructions && (
                            <p className="text-xs text-muted-foreground mt-1">{ex.instructions}</p>
                          )}
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Messages Panel */}
                <Collapsible open={messagesExpanded} onOpenChange={setMessagesExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between px-4 py-3 h-auto border rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">Messages ({messages.length})</span>
                      </div>
                      {messagesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 py-3 space-y-2 border border-t-0 rounded-b-lg -mt-1 max-h-40 overflow-y-auto">
                    {messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">No messages</p>
                    ) : (
                      messages.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`p-2 rounded text-sm ${
                            msg.therapist_id ? "bg-accent" : "bg-primary/10"
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">
                            {msg.therapist_id ? "Therapist" : "Patient"}
                          </p>
                          <p>{msg.body}</p>
                        </div>
                      ))
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Quick Templates */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">Quick notes</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDraftWithAI}
                      disabled={drafting}
                      className="h-7 text-xs"
                    >
                      {drafting ? (
                        <Loader className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1" />
                      )}
                      Draft with AI
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {NOTE_TEMPLATES.map((tpl) => (
                      <Button
                        key={tpl.label}
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(tpl.text)}
                        className="h-7 text-xs"
                      >
                        {tpl.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Note Input (only when needed) */}
                {showNoteField && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Note for patient</label>
                    <Textarea
                      placeholder="Add feedback or instructions..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Fixed Action Bar - Mobile optimized */}
            <div className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-card">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="flex-1 h-10 sm:h-9"
                  onClick={() => handleApprove(false)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 h-10 sm:h-9"
                  onClick={() => {
                    if (!showNoteField) {
                      setShowNoteField(true);
                      return;
                    }
                    handleApprove(true);
                  }}
                  disabled={submitting || (showNoteField && !note.trim())}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="truncate">{showNoteField && note.trim() ? "Approve + Note" : "Add Note"}</span>
                </Button>

                <Button
                  variant="destructive"
                  className="flex-1 h-10 sm:h-9"
                  onClick={() => {
                    if (!showNoteField) {
                      setShowNoteField(true);
                      return;
                    }
                    handleNeedsCorrection();
                  }}
                  disabled={submitting || (showNoteField && !note.trim())}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  <span className="truncate">Needs Correction</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ReviewPanel;
