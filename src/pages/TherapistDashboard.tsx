import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Inbox, CheckCircle2, History, Loader, Clock, AlertCircle, BookOpen, ChevronRight } from "lucide-react";
import { TherapistLayout } from "@/components/layout/TherapistLayout";
import { useToast } from "@/hooks/use-toast";
import ReviewCard from "@/components/therapist/ReviewCard";
import SendNoteDialog from "@/components/therapist/SendNoteDialog";
import ReviewPanel from "@/components/therapist/ReviewPanel";
import { approveWeek } from "@/lib/reviewActions";
import { calculateTriageLevel, type TriageLevel } from "@/lib/triageUtils";
import { getModuleInfo, cleanWeekTitle } from "@/lib/moduleUtils";

interface ReviewItem {
  id: string;
  patient_id: string;
  week_id: string;
  status: string;
  completed_at: string | null;
  patient: {
    id: string;
    program_variant: string;
    user: { name: string; email: string };
  };
  week: { number: number; title: string };
  uploads: { id: string; ai_feedback: any; ai_feedback_status: string | null }[];
  messages: { id: string }[];
  consecutiveNeedsMore: number;
}

type FilterType = "all" | "red" | "yellow" | "waiting48h";

const TherapistDashboard = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [patientMessages, setPatientMessages] = useState<any[]>([]);
  const [allWeeks, setAllWeeks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeksLoading, setWeeksLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("needs-review");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [exitingId, setExitingId] = useState<string | null>(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchApproving, setBatchApproving] = useState(false);

  // Send note dialog state
  const [noteDialog, setNoteDialog] = useState<{
    open: boolean;
    patientId: string;
    patientName: string;
    weekNumber: number;
    weekId: string;
  } | null>(null);

  // Review panel state
  const [reviewPanel, setReviewPanel] = useState<{
    open: boolean;
    progressId: string;
    patientId: string;
    patientName: string;
    weekNumber: number;
    weekId: string;
    weekStatus?: string;
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Safety timeout to prevent endless spinning
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 10000);

    loadInboxData().finally(() => clearTimeout(safetyTimer));

    // Load curriculum weeks independently so the Curriculum tab works
    // even if inbox queries hang
    loadWeeksData();

    // Switch to curriculum tab if hash is present
    if (location.hash === '#curriculum') {
      setActiveTab('curriculum');
    }
  }, [location.hash]);

  // Clear selection when changing tabs or filters
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab, activeFilter]);

  const loadInboxData = async () => {
    try {
      // Use the current session (fast, local) to avoid occasional hangs with getUser()
      // during token refresh.
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      // Check user role
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role === "admin" || userData?.role === "super_admin") {
        setIsAdmin(true);
      }
      if (userData?.role === "super_admin") {
        setIsSuperAdmin(true);
      }

      // Get all reviews from last 30 days with related data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: progressData, error } = await supabase
        .from("patient_week_progress")
        .select(`
          id,
          patient_id,
          week_id,
          status,
          completed_at,
          patient:patients!inner(
            id,
            program_variant,
            assigned_therapist_id,
            user:users!patients_user_id_fkey(name, email)
          ),
          week:weeks!inner(number, title)
        `)
        .in("status", ["submitted", "needs_more", "approved"])
        .gte("completed_at", thirtyDaysAgo.toISOString())
        .order("completed_at", { ascending: false });

      if (error) throw error;

      // Filter by therapist if not admin
      let filteredData = progressData || [];
      if (userData?.role === "therapist") {
        filteredData = filteredData.filter(
          (r: any) => r.patient?.assigned_therapist_id === user.id
        );
      }

      // Batch fetch uploads and messages
      const patientIds = [...new Set(filteredData.map((r: any) => r.patient_id))];
      const weekIds = [...new Set(filteredData.map((r: any) => r.week_id))];

      // Avoid querying with empty arrays (causes Supabase to hang)
      let allUploads: any[] = [];
      let allMessages: any[] = [];

      if (patientIds.length > 0 && weekIds.length > 0) {
        const [uploadsResult, messagesResult] = await Promise.all([
          supabase
            .from("uploads")
            .select("id, patient_id, week_id, ai_feedback, ai_feedback_status")
            .in("patient_id", patientIds)
            .in("week_id", weekIds),
          supabase
            .from("messages")
            .select("id, patient_id, week_id")
            .in("patient_id", patientIds)
            .in("week_id", weekIds)
        ]);
        allUploads = uploadsResult.data || [];
        allMessages = messagesResult.data || [];
      }

      // Group by patient_id + week_id for fast lookup
      const uploadsMap = new Map<string, any[]>();
      const messagesMap = new Map<string, any[]>();

      if (allUploads) {
        allUploads.forEach(u => {
          const key = `${u.patient_id}_${u.week_id}`;
          if (!uploadsMap.has(key)) uploadsMap.set(key, []);
          uploadsMap.get(key)!.push(u);
        });
      }

      if (allMessages) {
        allMessages.forEach(m => {
          const key = `${m.patient_id}_${m.week_id}`;
          if (!messagesMap.has(key)) messagesMap.set(key, []);
          messagesMap.get(key)!.push(m);
        });
      }

      // Enrich data without N+1 queries
      const enrichedData = (filteredData || []).map((review: any) => {
        const key = `${review.patient_id}_${review.week_id}`;
        return {
          ...review,
          uploads: uploadsMap.get(key) || [],
          messages: messagesMap.get(key) || [],
          consecutiveNeedsMore: 0,
        };
      });

      setReviews(enrichedData || []);

      const { data: allRecentMsgs, error: msgsError } = await supabase
        .from("messages")
        .select(`
          *,
          patient:patients!inner(
            id,
            assigned_therapist_id,
            user:users!patients_user_id_fkey(name)
          ),
          week:weeks(number)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!msgsError) {
        let filteredMsgs = allRecentMsgs || [];
        if (userData?.role === "therapist") {
          filteredMsgs = filteredMsgs.filter(m => m.patient?.assigned_therapist_id === user.id);
        }
        setPatientMessages(filteredMsgs);
      }

    } catch (error: any) {
      console.error("Error loading inbox:", error);
      toast({
        title: "Error",
        description: "Failed to load inbox data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWeeksData = async () => {
    setWeeksLoading(true);
    try {
      const { data: weeksData } = await supabase
        .from("weeks")
        .select("*, programs(title)")
        .order("number", { ascending: true });
      setAllWeeks(weeksData || []);
    } catch (error) {
      console.error("Error loading weeks:", error);
    } finally {
      setWeeksLoading(false);
    }
  };

  const getTriageLevel = (review: ReviewItem): TriageLevel => {
    return calculateTriageLevel(
      review.status,
      review.completed_at,
      review.consecutiveNeedsMore,
      review.uploads
    ).level;
  };

  const isWaiting48h = (submittedAt: string | null): boolean => {
    if (!submittedAt) return false;
    const hours = (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60);
    return hours >= 48;
  };

  const filteredReviews = useMemo(() => {
    let items: ReviewItem[] = [];

    switch (activeTab) {
      case "needs-review":
        items = reviews.filter(r => r.status === "submitted" || r.status === "needs_more");
        break;
      case "approved":
        items = reviews.filter(r => r.status === "approved");
        break;
      case "history":
        items = reviews;
        break;
      default:
        items = [];
    }

    if (activeFilter !== "all") {
      items = items.filter(r => {
        const level = getTriageLevel(r);
        switch (activeFilter) {
          case "red": return level === "red";
          case "yellow": return level === "yellow";
          case "waiting48h": return isWaiting48h(r.completed_at);
          default: return true;
        }
      });
    }

    return items;
  }, [reviews, activeTab, activeFilter]);

  const triageCounts = useMemo(() => {
    const needsReview = reviews.filter(r => r.status === "submitted" || r.status === "needs_more");
    return {
      red: needsReview.filter(r => getTriageLevel(r) === "red").length,
      yellow: needsReview.filter(r => getTriageLevel(r) === "yellow").length,
      green: needsReview.filter(r => getTriageLevel(r) === "green").length,
      waiting48h: needsReview.filter(r => isWaiting48h(r.completed_at)).length,
    };
  }, [reviews]);

  const selectableItems = useMemo(() => {
    return filteredReviews.filter(r =>
      (r.status === "submitted" || r.status === "needs_more") &&
      getTriageLevel(r) === "green"
    );
  }, [filteredReviews]);

  const handleToggleSelect = (id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === selectableItems.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(selectableItems.map(r => r.id)));
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;
    setBatchApproving(true);
    const toApprove = reviews.filter(r => selectedIds.has(r.id) && r.status !== "approved");
    let successCount = 0;

    try {
      for (const review of toApprove) {
        const result = await approveWeek(review.id, review.patient.id, review.week.number, "");
        if (result.success) successCount++;
      }
      setReviews(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, status: "approved" } : r));
      setSelectedIds(new Set());
      toast({
        title: "Batch Approval Complete",
        description: `${successCount} week${successCount !== 1 ? 's' : ''} approved successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Some approvals failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBatchApproving(false);
    }
  };

  const handleQuickApprove = async (progressId: string) => {
    const review = reviews.find(r => r.id === progressId);
    if (!review) return;
    setApprovingId(progressId);
    try {
      const result = await approveWeek(progressId, review.patient.id, review.week.number, "");
      if (result.success) {
        const moduleNum = Math.ceil(review.week.number / 2);
        toast({
          title: "Module Approved",
          description: `Module ${moduleNum} approved for ${review.patient.user.name}`,
        });
        setReviews(prev => prev.map(r => r.id === progressId ? { ...r, status: "approved" } : r));
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenNoteDialog = (patientId: string, weekNumber: number) => {
    const review = reviews.find(r => r.patient.id === patientId && r.week.number === weekNumber);
    if (!review) return;
    setNoteDialog({ open: true, patientId, patientName: review.patient.user.name, weekNumber, weekId: review.week_id });
  };

  const handleSendNote = async (note: string) => {
    if (!noteDialog || !userId) return;
    const { error } = await supabase.from("messages").insert({
      patient_id: noteDialog.patientId,
      week_id: noteDialog.weekId,
      therapist_id: userId,
      body: note,
    });
    if (error) throw error;
    const moduleNum = Math.ceil(noteDialog.weekNumber / 2);
    toast({ title: "Note Sent", description: `Note sent to patient for Module ${moduleNum}` });
  };

  const handleOpenReviewPanel = (progressId: string, patientId: string, weekNumber: number, weekId: string) => {
    const review = reviews.find(r => r.id === progressId);
    if (!review) return;
    setReviewPanel({ open: true, progressId, patientId, patientName: review.patient.user.name, weekNumber, weekId, weekStatus: review.status });
  };

  const handleReviewComplete = (action: "approved" | "needs_more" | "reassigned") => {
    if (!reviewPanel) return;
    setExitingId(reviewPanel.progressId);
    setTimeout(() => {
      setReviews(prev => prev.map(r => r.id === reviewPanel.progressId ? { ...r, status: action === "approved" ? "approved" : action === "reassigned" ? "open" : "needs_more" } : r));
      setExitingId(null);
    }, 300);
  };

  const loadingSpinner = (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading inbox...</p>
      </div>
    </div>
  );

  const needsReviewCount = reviews.filter(r => r.status === "submitted" || r.status === "needs_more").length;

  return (
    <TherapistLayout title="Inbox" description="Review & approve patient progress">
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="needs-review">
              <Inbox className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Needs Review</span>
              <span className="sm:hidden">Review</span>
              {needsReviewCount > 0 && <Badge variant="secondary" className="ml-2 bg-warning text-warning-foreground">{needsReviewCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="approved"><CheckCircle2 className="h-4 w-4 mr-2" />Approved</TabsTrigger>
            <TabsTrigger value="history"><History className="h-4 w-4 mr-2" />History</TabsTrigger>
            <TabsTrigger value="messages"><Users className="h-4 w-4 mr-2" />Messages</TabsTrigger>
            <TabsTrigger value="curriculum"><BookOpen className="h-4 w-4 mr-2" />Curriculum</TabsTrigger>
          </TabsList>

          {activeTab === "needs-review" && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Button variant={activeFilter === "all" ? "secondary" : "outline"} size="sm" onClick={() => setActiveFilter("all")}>All</Button>
              <Button variant={activeFilter === "red" ? "secondary" : "outline"} size="sm" onClick={() => setActiveFilter("red")}><AlertCircle className="h-4 w-4 mr-2 text-destructive" />Red</Button>
              <Button variant={activeFilter === "yellow" ? "secondary" : "outline"} size="sm" onClick={() => setActiveFilter("yellow")}><AlertCircle className="h-4 w-4 mr-2 text-warning" />Yellow</Button>
              <Button variant={activeFilter === "waiting48h" ? "secondary" : "outline"} size="sm" onClick={() => setActiveFilter("waiting48h")}><Clock className="h-4 w-4 mr-2" />&gt; 48h</Button>
            </div>
          )}

          <TabsContent value="needs-review" className="space-y-4">
            {loading ? loadingSpinner : filteredReviews.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                <p className="text-lg font-medium">All caught up!</p>
              </div>
            ) : (
              filteredReviews.map(review => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  patientId={review.patient.id}
                  patientName={review.patient.user.name}
                  weekNumber={review.week.number}
                  weekId={review.week_id}
                  weekTitle={review.week.title}
                  programVariant={review.patient.program_variant}
                  submittedAt={review.completed_at}
                  status={review.status}
                  consecutiveNeedsMore={review.consecutiveNeedsMore}
                  videoCount={review.uploads.length}
                  messageCount={review.messages.length}
                  onReview={handleOpenReviewPanel}
                  onApprove={handleQuickApprove}
                  onSendNote={handleOpenNoteDialog}
                  isApproving={approvingId === review.id}
                  isExiting={exitingId === review.id}
                  selectable={true}
                  selected={selectedIds.has(review.id)}
                  onSelect={handleToggleSelect}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {loading ? loadingSpinner : reviews.filter(r => r.status === "approved").length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">No approved weeks in last 30 days.</p>
            ) : (
              reviews.filter(r => r.status === "approved").map(review => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  patientId={review.patient.id}
                  patientName={review.patient.user.name}
                  weekNumber={review.week.number}
                  weekId={review.week_id}
                  weekTitle={review.week.title}
                  programVariant={review.patient.program_variant}
                  submittedAt={review.completed_at}
                  status={review.status}
                  consecutiveNeedsMore={review.consecutiveNeedsMore}
                  videoCount={review.uploads.length}
                  messageCount={review.messages.length}
                  onReview={handleOpenReviewPanel}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-3">
            {loading ? loadingSpinner : <div className="space-y-4">
              {patientMessages.length === 0 ? (
                <p className="text-center py-16 text-muted-foreground italic">No messages from patients</p>
              ) : (
                patientMessages.map(msg => {
                  const weekNumber = msg.week?.number || 1;
                  const weekTitle = msg.week?.title || 'General';
                  return (
                    <Card key={msg.id} className="cursor-pointer hover:bg-slate-50 transition-all" onClick={() => navigate(`/review/${msg.patient?.id}/${weekNumber}`)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{msg.patient?.user?.name}</p>
                            <p className="text-sm text-muted-foreground mb-2">
                              Module {Math.ceil(weekNumber / 2)} · {weekTitle}
                            </p>
                          </div>
                          <Badge variant="outline">{new Date(msg.created_at).toLocaleDateString()}</Badge>
                        </div>
                        <p className="mt-2 text-sm italic">"{msg.body}"</p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>}
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-8">
            {weeksLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading curriculum...</p>
                </div>
              </div>
            ) : allWeeks.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">No curriculum data found. Please ensure you are logged in.</p>
            ) : (
            <div className="grid grid-cols-1 gap-8">
              {[
                { dbTitle: 'Frenectomy Program', label: 'Surgical Pathway (Frenectomy)', variant: 'frenectomy' },
                { dbTitle: 'Non-Frenectomy Program', label: 'Non-Surgical Pathway', variant: 'non_frenectomy' },
              ].map(({ dbTitle, label, variant }) => (
                <div key={dbTitle} className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-1 h-8 bg-primary rounded-full" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight underline decoration-primary/30 decoration-4 underline-offset-4">{label}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.values(
                      allWeeks
                        .filter(w => w.programs?.title === dbTitle)
                        .reduce((acc, w) => {
                          const moduleInfo = getModuleInfo(w.number, variant);
                          if (!acc[moduleInfo.moduleNumber]) {
                            acc[moduleInfo.moduleNumber] = {
                              w,
                              moduleInfo
                            };
                          }
                          return acc;
                        }, {} as Record<number, any>)
                    ).map((item: any) => {
                      const { w, moduleInfo } = item;
                      return (
                        <Card
                          key={w.id}
                          className="group border-none shadow-premium rounded-2xl overflow-hidden hover:bg-slate-50 cursor-pointer transition-all active:scale-[0.98]"
                          onClick={() => {
                            navigate(`/week/${moduleInfo.weekRange[0]}?variant=${variant}`);
                          }}
                        >
                          <CardContent className="p-5 flex items-center justify-between bg-white group-hover:bg-slate-50/50 transition-colors">
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 tracking-tight">{moduleInfo.displayLabel}</p>
                              <p className="text-[11px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{cleanWeekTitle(w.title)}</p>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {noteDialog && (
        <SendNoteDialog
          open={noteDialog.open}
          onOpenChange={(open) => !open && setNoteDialog(null)}
          patientName={noteDialog.patientName}
          weekNumber={noteDialog.weekNumber}
          onSend={handleSendNote}
        />
      )}

      {reviewPanel && (
        <ReviewPanel
          open={reviewPanel.open}
          onOpenChange={(open) => !open && setReviewPanel(null)}
          progressId={reviewPanel.progressId}
          patientId={reviewPanel.patientId}
          patientName={reviewPanel.patientName}
          weekNumber={reviewPanel.weekNumber}
          weekId={reviewPanel.weekId}
          weekStatus={reviewPanel.weekStatus}
          onComplete={handleReviewComplete}
        />
      )}
    </TherapistLayout>
  );
};

export default TherapistDashboard;
