import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ClipboardList, 
  RefreshCw, 
  User, 
  Mail, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Bug,
  Stethoscope,
  Loader2,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkAuth, canAccessSuperAdminRoutes } from "@/lib/routeGuards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FeedbackRecord {
  id: string;
  tester_name: string | null;
  tester_email: string | null;
  checklist_state: unknown;
  patient_notes: string | null;
  therapist_notes: string | null;
  bugs_notes: string | null;
  clinical_notes: string | null;
  created_at: string;
  updated_at: string;
}

const TestingFeedback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const auth = await checkAuth();
      if (!auth.isAuthenticated) {
        navigate("/auth");
        return;
      }
      if (!canAccessSuperAdminRoutes(auth.role)) {
        toast({ title: "Access denied", description: "Super admin access required.", variant: "destructive" });
        navigate("/therapist");
        return;
      }
      fetchFeedback();
    };
    checkAccess();
  }, [navigate]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clinical_testing_feedback")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error: any) {
      console.error("Error fetching feedback:", error);
      toast({ title: "Error loading feedback", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from("clinical_testing_feedback")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setFeedback(prev => prev.filter(f => f.id !== id));
      toast({ title: "Feedback deleted" });
    } catch (error: any) {
      console.error("Error deleting feedback:", error);
      toast({ title: "Error deleting feedback", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const getChecklistProgress = (checklist: unknown) => {
    if (!checklist || typeof checklist !== 'object') return { patient: 0, therapist: 0 };
    const checklistObj = checklist as Record<string, boolean>;
    const patientItems = Object.entries(checklistObj).filter(([k, v]) => k.startsWith("patient-") && v).length;
    const therapistItems = Object.entries(checklistObj).filter(([k, v]) => k.startsWith("therapist-") && v).length;
    return { patient: patientItems, therapist: therapistItems };
  };

  const hasContent = (record: FeedbackRecord) => {
    return record.patient_notes || record.therapist_notes || record.bugs_notes || record.clinical_notes;
  };

  return (
    <AdminLayout title="Testing Feedback">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Clinical Testing Feedback</h1>
              <p className="text-muted-foreground">View all tester submissions</p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchFeedback} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : feedback.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No feedback submitted yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Testers can submit feedback at <code className="bg-muted px-1 rounded">/clinical-testing</code>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedback.map((record) => {
              const progress = getChecklistProgress(record.checklist_state);
              return (
                <Card key={record.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <User className="h-4 w-4" />
                          {record.tester_name || "Anonymous"}
                        </CardTitle>
                        {record.tester_email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {record.tester_email}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Updated: {new Date(record.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete feedback from {record.tester_name || "this tester"}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteFeedback(record.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleting === record.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Patient: {progress.patient}/9
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Stethoscope className="h-3 w-3 mr-1" />
                        Therapist: {progress.therapist}/8
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  {hasContent(record) && (
                    <CardContent className="pt-0 space-y-4">
                      <Separator />
                      
                      {record.patient_notes && (
                        <div>
                          <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-blue-500" />
                            Patient Testing Notes
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded">
                            {record.patient_notes}
                          </p>
                        </div>
                      )}
                      
                      {record.therapist_notes && (
                        <div>
                          <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
                            <Stethoscope className="h-4 w-4 text-purple-500" />
                            Therapist Testing Notes
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded">
                            {record.therapist_notes}
                          </p>
                        </div>
                      )}
                      
                      {record.bugs_notes && (
                        <div>
                          <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
                            <Bug className="h-4 w-4 text-red-500" />
                            Bugs Found
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200 dark:border-red-900">
                            {record.bugs_notes}
                          </p>
                        </div>
                      )}
                      
                      {record.clinical_notes && (
                        <div>
                          <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Clinical Concerns
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200 dark:border-amber-900">
                            {record.clinical_notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TestingFeedback;
