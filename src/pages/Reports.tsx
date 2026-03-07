import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { PatientMultiSelect } from "@/components/reports/PatientMultiSelect";
import { TherapistLayout } from "@/components/layout/TherapistLayout";

type DateRange = "7" | "30" | "90" | "custom";

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [programVariant, setProgramVariant] = useState<string>("all");
  const [adherenceData, setAdherenceData] = useState<any[]>([]);
  const [boltData, setBoltData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  const { user: authUser, isAuthReady: isReady, isStaff, role } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!authUser || !isStaff) {
      setLoading(false);
      return;
    }
    setUserRole(role);
    setUserId(authUser.id);
    loadPatients(authUser.id, role!);
    setLoading(false);
  }, [isReady, authUser?.id, isStaff]);

  useEffect(() => {
    if (userId && userRole) {
      loadReportData();
    }
  }, [userId, userRole, dateRange, programVariant, selectedPatients]);

  const loadPatients = async (therapistId: string, role: string) => {
    const query = supabase
      .from("patients")
      .select(`
        id,
        user_id,
        program_variant,
        users!patients_user_id_fkey (
          name,
          email
        )
      `);

    if (role === "therapist") {
      query.eq("assigned_therapist_id", therapistId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error loading patients:", error);
      return;
    }

    setPatients(data || []);
  };

  const getDateFilter = () => {
    const days = parseInt(dateRange);
    return subDays(new Date(), days).toISOString();
  };

  const loadReportData = async () => {
    const startDate = getDateFilter();
    const patientIds = selectedPatients.length > 0 ? selectedPatients : null;
    const therapistId = userRole === "therapist" ? userId : null;
    const variant = programVariant === "all" ? null : (programVariant as "standard" | "frenectomy");

    // Load adherence metrics
    const { data: adherence } = await supabase.rpc("get_adherence_metrics", {
      _therapist_id: therapistId,
      _patient_ids: patientIds,
      _start_date: startDate,
      _program_variant: variant,
    });

    setAdherenceData(adherence || []);

    // Load BOLT trends
    const { data: bolt } = await supabase.rpc("get_bolt_trends", {
      _therapist_id: therapistId,
      _patient_ids: patientIds,
      _start_date: startDate,
    });

    setBoltData(bolt || []);

    // Load week status distribution
    const { data: status } = await supabase.rpc("get_week_status_distribution", {
      _therapist_id: therapistId,
      _patient_ids: patientIds,
      _start_date: startDate,
    });

    setStatusData(status || []);

    // Load pending reviews
    const pendingQuery = supabase
      .from("patient_week_progress")
      .select(`
        id,
        patient_id,
        week_id,
        completed_at,
        patients!patient_week_progress_patient_id_fkey (
          id,
          users!patients_user_id_fkey (
            name
          )
        ),
        weeks!patient_week_progress_week_id_fkey (
          number
        )
      `)
      .eq("status", "submitted")
      .order("completed_at", { ascending: true });

    if (userRole === "therapist") {
      pendingQuery.eq("patients.assigned_therapist_id", userId);
    }

    const { data: pending } = await pendingQuery;
    setPendingReviews(pending || []);
  };

  const handleExportCSV = async () => {
    try {
      const patientIds = selectedPatients.length > 0 ? selectedPatients : patients.map(p => p.id);
      
      const { data, error } = await supabase.functions.invoke("export-patient-data", {
        body: { patientIds },
      });

      if (error) throw error;

      // Create CSV from data
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patient-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export complete",
        description: "Patient data has been exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return "";

    const headers = [
      "Patient Name",
      "Email",
      "Program Variant",
      "Module #",
      "Status",
      "BOLT Score",
      "Nasal %",
      "Tongue %",
      "Completed At",
    ];

    const rows = data.map((row: any) => [
      row.patient_name,
      row.patient_email,
      row.program_variant,
      row.week_number,
      row.status,
      row.bolt_score || "",
      row.nasal_breathing_pct || "",
      row.tongue_on_spot_pct || "",
      row.completed_at ? format(new Date(row.completed_at), "yyyy-MM-dd HH:mm") : "",
    ]);

    return [headers, ...rows].map(row => row.join(",")).join("\n");
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  if (loading) {
    return (
      <TherapistLayout title="Reports" description="View analytics and export patient data">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout title="Reports" description="View analytics and export patient data">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleExportCSV} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium mb-2 block">Patients</label>
              <PatientMultiSelect
                patients={patients}
                selected={selectedPatients}
                onChange={setSelectedPatients}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Program Variant</label>
              <Select value={programVariant} onValueChange={setProgramVariant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="frenectomy">Frenectomy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Adherence Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Adherence Over Time</CardTitle>
            <CardDescription>Average nasal and tongue adherence by module</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={adherenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week_number" label={{ value: "Module #", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: "Percentage (%)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avg_nasal_pct" stroke="#0088FE" name="Nasal %" />
                <Line type="monotone" dataKey="avg_tongue_pct" stroke="#00C49F" name="Tongue %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* BOLT Trend */}
        <Card>
          <CardHeader>
            <CardTitle>BOLT Score Trends</CardTitle>
            <CardDescription>Average BOLT scores by module</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={boltData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week_number" label={{ value: "Module #", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: "BOLT Score", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg_bolt" fill="#FFBB28" name="Avg BOLT" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Week Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Module Status Distribution</CardTitle>
            <CardDescription>Overview of module completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.status}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>{pendingReviews.length} modules awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingReviews.length === 0 ? (
              <p className="text-muted-foreground">No pending reviews</p>
            ) : (
              <div className="space-y-2">
                {pendingReviews.slice(0, 10).map((review: any) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                    onClick={() => navigate(`/review/${review.patient_id}/${review.weeks.number}`)}
                  >
                    <div>
                      <p className="font-medium">{review.patients.users.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Module {Math.ceil(review.weeks.number / 2)} • Submitted {format(new Date(review.completed_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TherapistLayout>
  );
};

export default Reports;
