import { supabase } from "@/integrations/supabase/client";

export interface MasterPatientListItem {
  patient_id: string;
  user_id: string;
  patient_name: string;
  patient_email: string;
  patient_status: 'active' | 'inactive' | 'completed';
  program_variant: 'frenectomy' | 'standard';
  enrolled_at: string;
  clinic_id: string;
  clinic_name: string;
  therapist_id: string | null;
  therapist_name: string | null;
  therapist_email: string | null;
  current_week_number: number | null;
  current_week_status: 'open' | 'submitted' | 'approved' | 'needs_more' | 'locked' | null;
  last_activity: string | null;
  adherence_14d: number | null;
}

export interface MasterPatientFilters {
  search?: string;
  clinicId?: string;
  patientStatus?: string;
  weekStatus?: string;
  weekNumber?: number;
  minCompletion?: number;
  maxCompletion?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchMasterPatientList(
  filters: MasterPatientFilters = {}
): Promise<{ data: MasterPatientListItem[]; count: number; error: any }> {
  const {
    search = '',
    clinicId,
    patientStatus,
    weekStatus,
    weekNumber,
    minCompletion,
    maxCompletion,
    startDate,
    endDate,
    page = 1,
    pageSize = 50
  } = filters;

  let query = supabase
    .from('v_master_patient_list')
    .select('*', { count: 'exact' });

  // Apply filters
  if (search) {
    query = query.or(`patient_name.ilike.%${search}%,patient_email.ilike.%${search}%`);
  }

  if (clinicId) {
    query = query.eq('clinic_id', clinicId);
  }

  if (patientStatus) {
    query = query.eq('patient_status', patientStatus as any);
  }

  if (weekStatus) {
    query = query.eq('current_week_status', weekStatus as any);
  }

  if (weekNumber !== undefined) {
    query = query.eq('current_week_number', weekNumber);
  }

  if (minCompletion !== undefined) {
    query = query.gte('adherence_14d', minCompletion);
  }

  if (maxCompletion !== undefined) {
    query = query.lte('adherence_14d', maxCompletion);
  }

  if (startDate) {
    query = query.gte('last_activity', startDate);
  }

  if (endDate) {
    query = query.lte('last_activity', endDate);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by last activity descending
  query = query.order('last_activity', { ascending: false, nullsFirst: false });

  const { data, error, count } = await query;

  return {
    data: data || [],
    count: count || 0,
    error
  };
}

export async function fetchAllClinics() {
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name')
    .order('name');

  return { data: data || [], error };
}

export async function exportMasterPatientCSV(filters: MasterPatientFilters = {}) {
  const { data } = await supabase.functions.invoke('export-master-patients', {
    body: filters
  });
  
  return data;
}