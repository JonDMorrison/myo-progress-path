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

    const { uploadId } = await req.json();

    // Get upload details
    const { data: upload, error: uploadError } = await supabase
      .from("uploads")
      .select(`
        *,
        weeks!uploads_week_id_fkey (
          title,
          notes
        )
      `)
      .eq("id", uploadId)
      .single();

    if (uploadError || !upload) {
      throw new Error("Upload not found");
    }

    // Extract the file path from file_url
    // file_url format can be either:
    // 1. Full URL: https://xxx.supabase.co/storage/v1/object/public/patient-videos/user_id/week_n/file.mp4
    // 2. Relative path: user_id/week_n/file.mp4
    let filePath = upload.file_url;
    
    // If it's a full URL, extract the path after the bucket name
    if (filePath.includes('/patient-videos/')) {
      filePath = filePath.split('/patient-videos/')[1];
    }
    
    console.log(`Extracting signed URL for path: ${filePath}`);
    
    // Get signed URL for video
    const { data: signedData, error: signedError } = await supabase.storage
      .from("patient-videos")
      .createSignedUrl(filePath, 300);

    if (signedError || !signedData?.signedUrl) {
      console.error("Failed to generate signed URL:", signedError);
      throw new Error(`Failed to generate signed URL: ${signedError?.message || 'Unknown error'}`);
    }
    
    console.log(`Generated signed URL successfully`);

    // Get exercise info
    const { data: exercises } = await supabase
      .from("exercises")
      .select("title, compensations, instructions")
      .eq("week_id", upload.week_id);

    const exerciseContext = exercises?.map(e => 
      `Exercise: ${e.title}\nCommon compensations: ${e.compensations}\nInstructions: ${e.instructions}`
    ).join("\n\n") || "";

    // Call Lovable AI with video analysis prompt
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a myofunctional therapy expert analyzing patient exercise videos. 
Common compensations to look for:
- Neck engagement (sternocleidomastoid activation)
- Jaw protrusion or lateralization
- Facial grimacing or tension
- Floor of mouth activation (visible swallowing muscles)
- Inadequate tongue positioning
- Lip tension or pursing

Analyze the video description and context, then provide structured feedback in JSON format with:
- strengths: array of positive observations (2-3 items)
- issues: array of compensations or problems observed (2-3 items)
- suggestions: array of actionable improvements (2-3 items)

Be encouraging but accurate. Focus on what matters most for progress.`;

    const userPrompt = `${exerciseContext}

Video details:
- Week: ${upload.weeks?.title || "Unknown"}
- Upload type: ${upload.kind}
- Video URL: ${signedData.signedUrl}

Please analyze this myofunctional therapy exercise and provide feedback.`;

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
        tools: [{
          type: "function",
          function: {
            name: "provide_video_feedback",
            description: "Provide structured feedback on the exercise video",
            parameters: {
              type: "object",
              properties: {
                strengths: {
                  type: "array",
                  items: { type: "string" },
                  description: "Positive observations (2-3 items)"
                },
                issues: {
                  type: "array",
                  items: { type: "string" },
                  description: "Compensations or problems (2-3 items)"
                },
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                  description: "Actionable improvements (2-3 items)"
                }
              },
              required: ["strengths", "issues", "suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "provide_video_feedback" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call returned from AI");
    }

    const feedback = JSON.parse(toolCall.function.arguments);

    // Update upload with AI feedback and status
    const { error: updateError } = await supabase
      .from("uploads")
      .update({ 
        ai_feedback: feedback,
        ai_feedback_status: 'complete'
      })
      .eq("id", uploadId);

    if (updateError) {
      console.error("Error updating upload:", updateError);
      // Set error status
      await supabase
        .from("uploads")
        .update({ ai_feedback_status: 'error' })
        .eq("id", uploadId);
      throw updateError;
    }

    console.log(`AI feedback generated for upload ${uploadId}`);

    return new Response(
      JSON.stringify({ success: true, feedback }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in analyze-video:", error);
    
    // Try to update status to error if we have uploadId
    try {
      const { uploadId } = await req.clone().json();
      if (uploadId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        await supabase
          .from("uploads")
          .update({ ai_feedback_status: 'error' })
          .eq("id", uploadId);
      }
    } catch (e) {
      console.error("Failed to update error status:", e);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
