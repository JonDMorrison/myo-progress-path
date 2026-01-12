import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConsentDialog } from "@/components/ConsentDialog";
import { Calendar } from "lucide-react";

import { Section } from "@/components/ui/Section";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { MessagesCard } from "@/components/dashboard/MessagesCard";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { WeekCard } from "@/components/week/WeekCard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { TodayExercisesCard } from "@/components/dashboard/TodayExercisesCard";
import { TodayExercisesCardWithProgress } from "@/components/dashboard/TodayExercisesCardWithProgress";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { GamificationPanel } from "@/components/gamification/GamificationPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProgress, isWeekAccessible } from "@/lib/userProgress";
import { grantBadgeWithToast } from "@/lib/gamification";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { PatientHeader } from "@/components/layout/PatientHeader";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProgramCompletionModal } from "@/components/ProgramCompletionModal";

const PatientDashboard = () => {
  const [patient, setPatient] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [allProgress, setAllProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConsent, setShowConsent] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<{ note?: string; therapistName?: string } | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);

      // Check if user is super admin (bypasses week locks)
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      
      setIsSuperAdmin(userData?.role === "super_admin");

      // Get patient record
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Check consent
      if (!patientData.consent_accepted_at) {
        setShowConsent(true);
        setLoading(false);
        return;
      }

      // Check if onboarding is completed
      const { data: onboarding } = await supabase
        .from("onboarding_progress")
        .select("completed_at")
        .eq("patient_id", patientData.id)
        .maybeSingle();

      if (!onboarding?.completed_at) {
        navigate("/onboarding");
        return;
      }

      // Grant first_login badge (idempotent - shows toast only on first earn)
      grantBadgeWithToast(patientData.id, "first_login", toast).catch(console.error);

      // Load user progress
      const progress = await getUserProgress(patientData.id);
      setUserProgress(progress);

      // Get ALL patient week progress to calculate averages
      const { data: allProgressData } = await supabase
        .from("patient_week_progress")
        .select("*, week:weeks(number)")
        .eq("patient_id", patientData.id)
        .in("status", ["submitted", "approved"]);

      setAllProgress(allProgressData || []);

      // Check if week 24 is completed and show celebration
      const week24Progress = allProgressData?.find((p: any) => p.week?.number === 24 && p.status === "approved");
      if (week24Progress) {
        // Check if user has already seen the completion modal (by checking if they have the badge)
        const { data: badge } = await supabase
          .from("earned_badges")
          .select("*")
          .eq("patient_id", patientData.id)
          .eq("badge_key", "program_completed")
          .maybeSingle();

        // If week 24 is approved but badge doesn't exist, show modal and grant badge
        if (!badge) {
          // Fetch completion note and therapist name
          const { data: completionInfo } = await supabase
            .from("patients")
            .select("completion_note, assigned_therapist_id")
            .eq("id", patientData.id)
            .single();
          
          let therapistName = 'Your Therapist';
          if (completionInfo?.assigned_therapist_id) {
            const { data: therapistData } = await supabase
              .from("users")
              .select("name")
              .eq("id", completionInfo.assigned_therapist_id)
              .single();
            therapistName = therapistData?.name || 'Your Therapist';
          }
          
          setCompletionData({
            note: completionInfo?.completion_note || undefined,
            therapistName,
          });
          setShowCompletion(true);
          
          // Grant the completion badge
          await supabase.functions.invoke("grant-badge", {
            body: { patientId: patientData.id, badgeKey: "program_completed" },
          });
        }
      }

      // Get current week based on patient's program_variant
      const programVariant = (patientData.program_variant as string) || 'frenectomy';
      const programTitle = programVariant === 'non_frenectomy' 
        ? 'Non-Frenectomy Program'
        : 'Frenectomy Program';
      
      const { data: weekData } = await supabase
        .from("weeks")
        .select("*, programs!inner(title)")
        .eq("number", progress?.currentWeek || 1)
        .eq("programs.title", programTitle)
        .maybeSingle();

      setCurrentWeek(weekData);

      // Get progress for current week if week exists
      if (weekData) {
        const { data: progressData } = await supabase
          .from("patient_week_progress")
          .select("*")
          .eq("patient_id", patientData.id)
          .eq("week_id", weekData.id)
          .maybeSingle();

        setProgress(progressData);

        // Get messages
        const { data: messagesData } = await supabase
          .from("messages")
          .select("*, therapist:therapist_id(name)")
          .eq("patient_id", patientData.id)
          .order("created_at", { ascending: false })
          .limit(10);

        setMessages(messagesData || []);
      }
    } catch (error: any) {
      console.error("Error loading patient data:", error);
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSendMessage = async (messageText: string) => {
    if (!patient || !currentWeek) return;

    try {
      const { error } = await supabase.from("messages").insert({
        patient_id: patient.id,
        week_id: currentWeek.id,
        therapist_id: patient.assigned_therapist_id,
        body: messageText,
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Your therapist will respond soon.",
      });

      // Reload messages
      loadPatientData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNavigateToWeek = async (weekNumber: number) => {
    if (!patient) return;
    
    // Super admins can access all weeks
    if (!isSuperAdmin) {
      const accessible = await isWeekAccessible(patient.id, weekNumber);
      if (!accessible) {
        toast({
          title: "Week Locked",
          description: "Please complete the previous week first.",
          variant: "destructive",
        });
        return;
      }
    }
    
    navigate(`/week/${weekNumber}`);
  };

  if (loading) {
    return (
      <MobileContainer>
        <LoadingSpinner message="Loading your dashboard..." />
        <BottomNav />
      </MobileContainer>
    );
  }

  // Show consent dialog if not accepted
  if (showConsent && patient) {
    return (
      <ConsentDialog
        open={showConsent}
        patientId={patient.id}
        onConsent={() => {
          setShowConsent(false);
          loadPatientData();
        }}
      />
    );
  }

  const firstName = user?.user_metadata?.name?.split(" ")[0] || "there";
  const completedWeeks = userProgress?.completedWeeks || 0;
  
  // Calculate averages from all completed weeks
  const avgNasalBreathing = allProgress.length > 0
    ? Math.round(allProgress.reduce((sum, p) => sum + (p.nasal_breathing_pct || 0), 0) / allProgress.length)
    : 0;
  const avgTongueOnSpot = allProgress.length > 0
    ? Math.round(allProgress.reduce((sum, p) => sum + (p.tongue_on_spot_pct || 0), 0) / allProgress.length)
    : 0;
  const latestBoltScore = allProgress.length > 0
    ? allProgress.filter(p => p.bolt_score).sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]?.bolt_score || 0
    : 0;
  
  // Get greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header Navigation */}
      <PatientHeader userName={user?.user_metadata?.name} />
      
      {/* Mobile Header (shows on mobile only) */}
      <DashboardHeader 
        greeting={greeting}
        firstName={firstName}
        onSignOut={handleSignOut}
      />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <MobileContainer>
        {!currentWeek ? (
          <Section>
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="py-16 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Weeks Available Yet</h3>
                <p className="text-muted-foreground">
                  Your program content will be available soon. Please check back later.
                </p>
              </CardContent>
            </Card>
          </Section>
        ) : (
          <div className="space-y-6 pb-24">
            {/* Today's Exercises - Primary CTA */}
            <TodayExercisesCardWithProgress 
              patientId={patient?.id}
              currentWeek={currentWeek}
              progress={progress}
              onStartSession={handleNavigateToWeek}
            />

            {/* Core Metrics - 3 Circular Gauges */}
            <div className="animate-fade-in">
              <StatsOverview
                nasalBreathing={avgNasalBreathing}
                tonguePosture={avgTongueOnSpot}
                boltScore={latestBoltScore}
              />
            </div>

            {/* Timeline & Messages */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 animate-fade-in">
              <TimelineCard
                completedWeeks={completedWeeks}
                currentWeek={currentWeek.number}
                programVariant={patient?.program_variant || 'frenectomy'}
                onWeekClick={handleNavigateToWeek}
                isSuperAdmin={isSuperAdmin}
              />

              <div id="messages-card">
                <MessagesCard
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>

            {/* Gamification & Achievements */}
            {patient && (
              <div className="space-y-4 animate-fade-in">
                <StreakBadge patientId={patient.id} />
                <GamificationPanel patientId={patient.id} clinicId={patient.clinic_id} />
              </div>
            )}
          </div>
        )}
        </MobileContainer>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
      
      {/* Program Completion Celebration */}
      <ProgramCompletionModal 
        open={showCompletion} 
        onClose={() => setShowCompletion(false)}
        completionNote={completionData?.note}
        therapistName={completionData?.therapistName}
      />
    </div>
  );
};

export default PatientDashboard;
