import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, AlertCircle, User, Calendar, FileDown, Play, Loader, Undo2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { approveWeek, requestMorePractice, reassignWeek } from "@/lib/reviewActions";
import { getProgramTitle } from "@/lib/constants";
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
  const [allProgress, setAllProgress] = useState<any[]>([]);
  const [weekLookup, setWeekLookup] = useState<Record<string, number>>({});

  useEffect(() => {
    loadReviewData();
  }, [patientId, weekNumber]);


  const loadReviewData = async () => {
    try {
      // Auth is guaranteed by ProtectedRoute — no need to check here

      // Get patient
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*, user:users!user_id(name, email)")
        .eq("id", patientId)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Get week - filter by patient's program variant.
      // Use the canonical helper so all four variants (+ legacy 'standard')
      // map to the correct display program. The previous inline mapping
      // routed `standard` and `frenectomy_video` to the wrong program title.
      const programTitle = getProgramTitle(patientData.program_variant);

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

      // Get ALL messages for this patient (across all modules)
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*, week:weeks(number)")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: true });

      setMessages(messagesData || []);

      // Get all progress rows for module navigation
      const { data: allProgressData } = await supabase
        .from("patient_week_progress")
        .select("id, week_id, status, week:weeks(number)")
        .eq("patient_id", patientId);

      setAllProgress(allProgressData || []);

      // Build week_id → week_number lookup from progress data
      const lookup: Record<string, number> = {};
      (allProgressData || []).forEach((p: any) => {
        if (p.week_id && p.week?.number) lookup[p.week_id] = p.week.number;
      });
      setWeekLookup(lookup);

      // Get uploads from both weeks of the module (Part One + Part Two)
      const partnerNum = parseInt(weekNumber || '1') % 2 === 1
        ? parseInt(weekNumber || '1') + 1
        : parseInt(weekNumber || '1') - 1;

      const { data: partnerWeek } = await supabase
        .from("weeks")
        .select("id, programs!inner(title)")
        .eq("number", partnerNum)
        .eq("programs.title", programTitle)
        .maybeSingle();

      const weekIdsToQuery = [weekData.id, partnerWeek?.id].filter(Boolean) as string[];

      const { data: uploadsData } = await supabase
        .from("uploads")
        .select("id, file_url, kind, created_at, exercise_key")
        .eq("patient_id", patientId)
        .in("week_id", weekIdsToQuery)
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
        const moduleNum = Math.ceil(parseInt(weekNumber || "1") / 2);
        toast({
          title: "Module Approved!",
          description: `Module ${moduleNum} has been approved. Next module unlocked.`,
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
        const moduleNum = Math.ceil(parseInt(weekNumber || "1") / 2);
        toast({
          title: "Feedback Sent",
          description: `Patient "${patient?.user?.name}" has been notified that Module ${moduleNum} needs more practice. Your feedback message has been sent.`,
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
        const moduleNum = Math.ceil(parseInt(weekNumber || "1") / 2);
        toast({
          title: "Module Reassigned",
          description: `Module ${moduleNum} has been unlocked for ${patient?.user?.name} to practice again.`,
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
              <div
                className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => navigate(`/therapist?patient=${patientId}`)}
              >
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/therapist?patient=${patientId}`)}
                >
                  {patient?.user?.name}
                </h1>
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
                <span className="font-semibold">Module {Math.ceil(parseInt(weekNumber || "1") / 2)}</span>
              </div>
              {progress && getStatusBadge(progress.status)}
            </div>
          </div>

          {/* Module navigation */}
          {(() => {
            const currentWeekNum = parseInt(weekNumber || "1");
            const currentModule = Math.ceil(currentWeekNum / 2);
            const prevWeekNum = currentWeekNum - 2;
            const nextWeekNum = currentWeekNum + 2;
            const hasPrev = prevWeekNum >= 1;
            const hasNext = allProgress.some((p: any) => p.week?.number === nextWeekNum || p.week?.number === nextWeekNum + 1);
            const totalModules = patient?.program_variant === "frenectomy" ? 13 : 12;

            return (
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div>
                  {hasPrev && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/review/${patientId}/${prevWeekNum}`)}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Module {Math.ceil(prevWeekNum / 2)}
                    </Button>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  Module {currentModule} of {totalModules}
                </span>
                <div>
                  {hasNext && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/review/${patientId}/${nextWeekNum}`)}
                    >
                      Module {Math.ceil(nextWeekNum / 2)}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Progress Summary */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Module Progress Summary</CardTitle>
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
                <CardDescription>All messages across modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No messages from patient
                    </p>
                  ) : (
                    messages.map((msg, idx) => {
                      const msgWeekNum = msg.week?.number;
                      const prevWeekNum = idx > 0 ? messages[idx - 1].week?.number : null;
                      const moduleNum = msgWeekNum ? Math.ceil(msgWeekNum / 2) : null;
                      const partLabel = msgWeekNum ? (msgWeekNum % 2 !== 0 ? "Part One" : "Part Two") : null;
                      const showLabel = msgWeekNum !== prevWeekNum && moduleNum;

                      return (
                        <div key={msg.id}>
                          {showLabel && (
                            <p className="text-xs font-semibold text-muted-foreground mt-2 mb-1">
                              Module {moduleNum} – {partLabel}
                            </p>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              msg.sent_by === 'system'
                                ? "bg-blue-50 border border-blue-200"
                                : msg.therapist_id ? "bg-accent" : "bg-primary/10"
                            }`}
                          >
                            <p className="text-sm font-medium mb-1">
                              {msg.sent_by === 'system' ? "📹 Notification" : msg.therapist_id ? "You" : patient?.user?.name}
                            </p>
                            <p className="text-sm">{msg.body}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })
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
                  (() => {
                    const firstAttempts = uploads.filter((u: any) => u.kind === 'first_attempt');
                    const lastAttempts = uploads.filter((u: any) => u.kind === 'last_attempt');

                    const renderUploadCard = (upload: any, label: string) => (
                      <div key={upload.id} className="mb-3">
                        <div
                          className="p-3 bg-muted rounded-lg space-y-3 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('button')) return;
                            handlePlayVideo(upload.id, upload.file_url);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{label}</p>
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
                              <span className="ml-2">Open</span>
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
                    );

                    return (
                      <div className="space-y-4">
                        {firstAttempts.length > 0 && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                              First Attempt ({firstAttempts.length} video{firstAttempts.length > 1 ? 's' : ''})
                            </p>
                            {firstAttempts.map((upload, idx) =>
                              renderUploadCard(upload, firstAttempts.length > 1 ? `First Attempt ${idx + 1}` : 'First Attempt')
                            )}
                          </div>
                        )}
                        {lastAttempts.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                              Last Attempt ({lastAttempts.length} video{lastAttempts.length > 1 ? 's' : ''})
                            </p>
                            {lastAttempts.map((upload, idx) =>
                              renderUploadCard(upload, lastAttempts.length > 1 ? `Last Attempt ${idx + 1}` : 'Last Attempt')
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()
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
                {progress?.status === "approved" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
                      <p className="text-3xl">✅</p>
                      <p className="font-bold text-emerald-800 text-lg">Module Approved</p>
                      <p className="text-sm text-emerald-700">
                        This module was approved. The patient has been unlocked to continue.
                      </p>
                      {progress?.updated_at && (
                        <p className="text-xs text-emerald-600">
                          Approved on {new Date(progress.updated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Reassign option even after approval */}
                    {isReassignable && (
                      <div className="pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="note">Reason for reassignment (optional)</Label>
                          <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Provide a reason for reassigning..."
                            rows={3}
                            disabled={submitting}
                          />
                        </div>
                        <Button
                          variant="secondary"
                          onClick={handleReassign}
                          disabled={submitting}
                          className="w-full mt-3"
                        >
                          <Undo2 className="mr-2 h-4 w-4" />
                          Reassign for Practice
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          This will unlock the week for the patient to practice again
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="note">Note for Patient (optional for approval, required for needs more)</Label>
                      <Textarea
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Provide feedback on their progress..."
                        rows={4}
                        disabled={submitting}
                      />
                    </div>

                    {/* Reassign button for needs_more reviewed weeks */}
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
                        This module has already been reviewed
                      </p>
                    )}
                  </>
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
