import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Users, Inbox, CheckCircle2, History, Loader, Clock, AlertCircle } from "lucide-react";
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
      review.completed_at,
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
            return isWaiting48h(r.completed_at);
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
      waiting48h: needsReview.filter(r => isWaiting48h(r.completed_at)).length,
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading inbox...</p>
        </div>
      </div>
    );
  }

  const needsReviewCount = reviews.filter(
    r => r.status === "submitted" || r.status === "needs_more"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Montrose Myo" className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Therapist Inbox</h1>
              <p className="text-sm text-muted-foreground">Review & approve patient progress</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/therapist/patients")} className="px-2 sm:px-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Patients</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/therapist/ai-assist")} className="px-2 sm:px-3">
              <span>✨</span>
              <span className="hidden sm:inline ml-2">AI</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/reports")} className="px-2 sm:px-3">
              <span>📊</span>
              <span className="hidden sm:inline ml-2">Reports</span>
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate(isSuperAdmin ? "/admin/master" : "/admin/content")} className="px-2 sm:px-3">
                <span>{isSuperAdmin ? "👑" : "⚙️"}</span>
                <span className="hidden sm:inline ml-2">Admin</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="px-2 sm:px-3">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="needs-review" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Needs Review
              {needsReviewCount > 0 && (
                <span className="ml-1 bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full">
                  {needsReviewCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
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
                  submittedAt={review.completed_at}
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
                  submittedAt={review.completed_at}
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
                  submittedAt={review.completed_at}
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
        </Tabs>
      </main>

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
    </div>
  );
};

export default TherapistDashboard;
