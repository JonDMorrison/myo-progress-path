import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoUpload } from "@/components/week/VideoUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Send, CheckCircle2, AlertCircle, HelpCircle, Video, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Section } from "@/components/ui/Section";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BOLTHelpContent } from "@/components/BOLTHelpContent";
import { NasalBreathingHelpContent } from "@/components/NasalBreathingHelpContent";
import { WeekIntroductionModal } from "@/components/WeekIntroductionModal";

import { notifyTherapistSubmission } from "@/lib/notify";
import { learnLinksByWeek, loadLearnIndex, LearnArticle } from "@/lib/learn";
import { RelatedWeeks } from "@/components/learn/RelatedWeeks";
import { LearnChips } from "@/components/week/LearnChips";
import { NasalUnblockModal } from "@/components/learn/NasalUnblockModal";
import { ResponsiveVideo } from "@/components/week/ResponsiveVideo";
import { SubmitBar } from "@/components/week/SubmitBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { ExerciseCompletionTracker } from "@/components/week/ExerciseCompletionTracker";

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

    try {
      // Save current data first
      await handleSaveProgress();

      // Then check if can submit
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

  const handleVideoUploadComplete = async () => {
    // Only reload uploads, don't reload all data which would clear form fields
    if (!patient || !week) return;
    
    const { data: uploadsData } = await supabase
      .from("uploads")
      .select("*")
      .eq("patient_id", patient.id)
      .eq("week_id", week.id)
      .order("created_at", { ascending: false });

    setUploads(uploadsData || []);
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

      <div className="min-h-screen bg-background pb-24 sm:pb-8">
        {/* Modern Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
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
            <h1 className="text-3xl font-bold mb-1">{week?.title ? `${week.title} - Week ${week.number}` : `Week ${week?.number || weekNumber}`}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <MobileContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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

            {/* Objectives - Single column on mobile, 2-col on desktop */}
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
                    
                  </CardContent>
                </Card>
              </Section>
            )}

            {/* Coaching Video - Responsive 16:9 */}
            {week?.video_title && week?.video_url && (
              <Section delay={300}>
                <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Play className="h-5 w-5 text-primary" />
                      {week.video_title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ResponsiveVideo 
                      src={week.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      title={week.video_title}
                    />
                  </CardContent>
                </Card>
              </Section>
            )}

            {/* Exercises */}
            <Section delay={300} className="pb-32">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">Exercises</h3>
                  <Badge variant="secondary">Mark each session as you complete it</Badge>
                </div>
                <ExerciseCompletionTracker
                  patientId={patient?.id}
                  weekId={week?.id}
                  exercises={exercises}
                  existingCompletions={progress?.exercise_completions || {}}
                />
              </div>
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
                        <VideoUpload
                          patientId={patient.id}
                          weekId={week.id}
                          kind="first_attempt"
                          onUploadComplete={handleVideoUploadComplete}
                          disabled={progress?.status === "submitted" || progress?.status === "approved"}
                          hasExisting={!!uploads.find(u => u.kind === 'first_attempt')}
                        />
                      </div>
                    )}

                    {week.requires_video_last && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Last Attempt Video</Label>
                        <VideoUpload
                          patientId={patient.id}
                          weekId={week.id}
                          kind="last_attempt"
                          onUploadComplete={handleVideoUploadComplete}
                          disabled={progress?.status === "submitted" || progress?.status === "approved"}
                          hasExisting={!!uploads.find(u => u.kind === 'last_attempt')}
                        />
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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="nasal" className="text-sm font-medium">% Time Nasal Breathing</Label>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-96">
                          <NasalBreathingHelpContent />
                        </HoverCardContent>
                      </HoverCard>
                    </div>
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
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-sm text-muted-foreground">Having trouble breathing through your nose?</p>
                      <NasalUnblockModal />
                    </div>
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

          {/* Sidebar - becomes full width on mobile */}
          <div className="space-y-4 sm:space-y-6">
            {/* Messages - Not sticky on mobile */}
            <Section delay={500}>
              <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow lg:sticky lg:top-24">
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
        </MobileContainer>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
      </div>
    </>
  );
};

export default WeekDetail;
