import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Send, CheckCircle2, AlertCircle, HelpCircle, Upload, Video, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Section } from "@/components/ui/Section";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BOLTHelpContent } from "@/components/BOLTHelpContent";
import { WeekIntroductionModal } from "@/components/WeekIntroductionModal";

import { notifyTherapistSubmission } from "@/lib/notify";
import { learnLinksByWeek, loadLearnIndex, LearnArticle } from "@/lib/learn";
import { RelatedWeeks } from "@/components/learn/RelatedWeeks";
import { LearnChips } from "@/components/week/LearnChips";
import { NasalUnblockModal } from "@/components/learn/NasalUnblockModal";

import { isWeekAccessible } from "@/lib/userProgress";

const WeekDetail = () => {
  const { weekNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [uploads, setUploads] = useState<any[]>([]);
  const [uploadingFirst, setUploadingFirst] = useState(false);
  const [uploadingLast, setUploadingLast] = useState(false);
  const [learnArticles, setLearnArticles] = useState<LearnArticle[]>([]);

  // Form state
  const [boltScore, setBoltScore] = useState("");
  const [nasalPct, setNasalPct] = useState("");
  const [tonguePct, setTonguePct] = useState("");

  useEffect(() => {
    loadWeekData();
    loadLearnIndex().then(setLearnArticles);
  }, [weekNumber]);


  const loadWeekData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get patient
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Check if week is accessible
      const accessible = await isWeekAccessible(patientData.id, parseInt(weekNumber || "1"));
      if (!accessible) {
        toast({
          title: "Week Locked",
          description: "Please complete the previous week to unlock this one.",
          variant: "destructive",
        });
        navigate("/patient");
        return;
      }

      // Get week
      const { data: weekData } = await supabase
        .from("weeks")
        .select("*")
        .eq("number", parseInt(weekNumber || "1"))
        .maybeSingle();

      if (!weekData) {
        toast({
          title: "Week Not Available",
          description: "This week's content hasn't been set up yet.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setWeek(weekData);

      // Get exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercises")
        .select("*")
        .eq("week_id", weekData.id)
        .order("title");

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData || []);

      // Get or create progress
      let { data: progressData, error: progressError } = await supabase
        .from("patient_week_progress")
        .select("*")
        .eq("patient_id", patientData.id)
        .eq("week_id", weekData.id)
        .maybeSingle();

      if (!progressData && !progressError) {
        // Create progress entry
        const { data: newProgress, error: createError } = await supabase
          .from("patient_week_progress")
          .insert({
            patient_id: patientData.id,
            week_id: weekData.id,
            status: "open",
          })
          .select()
          .single();

        if (createError) throw createError;
        progressData = newProgress;
      }

      setProgress(progressData);
      if (progressData) {
        setBoltScore(progressData.bolt_score?.toString() || "");
        setNasalPct(progressData.nasal_breathing_pct?.toString() || "");
        setTonguePct(progressData.tongue_on_spot_pct?.toString() || "");
      }

      // Get messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*, therapist:therapist_id(name)")
        .eq("patient_id", patientData.id)
        .eq("week_id", weekData.id)
        .order("created_at", { ascending: true });

      setMessages(messagesData || []);

      // Get uploads
      const { data: uploadsData } = await supabase
        .from("uploads")
        .select("*")
        .eq("patient_id", patientData.id)
        .eq("week_id", weekData.id)
        .order("created_at", { ascending: false });

      setUploads(uploadsData || []);

      // Show introduction modal if not viewed yet
      if (weekData?.introduction && progressData && !progressData.introduction_viewed) {
        setShowIntroduction(true);
      }
    } catch (error: any) {
      console.error("Error loading week data:", error);
      toast({
        title: "Error",
        description: "Failed to load week data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!progress) return;

    try {
      const { error } = await supabase
        .from("patient_week_progress")
        .update({
          bolt_score: boltScore ? parseInt(boltScore) : null,
          nasal_breathing_pct: nasalPct ? parseInt(nasalPct) : null,
          tongue_on_spot_pct: tonguePct ? parseInt(tonguePct) : null,
        })
        .eq("id", progress.id);

      if (error) throw error;

      toast({
        title: "Progress saved!",
        description: "Your progress has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canSubmit = async () => {
    if (!patient || !week || !progress) return false;

    // Call server-side validation
    const { data, error } = await supabase.rpc('calc_week_progress', {
      _patient_id: patient.id,
      _week_id: week.id
    });

    if (error) {
      console.error('Progress calculation error:', error);
      return false;
    }

    // Check if 100% complete
    const progressData = data as { percent_complete: number; missing: string[] };
    const isComplete = progressData?.percent_complete === 100;
    
    // Check if already submitted or approved
    const notYetReviewed = progress?.status === "open" || progress?.status === "needs_more";
    
    return isComplete && notYetReviewed;
  };

  const handleSubmitForReview = async () => {
    if (!progress || !patient) return;

    const canSubmitNow = await canSubmit();
    if (!canSubmitNow) {
      // Get missing items
      const { data } = await supabase.rpc('calc_week_progress', {
        _patient_id: patient.id,
        _week_id: week.id
      });

      const progressData = data as { missing: string[] };
      const missing = progressData?.missing || ['Unknown requirements'];
      
      toast({
        title: "Incomplete Data",
        description: `Missing: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Save current data first
      await handleSaveProgress();

      // Then submit for review
      const { error } = await supabase
        .from("patient_week_progress")
        .update({
          status: "submitted",
          completed_at: new Date().toISOString(),
        })
        .eq("id", progress.id);

      if (error) throw error;

      // Log event
      await supabase.from("events").insert({
        patient_id: patient.id,
        type: "submitted_week",
        meta: {
          week_number: parseInt(weekNumber || "1"),
          timestamp: new Date().toISOString(),
        },
      });

      // Notify therapist
      if (patient.assigned_therapist_id) {
        const { data: therapist } = await supabase
          .from("users")
          .select("email, name")
          .eq("id", patient.assigned_therapist_id)
          .single();

        if (therapist) {
          await notifyTherapistSubmission(
            therapist.email,
            therapist.name || "Therapist",
            patient.user?.name || "Patient",
            patient.id,
            parseInt(weekNumber || "1")
          );
        }
      }

      toast({
        title: "Submitted for review!",
        description: "Your therapist will review your progress soon.",
      });

      navigate("/patient");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleIntroductionContinue = async () => {
    if (!progress?.id) return;
    
    try {
      const { error } = await supabase
        .from('patient_week_progress')
        .update({ introduction_viewed: true })
        .eq('id', progress.id);

      if (error) throw error;
      
      setShowIntroduction(false);
    } catch (error: any) {
      console.error('Error marking introduction as viewed:', error);
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVideoUpload = async (kind: 'first_attempt' | 'last_attempt') => {
    if (!patient || !week) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/mov,video/webm';
    
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a video under 100MB.",
          variant: "destructive",
        });
        return;
      }

      try {
        if (kind === 'first_attempt') setUploadingFirst(true);
        else setUploadingLast(true);

        // Generate unique filename
        const timestamp = Date.now();
        const ext = file.name.split('.').pop();
        const filename = `${patient.id}/${week.id}/${kind}_${timestamp}.${ext}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('patient-videos')
          .upload(filename, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('patient-videos')
          .getPublicUrl(filename);

        // Create upload record
        const { error: insertError } = await supabase
          .from('uploads')
          .insert({
            patient_id: patient.id,
            week_id: week.id,
            kind,
            file_url: publicUrl,
          });

        if (insertError) throw insertError;

        toast({
          title: "Video uploaded!",
          description: "Your video has been uploaded successfully.",
        });

        // Reload data to show new upload
        await loadWeekData();
      } catch (error: any) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        if (kind === 'first_attempt') setUploadingFirst(false);
        else setUploadingLast(false);
      }
    };

    input.click();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !patient || !week) return;

    try {
      const { error } = await supabase.from("messages").insert({
        patient_id: patient.id,
        week_id: week.id,
        therapist_id: patient.assigned_therapist_id,
        body: newMessage,
      });

      if (error) throw error;

      setNewMessage("");
      loadWeekData();

      toast({
        title: "Message sent!",
        description: "Your therapist will respond soon.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading week details...</p>
        </div>
      </div>
    );
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

  return (
    <>
      <WeekIntroductionModal
        open={showIntroduction}
        weekNumber={week?.number || 0}
        introduction={week?.introduction || ""}
        onContinue={handleIntroductionContinue}
      />

      <div className="min-h-screen bg-background pb-20">
        {/* Modern Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate("/patient")} className="rounded-xl -ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            {progress && (
              <Badge
                variant="outline"
                className={`rounded-full ${
                  progress.status === "approved"
                    ? "bg-success/10 text-success border-success/20"
                    : progress.status === "submitted"
                    ? "bg-warning/10 text-warning border-warning/20"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {progress.status}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Week {week?.number}</h1>
            <p className="text-muted-foreground text-lg">{week?.title}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Introduction */}
            {week?.overview && (
              <Section delay={0}>
                <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">{week.overview}</p>
                    </div>
                  </CardContent>
                </Card>
              </Section>
            )}

            {/* Objectives */}
            {week?.objectives && Array.isArray(week.objectives) && week.objectives.length > 0 && (
              <Section delay={100}>
                <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">Learning Objectives</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {week.objectives.map((objective: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{objective}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Learn More Chips */}
                    <div className="pt-4 border-t">
                      <LearnChips weekNumber={parseInt(weekNumber || "0")} />
                    </div>
                    
                    {/* Quick Help for Congestion */}
                    <div className="flex justify-end">
                      <NasalUnblockModal />
                    </div>
                  </CardContent>
                </Card>
              </Section>
            )}

            {/* Coaching Video */}
            {week?.video_title && (
              <Section delay={200}>
                <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Play className="h-5 w-5 text-primary" />
                      {week.video_title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {week.video_url ? (
                      <div className="aspect-video bg-muted">
                        <iframe
                          src={week.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title={week.video_title}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-muted-foreground text-sm">Video coming soon</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Section>
            )}

            {/* Exercises */}
            <Section delay={300}>
              <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Exercises</CardTitle>
                  <CardDescription>Complete each exercise as instructed</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-3">
                    {exercises.map((exercise, idx) => (
                      <AccordionItem 
                        key={exercise.id} 
                        value={`exercise-${idx}`} 
                        className="border rounded-xl px-4 hover:shadow-sm transition-shadow"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-3 text-left">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">{getExerciseIcon(exercise.type)}</span>
                            </div>
                            <div>
                              <p className="font-semibold">{exercise.title}</p>
                              <p className="text-sm text-muted-foreground capitalize">{exercise.type} Exercise</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 space-y-4">
                          {exercise.instructions && (
                            <div className="rounded-lg bg-accent/50 p-4">
                              <h4 className="font-medium mb-2 text-sm">Instructions</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">{exercise.instructions}</p>
                            </div>
                          )}
                          {exercise.props && (
                            <div>
                              <h4 className="font-medium mb-2 text-sm">Props Needed</h4>
                              <p className="text-sm text-muted-foreground">{exercise.props}</p>
                            </div>
                          )}
                          {exercise.compensations && (
                            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                              <h4 className="font-medium text-warning flex items-center gap-2 mb-2 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                Watch for compensations
                              </h4>
                              <p className="text-sm">{exercise.compensations}</p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </Section>

            {/* Tracking */}
            <Section delay={400}>
              <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Week Progress</CardTitle>
                  <CardDescription>Track your daily practice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                {/* Video Uploads */}
                {(week?.requires_video_first || week?.requires_video_last) && (
                  <div className="space-y-4 pb-6 border-b">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      Video Submissions
                    </h4>
                    
                    {week.requires_video_first && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">First Attempt Video</Label>
                        {uploads.find(u => u.kind === 'first_attempt') ? (
                          <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-success" />
                              <span className="text-sm font-medium">Video uploaded</span>
                            </div>
                            {progress?.status !== "submitted" && progress?.status !== "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVideoUpload('first_attempt')}
                                disabled={uploadingFirst}
                                className="rounded-lg"
                              >
                                Replace
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleVideoUpload('first_attempt')}
                            disabled={uploadingFirst || progress?.status === "submitted" || progress?.status === "approved"}
                            className="w-full h-12 rounded-xl"
                          >
                            <Upload className="mr-2 h-5 w-5" />
                            {uploadingFirst ? "Uploading..." : "Upload First Attempt"}
                          </Button>
                        )}
                      </div>
                    )}

                    {week.requires_video_last && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Last Attempt Video</Label>
                        {uploads.find(u => u.kind === 'last_attempt') ? (
                          <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-success" />
                              <span className="text-sm font-medium">Video uploaded</span>
                            </div>
                            {progress?.status !== "submitted" && progress?.status !== "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVideoUpload('last_attempt')}
                                disabled={uploadingLast}
                                className="rounded-lg"
                              >
                                Replace
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleVideoUpload('last_attempt')}
                            disabled={uploadingLast || progress?.status === "submitted" || progress?.status === "approved"}
                            className="w-full h-12 rounded-xl"
                          >
                            <Upload className="mr-2 h-5 w-5" />
                            {uploadingLast ? "Uploading..." : "Upload Last Attempt"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                {week?.requires_bolt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="bolt">BOLT Score (seconds)</Label>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-96">
                          <BOLTHelpContent />
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <Input
                      id="bolt"
                      type="number"
                      value={boltScore}
                      onChange={(e) => setBoltScore(e.target.value)}
                      placeholder="Enter your BOLT score"
                      disabled={progress?.status === "submitted" || progress?.status === "approved"}
                      className="h-12 rounded-xl"
                    />
                  </div>
                )}

                  <div className="space-y-2">
                    <Label htmlFor="nasal" className="text-sm font-medium">% Time Nasal Breathing</Label>
                    <Input
                      id="nasal"
                      type="number"
                      min="0"
                      max="100"
                      value={nasalPct}
                      onChange={(e) => setNasalPct(e.target.value)}
                      placeholder="0-100%"
                      disabled={progress?.status === "submitted" || progress?.status === "approved"}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tongue" className="text-sm font-medium">% Time Tongue on Spot</Label>
                    <Input
                      id="tongue"
                      type="number"
                      min="0"
                      max="100"
                      value={tonguePct}
                      onChange={(e) => setTonguePct(e.target.value)}
                      placeholder="0-100%"
                      disabled={progress?.status === "submitted" || progress?.status === "approved"}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleSaveProgress}
                    disabled={progress?.status === "submitted" || progress?.status === "approved"}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Save Progress
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleSubmitForReview}
                    disabled={!canSubmit()}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Submit for Review
                  </Button>
                </div>

                {!canSubmit() && progress?.status !== "submitted" && progress?.status !== "approved" && (
                  <div className="text-sm text-muted-foreground text-center bg-warning/10 border border-warning/20 rounded-xl p-3">
                    Complete all required fields to submit for review
                  </div>
                )}
              </CardContent>
            </Card>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learn More Links */}
            {learnLinksByWeek[parseInt(weekNumber || "0")] && (
              <Section delay={450}>
                <RelatedWeeks 
                  slugs={learnLinksByWeek[parseInt(weekNumber || "0")]} 
                  articles={learnArticles}
                />
              </Section>
            )}

            {/* Messages */}
            <Section delay={500}>
              <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Messages</CardTitle>
                  <CardDescription>Chat with your therapist</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <Send className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          No messages yet. Start a conversation!
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-xl text-sm transition-all ${
                            msg.therapist_id 
                              ? "bg-accent hover:shadow-sm" 
                              : "bg-primary/10 hover:shadow-sm"
                          }`}
                        >
                          <p className="font-semibold mb-1">
                            {msg.therapist_id ? msg.therapist?.name || "Therapist" : "You"}
                          </p>
                          <p className="text-muted-foreground leading-relaxed">{msg.body}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      disabled={progress?.status === "approved"}
                      className="rounded-xl resize-none"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || progress?.status === "approved"}
                      className="h-auto rounded-xl"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default WeekDetail;
