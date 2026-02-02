import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Inbox, CheckCircle2, History, Loader, Clock, AlertCircle, BookOpen, ChevronRight } from "lucide-react";
import { TherapistLayout } from "@/components/layout/TherapistLayout";
import { useToast } from "@/hooks/use-toast";
import ReviewCard, { getCardTriageLevel } from "@/components/therapist/ReviewCard";
import SendNoteDialog from "@/components/therapist/SendNoteDialog";
import ReviewPanel from "@/components/therapist/ReviewPanel";
import { approveWeek } from "@/lib/reviewActions";
import { calculateTriageLevel, type TriageLevel } from "@/lib/triageUtils";

interface ReviewItem {
  id: string;
  patient_id: string;
  week_id: string;
  status: string;
  submitted_at: string | null;
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
  const { toast } = useToast();

  useEffect(() => {
    loadInboxData();
  }, []);

  // Clear selection when changing tabs or filters
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab, activeFilter]);

  const loadInboxData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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

      if (userData?.role === "admin") setIsAdmin(true);
      if (userData?.role === "super_admin") {
        setIsSuperAdmin(true);
        setIsAdmin(true);
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
          submitted_at,
          patient:patients!inner(
            id,
            program_variant,
            assigned_therapist_id,
            user:users!patients_user_id_fkey(name, email)
          ),
          week:weeks!inner(number, title)
        `)
        .in("status", ["submitted", "needs_more", "approved"])
        .gte("submitted_at", thirtyDaysAgo.toISOString())
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      // Filter by therapist if not admin
      let filteredData = progressData || [];
      if (userData?.role === "therapist") {
        filteredData = filteredData.filter(
          (r: any) => r.patient?.assigned_therapist_id === user.id
        );
      }

      // Batch fetch uploads and messages for all reviews at once (performance optimization)
      const reviewPatientWeekPairs = filteredData.map((r: any) => ({
        patient_id: r.patient_id,
        week_id: r.week_id
      }));

      // Get unique patient_ids and week_ids for batch queries
      const patientIds = [...new Set(reviewPatientWeekPairs.map(p => p.patient_id))];
      const weekIds = [...new Set(reviewPatientWeekPairs.map(p => p.week_id))];

      // Batch fetch uploads
      const { data: allUploads } = await supabase
        .from("uploads")
        .select("id, patient_id, week_id, ai_feedback, ai_feedback_status")
        .in("patient_id", patientIds)
        .in("week_id", weekIds);

      // Batch fetch messages
      const { data: allMessages } = await supabase
        .from("messages")
        .select("id, patient_id, week_id")
        .in("patient_id", patientIds)
        .in("week_id", weekIds);

      // Group by patient_id + week_id for fast lookup
      const uploadsMap = new Map<string, typeof allUploads>();
      const messagesMap = new Map<string, typeof allMessages>();

      (allUploads || []).forEach(u => {
        const key = `${u.patient_id}_${u.week_id}`;
        if (!uploadsMap.has(key)) uploadsMap.set(key, []);
        uploadsMap.get(key)!.push(u);
      });

      (allMessages || []).forEach(m => {
        const key = `${m.patient_id}_${m.week_id}`;
        if (!messagesMap.has(key)) messagesMap.set(key, []);
        messagesMap.get(key)!.push(m);
      });

      // Enrich data without N+1 queries
      const enrichedData = filteredData.map((review: any) => {
        const key = `${review.patient_id}_${review.week_id}`;
        return {
          ...review,
          uploads: uploadsMap.get(key) || [],
          messages: messagesMap.get(key) || [],
          consecutiveNeedsMore: 0, // Simplified - calculate on detail view only
        };
      });

      setReviews(enrichedData);

      // Fetch all recent messages for the Messages Inbox tab
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

      // Fetch all weeks for curriculum preview
      const { data: weeksData } = await supabase
        .from("weeks")
        .select("*, programs(title)")
        .order("number", { ascending: true });

      setAllWeeks(weeksData || []);
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

  // Get triage level for a review item
  const getTriageLevel = (review: ReviewItem): TriageLevel => {
    return calculateTriageLevel(
      review.status,
      review.submitted_at,
      review.consecutiveNeedsMore,
      review.uploads
    ).level;
  };

  // Check if waiting > 48h
  const isWaiting48h = (submittedAt: string | null): boolean => {
    if (!submittedAt) return false;
    const hours = (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60);
    return hours >= 48;
  };

  // Filter reviews by tab and active filter
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

    // Apply active filter
    if (activeFilter !== "all") {
      items = items.filter(r => {
        const level = getTriageLevel(r);
        switch (activeFilter) {
          case "red":
            return level === "red";
          case "yellow":
            return level === "yellow";
          case "waiting48h":
            return isWaiting48h(r.submitted_at);
          default:
            return true;
        }
      });
    }

    return items;
  }, [reviews, activeTab, activeFilter]);

  // Count reviews by triage level for filter badges
  const triageCounts = useMemo(() => {
    const needsReview = reviews.filter(r => r.status === "submitted" || r.status === "needs_more");
    return {
      red: needsReview.filter(r => getTriageLevel(r) === "red").length,
      yellow: needsReview.filter(r => getTriageLevel(r) === "yellow").length,
      green: needsReview.filter(r => getTriageLevel(r) === "green").length,
      waiting48h: needsReview.filter(r => isWaiting48h(r.submitted_at)).length,
    };
  }, [reviews]);

  // Get selectable (GREEN) items from current filtered view
  const selectableItems = useMemo(() => {
    return filteredReviews.filter(r =>
      (r.status === "submitted" || r.status === "needs_more") &&
      getTriageLevel(r) === "green"
    );
  }, [filteredReviews]);

  const handleToggleSelect = (id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === selectableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableItems.map(r => r.id)));
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;

    setBatchApproving(true);
    const toApprove = reviews.filter(r => selectedIds.has(r.id) && r.status !== "approved");
    let successCount = 0;

    try {
      for (const review of toApprove) {
        const result = await approveWeek(
          review.id,
          review.patient.id,
          review.week.number,
          "" // No note for batch approve
        );

        if (result.success) {
          successCount++;
          // Log audit event is handled by approveWeek
        }
      }

      // Update local state
      setReviews(prev =>
        prev.map(r =>
          selectedIds.has(r.id) ? { ...r, status: "approved" } : r
        )
      );

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
      const result = await approveWeek(
        progressId,
        review.patient.id,
        review.week.number,
        ""
      );

      if (result.success) {
        toast({
          title: "Week Approved",
          description: `Week ${review.week.number} approved for ${review.patient.user.name}`,
        });
        setReviews(prev =>
          prev.map(r =>
            r.id === progressId ? { ...r, status: "approved" } : r
          )
        );
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve week.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenNoteDialog = (patientId: string, weekNumber: number) => {
    const review = reviews.find(
      r => r.patient.id === patientId && r.week.number === weekNumber
    );
    if (!review) return;

    setNoteDialog({
      open: true,
      patientId,
      patientName: review.patient.user.name,
      weekNumber,
      weekId: review.week_id,
    });
  };

  const handleSendNote = async (note: string) => {
    if (!noteDialog || !userId) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        patient_id: noteDialog.patientId,
        week_id: noteDialog.weekId,
        therapist_id: userId,
        body: note,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send note.",
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Note Sent",
      description: `Note sent to patient for Week ${noteDialog.weekNumber}`,
    });
  };

  const handleOpenReviewPanel = (progressId: string, patientId: string, weekNumber: number, weekId: string) => {
    const review = reviews.find(r => r.id === progressId);
    if (!review) return;

    setReviewPanel({
      open: true,
      progressId,
      patientId,
      patientName: review.patient.user.name,
      weekNumber,
      weekId,
      weekStatus: review.status,
    });
  };

  const handleReviewComplete = (action: "approved" | "needs_more" | "reassigned") => {
    if (!reviewPanel) return;

    setExitingId(reviewPanel.progressId);

    setTimeout(() => {
      setReviews(prev =>
        prev.map(r =>
          r.id === reviewPanel.progressId
            ? { ...r, status: action === "approved" ? "approved" : action === "reassigned" ? "open" : "needs_more" }
            : r
        )
      );
      setExitingId(null);
    }, 300);
  };

  // Sign out is now handled by the TherapistLayout sidebar

  if (loading) {
    return (
      <TherapistLayout title="Inbox" description="Review & approve patient progress">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading inbox...</p>
          </div>
        </div>
      </TherapistLayout>
    );
  }

  const needsReviewCount = reviews.filter(
    r => r.status === "submitted" || r.status === "needs_more"
  ).length;

  return (
    <TherapistLayout title="Inbox" description="Review & approve patient progress">
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="needs-review" className="flex items-center gap-2 text-xs sm:text-sm">
              <Inbox className="h-4 w-4" />
              <span className="hidden sm:inline">Needs Review</span>
              <span className="sm:hidden">Review</span>
              {needsReviewCount > 0 && (
                <span className="ml-1 bg-warning text-warning-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                  {needsReviewCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Approved</span>
              <span className="sm:hidden">Done</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 text-xs sm:text-sm">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="flex items-center gap-2 text-xs sm:text-sm">
              <BookOpen className="h-4 w-4" />
              Curriculum
            </TabsTrigger>
          </TabsList>

          {/* Filter chips - only on needs-review tab */}
          {activeTab === "needs-review" && (
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground mr-1">Filter:</span>

                <Button
                  variant={activeFilter === "all" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter("all")}
                  className="h-7 text-xs"
                >
                  All
                </Button>

                <Button
                  variant={activeFilter === "red" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter("red")}
                  className="h-7 text-xs"
                >
                  <AlertCircle className="h-3 w-3 mr-1 text-destructive" />
                  Red {triageCounts.red > 0 && `(${triageCounts.red})`}
                </Button>

                <Button
                  variant={activeFilter === "yellow" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter("yellow")}
                  className="h-7 text-xs"
                >
                  <AlertCircle className="h-3 w-3 mr-1 text-warning" />
                  Yellow {triageCounts.yellow > 0 && `(${triageCounts.yellow})`}
                </Button>

                <Button
                  variant={activeFilter === "waiting48h" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter("waiting48h")}
                  className="h-7 text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  &gt; 48h {triageCounts.waiting48h > 0 && `(${triageCounts.waiting48h})`}
                </Button>
              </div>

              {/* Batch selection controls */}
              {selectableItems.length > 0 && (
                <div className="flex items-center gap-2 sm:ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 text-xs"
                  >
                    {selectedIds.size === selectableItems.length ? "Deselect All" : `Select All Green (${selectableItems.length})`}
                  </Button>

                  {selectedIds.size > 0 && (
                    <Button
                      size="sm"
                      onClick={handleBatchApprove}
                      disabled={batchApproving}
                      className="h-7"
                    >
                      {batchApproving ? (
                        <Loader className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      Approve Selected ({selectedIds.size})
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <TabsContent value="needs-review" className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  {activeFilter !== "all" ? "No matching reviews" : "All caught up!"}
                </p>
                <p className="text-muted-foreground">
                  {activeFilter !== "all"
                    ? "Try adjusting your filter."
                    : "No pending reviews at the moment."}
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  patientId={review.patient.id}
                  patientName={review.patient.user.name}
                  weekNumber={review.week.number}
                  weekId={review.week_id}
                  weekTitle={review.week.title}
                  programVariant={review.patient.program_variant}
                  submittedAt={review.submitted_at}
                  status={review.status}
                  consecutiveNeedsMore={review.consecutiveNeedsMore}
                  videoCount={review.uploads.length}
                  messageCount={review.messages.length}
                  uploads={review.uploads}
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

          <TabsContent value="approved" className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No approved reviews in the last 30 days.</p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  patientId={review.patient.id}
                  patientName={review.patient.user.name}
                  weekNumber={review.week.number}
                  weekId={review.week_id}
                  weekTitle={review.week.title}
                  programVariant={review.patient.program_variant}
                  submittedAt={review.submitted_at}
                  status={review.status}
                  consecutiveNeedsMore={review.consecutiveNeedsMore}
                  videoCount={review.uploads.length}
                  messageCount={review.messages.length}
                  uploads={review.uploads}
                  onReview={handleOpenReviewPanel}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No history in the last 30 days.</p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  patientId={review.patient.id}
                  patientName={review.patient.user.name}
                  weekNumber={review.week.number}
                  weekId={review.week_id}
                  weekTitle={review.week.title}
                  programVariant={review.patient.program_variant}
                  submittedAt={review.submitted_at}
                  status={review.status}
                  consecutiveNeedsMore={review.consecutiveNeedsMore}
                  videoCount={review.uploads.length}
                  messageCount={review.messages.length}
                  uploads={review.uploads}
                  onReview={handleOpenReviewPanel}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-3">
            <div className="space-y-4">
              {patientMessages.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 italic">
                  <Inbox className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400">Your patient inbox is currently empty</p>
                </div>
              ) : (
                patientMessages.map((msg) => (
                  <Card
                    key={msg.id}
                    className={`group border-none shadow-premium rounded-[2rem] overflow-hidden transition-all hover:bg-slate-50 cursor-pointer ${msg.therapist_id ? "opacity-75" : "bg-white"
                      }`}
                    onClick={() => navigate(`/review/${msg.patient_id}/${msg.week?.number || 1}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black ${msg.therapist_id ? "bg-slate-100 text-slate-400" : "bg-primary/10 text-primary ring-4 ring-primary/5"
                            }`}>
                            {(msg.patient?.user?.name || "P")[0]}
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900 tracking-tight">
                              {msg.therapist_id ? "Response to " + msg.patient?.user?.name : msg.patient?.user?.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] uppercase font-black border-slate-100">
                                Week {msg.week?.number || "General"}
                              </Badge>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {new Date(msg.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!msg.therapist_id && (
                          <Badge className="bg-rose-500 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse">
                            Needs Reply
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl italic border border-slate-100/50">
                        "{msg.body}"
                      </p>
                      <div className="mt-4 flex justify-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to respond →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              {['Frenectomy Program', 'Non-Frenectomy Program'].map(program => (
                <div key={program} className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h3 className="text-lg font-black tracking-tight text-slate-800 uppercase italic">{program}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {allWeeks
                      .filter(w => w.programs?.title === program)
                      .map(w => (
                        <Card
                          key={w.id}
                          className="group border-none shadow-premium rounded-2xl overflow-hidden hover:bg-slate-50 cursor-pointer transition-all active:scale-[0.98]"
                          onClick={() => navigate(`/week/${w.number}`)}
                        >
                          <CardContent className="p-5 flex items-center justify-between bg-white group-hover:bg-slate-50/50 transition-colors">
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 tracking-tight">Module {w.number}</p>
                              <p className="text-[11px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{w.title || 'Untitled Module'}</p>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Note Dialog */}
      {noteDialog && (
        <SendNoteDialog
          open={noteDialog.open}
          onOpenChange={(open) => setNoteDialog(open ? noteDialog : null)}
          patientName={noteDialog.patientName}
          weekNumber={noteDialog.weekNumber}
          onSend={handleSendNote}
        />
      )}

      {/* Review Panel */}
      {reviewPanel && (
        <ReviewPanel
          open={reviewPanel.open}
          onOpenChange={(open) => setReviewPanel(open ? reviewPanel : null)}
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
