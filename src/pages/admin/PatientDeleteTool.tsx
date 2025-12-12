import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Search, Trash2, User, Calendar, Mail } from "lucide-react";
import { deletePatientData } from "@/lib/patientData";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface PatientResult {
  patient_id: string;
  user_id: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_status: string | null;
  enrolled_at: string | null;
  current_week_number: number | null;
  clinic_name: string | null;
}

export default function PatientDeleteTool() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<PatientResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const CONFIRM_TEXT = "DELETE";

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "super_admin") {
      toast({
        title: "Access Denied",
        description: "Super admin privileges required.",
        variant: "destructive",
      });
      navigate("/therapist");
      return;
    }

    setIsAuthorized(true);
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("v_master_patient_list")
        .select("patient_id, user_id, patient_name, patient_email, patient_status, enrolled_at, current_week_number, clinic_name")
        .or(`patient_email.ilike.%${search}%,patient_name.ilike.%${search}%`)
        .limit(20);

      if (error) throw error;
      setPatients(data || []);
      
      if (!data?.length) {
        toast({ title: "No patients found", description: "Try a different search term" });
      }
    } catch (error: any) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient: PatientResult) => {
    setSelectedPatient(patient);
    setConfirmText("");
    setReason("");
  };

  const handleDelete = async () => {
    if (!selectedPatient || !reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for deletion",
        variant: "destructive"
      });
      return;
    }

    if (confirmText !== CONFIRM_TEXT) {
      toast({
        title: "Confirmation Required",
        description: `Please type "${CONFIRM_TEXT}" to confirm`,
        variant: "destructive"
      });
      return;
    }

    setDeleting(true);
    try {
      await deletePatientData(selectedPatient.patient_id, reason);

      toast({
        title: "Patient Data Deleted",
        description: "Patient PII has been anonymized. Audit logs preserved for compliance."
      });

      // Remove from list and reset selection
      setPatients(patients.filter(p => p.patient_id !== selectedPatient.patient_id));
      setSelectedPatient(null);
      setShowConfirmDialog(false);
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isAuthorized) return null;

  return (
    <AdminLayout title="Delete Patients" description="Safely remove test accounts and anonymize patient data">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Patient
            </CardTitle>
            <CardDescription>
              Search by name or email to find test accounts to delete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "..." : "Search"}
              </Button>
            </div>

            {/* Results */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {patients.map((patient) => (
                <div
                  key={patient.patient_id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPatient?.patient_id === patient.patient_id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {patient.patient_name || "No name"}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {patient.patient_email}
                      </p>
                    </div>
                    <Badge variant={patient.patient_status === "active" ? "default" : "secondary"}>
                      {patient.patient_status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>Week {patient.current_week_number || 0}</span>
                    <span>{patient.clinic_name}</span>
                    {patient.enrolled_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(patient.enrolled_at), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delete Panel */}
        <Card className={selectedPatient ? "border-destructive/50" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Patient
            </CardTitle>
            <CardDescription>
              {selectedPatient
                ? `Preparing to delete: ${selectedPatient.patient_name || selectedPatient.patient_email}`
                : "Select a patient from the search results"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedPatient ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Search and select a patient to delete</p>
              </div>
            ) : (
              <>
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-destructive">⚠️ Warning: Irreversible Action</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Email and name will be anonymized</li>
                    <li>Consent signatures will be redacted</li>
                    <li>Progress and audit logs preserved for HIPAA</li>
                  </ul>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm"><strong>Patient:</strong> {selectedPatient.patient_name}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedPatient.patient_email}</p>
                  <p className="text-sm"><strong>Status:</strong> {selectedPatient.patient_status}</p>
                  <p className="text-sm"><strong>Current Week:</strong> {selectedPatient.current_week_number || 0}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Deletion *</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Test account cleanup, Patient requested deletion..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">
                    Type <span className="font-mono font-bold text-destructive">{CONFIRM_TEXT}</span> to confirm
                  </Label>
                  <Input
                    id="confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder={CONFIRM_TEXT}
                  />
                </div>

                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={deleting || !reason.trim() || confirmText !== CONFIRM_TEXT}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Patient Data
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently anonymize <strong>{selectedPatient?.patient_email}</strong>'s data.
              This action will be logged and cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Yes, Delete Patient Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
