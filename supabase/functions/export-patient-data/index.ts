import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check user role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || (userData.role !== "therapist" && userData.role !== "admin")) {
      throw new Error("Insufficient permissions");
    }

    const { patientIds } = await req.json();

    // Build query for patient data
    let query = supabase
      .from("v_weekly_metrics")
      .select("*")
      .order("patient_name", { ascending: true })
      .order("week_number", { ascending: true });

    // Therapists can only see their own patients
    if (userData.role === "therapist") {
      query = query.eq("assigned_therapist_id", user.id);
    }

    // Filter by specific patients if provided
    if (patientIds && patientIds.length > 0) {
      query = query.in("patient_id", patientIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching patient data:", error);
      throw error;
    }

    // Enrich with upload information if premium
    const enrichedData = await Promise.all(
      (data || []).map(async (row: any) => {
        const { data: uploads } = await supabase
          .from("uploads")
          .select("kind")
          .eq("patient_id", row.patient_id)
          .eq("week_id", row.week_id);

        return {
          ...row,
          has_first_video: uploads?.some((u: any) => u.kind === "first_attempt") || false,
          has_last_video: uploads?.some((u: any) => u.kind === "last_attempt") || false,
        };
      })
    );

    console.log(`Exported ${enrichedData.length} records for user ${user.id}`);

    return new Response(JSON.stringify(enrichedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in export-patient-data:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
