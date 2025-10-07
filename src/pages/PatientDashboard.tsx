import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LogOut, Calendar, CheckCircle2, Clock, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PatientDashboard = () => {
  const [patient, setPatient] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

      // Get patient record
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Get current week (for now, get week 1)
      const { data: weekData, error: weekError } = await supabase
        .from("weeks")
        .select("*")
        .eq("number", 1)
        .single();

      if (weekError) throw weekError;
      setCurrentWeek(weekData);

      // Get progress for current week
      const { data: progressData } = await supabase
        .from("patient_week_progress")
        .select("*")
        .eq("patient_id", patientData.id)
        .eq("week_id", weekData.id)
        .maybeSingle();

      setProgress(progressData);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: { label: "In Progress", className: "bg-primary/10 text-primary border-primary/20" },
      submitted: { label: "Pending Review", className: "bg-warning/10 text-warning border-warning/20" },
      approved: { label: "Approved", className: "bg-success/10 text-success border-success/20" },
      needs_more: { label: "Needs Practice", className: "bg-secondary/10 text-secondary border-secondary/20" },
      locked: { label: "Locked", className: "bg-muted text-muted-foreground border-muted" },
    };
    
    const variant = variants[status] || variants.open;
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">M</span>
            </div>
            <h1 className="text-2xl font-bold">MyoCoach</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground text-lg">
            Continue your myofunctional therapy journey
          </p>
        </div>

        {/* Current Week Card */}
        {currentWeek && (
          <Card className="mb-6 shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Week {currentWeek.number}</CardTitle>
                    <CardDescription>{currentWeek.title || "Current Week"}</CardDescription>
                  </div>
                </div>
                {progress && getStatusBadge(progress.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Week Progress</span>
                  <span className="font-medium">
                    {progress?.status === "approved" ? "100%" : progress?.status === "submitted" ? "90%" : "30%"}
                  </span>
                </div>
                <Progress 
                  value={progress?.status === "approved" ? 100 : progress?.status === "submitted" ? 90 : 30} 
                  className="h-3"
                />
              </div>

              {/* Quick Stats */}
              {progress && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {progress.bolt_score && (
                    <div className="bg-accent rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{progress.bolt_score}s</p>
                      <p className="text-sm text-muted-foreground">BOLT Score</p>
                    </div>
                  )}
                  {progress.nasal_breathing_pct && (
                    <div className="bg-accent rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-success">{progress.nasal_breathing_pct}%</p>
                      <p className="text-sm text-muted-foreground">Nasal Breathing</p>
                    </div>
                  )}
                  {progress.tongue_on_spot_pct && (
                    <div className="bg-accent rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-secondary">{progress.tongue_on_spot_pct}%</p>
                      <p className="text-sm text-muted-foreground">Tongue Position</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <Button 
                className="w-full h-12 text-base font-medium"
                onClick={() => navigate(`/week/${currentWeek.number}`)}
              >
                {progress?.status === "approved" ? (
                  <>
                    <CheckCircle2 className="mr-2" />
                    Review Week {currentWeek.number}
                  </>
                ) : progress?.status === "submitted" ? (
                  <>
                    <Clock className="mr-2" />
                    Awaiting Therapist Review
                  </>
                ) : (
                  <>
                    Continue Week {currentWeek.number}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Program Overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>24-Week Program Overview</CardTitle>
            <CardDescription>Track your complete therapy journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 24 }, (_, i) => i + 1).map((weekNum) => (
                <button
                  key={weekNum}
                  className={`
                    aspect-square rounded-lg border-2 font-semibold text-sm
                    transition-all hover:scale-105
                    ${weekNum === 1 
                      ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                      : "bg-muted/50 text-muted-foreground border-border"
                    }
                  `}
                >
                  {weekNum}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PatientDashboard;
