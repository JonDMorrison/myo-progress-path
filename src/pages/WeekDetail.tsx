import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Section } from "@/components/ui/Section";
import { WeekIntroductionModal } from "@/components/WeekIntroductionModal";
import { notifyTherapistSubmission } from "@/lib/notify";
import { ResponsiveVideo } from "@/components/week/ResponsiveVideo";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { isWeekAccessible } from "@/lib/userProgress";
import { WeekHeader } from "@/components/week/WeekHeader";
import { WeekObjectives } from "@/components/week/WeekObjectives";
import { WeekProgressForm } from "@/components/week/WeekProgressForm";
import { WeekMessagesPanel } from "@/components/week/WeekMessagesPanel";
import { WeekCompletionChecklist } from "@/components/week/WeekCompletionChecklist";
import { WeekExercisesList } from "@/components/week/WeekExercisesList";
import { SubmitBar } from "@/components/week/SubmitBar";
import { ExerciseProgressSummary } from "@/components/week/ExerciseProgressSummary";

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
  const [canSubmitState, setCanSubmitState] = useState(false);
  const [missingRequirements, setMissingRequirements] = useState<string[]>([]);

  useEffect(() => {
    loadWeekData();
  }, [weekNumber]);

  const loadWeekData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is super admin (bypasses week locks)
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      
      const isSuperAdmin = userData?.role === "super_admin";

      // Get patient
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Check if week is accessible (super admins can access all weeks)
      if (!isSuperAdmin) {
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

      // Check submit eligibility
      checkCanSubmit(patientData.id, weekData.id, progressData);
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

  const checkCanSubmit = async (patientId: string, weekId: string, progressData: any) => {
    try {
      const { data, error } = await supabase.rpc('calc_week_progress', {
        _patient_id: patientId,
        _week_id: weekId
      });

      if (error) {
        console.error('Progress calculation error:', error);
        setCanSubmitState(false);
        setMissingRequirements([]);
        return;
      }

      const result = data as { percent_complete: number; missing: string[] };
      const isComplete = result?.percent_complete === 100;
      const notYetReviewed = progressData?.status === "open" || progressData?.status === "needs_more";
      
      setCanSubmitState(isComplete && notYetReviewed);
      setMissingRequirements(isComplete ? [] : result?.missing || []);
    } catch (error) {
      console.error('Error checking submit eligibility:', error);
      setCanSubmitState(false);
      setMissingRequirements([]);
    }
  };

  const canSubmit = async () => {
    if (!patient || !week || !progress) return false;

    const { data, error } = await supabase.rpc('calc_week_progress', {
      _patient_id: patient.id,
      _week_id: week.id
    });

    if (error) {
      console.error('Progress calculation error:', error);
      return false;
    }

    const progressData = data as { percent_complete: number; missing: string[] };
    const isComplete = progressData?.percent_complete === 100;
    const notYetReviewed = progress?.status === "open" || progress?.status === "needs_more";
    
    return isComplete && notYetReviewed;
  };

  const handleSubmitForReview = async () => {
    if (!progress || !patient) return;

    try {
      const canSubmitNow = await canSubmit();
      if (!canSubmitNow) {
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

      const { error } = await supabase
        .from("patient_week_progress")
        .update({
          status: "submitted",
          completed_at: new Date().toISOString(),
        })
        .eq("id", progress.id);

      if (error) throw error;

      await supabase.from("events").insert({
        patient_id: patient.id,
        type: "submitted_week",
        meta: {
          week_number: parseInt(weekNumber || "1"),
          timestamp: new Date().toISOString(),
        },
      });

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
    if (!patient || !week) return;
    
    const { data: uploadsData } = await supabase
      .from("uploads")
      .select("*")
      .eq("patient_id", patient.id)
      .eq("week_id", week.id)
      .order("created_at", { ascending: false });

    setUploads(uploadsData || []);
  };

  const handleProgressUpdate = async () => {
    if (!patient || !week) return;
    
    const { data: progressData } = await supabase
      .from("patient_week_progress")
      .select("*")
      .eq("patient_id", patient.id)
      .eq("week_id", week.id)
      .single();

    if (progressData) {
      setProgress(progressData);
      // Recheck submit eligibility
      checkCanSubmit(patient.id, week.id, progressData);
    }
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

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*, therapist:therapist_id(name)")
        .eq("patient_id", patient.id)
        .eq("week_id", week.id)
        .order("created_at", { ascending: true });

      setMessages(messagesData || []);
      setNewMessage("");

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

  return (
    <>
      <WeekIntroductionModal
        open={showIntroduction}
        weekNumber={week?.number || 0}
        introduction={week?.introduction || ""}
        onContinue={handleIntroductionContinue}
      />

      <div className="min-h-screen bg-background pb-24 sm:pb-8">
        {/* Header */}
        <WeekHeader
          week={week}
          progress={progress}
          onBack={() => navigate("/patient")}
        />

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
          <MobileContainer>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Introduction */}
                {week?.overview && (
                  <Section delay={0}>
                    <Card className="rounded-2xl border shadow-sm">
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground leading-relaxed">{week.overview}</p>
                      </CardContent>
                    </Card>
                  </Section>
                )}

                {/* Objectives */}
                {week?.objectives && (
                  <Section delay={100}>
                    <WeekObjectives
                      objectives={week.objectives}
                      weekNumber={parseInt(weekNumber || "0")}
                    />
                  </Section>
                )}

                {/* Coaching Video */}
                {week?.video_url && (
                  <Section delay={200}>
                    <Card className="rounded-2xl border shadow-sm overflow-hidden">
                      <CardContent className="p-0">
                        <ResponsiveVideo
                          src={week.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                          title={week.video_title || "Week Video"}
                        />
                      </CardContent>
                    </Card>
                  </Section>
                )}

                {/* Exercise Progress Summary */}
                {exercises.length > 0 && (
                  <Section delay={300}>
                    <ExerciseProgressSummary
                      completedCount={Object.values(progress?.exercise_completions || {}).filter((count): count is number => typeof count === 'number' && count > 0).length}
                      totalCount={exercises.length}
                    />
                  </Section>
                )}

                {/* Exercises */}
                {exercises.length > 0 && (
                  <Section delay={350}>
                    <WeekExercisesList
                      exercises={exercises}
                      patientId={patient?.id}
                      weekId={week?.id}
                      existingCompletions={progress?.exercise_completions || {}}
                      onUpdate={handleProgressUpdate}
                    />
                  </Section>
                )}

                {/* Progress Form */}
                {progress && week && (
                  <Section delay={400}>
                    <Card className="rounded-2xl border shadow-sm">
                      <CardContent className="pt-6">
                        <WeekProgressForm
                          progress={progress}
                          week={week}
                          patientId={patient?.id}
                        />
                      </CardContent>
                    </Card>
                  </Section>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Completion Checklist */}
                <WeekCompletionChecklist
                  progress={progress}
                  week={week}
                  uploads={uploads}
                  exercises={exercises}
                />

                {/* Messages */}
                <WeekMessagesPanel
                  messages={messages}
                  newMessage={newMessage}
                  onMessageChange={setNewMessage}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </MobileContainer>
        </main>

        {/* Submit Bar */}
        {progress && (progress.status === "open" || progress.status === "needs_more") && (
          <SubmitBar
            onComplete={handleSubmitForReview}
            canSubmit={canSubmitState}
            loading={false}
            missingRequirements={missingRequirements}
          />
        )}

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </>
  );
};

export default WeekDetail;
