import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  actor_id?: string;
  actor_email?: string;
  action: string;
  target_type: string;
  target_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an audit event to the immutable audit_log table
 * This is required for HIPAA compliance to track all access to PHI
 */
export async function logAudit(
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: Record<string, any>
) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user?.id)
      .single();

    const entry: AuditLogEntry = {
      actor_id: user?.id,
      actor_email: userData?.email || user?.email,
      action,
      target_type: targetType,
      target_id: targetId,
      user_agent: navigator.userAgent,
      metadata
    };

    const { error } = await supabase
      .from('audit_log')
      .insert([entry]);

    if (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging should not break app functionality
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

/**
 * Export audit logs (super admin only)
 */
export async function exportAuditLogs(
  startDate?: Date,
  endDate?: Date,
  actorId?: string
) {
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }
  if (actorId) {
    query = query.eq('actor_id', actorId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to export audit logs: ${error.message}`);
  }

  return data;
}

/**
 * Convert audit logs to CSV format
 */
export function auditLogsToCsv(logs: any[]): string {
  if (!logs || logs.length === 0) {
    return 'No audit logs found';
  }

  const headers = [
    'Timestamp',
    'Actor Email',
    'Action',
    'Target Type',
    'Target ID',
    'IP Address',
    'User Agent',
    'Metadata'
  ];

  const rows = logs.map(log => [
    new Date(log.created_at).toISOString(),
    log.actor_email || '',
    log.action,
    log.target_type,
    log.target_id || '',
    log.ip_address || '',
    log.user_agent || '',
    JSON.stringify(log.metadata || {})
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');

  return csvContent;
}
