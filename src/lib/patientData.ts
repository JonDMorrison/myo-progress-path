import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "./audit";

/**
 * Export all patient data for HIPAA compliance
 * Generates a comprehensive export including profile, progress, consents, and audit logs
 */
export async function exportPatientData(patientId: string) {
  try {
    // Log the export action
    await logAudit('export_patient_data', 'patient', patientId);

    // Fetch patient profile
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        user:users(id, email, name, created_at)
      `)
      .eq('id', patientId)
      .single();

    if (patientError) throw patientError;

    // Fetch week progress
    const { data: progress, error: progressError } = await supabase
      .from('patient_week_progress')
      .select(`
        *,
        week:weeks(number, title)
      `)
      .eq('patient_id', patientId)
      .order('completed_at', { ascending: false });

    if (progressError) throw progressError;

    // Fetch uploads metadata (not actual files)
    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (uploadsError) throw uploadsError;

    // Fetch events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    // Fetch audit logs for this patient
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_log')
      .select('*')
      .eq('target_id', patientId)
      .order('created_at', { ascending: false });

    if (auditError) throw auditError;

    // Fetch gamification stats
    const { data: gamification, error: gamificationError } = await supabase
      .from('gamification_stats')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    // Compile export data
    const exportData = {
      export_date: new Date().toISOString(),
      patient_id: patientId,
      profile: patient,
      week_progress: progress || [],
      uploads: uploads || [],
      events: events || [],
      audit_logs: auditLogs || [],
      gamification: gamification || null
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting patient data:', error);
    throw error;
  }
}

/**
 * Convert patient data to CSV format for audit logs
 */
export function patientDataToCsv(data: any): string {
  const sections = [];

  // Patient Profile
  sections.push('PATIENT PROFILE');
  sections.push(`ID,${data.patient_id}`);
  sections.push(`Email,${data.profile?.user?.email || ''}`);
  sections.push(`Name,${data.profile?.user?.name || ''}`);
  sections.push(`Status,${data.profile?.status || ''}`);
  sections.push(`Enrolled,${data.profile?.created_at || ''}`);
  sections.push('');

  // Week Progress
  sections.push('WEEK PROGRESS');
  sections.push('Week Number,Week Title,Status,BOLT Score,Nasal Breathing %,Tongue on Spot %,Completed At');
  data.week_progress?.forEach((wp: any) => {
    sections.push(`${wp.week?.number || ''},${wp.week?.title || ''},${wp.status},${wp.bolt_score || ''},${wp.nasal_breathing_pct || ''},${wp.tongue_on_spot_pct || ''},${wp.completed_at || ''}`);
  });
  sections.push('');

  // Uploads
  sections.push('UPLOADS');
  sections.push('Created At,Kind,File URL');
  data.uploads?.forEach((upload: any) => {
    sections.push(`${upload.created_at},${upload.kind},${upload.file_url || 'N/A'}`);
  });
  sections.push('');

  // Audit Logs
  sections.push('AUDIT LOGS (Access History)');
  sections.push('Timestamp,Actor Email,Action,Target Type');
  data.audit_logs?.forEach((log: any) => {
    sections.push(`${log.created_at},${log.actor_email || ''},${log.action},${log.target_type}`);
  });

  return sections.join('\n');
}

/**
 * Soft delete patient - anonymize PII but keep records for HIPAA compliance
 */
export async function deletePatientData(patientId: string, reason: string) {
  try {
    // Log the deletion action
    await logAudit('delete_patient_data', 'patient', patientId, { reason });

    // Get patient to anonymize
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('user_id')
      .eq('id', patientId)
      .single();

    if (patientError) throw patientError;

    // Anonymize patient record
    const { error: updatePatientError } = await supabase
      .from('patients')
      .update({
        status: 'completed',
        consent_signature: 'REDACTED',
        consent_payload: null
      })
      .eq('id', patientId);

    if (updatePatientError) throw updatePatientError;

    // Anonymize user record
    if (patient.user_id) {
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          email: `deleted_${patientId}@anonymized.local`,
          name: 'DELETED USER'
        })
        .eq('id', patient.user_id);

      if (updateUserError) throw updateUserError;
    }

    // Note: We keep progress, uploads metadata, and audit logs for compliance
    // File references are kept but patient_id associations are preserved for audit trail
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting patient data:', error);
    throw error;
  }
}

/**
 * Check if user requires MFA and hasn't set it up yet
 */
export async function checkMfaRequired(userId: string): Promise<boolean> {
  const { data: user, error } = await supabase
    .from('users')
    .select('role, mfa_enabled')
    .eq('id', userId)
    .single();

  if (error) return false;

  // MFA required for therapists, admins, and super_admins
  const requiresMfa = ['therapist', 'admin', 'super_admin'].includes(user.role);
  return requiresMfa && !user.mfa_enabled;
}
