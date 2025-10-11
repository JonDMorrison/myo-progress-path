import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConsentDialog } from "@/components/ConsentDialog";
import MyoCoachLogo from "@/assets/MyoCoach_Logo.png";
import { Section } from "@/components/ui/Section";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { MessagesCard } from "@/components/dashboard/MessagesCard";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { WeekCard } from "@/components/week/WeekCard";
import { PersonalizedHero } from "@/components/dashboard/PersonalizedHero";
import { QuickStatsBar } from "@/components/dashboard/QuickStatsBar";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { CircularGauge } from "@/components/ui/CircularGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProgress, isWeekAccessible } from "@/lib/userProgress";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";

const PatientDashboard = () => {
  const [patient, setPatient] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConsent, setShowConsent] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
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
              <img src={MyoCoachLogo} alt="MyoCoach" className="h-10 w-auto" />
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

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src={MyoCoachLogo} alt="MyoCoach" className="h-10 w-auto" />
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-xl">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          
          {/* Progress Bar */}
          {userProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Week {userProgress.currentWeek} of {userProgress.totalWeeks}
                </span>
                <span className="font-medium">{userProgress.percentComplete}% Complete</span>
              </div>
              <Progress value={userProgress.percentComplete} className="h-2" />
              {userProgress.lastActivityDate && (
                <p className="text-xs text-muted-foreground">
                  Last activity: {new Date(userProgress.lastActivityDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
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
            {/* Personalized Hero */}
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
              <PersonalizedHero
                patientName={firstName}
                onSendMessage={() => {
                  const messagesSection = document.getElementById("messages-card");
                  messagesSection?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>

            {/* Quick Stats Bar */}
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
              <QuickStatsBar
                nasalBreathing={progress?.nasal_breathing_pct || 0}
                tonguePosture={progress?.tongue_on_spot_pct || 0}
                boltScore={progress?.bolt_score || 0}
                weekProgress={userProgress?.percentComplete || 0}
              />
            </div>

            {/* Active Weeks */}
            {userProgress?.weekStatuses?.filter((week: any) => !week.isLocked).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Your Active Weeks</h2>
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  {userProgress?.weekStatuses
                    .filter((week: any) => !week.isLocked)
                    .map((week: any, index: number) => (
                      <div
                        key={week.weekNumber}
                        className="opacity-0 animate-fade-in-up"
                        style={{ animationDelay: `${200 + index * 100}ms`, animationFillMode: "forwards" }}
                      >
                        <WeekCard
                          week={week}
                          weekTitle={`Week ${week.weekNumber}`}
                          onNavigate={() => handleNavigateToWeek(week.weekNumber)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Circular Gauges */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <Card className="opacity-0 animate-fade-in-up rounded-2xl border shadow-sm hover:shadow-md transition-all" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
                <CardHeader>
                  <CardTitle>Nasal Breathing</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                  <CircularGauge
                    value={progress?.nasal_breathing_pct || 0}
                    label="Consistency"
                    size={120}
                    strokeWidth={10}
                  />
                </CardContent>
              </Card>

              <Card className="opacity-0 animate-fade-in-up rounded-2xl border shadow-sm hover:shadow-md transition-all" style={{ animationDelay: "450ms", animationFillMode: "forwards" }}>
                <CardHeader>
                  <CardTitle>Tongue Posture</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                  <CircularGauge
                    value={progress?.tongue_on_spot_pct || 0}
                    label="Compliance"
                    size={120}
                    strokeWidth={10}
                  />
                </CardContent>
              </Card>

              <Card className="opacity-0 animate-fade-in-up rounded-2xl border shadow-sm hover:shadow-md transition-all" style={{ animationDelay: "500ms", animationFillMode: "forwards" }}>
                <CardHeader>
                  <CardTitle>BOLT Score</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
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
                          strokeDashoffset={326.73 * (1 - Math.min((progress?.bolt_score || 0) / 40, 1))}
                          strokeLinecap="round"
                          className="fill-none stroke-primary transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{progress?.bolt_score || 0}s</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground text-center">Average Score</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Grid - Timeline & Messages */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "550ms", animationFillMode: "forwards" }}>
                <TimelineCard
                  completedWeeks={completedWeeks}
                  currentWeek={currentWeek.number}
                  onWeekClick={handleNavigateToWeek}
                />
              </div>

              <div id="messages-card" className="opacity-0 animate-fade-in-up" style={{ animationDelay: "600ms", animationFillMode: "forwards" }}>
                <MessagesCard
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onViewAll={() => navigate(`/week/${currentWeek.number}`)}
                />
              </div>
            </div>

            {/* Gamification Section */}
            {patient && (
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "650ms", animationFillMode: "forwards" }}>
                <StreakBadge patientId={patient.id} />
              </div>
            )}
          </div>
        )}
        </MobileContainer>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default PatientDashboard;
