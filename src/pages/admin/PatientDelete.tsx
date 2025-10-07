import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { deletePatientData } from "@/lib/patientData";
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

export default function PatientDelete() {
  const { patientId } = useParams<{ patientId: string }>();
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const CONFIRM_TEXT = "DELETE PATIENT";

  async function handleDelete() {
    if (!patientId || !reason.trim()) {
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

    setLoading(true);
    try {
      await deletePatientData(patientId, reason);

      toast({
        title: "Patient Data Deleted",
        description: "Patient PII has been anonymized. Audit logs preserved for compliance."
      });

      setTimeout(() => navigate("/master-admin"), 2000);
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Patient Data
            </CardTitle>
            <CardDescription>
              Permanently anonymize patient PHI while preserving audit logs for HIPAA compliance.
              This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-destructive">⚠️ Warning: Irreversible Action</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Patient email and name will be replaced with anonymized values</li>
                <li>Consent signatures will be redacted</li>
                <li>Progress data, uploads metadata, and audit logs will be preserved</li>
                <li>This is a soft delete - data remains for compliance but is anonymized</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Deletion *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this patient's data is being deleted (required for audit trail)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">
                Type <span className="font-mono font-bold">{CONFIRM_TEXT}</span> to confirm
              </Label>
              <Input
                id="confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_TEXT}
              />
            </div>

            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={loading || !reason.trim() || confirmText !== CONFIRM_TEXT}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Patient Data
            </Button>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>HIPAA Compliance:</strong> Deletion is logged in audit trail.
                Anonymized records retained for minimum 6 years per HIPAA requirements.
              </p>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to permanently anonymize this patient's PHI.
                This action will be logged and cannot be reversed.
                Are you absolutely sure?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Delete Patient Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
