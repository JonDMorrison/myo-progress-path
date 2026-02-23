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
  // RefreshCw removed - AI analysis disabled
  Send,
  Undo2,
  Award,
  Wrench
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { approveWeek, requestMorePractice, reassignWeek } from "@/lib/reviewActions";
import { moveToMaintenance } from "@/lib/maintenanceActions";
import VideoPlayer from "./VideoPlayer";
// AIReviewSummary removed - AI feedback disabled, therapist provides all feedback
import TherapistFeedbackDialog from "./TherapistFeedbackDialog";
import { ExerciseVideoToggle } from "./ExerciseVideoToggle";

interface ReviewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progressId: string;
  patientId: string;
  patientName: string;
  weekNumber: number;
  weekId: string;
  weekStatus?: string;
  onComplete: (action: "approved" | "needs_more" | "reassigned") => void;
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
  video_required: boolean;
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

// Completion note template for Week 24
const COMPLETION_NOTE_TEMPLATE = `Congratulations on completing your myofunctional therapy program! 

You've made remarkable progress in developing healthy breathing and tongue posture habits. Here are my observations:

**Key achievements:**
- [Note specific improvements you've observed]

**Moving forward:**
- Continue to be mindful of nasal breathing throughout the day
- Maintain your tongue on "the spot" - this should now feel natural
- If you notice old habits returning during stress, gently redirect

I'm proud of your dedication and commitment to this journey. Your new habits will serve you well for life!`;

