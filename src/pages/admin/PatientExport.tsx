import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, FileJson, FileText, ArrowLeft } from "lucide-react";
import { exportPatientData, patientDataToCsv } from "@/lib/patientData";

export default function PatientExport() {
  const { patientId } = useParams<{ patientId: string }>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleExportJson() {
    if (!patientId) return;

    setLoading(true);
    try {
      const data = await exportPatientData(patientId);
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patient_${patientId}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Patient data exported as JSON"
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleExportCsv() {
    if (!patientId) return;

    setLoading(true);
    try {
      const data = await exportPatientData(patientId);
      const csv = patientDataToCsv(data);
      
      const blob = new Blob([csv], {
        type: "text/csv"
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patient_${patientId}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Patient data exported as CSV"
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Patient Data
            </CardTitle>
            <CardDescription>
              Download a complete export of patient data for compliance and record-keeping.
              This includes profile, progress, uploads metadata, events, and audit logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Export includes:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Patient profile and enrollment information</li>
                <li>Week-by-week progress and metrics</li>
                <li>Upload metadata (file references, not actual files)</li>
                <li>Activity events</li>
                <li>Complete audit log (access history)</li>
                <li>Gamification statistics</li>
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                onClick={handleExportJson}
                disabled={loading}
                className="w-full"
              >
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </Button>

              <Button
                onClick={handleExportCsv}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
              <p className="text-xs text-yellow-600 dark:text-yellow-500">
                <strong>Privacy Notice:</strong> Exported data contains PHI and must be handled 
                according to HIPAA requirements. Secure the file and delete after use.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
