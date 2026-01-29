/**
 * DISABLED: AI Video Analysis Edge Function
 * 
 * This function has been disabled as per requirement to remove all AI-generated
 * or automatic feedback. All patient feedback must now come directly from therapists.
 * 
 * The function is kept in place (returning a disabled message) to prevent errors
 * from any residual calls, but it no longer performs AI analysis.
 * 
 * Date disabled: 2025-01-29
 * Reason: No feedback should be sent unless explicitly written and sent by therapist
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Return a disabled message - AI feedback has been turned off
  console.log("analyze-video function called but AI feedback is disabled");
  
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: "AI video analysis has been disabled. Feedback is now therapist-only.",
      disabled: true
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 to prevent error cascades
    }
  );
});
