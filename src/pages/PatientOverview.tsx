import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, MessageSquare, Video, ChevronRight, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TherapistLayout } from "@/components/layout/TherapistLayout";
import { isFrenectomyVariant } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function PatientOverview() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [progressRows, setProgressRows] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      // Fetch patient
      const { data: patientData } = await supabase
        .from("patients")
        .select("*, user:users!user_id(name, email)")
        .eq("id", patientId)
        .single();

      setPatient(patientData);

      // Fetch all progress rows with week numbers
      const { data: progress } = await supabase
        .from("patient_week_progress")
        .select("*, week:weeks(number, title)")
        .eq("patient_id", patientId)
        .order("week_id");

      setProgressRows(progress || []);

      // Fetch recent messages (last 5)
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(5);

      setMessages(msgs || []);

      // Get total message count
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", patientId);

      setMessageCount(count || 0);
    } catch (error) {
      console.error("Error loading patient overview:", error);
    } finally {
      setLoading(false);
    }
  };

  // Build module data from progress rows
  const totalModules = patient ? (isFrenectomyVariant(patient.program_variant) ? 13 : 12) : 12;

  // Map progress rows by week number for quick lookup
  const progressByWeek: Record<number, any> = {};
  progressRows.forEach((p) => {
    const wn = p.week?.number;
    if (wn) progressByWeek[wn] = p;
  });

  // Build modules array
  const modules = Array.from({ length: totalModules }, (_, i) => {
    const moduleNum = i + 1;
    const evenWeek = moduleNum * 2; // Part Two week
    const oddWeek = evenWeek - 1; // Part One week
    // Use even week (Part Two) progress as the module status since submission happens there
    const prog = progressByWeek[evenWeek] || progressByWeek[oddWeek];
    const partOneProg = progressByWeek[oddWeek];
    const partTwoProg = progressByWeek[evenWeek];

    let status: string;
    if (prog) {
      status = prog.status || "open";
    } else if (partOneProg) {
      status = "open"; // Part One started but no Part Two yet
    } else {
      // Check if previous module is approved
      const prevEvenWeek = (moduleNum - 1) * 2;
      const prevProg = progressByWeek[prevEvenWeek];
      status = moduleNum === 1 || prevProg?.status === "approved" ? "open" : "locked";
    }

    return {
      moduleNum,
      evenWeek,
      oddWeek,
      status,
      boltScore: prog?.bolt_score,
      nasalPct: prog?.nasal_breathing_pct,
      tonguePct: prog?.tongue_on_spot_pct,
      submittedAt: prog?.completed_at || prog?.submitted_at,
      approvedAt: prog?.status === "approved" ? prog?.updated_at : null,
    };
  });

  const approvedCount = modules.filter((m) => m.status === "approved").length;
  const pendingCount = modules.filter((m) => m.status === "submitted").length;
  const totalWithProgress = progressRows.length;

  const scrollTo = (id: string) => {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const filteredModules = statusFilter
    ? modules.filter((m) => m.status === statusFilter)
    : modules;

  const getModuleStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Approved</Badge>;
      case "submitted":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Submitted</Badge>;
      case "needs_more":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Needs More</Badge>;
      case "open":
        return <Badge variant="secondary">Open</Badge>;
      case "locked":
        return <Badge variant="outline" className="text-slate-400 border-slate-200">Locked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <TherapistLayout title="Patient Overview">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading patient...</p>
          </div>
        </div>
      </TherapistLayout>
    );
  }

  if (!patient) {
    return (
      <TherapistLayout title="Patient Overview">
        <div className="text-center py-16 text-muted-foreground">Patient not found</div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout title={patient.user?.name || "Patient Overview"}>
      <div className="space-y-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/therapist/patients")} className="mb-2 -ml-2">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Patients
            </Button>
            <h1 className="text-2xl font-bold">{patient.user?.name}</h1>
            <p className="text-sm text-muted-foreground">{patient.user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                {isFrenectomyVariant(patient.program_variant) ? "Frenectomy" : "Non-Surgical"}
              </Badge>
              {patient.requires_video === false && (
                <Badge variant="outline" className="text-slate-500">No video review</Badge>
              )}
              {patient.created_at && (
                <span className="text-xs text-muted-foreground">
                  Enrolled {formatDistanceToNow(new Date(patient.created_at), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setStatusFilter("approved"); scrollTo("module-timeline"); }}
          >
            <CardContent className="pt-4 pb-3 px-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Approved</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setStatusFilter("submitted"); scrollTo("module-timeline"); }}
          >
            <CardContent className="pt-4 pb-3 px-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setStatusFilter(null); scrollTo("module-timeline"); }}
          >
            <CardContent className="pt-4 pb-3 px-4 text-center">
              <p className="text-2xl font-bold">{totalWithProgress}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Progress</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setStatusFilter(null); scrollTo("messages-section"); }}
          >
            <CardContent className="pt-4 pb-3 px-4 text-center">
              <p className="text-2xl font-bold">{messageCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Timeline */}
        <Card id="module-timeline">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Module Timeline</CardTitle>
                <CardDescription>
                  {statusFilter
                    ? `Showing ${filteredModules.length} ${statusFilter} module${filteredModules.length !== 1 ? "s" : ""}`
                    : `${totalModules} modules total`}
                </CardDescription>
              </div>
              {statusFilter && (
                <Button variant="ghost" size="sm" onClick={() => setStatusFilter(null)}>
                  Show all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {filteredModules.map((mod) => {
              const isClickable = mod.status !== "locked";
              const weekNum = mod.evenWeek;

              return (
                <div
                  key={mod.moduleNum}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    isClickable && "cursor-pointer hover:bg-slate-50",
                    mod.status === "locked" && "opacity-50"
                  )}
                  onClick={() => {
                    if (isClickable) navigate(`/review/${patientId}/${weekNum}`);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Module number indicator */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        mod.status === "approved" && "bg-emerald-100 text-emerald-700",
                        mod.status === "submitted" && "bg-amber-100 text-amber-700",
                        mod.status === "needs_more" && "bg-orange-100 text-orange-700",
                        mod.status === "open" && "bg-slate-100 text-slate-600",
                        mod.status === "locked" && "bg-slate-50 text-slate-300"
                      )}
                    >
                      {mod.status === "locked" ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        mod.moduleNum
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Module {mod.moduleNum}</span>
                        {getModuleStatusBadge(mod.status)}
                      </div>

                      {/* Metrics for modules with data */}
                      {(mod.status === "approved" || mod.status === "submitted" || mod.status === "needs_more") && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {mod.boltScore && <span>BOLT: {mod.boltScore}s</span>}
                          {mod.nasalPct !== null && mod.nasalPct !== undefined && (
                            <span>Nasal: {mod.nasalPct}%</span>
                          )}
                          {mod.tonguePct !== null && mod.tonguePct !== undefined && (
                            <span>Tongue: {mod.tonguePct}%</span>
                          )}
                          {mod.status === "approved" && mod.approvedAt && (
                            <span>Approved {formatDistanceToNow(new Date(mod.approvedAt), { addSuffix: true })}</span>
                          )}
                          {mod.status === "submitted" && mod.submittedAt && (
                            <span>Submitted {formatDistanceToNow(new Date(mod.submittedAt), { addSuffix: true })}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action arrow for submitted modules */}
                  {mod.status === "submitted" && (
                    <Button
                      size="sm"
                      variant="default"
                      className="shrink-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/review/${patientId}/${weekNum}`);
                      }}
                    >
                      Review
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}

                  {isClickable && mod.status !== "submitted" && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card id="messages-section">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Messages
              </CardTitle>
              {messageCount > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/review/${patientId}/${modules.find(m => m.status === "submitted")?.evenWeek || 2}`)}
                >
                  View all ({messageCount})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      msg.sent_by === "system"
                        ? "bg-blue-50 border border-blue-200"
                        : msg.therapist_id
                          ? "bg-slate-50"
                          : "bg-primary/5"
                    )}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {msg.sent_by === "system" ? "Notification" : msg.therapist_id ? "You" : patient.user?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.created_at && formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-slate-600">{msg.body}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TherapistLayout>
  );
}
