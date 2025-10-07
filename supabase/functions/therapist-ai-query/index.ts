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
    const { query, context, history } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are an AI assistant for myofunctional therapists.
You analyze patient data and provide insights about:
- Pending reviews and patient progress
- Adherence trends and patterns
- Patients who may need extra attention
- Exercise compliance and compensation issues

Provide clear, actionable insights. Reference specific patients when relevant.
Keep responses concise and professional.`;

    const userPrompt = `Patient data context:
${context}

Therapist question: ${query}

Analyze the data and provide helpful insights.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userPrompt }
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI query failed");
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices?.[0]?.message?.content || "";

    console.log("AI query processed successfully");

    return new Response(
      JSON.stringify({ success: true, response }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in therapist-ai-query:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
