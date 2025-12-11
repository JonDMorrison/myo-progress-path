import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId?: string;
  templateName?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, text, userId, templateName }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fromEmail = Deno.env.get('FROM_EMAIL') || 'MyoCoach <onboarding@resend.dev>';

    console.log(`[send-email] Sending to ${to}, template: ${templateName || 'generic'}`);

    const sendResult = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    });

    // Log to email_log table
    const { error: logError } = await supabase
      .from('email_log')
      .insert({
        user_id: userId || null,
        email: to,
        template_name: templateName || 'generic',
        sent_at: new Date().toISOString(),
        status: sendResult?.error ? 'fail' : 'success',
        provider_id: sendResult?.data?.id ?? null,
        error_message: sendResult?.error?.message ?? null,
      });

    if (logError) {
      console.error('[email_log] insert failed:', logError);
    }

    if (sendResult?.error) {
      console.error('[send-email] Resend error:', sendResult.error);
      return new Response(
        JSON.stringify({ ok: false, error: sendResult.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-email] Success! ID: ${sendResult?.data?.id}`);

    return new Response(
      JSON.stringify({ ok: true, id: sendResult?.data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[send-email] Unexpected error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
