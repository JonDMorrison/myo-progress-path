import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { userId, email, name } = await req.json()

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Create public.users row
    await supabase.from('users').upsert(
      { id: userId, email, name: name || email.split('@')[0], role: 'patient' },
      { onConflict: 'id' }
    )

    // Create patients row
    const { data: patient } = await supabase.from('patients').upsert(
      { user_id: userId, email, name: name || email.split('@')[0], program_variant: 'frenectomy' },
      { onConflict: 'user_id' }
    ).select('id').single()

    // Create onboarding_progress row
    if (patient?.id) {
      await supabase.from('onboarding_progress').upsert(
        { patient_id: patient.id, completed_at: null, completed_steps: [], current_step: 'welcome' },
        { onConflict: 'patient_id' }
      )
    }

    return new Response(JSON.stringify({ success: true, patientId: patient?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
