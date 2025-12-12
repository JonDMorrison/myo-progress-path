import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Users, Inbox, CheckCircle2, History, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReviewCard from "@/components/therapist/ReviewCard";
import SendNoteDialog from "@/components/therapist/SendNoteDialog";
import { approveWeek } from "@/lib/reviewActions";

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

const TherapistDashboard = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("needs-review");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  
  // Send note dialog state
  const [noteDialog, setNoteDialog] = useState<{
    open: boolean;
    patientId: string;
    patientName: string;
    weekNumber: number;
    weekId: string;
  } | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadInboxData();
  }, []);

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

      // For each progress, get uploads and messages counts
      const enrichedData = await Promise.all(
        filteredData.map(async (review: any) => {
          // Get uploads
          const { data: uploads } = await supabase
            .from("uploads")
            .select("id, ai_feedback, ai_feedback_status")
            .eq("patient_id", review.patient_id)
            .eq("week_id", review.week_id);

          // Get messages count
          const { data: messages } = await supabase
            .from("messages")
            .select("id")
            .eq("patient_id", review.patient_id)
            .eq("week_id", review.week_id);

          // Calculate consecutive needs_more count
          const { data: historyData } = await supabase
            .from("patient_week_progress")
            .select("status")
            .eq("patient_id", review.patient_id)
            .eq("week_id", review.week_id)
            .order("completed_at", { ascending: false })
            .limit(5);

          let consecutiveNeedsMore = 0;
          if (historyData) {
            for (const h of historyData) {
              if (h.status === "needs_more") consecutiveNeedsMore++;
              else break;
            }
          }

          return {
            ...review,
            uploads: uploads || [],
            messages: messages || [],
            consecutiveNeedsMore,
          };
        })
      );

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

  // Filter reviews by tab
  const filteredReviews = useMemo(() => {
    switch (activeTab) {
      case "needs-review":
        return reviews.filter(r => r.status === "submitted" || r.status === "needs_more");
      case "approved":
        return reviews.filter(r => r.status === "approved");
      case "history":
        return reviews;
      default:
        return [];
    }
  }, [reviews, activeTab]);

  const handleQuickApprove = async (progressId: string) => {
    const review = reviews.find(r => r.id === progressId);
    if (!review) return;

    setApprovingId(progressId);
    try {
      const result = await approveWeek(
        progressId,
        review.patient.id,
        review.week.number,
        "" // No note for quick approve
      );

      if (result.success) {
        toast({
          title: "Week Approved",
          description: `Week ${review.week.number} approved for ${review.patient.user.name}`,
        });
        // Update local state
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

    const { data, error } = await supabase
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
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/therapist/patients")}>
              <Users className="mr-2 h-4 w-4" />
              Patients
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/therapist/ai-assist")}>
              <span className="mr-2">✨</span>
              AI
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
              <span className="mr-2">📊</span>
              Reports
            </Button>
            {isSuperAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/master")}>
                <span className="mr-2">👑</span>
                Master
              </Button>
            )}
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/content")}>
                <span className="mr-2">⚙️</span>
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Tabs - ONLY these three */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
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

          <TabsContent value="needs-review" className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">All caught up!</p>
                <p className="text-muted-foreground">No pending reviews at the moment.</p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  patientId={review.patient.id}
                  patientName={review.patient.user.name}
                  weekNumber={review.week.number}
                  weekTitle={review.week.title}
                  programVariant={review.patient.program_variant}
                  submittedAt={review.completed_at}
                  status={review.status}
                  consecutiveNeedsMore={review.consecutiveNeedsMore}
                  videoCount={review.uploads.length}
                  messageCount={review.messages.length}
                  uploads={review.uploads}
                  onApprove={handleQuickApprove}
                  onSendNote={handleOpenNoteDialog}
                  isApproving={approvingId === review.id}
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
                  weekTitle={review.week.title}
                  programVariant={review.patient.program_variant}
                  submittedAt={review.completed_at}
                  status={review.status}
                  consecutiveNeedsMore={review.consecutiveNeedsMore}
                  videoCount={review.uploads.length}
                  messageCount={review.messages.length}
                  uploads={review.uploads}
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
                  weekTitle={review.week.title}
                  programVariant={review.patient.program_variant}
                  submittedAt={review.completed_at}
                  status={review.status}
                  consecutiveNeedsMore={review.consecutiveNeedsMore}
                  videoCount={review.uploads.length}
                  messageCount={review.messages.length}
                  uploads={review.uploads}
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
    </div>
  );
};

export default TherapistDashboard;
