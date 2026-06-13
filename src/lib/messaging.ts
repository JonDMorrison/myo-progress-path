import { supabase } from "@/integrations/supabase/client";
import { patientRequiresVideo } from "@/lib/constants";

/**
 * Returns true if the patient's tier accepts therapist messages.
 * The no-feedback (non_frenectomy with requires_video=false) pathway
 * has the patient inbox blocked at PatientMessages.tsx, so any therapist
 * message would land in a hidden inbox. Gate outbound inserts on this.
 */
export async function canMessagePatient(patientId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("patients")
    .select("program_variant, requires_video")
    .eq("id", patientId)
    .maybeSingle();
  if (error || !data) return true; // fail open so a tier lookup hiccup never silently drops a real message
  return patientRequiresVideo(data as any);
}
