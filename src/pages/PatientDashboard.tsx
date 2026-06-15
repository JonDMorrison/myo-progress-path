import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Lock } from "lucide-react";
import { getModuleInfo, getModuleAnchorWeek } from "@/lib/moduleUtils";

import { Section } from "@/components/ui/Section";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { MessagesCard } from "@/components/dashboard/MessagesCard";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { GamificationPanel } from "@/components/gamification/GamificationPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserProgress, isWeekAccessible } from "@/lib/userProgress";
import { grantBadgeWithToast } from "@/lib/gamification";
import { getProgramTitle, patientRequiresVideo } from "@/lib/constants";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { PatientHeader } from "@/components/layout/PatientHeader";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProgramCompletionModal } from "@/components/ProgramCompletionModal";
import { MaintenanceDashboard } from "@/components/maintenance/MaintenanceDashboard";
import { TodayExercisesCardWithProgress } from "@/components/dashboard/TodayExercisesCardWithProgress";

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
  const { user: authUser, isAuthReady: isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!authUser) return;
    loadPatientData(authUser);
  }, [isReady, authUser?.id]);

  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);
      }
    };
    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, []);

  const loadPatientData = async (authUser: any) => {
    try {
      setUser(authUser);

      const { data: userData } = await supabase.from("users").select("role").eq("id", authUser.id).single();
      setIsSuperAdmin(userData?.role === "super_admin");

      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (patientError) throw patientError;
      if (!patientData) {
        if (userData?.role === "therapist" || userData?.role === "admin" || userData?.role === "super_admin") {
          navigate("/therapist");
          return;
        }
        navigate("/");
        return;
      }

      setPatient(patientData);

      const { data: onboarding } = await supabase
        .from("onboarding_progress")
        .select("completed_at")
        .eq("patient_id", patientData.id)
        .maybeSingle();

      if (!onboarding?.completed_at) {
        navigate("/onboarding");
        return;
      }

      grantBadgeWithToast(patientData.id, "first_login", toast).catch(console.error);

      const progressSummary = await getUserProgress(patientData.id);
      setUserProgress(progressSummary);

      const { data: allProgressData } = await supabase
        .from("patient_week_progress")
        .select("*, week:weeks(number)")
        .eq("patient_id", patientData.id)
        .in("status", ["submitted", "approved"]);

      setAllProgress(allProgressData || []);

      const week24Progress = allProgressData?.find((p: any) => p.week?.number === 24 && p.status === "approved");
      if (week24Progress) {
        const { data: badge } = await supabase
          .from("earned_badges")
          .select("*")
          .eq("patient_id", patientData.id)
          .eq("badge_key", "program_completed")
          .maybeSingle();

        if (!badge) {
          setCompletionData({ therapistName: 'Your Therapist' });
          setShowCompletion(true);
          try {
            await supabase.functions.invoke("grant-badge", { body: { patientId: patientData.id, badgeKey: "program_completed" } });
          } catch (e) {
            console.error('grant-badge failed:', e);
          }
        }
      }

      const programVariant = (patientData.program_variant as string) || 'frenectomy';
      const programTitle = getProgramTitle(programVariant);

      const { data: weekData } = await supabase
        .from("weeks")
        .select("*, programs!inner(title)")
        .eq("number", progressSummary?.currentWeek || 1)
        .eq("programs.title", programTitle)
        .maybeSingle();

      setCurrentWeek(weekData);

      if (weekData) {
        const { data: progressData } = await supabase
          .from("patient_week_progress")
          .select("*")
          .eq("patient_id", patientData.id)
          .eq("week_id", weekData.id)
          .maybeSingle();

        setProgress(progressData);
      }

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setMessages((messagesData || []).reverse());
    } catch (error: any) {
      console.error("Error loading patient data:", error);
      toast({ title: "Error", description: "Failed to load your data. Please try again.", variant: "destructive" });
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
        body: messageText,
        sent_by: 'patient',
      } as any);

      if (error) throw error;

      toast({ title: "Message sent!", description: "Your therapist will respond soon." });
      if (user) loadPatientData(user);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleNavigateToWeek = async (weekNumber: number) => {
    if (!patient) return;
    if (!isSuperAdmin) {
      const accessible = await isWeekAccessible(patient.id, weekNumber);
      if (!accessible) {
        toast({ title: "Module Locked", description: "Please complete the previous module first.", variant: "destructive" });
        return;
      }
    }
    const anchor = getModuleAnchorWeek(weekNumber, patient.program_variant || "frenectomy");
    navigate(`/week/${anchor}`);
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
  const avgNasalBreathing = allProgress.length > 0 ? Math.round(allProgress.reduce((sum, p) => sum + (p.nasal_breathing_pct || 0), 0) / allProgress.length) : 0;
  const avgTongueOnSpot = allProgress.length > 0 ? Math.round(allProgress.reduce((sum, p) => sum + (p.tongue_on_spot_pct || 0), 0) / allProgress.length) : 0;
  const latestBoltScore = allProgress.length > 0 ? allProgress.filter(p => p.bolt_score).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0]?.bolt_score || 0 : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const canUseMessages = patientRequiresVideo(patient);

  return (
    <div className="min-h-screen bg-[#FDFDFD] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] -z-10" />

      <PatientHeader userName={user?.user_metadata?.name} />
      <DashboardHeader greeting={greeting} firstName={firstName} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-5xl relative z-10">
        <MobileContainer>
          {false ? (
            <MaintenanceDashboard patientId={patient.id} clinicId={'a1b2c3d4-e5f6-7890-abcd-ef1234567890'} userName={user?.user_metadata?.name} />
          ) : !currentWeek ? (
            <Section>
              <Card className="rounded-3xl border-none shadow-elevated bg-white/80 backdrop-blur-md">
                <CardContent className="py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar className="w-10 h-10 text-slate-400" /></div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Setting Up Your Journey</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Your personalized therapy content is currently being prepared. Check back shortly to begin.</p>
                </CardContent>
              </Card>
            </Section>
          ) : (
            <div className="space-y-8 pb-24">
              <div className="animate-fade-in-up transform transition-all duration-500">
                <TodayExercisesCardWithProgress patientId={patient?.id} currentWeek={currentWeek} progress={progress} programVariant={patient?.program_variant || 'frenectomy'} onStartSession={handleNavigateToWeek} />
              </div>

              <div className="animate-fade-in [animation-delay:200ms]">
                <div className="mb-4 flex items-center justify-between px-1">
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight italic">Your Vital Signs</h2>
                  <div className="h-px flex-1 bg-slate-100 mx-4 hidden sm:block" />
                </div>
                <StatsOverview nasalBreathing={avgNasalBreathing} tonguePosture={avgTongueOnSpot} boltScore={latestBoltScore} />
              </div>

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 animate-fade-in [animation-delay:400ms]">
                <div className="lg:col-span-7">
                  <div className="mb-4 flex items-center gap-3 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight italic">Program Path</h2>
                  </div>
                  <TimelineCard completedWeeks={completedWeeks} currentWeek={currentWeek.number} programVariant={patient?.program_variant || 'frenectomy'} onWeekClick={handleNavigateToWeek} isSuperAdmin={isSuperAdmin} />

                  {(() => {
                    const moduleDescriptions: Record<number, string> = {
                      1: "Foundation building — clicks, tongue trace, BOLT test and elastic hold",
                      2: "Strengthening — tongue points, tongue in cheek, K sounds and brushing",
                      3: "Coordination — lip trace, 4-7-8 breathing and cheek resistance",
                      4: "Swallowing — perfect bowl, lip pops, teeth trace and over breathing",
                      5: "Integration — pickle tongue, smile swallows, button pulls and mouth taping",
                      6: "Consolidation — nasal breathing, swallowing patterns and posture",
                      7: "Mid-program review — building on all foundations so far",
                      8: "Advanced exercises — increasing difficulty and duration",
                      9: "Habit formation — exercises becoming automatic",
                      10: "Self study — independent practice with check-in",
                      11: "Refinement — fine-tuning technique",
                      12: "Final push — 85%+ consistency targets",
                      13: "Maintenance — long-term habit review",
                    };
                    const variant = patient?.program_variant || 'frenectomy';
                    const currentModule = getModuleInfo(currentWeek.number, variant).moduleNumber;
                    const upcoming: { moduleNumber: number; label: string; weekRange: [number, number] }[] = [];
                    for (let w = 1; w <= 24 && upcoming.length < 3; w++) {
                      const info = getModuleInfo(w, variant);
                      if (info.moduleNumber > currentModule && !upcoming.some(u => u.moduleNumber === info.moduleNumber)) upcoming.push({ moduleNumber: info.moduleNumber, label: info.displayLabel, weekRange: info.weekRange });
                    }
                    if (upcoming.length === 0) return null;
                    return (
                      <div className="mt-8">
                        <div className="mb-4 flex items-center gap-3 px-1"><Lock className="w-4 h-4 text-slate-400" /><h2 className="text-lg font-bold text-slate-600 tracking-tight">What's Coming</h2></div>
                        <div className="space-y-3">
                          {upcoming.map(m => (
                            <div key={m.moduleNumber} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white/60">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0"><Lock className="w-5 h-5 text-slate-400" /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-600">{m.label}</p>
                                {moduleDescriptions[m.moduleNumber] && <p className="text-xs text-slate-500 mt-0.5">{moduleDescriptions[m.moduleNumber]}</p>}
                                <p className="text-xs text-slate-400 mt-0.5">Weeks {m.weekRange[0]}–{m.weekRange[1]}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="lg:col-span-5 space-y-6">
                  {(canUseMessages || messages.length > 0) && (
                    <div id="messages-card">
                      <div className="mb-4 flex items-center justify-between px-1">
                        <div className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-secondary-foreground" /><h2 className="text-lg font-bold text-slate-800 tracking-tight italic">Messages & Feedback</h2></div>
                        {messages.filter(m => m.therapist_id || m.sent_by === 'therapist').length > 0 && <Badge variant="secondary" className="bg-primary/10 text-primary animate-pulse border-none text-[10px] font-bold uppercase tracking-widest">New Feedback</Badge>}
                      </div>
                      <MessagesCard messages={messages} onSendMessage={handleSendMessage} canSend={canUseMessages} />
                    </div>
                  )}

                  {patient && (
                    <div id="account-section" className="space-y-4">
                      <StreakBadge patientId={patient.id} />
                      <GamificationPanel patientId={patient.id} clinicId={'a1b2c3d4-e5f6-7890-abcd-ef1234567890'} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </MobileContainer>
      </main>

      <BottomNav />
      <ProgramCompletionModal open={showCompletion} onClose={() => setShowCompletion(false)} completionNote={completionData?.note} therapistName={completionData?.therapistName} />
    </div>
  );
};

export default PatientDashboard;
