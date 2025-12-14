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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { patientId, badgeKey } = await req.json();

    if (!patientId || !badgeKey) {
      throw new Error("Invalid parameters");
    }

    // Check if badge exists
    const { data: badge, error: badgeError } = await supabase
      .from("badges")
      .select("*")
      .eq("key", badgeKey)
      .single();

    if (badgeError || !badge) {
      throw new Error(`Badge ${badgeKey} not found`);
    }

    // Check if already earned (idempotent)
    const { data: existing } = await supabase
      .from("earned_badges")
      .select("id")
      .eq("patient_id", patientId)
      .eq("badge_key", badgeKey)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, alreadyEarned: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Grant badge
    const { error: insertError } = await supabase
      .from("earned_badges")
      .insert({
        patient_id: patientId,
        badge_key: badgeKey,
      });

    if (insertError) throw insertError;

    // Log event
    await supabase.from("events").insert({
      patient_id: patientId,
      type: "badge_granted",
      meta: {
        badge_key: badgeKey,
        badge_name: badge.name,
        timestamp: new Date().toISOString(),
      },
    });

    // Create notification
    await supabase.from("notifications").insert({
      patient_id: patientId,
      body: `Congratulations! You earned the "${badge.name}" badge! ${badge.icon}`,
      sent_email: false,
      read: false,
    });

    console.log(`Granted badge ${badgeKey} to patient ${patientId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        alreadyEarned: false,
        badge: {
          key: badge.key,
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in grant-badge:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
