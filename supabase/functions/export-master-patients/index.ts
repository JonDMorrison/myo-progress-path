import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is super_admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Super admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get filters from request
    const { search, clinicId, patientStatus, weekStatus } = await req.json();

    // Build query
    let query = supabase
      .from('v_master_patient_list')
      .select('*');

    if (search) {
      query = query.or(`patient_name.ilike.%${search}%,patient_email.ilike.%${search}%`);
    }

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    if (patientStatus) {
      query = query.eq('patient_status', patientStatus);
    }

    if (weekStatus) {
      query = query.eq('current_week_status', weekStatus);
    }

    query = query.order('last_activity', { ascending: false, nullsFirst: false });

    const { data: patients, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    // Generate CSV
    const headers = [
      'Clinic',
      'Patient Name',
      'Email',
      'Assigned Therapist',
      'Current Week',
      'Current Status',
      'Last Activity',
      'Adherence (14d)',
      'Program Variant',
      'Patient Status'
    ];

    const csvRows = [headers.join(',')];

    for (const patient of patients || []) {
      // Calculate module label from week number (Option B: module-only).
      const weekNum = patient.current_week_number;
      const moduleLabel = weekNum
        ? `Module ${Math.ceil(weekNum / 2)}`
        : '';
      
      const row = [
        patient.clinic_name || '',
        patient.patient_name || '',
        patient.patient_email || '',
        patient.therapist_name || 'Unassigned',
        moduleLabel,
        patient.current_week_status || '',
        patient.last_activity || '',
        patient.adherence_14d !== null ? `${patient.adherence_14d}%` : '',
        patient.program_variant || '',
        patient.patient_status || ''
      ];
      csvRows.push(row.map(cell => `"${cell}"`).join(','));
    }

    const csvContent = csvRows.join('\n');

    // Log export event
    await supabase
      .from('events')
      .insert({
        type: 'master_admin_export',
        patient_id: null,
        meta: {
          exported_by: user.id,
          exported_at: new Date().toISOString(),
          row_count: patients?.length || 0,
          filters: { search, clinicId, patientStatus, weekStatus }
        }
      });

    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="master-patients-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});