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
  MessageSquare
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
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [note, setNote] = useState("");
  const [exercisesExpanded, setExercisesExpanded] = useState(false);
  const [messagesExpanded, setMessagesExpanded] = useState(false);
  const [reviewingBy, setReviewingBy] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPanelData();
      markAsReviewing();
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

      // Check if someone else is reviewing
      const { data: progressData } = await supabase
        .from("patient_week_progress")
        .select("ai_summary")
        .eq("id", progressId)
        .single();

      // Parse ai_summary for reviewing_by (temporary field usage)
      // In a real app, you'd add a dedicated column
      if (progressData?.ai_summary?.startsWith("REVIEWING:")) {
        const reviewerId = progressData.ai_summary.split(":")[1];
        if (reviewerId !== user?.id) {
          // Get reviewer name
          const { data: reviewerData } = await supabase
            .from("users")
            .select("name")
            .eq("id", reviewerId)
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

    // Mark this progress as being reviewed (using ai_summary temporarily)
    await supabase
      .from("patient_week_progress")
      .update({ ai_summary: `REVIEWING:${user.id}` })
      .eq("id", progressId);
  };

  const clearReviewing = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Clear reviewing status only if we set it
    const { data } = await supabase
      .from("patient_week_progress")
      .select("ai_summary")
      .eq("id", progressId)
      .single();

    if (data?.ai_summary === `REVIEWING:${user.id}`) {
      await supabase
        .from("patient_week_progress")
        .update({ ai_summary: null })
        .eq("id", progressId);
    }
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

  const handleTakeover = async () => {
    setReviewingBy(null);
    await markAsReviewing();
    toast({
      title: "Review Takeover",
      description: "You are now reviewing this submission.",
    });
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

                {/* Note Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Note for patient</label>
                  <Textarea
                    placeholder="Add feedback or instructions..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </ScrollArea>

            {/* Fixed Action Bar */}
            <div className="border-t px-6 py-4 bg-card">
              <div className="flex gap-2">
                <Button
                  className="flex-1"
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
                  className="flex-1"
                  onClick={() => handleApprove(true)}
                  disabled={submitting || !note.trim()}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Approve + Note
                </Button>

                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleNeedsCorrection}
                  disabled={submitting || !note.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Needs Correction
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
