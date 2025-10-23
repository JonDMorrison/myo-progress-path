import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  patientIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  programVariant?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { patientIds, dateRange, programVariant }: ExportRequest = await req.json();
    
    console.log("Exporting data for patients:", patientIds?.length || "all");

    // Build query for patient data
    let query = supabase
      .from("patient_week_progress")
      .select(`
        *,
        patient:patients!patient_week_progress_patient_id_fkey (
          id,
          program_variant,
          user:users!patients_user_id_fkey (
            name,
            email
          )
        ),
        week:weeks!patient_week_progress_week_id_fkey (
          number,
          title
        )
      `)
      .order("completed_at", { ascending: false });

    // Filter by specific patients if provided
    if (patientIds && patientIds.length > 0) {
      query = query.in("patient_id", patientIds);
    }

    // Apply date range filters
    if (dateRange?.start) {
      query = query.gte("completed_at", dateRange.start);
    }
    if (dateRange?.end) {
      query = query.lte("completed_at", dateRange.end);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching patient data:", error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} records`);

    // Generate CSV
    const csv = generateCSV(data || []);
    
    // Store in storage bucket  
    const fileName = `export-${new Date().toISOString().split('T')[0]}-${Date.now()}.csv`;
    const { error: uploadError } = await supabase.storage
      .from("patient-exports")
      .upload(fileName, csv, {
        contentType: "text/csv",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Create signed URL (expires in 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from("patient-exports")
      .createSignedUrl(fileName, 3600);

    if (urlError) {
      console.error("URL error:", urlError);
      throw urlError;
    }

    console.log("Export successful, file:", fileName);

    return new Response(
      JSON.stringify({
        success: true,
        url: urlData.signedUrl,
        fileName,
        recordCount: data?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in export-patient-data:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Export failed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function generateCSV(data: any[]): string {
  const headers = [
    "Patient Name",
    "Email",
    "Program",
    "Week #",
    "Week Title",
    "Status",
    "BOLT Score",
    "Nasal %",
    "Tongue %",
    "Completed At",
  ];

  const escapeCSV = (value: any) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map((row: any) => [
    escapeCSV(row.patient?.user?.name || ""),
    escapeCSV(row.patient?.user?.email || ""),
    escapeCSV(row.patient?.program_variant || ""),
    escapeCSV(row.week?.number || ""),
    escapeCSV(row.week?.title || ""),
    escapeCSV(row.status || ""),
    escapeCSV(row.bolt_score || ""),
    escapeCSV(row.nasal_breathing_pct || ""),
    escapeCSV(row.tongue_on_spot_pct || ""),
    escapeCSV(row.completed_at ? new Date(row.completed_at).toISOString() : ""),
  ].join(","));

  return [headers.join(","), ...rows].join("\n");
}
