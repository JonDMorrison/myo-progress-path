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

    const { patientId, weekId } = await req.json();

    // Get patient and week progress
    const { data: patient } = await supabase
      .from("patients")
      .select("*, users!patients_user_id_fkey (name)")
      .eq("id", patientId)
      .single();

    const { data: progress } = await supabase
      .from("patient_week_progress")
      .select(`
        *,
        weeks!patient_week_progress_week_id_fkey (number, title)
      `)
      .eq("patient_id", patientId)
      .eq("week_id", weekId)
      .single();

    if (!progress || !patient) {
      throw new Error("Progress or patient not found");
    }

    // Get AI feedback from uploads
    const { data: uploads } = await supabase
      .from("uploads")
      .select("ai_feedback, kind")
      .eq("patient_id", patientId)
      .eq("week_id", weekId)
      .not("ai_feedback", "is", null);

    const aiFeedbackSummary = uploads?.map(u => 
      `${u.kind}: ${JSON.stringify(u.ai_feedback)}`
    ).join("\n") || "No video feedback available";

    // Call Lovable AI for progress note
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a myofunctional therapist writing progress notes. 
Create concise, professional notes that:
1. Acknowledge patient effort and progress
2. Highlight specific improvements or concerns
3. Suggest next focus areas
Keep it to 2-3 sentences. Be encouraging but accurate.`;

    const userPrompt = `Write a progress note for ${patient.users.name}, Week ${progress.weeks.number}:

Data:
- BOLT Score: ${progress.bolt_score || "Not recorded"}
- Nasal Breathing: ${progress.nasal_breathing_pct !== null ? progress.nasal_breathing_pct + "%" : "Not recorded"}
- Tongue on Spot: ${progress.tongue_on_spot_pct !== null ? progress.tongue_on_spot_pct + "%" : "Not recorded"}
- Status: ${progress.status}

AI Video Feedback:
${aiFeedbackSummary}

Generate a professional progress note.`;

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

    if (!aiResponse.ok) {
      throw new Error("AI note generation failed");
    }

    const aiData = await aiResponse.json();
    const note = aiData.choices?.[0]?.message?.content || "";

    // Update progress with AI summary
    const { error: updateError } = await supabase
      .from("patient_week_progress")
      .update({ ai_summary: note })
      .eq("id", progress.id);

    if (updateError) {
      throw updateError;
    }

    console.log(`Progress note generated for patient ${patientId}, week ${weekId}`);

    return new Response(
      JSON.stringify({ success: true, note }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in generate-progress-note:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
