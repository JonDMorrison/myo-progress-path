import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_DAILY_POINTS = 500;
const POINTS_PER_LEVEL = 500;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { patientId, amount, reason } = await req.json();

    if (!patientId || amount <= 0) {
      throw new Error("Invalid parameters");
    }

    // Get current stats
    const { data: stats, error: statsError } = await supabase
      .from("gamification_stats")
      .select("*")
      .eq("patient_id", patientId)
      .single();

    if (statsError) {
      throw statsError;
    }

    // Check daily limit
    const today = new Date().toISOString().split("T")[0];
    const { data: todaysEvents } = await supabase
      .from("events")
      .select("meta")
      .eq("patient_id", patientId)
      .eq("type", "points_awarded")
      .gte("created_at", `${today}T00:00:00Z`)
      .lte("created_at", `${today}T23:59:59Z`);

    const todaysPoints = todaysEvents?.reduce(
      (sum: number, evt: any) => sum + (evt.meta?.amount || 0),
      0
    ) || 0;

    const actualAmount = Math.min(amount, MAX_DAILY_POINTS - todaysPoints);

    if (actualAmount <= 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Daily points limit reached" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Award points
    const newPoints = stats.points + actualAmount;
    const newLevel = Math.floor(newPoints / POINTS_PER_LEVEL) + 1;

    const { error: updateError } = await supabase
      .from("gamification_stats")
      .update({
        points: newPoints,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("patient_id", patientId);

    if (updateError) throw updateError;

    // Log event
    await supabase.from("events").insert({
      patient_id: patientId,
      type: "points_awarded",
      meta: {
        amount: actualAmount,
        reason,
        newTotal: newPoints,
        newLevel,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Awarded ${actualAmount} points to patient ${patientId} for ${reason}`);

    return new Response(
      JSON.stringify({ success: true, newTotal: newPoints, newLevel }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in award-points:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
