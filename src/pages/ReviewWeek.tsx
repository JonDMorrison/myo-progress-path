import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, AlertCircle, User, Calendar, FileDown, Play, Loader, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { approveWeek, requestMorePractice, reassignWeek } from "@/lib/reviewActions";
import { getVideoUrl } from "@/lib/storage";

// AI feedback has been disabled - therapist feedback only

const ReviewWeek = () => {
  const { patientId, weekNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [week, setWeek] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [note, setNote] = useState("");

  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [uploads, setUploads] = useState<any[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState<string | null>(null);
  // AI analysis state removed - therapist feedback only

  useEffect(() => {
    loadReviewData();
  }, [patientId, weekNumber]);


  const loadReviewData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get patient
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*, user:users!patients_user_id_fkey(name, email)")
        .eq("id", patientId)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Get week - filter by patient's program variant
      const programTitle = patientData.program_variant === "frenectomy" || patientData.program_variant === "standard"
        ? "Frenectomy Program"
        : "Non-Frenectomy Program";

      const { data: weekData, error: weekError } = await supabase
        .from("weeks")
        .select("*, programs!inner(title)")
        .eq("number", parseInt(weekNumber || "1"))
        .eq("programs.title", programTitle)
        .maybeSingle();

      if (weekError) throw weekError;
      if (!weekData) {
        throw new Error(`Week ${weekNumber} not found for ${programTitle}`);
      }
      setWeek(weekData);

      // Get progress
      const { data: progressData, error: progressError } = await supabase
        .from("patient_week_progress")
        .select("*")
        .eq("patient_id", patientId)
        .eq("week_id", weekData.id)
        .maybeSingle();

      if (progressError) throw progressError;
      setProgress(progressData);

      // Get messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*, therapist:therapist_id(name)")
        .eq("patient_id", patientId)
        .eq("week_id", weekData.id)
        .order("created_at", { ascending: true });

      setMessages(messagesData || []);

      // Get uploads with AI feedback
      const { data: uploadsData } = await supabase
        .from("uploads")
        .select("*")
        .eq("patient_id", patientId)
        .eq("week_id", weekData.id)
        .order("created_at", { ascending: true });

      setUploads(uploadsData || []);

      // AI summary is NOT set as default note anymore - therapist must choose or write their own
      /*
      if (progressData?.ai_summary && !note) {
        setNote(progressData.ai_summary);
      }
      */
    } catch (error: any) {
      console.error("Error loading review data:", error);
      toast({
        title: "Error",
        description: "Failed to load review data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!progress || !patient) return;

    setSubmitting(true);
    try {
      const result = await approveWeek(
        progress.id,
        patient.id,
        parseInt(weekNumber || "1"),
        note
      );

      if (result.success) {
        toast({
          title: "Week Approved!",
          description: `Week ${weekNumber} has been approved. Next week unlocked.`,
        });
        navigate("/therapist");
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

  const handleNeedsMore = async () => {
    if (!progress || !patient) return;

    if (!note.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide feedback for the patient.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestMorePractice(
        progress.id,
        patient.id,
        parseInt(weekNumber || "1"),
        note
      );

      if (result.success) {
        toast({
          title: "Feedback Sent",
          description: `Patient "${patient?.user?.name}" has been notified that Week ${weekNumber} needs more practice. Your feedback message has been sent.`,
        });
        navigate("/therapist");
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

  const handleReassign = async () => {
    if (!progress || !patient) return;

    setSubmitting(true);
    try {
      const result = await reassignWeek(
        progress.id,
        patient.id,
        parseInt(weekNumber || "1"),
        note.trim() || undefined
      );

      if (result.success) {
        toast({
          title: "Week Reassigned",
          description: `Week ${weekNumber} has been unlocked for ${patient?.user?.name} to practice again.`,
        });
        navigate("/therapist");
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

  const isReassignable = progress?.status === "approved" || progress?.status === "submitted";

  const handleDownloadSummary = async () => {
    if (!patientId) return;

    setDownloadingPDF(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-patient-summary", {
        body: { patientId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast({
          title: "Summary Generated",
          description: "Opening patient summary in a new tab.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate patient summary.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handlePlayVideo = async (uploadId: string, fileUrl: string) => {
    setLoadingVideo(uploadId);
    try {
      const signedUrl = await getVideoUrl(fileUrl);
      setPlayingVideo(signedUrl);
    } catch (error: any) {
      console.error('Error loading video:', error);
      toast({
        title: "Error",
        description: "Failed to load video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingVideo(null);
    }
  };

  // AI analysis retry function removed - therapist feedback only

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading review...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      submitted: { label: "Pending Review", className: "bg-warning/10 text-warning border-warning/20" },
      approved: { label: "Approved", className: "bg-success/10 text-success border-success/20" },
      needs_more: { label: "Needs Practice", className: "bg-secondary/10 text-secondary border-secondary/20" },
    };

    const variant = variants[status] || variants.submitted;
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/therapist")} className="mb-3">
            <ArrowLeft className="mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{patient?.user?.name}</h1>
                <p className="text-sm text-muted-foreground">{patient?.user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSummary}
                disabled={downloadingPDF}
              >
                <FileDown className="mr-2 h-4 w-4" />
                {downloadingPDF ? "Generating..." : "Patient Summary"}
              </Button>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">Week {weekNumber}</span>
              </div>
              {progress && getStatusBadge(progress.status)}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Progress Summary */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Week Progress Summary</CardTitle>
                <CardDescription>{week?.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {progress && (
                  <div className="grid grid-cols-3 gap-4">
                    {progress.bolt_score && (
                      <div className="bg-accent rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{progress.bolt_score}s</p>
                        <p className="text-xs text-muted-foreground mt-1">BOLT Score</p>
                      </div>
                    )}
                    {progress.nasal_breathing_pct !== null && (
                      <div className="bg-accent rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-success">{progress.nasal_breathing_pct}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Nasal Breathing</p>
                      </div>
                    )}
                    {progress.tongue_on_spot_pct !== null && (
                      <div className="bg-accent rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-secondary">{progress.tongue_on_spot_pct}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Tongue Position</p>
                      </div>
                    )}
                  </div>
                )}

                {progress?.submitted_at && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Submitted:</strong> {new Date(progress.submitted_at).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Patient Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No messages from patient
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${msg.therapist_id ? "bg-accent" : "bg-primary/10"
                          }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {msg.therapist_id ? "You" : patient?.user?.name}
                        </p>
                        <p className="text-sm">{msg.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Review Actions */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Video Review</CardTitle>
                <CardDescription>First and last attempt comparison</CardDescription>
              </CardHeader>
              <CardContent>
                {playingVideo ? (
                  <div className="space-y-4">
                    <video
                      controls
                      autoPlay
                      className="w-full rounded-lg bg-black"
                      onEnded={() => setPlayingVideo(null)}
                    >
                      <source src={playingVideo} type="video/mp4" />
                      Your browser does not support video playback.
                    </video>
                    <Button
                      variant="outline"
                      onClick={() => setPlayingVideo(null)}
                      className="w-full"
                    >
                      Close Video
                    </Button>
                  </div>
                ) : uploads.length === 0 ? (
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <p className="text-sm text-muted-foreground">No videos uploaded yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Videos will appear here when patient uploads
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploads.map((upload: any) => (
                      <div key={upload.id} className="space-y-3">
                        <div className="p-3 bg-muted rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {upload.kind === "first_attempt" ? "First Attempt" : "Last Attempt"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(upload.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handlePlayVideo(upload.id, upload.file_url)}
                              disabled={loadingVideo === upload.id}
                            >
                              {loadingVideo === upload.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              <span className="ml-2">Play</span>
                            </Button>
                          </div>
                          {upload.thumb_url && (
                            <img
                              src={upload.thumb_url}
                              alt="Video thumbnail"
                              className="w-full h-32 object-cover rounded cursor-pointer"
                              onClick={() => handlePlayVideo(upload.id, upload.file_url)}
                            />
                          )}
                        </div>

                        {/* AI feedback section removed - therapist provides all feedback */}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Form */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Review & Feedback</CardTitle>
                <CardDescription>Approve or request more practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note">Note for Patient (optional for approval, required for needs more)</Label>
                  {/* AI summary indicator removed - therapist writes all feedback */}
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Provide feedback on their progress..."
                    rows={4}
                    disabled={submitting || progress?.status !== "submitted"}
                  />
                </div>

                {/* Reassign button for already reviewed weeks */}
                {isReassignable && progress?.status !== "submitted" && (
                  <div className="mb-4 pb-4 border-b">
                    <Button
                      variant="secondary"
                      onClick={handleReassign}
                      disabled={submitting}
                      className="w-full"
                    >
                      <Undo2 className="mr-2 h-4 w-4" />
                      Reassign for Practice
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      This will unlock the week for the patient to practice again
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="success"
                    onClick={handleApprove}
                    disabled={submitting || progress?.status !== "submitted"}
                    className="w-full"
                  >
                    <CheckCircle2 className="mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="warning"
                    onClick={handleNeedsMore}
                    disabled={submitting || progress?.status !== "submitted"}
                    className="w-full"
                  >
                    <AlertCircle className="mr-2" />
                    Needs More
                  </Button>
                </div>

                {progress?.status !== "submitted" && !isReassignable && (
                  <p className="text-xs text-center text-muted-foreground">
                    This week has already been reviewed
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewWeek;
