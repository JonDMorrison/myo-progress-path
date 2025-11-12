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

    const { patientId } = await req.json();

    if (!patientId) {
      throw new Error("Invalid parameters");
    }

    const today = new Date().toISOString().split("T")[0];

    // Get current stats
    const { data: stats, error: statsError } = await supabase
      .from("gamification_stats")
      .select("*")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (statsError) throw statsError;

    // If no stats exist, create them
    if (!stats) {
      const { data: newStats, error: createError } = await supabase
        .from("gamification_stats")
        .insert({
          patient_id: patientId,
          points: 0,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (createError) throw createError;

      return new Response(
        JSON.stringify({ success: true, newStreak: 1, longestStreak: 1 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const lastActivityDate = stats.last_activity_date;
    let newStreak = stats.current_streak;
    let longestStreak = stats.longest_streak;

    // If activity is today, no change
    if (lastActivityDate === today) {
      return new Response(
        JSON.stringify({ success: true, newStreak, noChange: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Calculate days between
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastActivityDate === yesterdayStr) {
      // Consecutive day - increment streak
      newStreak += 1;
    } else {
      // Streak broken - reset to 1
      newStreak = 1;
    }

    // Update longest streak if needed
    if (newStreak > longestStreak) {
      longestStreak = newStreak;
    }

    // Update stats
    const { error: updateError } = await supabase
      .from("gamification_stats")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq("patient_id", patientId);

    if (updateError) throw updateError;

    // Check for streak badges
    if (newStreak === 7) {
      // Grant 7-day streak badge
      await supabase.from("earned_badges").insert({
        patient_id: patientId,
        badge_key: "clean_streak_7",
      }).select();

      // Award bonus points
      await supabase.from("events").insert({
        patient_id: patientId,
        type: "points_awarded",
        meta: {
          amount: 200,
          reason: "7-day streak",
          timestamp: new Date().toISOString(),
        },
      });

      // Update points
      await supabase
        .from("gamification_stats")
        .update({
          points: stats.points + 200,
        })
        .eq("patient_id", patientId);
    }

    console.log(`Updated streak for patient ${patientId}: ${newStreak} days`);

    return new Response(
      JSON.stringify({ success: true, newStreak, longestStreak }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in update-streak:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
