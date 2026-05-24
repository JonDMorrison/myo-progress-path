import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TherapistLayout } from "@/components/layout/TherapistLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader, CheckCircle2 } from "lucide-react";

export default function AccessRequests() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("patients")
      .select("id, name, email, program_variant, requires_video, access_requested_at")
      .is("access_approved_at", null)
      .order("access_requested_at", { ascending: true });

    if (error) {
      console.error("Failed to load access requests", error);
      toast({ title: "Error", description: "Could not load access requests.", variant: "destructive" });
    } else {
      setPatients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRows();
  }, []);

  const allowAccess = async (patientId: string) => {
    setSavingId(patientId);
    const { error } = await (supabase as any).rpc("approve_patient_access", { p_patient_id: patientId });
    if (error) {
      console.error("Failed to allow access", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Access enabled", description: "The patient can now access modules." });
      await loadRows();
    }
    setSavingId(null);
  };

  return (
    <TherapistLayout title="Access Requests" description="Review new patient access requests">
      <div className="max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader className="h-8 w-8 animate-spin text-primary" /></div>
        ) : patients.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />No pending access requests.</CardContent></Card>
        ) : (
          patients.map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3"><span>{patient.name}</span><Badge variant="secondary">Pending</Badge></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>Email: {patient.email}</div>
                  <div>Program: {patient.program_variant}</div>
                  <div>Video: {patient.requires_video ? "Required" : "Not required"}</div>
                  <div>Requested: {patient.access_requested_at ? new Date(patient.access_requested_at).toLocaleString() : "Unknown"}</div>
                </div>
                <Button onClick={() => allowAccess(patient.id)} disabled={savingId === patient.id}>{savingId === patient.id ? "Saving..." : "Allow Access"}</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </TherapistLayout>
  );
}
