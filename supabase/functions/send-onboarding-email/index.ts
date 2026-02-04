import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface OnboardingRequest {
  userId: string;
  email: string;
  name: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, name }: OnboardingRequest = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-onboarding-email] Processing for ${email}`);

    // Fetch Week 1 video URL from app_settings
    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'week1_video_url')
      .single();

    if (settingsError) {
      console.error('[send-onboarding-email] Failed to fetch week1_video_url:', settingsError);
    }

    const week1VideoUrl = settings?.value as string || 'https://vimeo.com/placeholder';
    const appUrl = Deno.env.get('VITE_APP_BASE_URL') || 'https://app.example.com';
    const loginUrl = `${appUrl}/auth`;
    
    const safeName = name?.trim() || "there";
    const subject = "Welcome to Montrose Myo — Let's Get Started";
    const brandBlue = "#0B5EA8";
    const brandOrange = "#F7941D";
    const supportEmail = "myo@montrosedentalcentre.com";
    const supportPhone = "+1-604-555-1234";

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f9;color:#0e1116;font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="640" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:640px;background:#ffffff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,.06);">
          <tr>
            <td style="padding:24px 28px 0 28px;">
              <h1 style="margin:0 0 8px;font-size:24px;line-height:1.3;font-weight:700;color:#0e1116;">
                Welcome, ${safeName} 👋
              </h1>
              <p style="margin:0;color:#353a44;line-height:1.6;font-size:16px;">
                I'm <strong>Dr. Matt Francisco</strong>. We're excited to start your Montrose Myo program.
                Over the next weeks, you'll build healthy habits for <strong>tongue posture</strong>, <strong>nasal breathing</strong>,
                <strong>chewing</strong>, and <strong>swallowing</strong> — at a relaxed, sustainable pace.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px 0 28px;">
              <a href="${loginUrl}" style="display:inline-block;background:${brandBlue};color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:600;box-shadow:0 3px 10px rgba(0,0,0,.12);">
                Log In to Montrose Myo
              </a>
              <p style="margin:10px 0 0;color:#6b7280;font-size:13px;">Use your email to sign in securely.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 28px 0 28px;">
              <h2 style="margin:0 0 8px;font-size:18px;color:#0e1116;">What to expect in Module 1</h2>
              <p style="margin:0 0 12px;color:#353a44;line-height:1.6;font-size:15px;">
                A short overview of your first exercises and how to find your tongue "spot".
              </p>
              <a href="${week1VideoUrl}" style="display:inline-block;border:1px solid ${brandOrange};color:${brandOrange};text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:600;">
                Watch the Module 1 Intro Video
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f9fafb;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 6px;font-weight:700;color:#0e1116;">Need help?</p>
                    <p style="margin:0;color:#353a44;line-height:1.6;font-size:14px;">
                      Email us at <a href="mailto:${supportEmail}" style="color:${brandBlue};text-decoration:none;">${supportEmail}</a>
                      or call <a href="tel:${supportPhone}" style="color:${brandBlue};text-decoration:none;">${supportPhone}</a>.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;color:#6b7280;font-size:13px;">
                Every small step adds up — better breathing, sleep, and energy are worth it. 💪
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 28px 24px 28px;text-align:center;color:#6b7280;font-size:12px;">
              © ${new Date().getFullYear()} Montrose Dental Centre • Montrose Myo
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `Welcome to Montrose Myo, ${safeName}!

I'm Dr. Matt Francisco. We're excited to start your Montrose Myo program.

Log in here: ${loginUrl}

Watch your Module 1 intro video: ${week1VideoUrl}

Need help? Email ${supportEmail} or call ${supportPhone}.

Every small step adds up — better breathing, sleep, and energy are worth it.

© ${new Date().getFullYear()} Montrose Dental Centre`;

    // Call send-email function
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        to: email,
        subject,
        html,
        text,
        userId,
        templateName: 'onboarding',
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResult.ok) {
      console.error('[send-onboarding-email] Email send failed:', emailResult.error);
      return new Response(
        JSON.stringify({ ok: false, error: emailResult.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-onboarding-email] Success for ${email}`);

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[send-onboarding-email] Unexpected error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
