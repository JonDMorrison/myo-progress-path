import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthReady } from "@/hooks/useAuthReady";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

import { Section } from "@/components/ui/Section";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { MessagesCard } from "@/components/dashboard/MessagesCard";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { TodayExercisesCard } from "@/components/dashboard/TodayExercisesCard";
import { TodayExercisesCardWithProgress } from "@/components/dashboard/TodayExercisesCardWithProgress";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { GamificationPanel } from "@/components/gamification/GamificationPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserProgress, isWeekAccessible } from "@/lib/userProgress";
import { grantBadgeWithToast } from "@/lib/gamification";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { PatientHeader } from "@/components/layout/PatientHeader";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProgramCompletionModal } from "@/components/ProgramCompletionModal";
import { MaintenanceDashboard } from "@/components/maintenance/MaintenanceDashboard";

const PatientDashboard = () => {
  const [patient, setPatient] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [allProgress, setAllProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<{ note?: string; therapistName?: string } | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session?.user) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            if (newSession?.user && !cancelled) {
              subscription.unsubscribe();
              loadPatientData(newSession.user);
            }
          }
        );
        setTimeout(() => {
          subscription.unsubscribe();
          if (!cancelled) navigate("/auth");
        }, 10000);
        return;
      }

      loadPatientData(session.user);
    };

    init();
    
    // Smooth Hash Scroll logic
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 500);
        }
      }
    };

    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    return () => {
      cancelled = true;
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, []);

  const loadPatientData = async (authUser: any) => {
    try {
      setUser(authUser);

      // Check if user is super admin (bypasses week locks)
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", authUser.id)
        .single();

      setIsSuperAdmin(userData?.role === "super_admin");

      // Get patient record
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (patientError) throw patientError;

      if (!patientData) {
        // If not a patient but is staff, redirect to therapist dashboard
        if (userData?.role === "therapist" || userData?.role === "admin" || userData?.role === "super_admin") {
          navigate("/therapist");
          return;
        }
        // Otherwise send to home (or could be redirected to /onboarding if we had a way to create a profile)
        navigate("/");
        return;
      }

      setPatient(patientData);


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
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      localStorage.clear();
      window.location.href = "/auth";
    }
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
      if (user) loadPatientData(user);
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
          title: "Module Locked",
          description: "Please complete the previous module first.",
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
    ? allProgress.filter(p => p.bolt_score).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0]?.bolt_score || 0
    : 0;

  // Get greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#FDFDFD] relative overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] -z-10" />

      {/* Desktop Header Navigation */}
      <PatientHeader userName={user?.user_metadata?.name} />

      {/* Mobile Header */}
      <DashboardHeader
        greeting={greeting}
        firstName={firstName}
        onSignOut={handleSignOut}
      />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-5xl relative z-10">
        <MobileContainer>
          {/* Maintenance Mode Dashboard */}
          {patient?.status === "maintenance" ? (
            <MaintenanceDashboard
              patientId={patient.id}
              clinicId={patient.clinic_id}
              userName={user?.user_metadata?.name}
            />
          ) : !currentWeek ? (
            <Section>
              <Card className="rounded-3xl border-none shadow-elevated bg-white/80 backdrop-blur-md">
                <CardContent className="py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Setting Up Your Journey</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Your personalized therapy content is currently being prepared. Check back shortly to begin.
                  </p>
                </CardContent>
              </Card>
            </Section>
          ) : (
            <div className="space-y-8 pb-24">
              {/* Primary Action Card with Slide-up Animation */}
              <div className="animate-fade-in-up transform transition-all duration-500">
                <TodayExercisesCardWithProgress
                  patientId={patient?.id}
                  currentWeek={currentWeek}
                  progress={progress}
                  programVariant={patient?.program_variant || 'frenectomy'}
                  onStartSession={handleNavigateToWeek}
                />
              </div>

              {/* Core Metrics with Staggered Fade */}
              <div className="animate-fade-in [animation-delay:200ms]">
                <div className="mb-4 flex items-center justify-between px-1">
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight italic">Your Vital Signs</h2>
                  <div className="h-px flex-1 bg-slate-100 mx-4 hidden sm:block" />
                </div>
                <StatsOverview
                  nasalBreathing={avgNasalBreathing}
                  tonguePosture={avgTongueOnSpot}
                  boltScore={latestBoltScore}
                />
              </div>

              {/* Timeline & Secondary Cards */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 animate-fade-in [animation-delay:400ms]">
                <div className="lg:col-span-7">
                  <div className="mb-4 flex items-center gap-3 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight italic">Program Path</h2>
                  </div>
                  <TimelineCard
                    completedWeeks={completedWeeks}
                    currentWeek={currentWeek.number}
                    programVariant={patient?.program_variant || 'frenectomy'}
                    onWeekClick={handleNavigateToWeek}
                    isSuperAdmin={isSuperAdmin}
                  />
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div id="messages-card">
                    <div className="mb-4 flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary-foreground" />
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight italic">Messages & Feedback</h2>
                      </div>
                      {messages.filter(m => m.therapist_id).length > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary animate-pulse border-none text-[10px] font-bold uppercase tracking-widest">
                          New Feedback
                        </Badge>
                      )}
                    </div>
                    <MessagesCard
                      messages={messages}
                      onSendMessage={handleSendMessage}
                    />
                  </div>

                  {/* Gamification Sidebar Segment */}
                  {patient && (
                    <div id="account-section" className="space-y-4">
                      <StreakBadge patientId={patient.id} />
                      <GamificationPanel patientId={patient.id} clinicId={patient.clinic_id} />
                    </div>
                  )}
                </div>
              </div>
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
