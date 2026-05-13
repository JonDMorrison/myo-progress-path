import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceCheckinCard } from "./MaintenanceCheckinCard";
import { MaintenanceAssignmentCard } from "./MaintenanceAssignmentCard";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { GamificationPanel } from "@/components/gamification/GamificationPanel";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { format, subDays, isAfter } from "date-fns";

interface MaintenanceDashboardProps {
  patientId: string;
  clinicId: string;
  userName?: string;
}

interface CheckinData {
  nasal_breathing_percent: number;
  tongue_on_spot_percent: number;
  bolt_score: number | null;
  checkin_date: string;
}

interface Assignment {
  id: string;
  week_id: string;
  week_number: number;
  week_title: string;
  due_date: string | null;
  status: string;
  notes: string | null;
  assigned_at: string;
}

export function MaintenanceDashboard({ patientId, clinicId, userName }: MaintenanceDashboardProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<CheckinData[]>([]);
  const [hasCheckedInThisWeek, setHasCheckedInThisWeek] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaintenanceData();
  }, [patientId]);

  const loadMaintenanceData = async () => {
    try {
      // Load assignments with week details
      const { data: assignmentsData } = await supabase
        .from("maintenance_assignments")
        .select(`
          id,
          week_id,
          due_date,
          status,
          notes,
          assigned_at,
          weeks!inner(number, title)
        `)
        .eq("patient_id", patientId)
        .order("assigned_at", { ascending: false });

      if (assignmentsData) {
        const formattedAssignments = assignmentsData.map((a: any) => {
          // Option B: patient-facing label is module-only.
          const moduleNum = Math.ceil(a.weeks.number / 2);
          return {
            id: a.id,
            week_id: a.week_id,
            week_number: a.weeks.number,
            week_title: a.weeks.title || `Module ${moduleNum}`,
            due_date: a.due_date,
            status: a.status,
            notes: a.notes,
            assigned_at: a.assigned_at,
          };
        });
        setAssignments(formattedAssignments);
      }

      // Load recent check-ins (last 4 weeks)
      const { data: checkinsData } = await supabase
        .from("maintenance_checkins")
        .select("nasal_breathing_percent, tongue_on_spot_percent, bolt_score, checkin_date")
        .eq("patient_id", patientId)
        .order("checkin_date", { ascending: false })
        .limit(4);

      if (checkinsData) {
        setRecentCheckins(checkinsData);
        
        // Check if there's a check-in in the last 7 days
        const weekAgo = subDays(new Date(), 7);
        const hasRecent = checkinsData.some(c => 
          isAfter(new Date(c.checkin_date), weekAgo)
        );
        setHasCheckedInThisWeek(hasRecent);
      }
    } catch (error) {
      console.error("Error loading maintenance data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate averages from recent check-ins
  const avgNasal = recentCheckins.length > 0
    ? Math.round(recentCheckins.reduce((sum, c) => sum + c.nasal_breathing_percent, 0) / recentCheckins.length)
    : 0;
  const avgTongue = recentCheckins.length > 0
    ? Math.round(recentCheckins.reduce((sum, c) => sum + c.tongue_on_spot_percent, 0) / recentCheckins.length)
    : 0;
  const latestBolt = recentCheckins.find(c => c.bolt_score)?.bolt_score || 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Maintenance Mode Header */}
      <Card className="rounded-xl sm:rounded-2xl border shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Maintenance Mode</h2>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Program Graduate
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Congratulations on completing the program! Continue your progress with regular check-ins and therapist-assigned practice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats from recent check-ins */}
      <StatsOverview
        nasalBreathing={avgNasal}
        tonguePosture={avgTongue}
        boltScore={latestBolt}
      />

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Check-in */}
        {!hasCheckedInThisWeek ? (
          <MaintenanceCheckinCard 
            patientId={patientId}
            onCheckinComplete={loadMaintenanceData}
          />
        ) : (
          <Card className="rounded-xl sm:rounded-2xl border shadow-sm">
            <CardContent className="py-8 text-center">
              <div className="p-3 rounded-full bg-green-100 w-fit mx-auto mb-3">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-lg mb-1">Check-in Complete!</h3>
              <p className="text-muted-foreground text-sm">
                You've submitted your check-in for this week. See you next week!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Therapist Assignments */}
        <MaintenanceAssignmentCard 
          assignments={assignments}
          onStatusChange={loadMaintenanceData}
        />
      </div>

      {/* Recent Check-in History */}
      {recentCheckins.length > 0 && (
        <Card className="rounded-xl sm:rounded-2xl border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentCheckins.map((checkin, i) => (
                <div key={i} className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-2">
                    {format(new Date(checkin.checkin_date), "MMM d, yyyy")}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Nasal</span>
                      <span className="font-medium">{checkin.nasal_breathing_percent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tongue</span>
                      <span className="font-medium">{checkin.tongue_on_spot_percent}%</span>
                    </div>
                    {checkin.bolt_score && (
                      <div className="flex justify-between">
                        <span>BOLT</span>
                        <span className="font-medium">{checkin.bolt_score}s</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gamification */}
      <StreakBadge patientId={patientId} />
      <GamificationPanel patientId={patientId} clinicId={clinicId} />
    </div>
  );
}
