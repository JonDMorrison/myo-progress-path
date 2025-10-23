import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, UserCheck, Clock, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AtRiskPatients } from "@/components/reports/AtRiskPatients";
import { startOfWeek, endOfWeek } from "date-fns";

const TherapistDashboard = () => {
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activePatients, setActivePatients] = useState(0);
  const [reviewedThisWeek, setReviewedThisWeek] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log("Loading dashboard data...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found, redirecting to auth");
        navigate("/auth");
        return;
      }

      console.log("User found:", user.id);
      setUserId(user.id);

      // Check if user is admin or super admin
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role === "admin") {
        setIsAdmin(true);
      }
      
      if (userData?.role === "super_admin") {
        setIsSuperAdmin(true);
        setIsAdmin(true);
      }

      // Get pending reviews
      const { data: pendingData, error: pendingError } = await supabase
        .from("patient_week_progress")
        .select(`
          *,
          patient:patients(
            id,
            user:users(name, email)
          ),
          week:weeks(number, title)
        `)
        .eq("status", "submitted")
        .order("completed_at", { ascending: false });

      if (pendingError) throw pendingError;
      setPendingReviews(pendingData || []);

      // Get active patients count
      const patientsQuery = supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");

      if (userData?.role === "therapist") {
        patientsQuery.eq("assigned_therapist_id", user.id);
      }

      const { count: patientsCount } = await patientsQuery;
      setActivePatients(patientsCount || 0);

      // Get reviewed this week count
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();

      const reviewedQuery = supabase
        .from("patient_week_progress")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved")
        .gte("completed_at", weekStart)
        .lte("completed_at", weekEnd);

      if (userData?.role === "therapist") {
        // Join with patients to filter by therapist
        const { data: reviewedData } = await supabase
          .from("patient_week_progress")
          .select(`
            id,
            patients!inner(assigned_therapist_id)
          `)
          .eq("status", "approved")
          .eq("patients.assigned_therapist_id", user.id)
          .gte("completed_at", weekStart)
          .lte("completed_at", weekEnd);

        setReviewedThisWeek(reviewedData?.length || 0);
      } else {
        const { count: reviewedCount } = await reviewedQuery;
        setReviewedThisWeek(reviewedCount || 0);
      }

    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      console.log("Dashboard data loading complete, setting loading to false");
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
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Montrose Myo" className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Montrose Myo</h1>
              <p className="text-sm text-muted-foreground">Therapist Portal</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => navigate("/therapist/patients")}>
            <Users className="mr-2 h-4 w-4" />
            Patients
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/therapist/ai-assist")}>
            <span className="mr-2">✨</span>
            AI Assistant
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
            <span className="mr-2">📊</span>
            Reports
          </Button>
          {isSuperAdmin && (
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/master")}>
              <span className="mr-2">👑</span>
              Master Admin
            </Button>
          )}
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/content")}>
              <span className="mr-2">⚙️</span>
              Admin
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2" />
            Sign Out
          </Button>
        </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-warning">{pendingReviews.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                </div>
                <Clock className="w-10 h-10 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-success">{reviewedThisWeek}</p>
                  <p className="text-sm text-muted-foreground">Reviewed This Week</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">{activePatients}</p>
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                </div>
                <UserCheck className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* At-Risk Patients */}
        {userId && (
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardDescription>Patients who may need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <AtRiskPatients therapistId={userId} />
            </CardContent>
          </Card>
        )}

        {/* Pending Reviews */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Pending Reviews
            </CardTitle>
            <CardDescription>Patients waiting for your feedback</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingReviews.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">All caught up!</p>
                <p className="text-muted-foreground">No pending reviews at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <Card key={review.id} className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {review.patient?.user?.name || "Unknown Patient"}
                            </h3>
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                              Week {review.week?.number}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {review.patient?.user?.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {new Date(review.completed_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {review.bolt_score && (
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">{review.bolt_score}s</p>
                              <p className="text-xs text-muted-foreground">BOLT</p>
                            </div>
                          )}
                          {review.nasal_breathing_pct && (
                            <div className="text-center">
                              <p className="text-2xl font-bold text-success">{review.nasal_breathing_pct}%</p>
                              <p className="text-xs text-muted-foreground">Nasal</p>
                            </div>
                          )}
                          {review.tongue_on_spot_pct && (
                            <div className="text-center">
                              <p className="text-2xl font-bold text-secondary">{review.tongue_on_spot_pct}%</p>
                              <p className="text-xs text-muted-foreground">Tongue</p>
                            </div>
                          )}
                          <Button
                            onClick={() => navigate(`/review/${review.patient?.id}/${review.week?.number}`)}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TherapistDashboard;
