import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConsentDialog } from "@/components/ConsentDialog";

import { Section } from "@/components/ui/Section";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { MessagesCard } from "@/components/dashboard/MessagesCard";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { WeekCard } from "@/components/week/WeekCard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { TodayExercisesCard } from "@/components/dashboard/TodayExercisesCard";
import { CircularGauge } from "@/components/ui/CircularGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProgress, isWeekAccessible } from "@/lib/userProgress";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { PatientHeader } from "@/components/layout/PatientHeader";
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
          setShowCompletion(true);
          
          // Grant the completion badge
          await supabase.functions.invoke("grant-badge", {
            body: { patientId: patientData.id, badgeKey: "program_completed" },
          });
        }
      }

      // Get current week (for now, get week 1)
      const { data: weekData } = await supabase
        .from("weeks")
        .select("*")
        .eq("number", progress?.currentWeek || 1)
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
    
    const accessible = await isWeekAccessible(patient.id, weekNumber);
    if (!accessible) {
      toast({
        title: "Week Locked",
        description: "Please complete the previous week first.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/week/${weekNumber}`);
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center gap-2">
                <img src="/favicon.png" alt="Montrose Myo" className="h-8 w-8" />
                <span className="text-xl font-bold">Montrose Myo</span>
              </div>
            </div>
          </header>
          <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
            <DashboardSkeleton />
          </div>
        </div>
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
      <header className="md:hidden sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src="/favicon.png" alt="Montrose Myo" className="h-8 w-8" />
                <span className="text-xl font-bold">Montrose Myo</span>
              </div>
              <h1 className="text-lg font-semibold">{greeting}, {firstName}!</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-xl">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
        </div>
      </header>

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
            <div className="animate-fade-in">
              <TodayExercisesCard
                weekNumber={currentWeek.number}
                weekTitle={currentWeek.title || `Week ${currentWeek.number}`}
                exercisesCompleted={0}
                totalExercises={5}
                isCompleted={progress?.status === 'completed'}
                onStartSession={() => handleNavigateToWeek(currentWeek.number)}
              />
            </div>

            {/* Core Metrics - 3 Circular Gauges */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 animate-fade-in">
              <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Nasal Breathing</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-4">
                  <CircularGauge
                    value={avgNasalBreathing}
                    label="Consistency"
                    size={120}
                    strokeWidth={10}
                  />
                </CardContent>
              </Card>

              <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tongue Posture</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-4">
                  <CircularGauge
                    value={avgTongueOnSpot}
                    label="Compliance"
                    size={120}
                    strokeWidth={10}
                  />
                </CardContent>
              </Card>

              <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">BOLT Score</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-4">
                  <div className="inline-flex flex-col items-center gap-2">
                    <div className="relative">
                      <svg width={120} height={120} className="transform -rotate-90">
                        <circle
                          cx={60}
                          cy={60}
                          r={52}
                          strokeWidth={10}
                          className="fill-none stroke-muted opacity-20"
                        />
                        <circle
                          cx={60}
                          cy={60}
                          r={52}
                          strokeWidth={10}
                          strokeDasharray={326.73}
                          strokeDashoffset={326.73 * (1 - Math.min(latestBoltScore / 40, 1))}
                          strokeLinecap="round"
                          className="fill-none stroke-primary transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{latestBoltScore}s</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground text-center">
                      {latestBoltScore > 0 ? "Latest Score" : "No Data"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline & Messages */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 animate-fade-in">
              <TimelineCard
                completedWeeks={completedWeeks}
                currentWeek={currentWeek.number}
                onWeekClick={handleNavigateToWeek}
              />

              <div id="messages-card">
                <MessagesCard
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>

            {/* Gamification */}
            {patient && (
              <div className="animate-fade-in">
                <StreakBadge patientId={patient.id} />
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
      />
    </div>
  );
};

export default PatientDashboard;