const ReviewPanel = ({
  open,
  onOpenChange,
  progressId,
  patientId,
  patientName,
  weekNumber,
  weekId,
  weekStatus,
  onComplete,
}: ReviewPanelProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

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

      // Load exercises with video_required field
      const { data: exercisesData } = await supabase
        .from("exercises")
        .select("id, title, instructions, video_required")
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
        const moduleNum = Math.ceil(weekNumber / 2);
        toast({
          title: "Module Approved",
          description: `Module ${moduleNum} approved for ${patientName}`,
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

  // AI draft and AI analysis removed - therapist provides all feedback

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

  const handleReassign = async () => {
    setSubmitting(true);
    try {
      const result = await reassignWeek(
        progressId,
        patientId,
        weekNumber,
        note.trim() || undefined
      );

      if (result.success) {
        const moduleNum = Math.ceil(weekNumber / 2);
        toast({
          title: "Module Reassigned",
          description: `Module ${moduleNum} has been unlocked for ${patientName} to practice again.`,
        });
        onComplete("reassigned");
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reassign week.",
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

  const isReassignable = weekStatus === "approved" || weekStatus === "submitted";

  const isLocked = reviewingBy !== null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{patientName} · Module {Math.ceil(weekNumber / 2)}</span>
              {weekNumber === 24 && (
                <Badge className="bg-success/10 text-success border-success/20">
                  Final Module
                </Badge>
              )}
            </div>
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

                {/* AI Analysis Status and AI Review Summary */}
                {weekMetrics?.ai_summary && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="font-bold text-slate-900 uppercase tracking-tight text-xs">AI Recommended Feedback</h4>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase">Suggestion</Badge>
                    </div>
                    <div className="bg-white/80 p-3 rounded-lg border border-primary/10 italic text-sm text-slate-600 leading-relaxed shadow-sm">
                      "{weekMetrics.ai_summary}"
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white hover:bg-primary/5 border-primary/20 text-primary font-bold text-xs"
                      onClick={() => applyTemplate(weekMetrics.ai_summary)}
                    >
                      <Sparkles className="h-3 w-3 mr-2" />
                      USE THIS SUGGESTION
                    </Button>
                  </div>
                )}

                {/* Exercise Instructions & Video Settings (collapsed) */}
                {exercises.length > 0 && (
                  <Collapsible open={exercisesExpanded} onOpenChange={setExercisesExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between px-4 py-3 h-auto border rounded-lg">
                        <span className="font-medium">Exercise Settings ({exercises.length})</span>
                        {exercisesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 py-3 space-y-3 border border-t-0 rounded-b-lg -mt-1">
                      {exercises.map((ex) => (
                        <div key={ex.id} className="flex items-start justify-between gap-3 py-2 border-b last:border-0">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{ex.title}</p>
                            {ex.instructions && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ex.instructions}</p>
                            )}
                          </div>
                          <ExerciseVideoToggle
                            exerciseId={ex.id}
                            exerciseTitle={ex.title}
                            videoRequired={ex.video_required ?? false}
                            onUpdate={loadPanelData}
                          />
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
                          className={`p-2 rounded text-sm ${msg.therapist_id ? "bg-accent" : "bg-primary/10"
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

                {/* Rich Feedback Button */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowFeedbackDialog(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Rich Feedback (Video/Photo/Text)
                </Button>

                {/* Week 24 Special Completion Note Section */}
                {weekNumber === 24 && (
                  <div className="bg-success/5 border border-success/20 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-success" />
                      <h4 className="font-semibold text-success">Program Completion Note</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This is the final week! Write a personalized completion note emphasizing
                      habit awareness, long-term carryover, and self-monitoring skills.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(COMPLETION_NOTE_TEMPLATE)}
                      className="w-full border-success/30 hover:bg-success/10"
                    >
                      <Sparkles className="h-4 w-4 mr-2 text-success" />
                      Use Completion Template
                    </Button>
                  </div>
                )}

                {/* Quick Templates (hidden for week 24 to emphasize completion note) */}
                {weekNumber !== 24 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Quick notes</label>
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
                )}

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
              {/* Reassign button for completed weeks */}
              {isReassignable && (
                <div className="mb-3 pb-3 border-b">
                  <Button
                    variant="secondary"
                    className="w-full h-10 sm:h-9"
                    onClick={() => {
                      if (!showNoteField) {
                        setShowNoteField(true);
                        setNote("");
                        return;
                      }
                      handleReassign();
                    }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Undo2 className="h-4 w-4 mr-2" />
                    )}
                    <span className="truncate">
                      {showNoteField ? "Confirm Reassign for Practice" : "Reassign for Practice"}
                    </span>
                  </Button>
                  {showNoteField && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      This will unlock the week for the patient to practice again
                    </p>
                  )}
                </div>
              )}

              {/* Week 24 Maintenance Mode Option */}
              {weekNumber === 24 && (
                <div className="flex flex-col gap-2 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium text-primary flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Program Completion Options
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      className="flex-1 h-10 sm:h-9"
                      onClick={() => handleApprove(note.trim() ? true : false)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Complete Program
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-10 sm:h-9 border-primary/50 text-primary hover:bg-primary/10"
                      onClick={async () => {
                        setSubmitting(true);
                        try {
                          // First approve Week 24
                          const approveResult = await approveWeek(
                            progressId,
                            patientId,
                            weekNumber,
                            note.trim() ? note : ""
                          );

                          if (!approveResult.success) {
                            throw new Error(approveResult.error);
                          }

                          // Then move to maintenance
                          const maintenanceResult = await moveToMaintenance(patientId);

                          if (maintenanceResult.success) {
                            toast({
                              title: "Moved to Maintenance Mode",
                              description: `${patientName} has been moved to maintenance mode for ongoing therapist-directed practice.`,
                            });
                            onComplete("approved");
                            onOpenChange(false);
                          } else {
                            throw new Error(maintenanceResult.error);
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
                      }}
                      disabled={submitting}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Move to Maintenance
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Complete Program:</strong> Marks patient as completed. <br />
                    <strong>Maintenance Mode:</strong> Keeps patient active for weekly check-ins and therapist-assigned practice.
                  </p>
                </div>
              )}

              {weekNumber !== 24 && (
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
              )}
            </div>
          </>
        )}

        {/* Therapist Feedback Dialog */}
        <TherapistFeedbackDialog
          open={showFeedbackDialog}
          onOpenChange={setShowFeedbackDialog}
          patientId={patientId}
          patientName={patientName}
          weekId={weekId}
          weekNumber={weekNumber}
          progressId={progressId}
          onSuccess={loadPanelData}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ReviewPanel;
