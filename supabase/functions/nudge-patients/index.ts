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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Find patients who haven't logged activity in 3+ days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: inactivePatients } = await supabase
      .from("patients")
      .select(`
        id,
        users!patients_user_id_fkey (name, email),
        patient_week_progress!patient_week_progress_patient_id_fkey (
          completed_at,
          status,
          weeks!patient_week_progress_week_id_fkey (number, title)
        )
      `)
      .eq("status", "active")
      .order("patient_week_progress.completed_at", { ascending: false });

    const patientsToNudge: any[] = [];

    for (const patient of inactivePatients || []) {
      const latestProgress = patient.patient_week_progress?.[0];
      
      if (!latestProgress || new Date(latestProgress.completed_at) < threeDaysAgo) {
        patientsToNudge.push({
          ...patient,
          reason: "inactive",
          weekNumber: (latestProgress?.weeks as any)?.number || 1
        });
      }
    }

    // Generate AI nudges for each patient
    const systemPrompt = `You are a supportive myofunctional therapy coach. 
Generate warm, encouraging reminder messages for patients.
Keep messages to 1-2 sentences, friendly tone, specific to their situation.
DO NOT use emojis.`;

    const nudges: any[] = [];

    for (const patient of patientsToNudge) {
      const userPrompt = `Generate a motivational nudge for ${patient.users.name}.
Situation: Patient hasn't logged activity in 3+ days for Week ${patient.weekNumber}.
Encourage them to continue their exercises and log their progress.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const nudgeText = aiData.choices?.[0]?.message?.content || "";

        // Create notification
        const { data: notification } = await supabase
          .from("notifications")
          .insert({
            patient_id: patient.id,
            body: nudgeText,
            sent_email: false,
            read: false
          })
          .select()
          .single();

        if (notification) {
          nudges.push({
            patientId: patient.id,
            patientName: patient.users.name,
            nudgeText,
          });
        }
      }
    }

    console.log(`Generated ${nudges.length} patient nudges`);

    return new Response(
      JSON.stringify({ success: true, count: nudges.length, nudges }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in nudge-patients:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
