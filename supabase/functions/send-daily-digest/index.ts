import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const BASE_URL = "https://myocoach.ca";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  return `${mins}m ago`;
}

function buildDigestEmail(
  therapistName: string,
  firstAttempts: any[],
  pendingApprovals: any[]
): string {
  const firstAttemptsHtml = firstAttempts
    .map((u) => {
      const moduleNum = Math.ceil((u.week?.number || 1) / 2);
      const patientName = u.patient?.name || "Patient";
      const reviewUrl = `${BASE_URL}/review/${u.patient_id}/${u.week?.number}`;
      return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #bfdbfe;">
          <strong style="color: #1e3a8a; font-size: 14px;">${patientName}</strong><br>
          <span style="color: #3b82f6; font-size: 12px;">Module ${moduleNum} &mdash; uploaded ${timeAgo(u.created_at)}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #bfdbfe; text-align: right;">
          <a href="${reviewUrl}" style="background: #2563eb; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">View &amp; Respond</a>
        </td>
      </tr>`;
    })
    .join("");

  const approvalsHtml = pendingApprovals
    .map((p) => {
      const moduleNum = Math.ceil((p.week?.number || 1) / 2);
      const patientName = p.patient?.name || "Patient";
      const reviewUrl = `${BASE_URL}/review/${p.patient_id}/${p.week?.number}`;
      const submittedAgo = p.completed_at ? timeAgo(p.completed_at) : "recently";
      return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0;">
          <strong style="color: #14532d; font-size: 14px;">${patientName}</strong><br>
          <span style="color: #16a34a; font-size: 12px;">Module ${moduleNum} &mdash; submitted ${submittedAgo}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0; text-align: right;">
          <a href="${reviewUrl}" style="background: #16a34a; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">Review &amp; Approve</a>
        </td>
      </tr>`;
    })
    .join("");

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="${BASE_URL}/favicon.png" width="48" height="48" style="border-radius: 10px;" />
    <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 8px;">MyoCoach</div>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 24px 28px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
    <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px;">Good morning, ${therapistName} &#x1F44B;</p>
    <p style="font-size: 14px; color: #64748b; margin: 0;">Here's what needs your attention today.</p>
  </div>

  ${
    firstAttempts.length > 0
      ? `
  <div style="background: #eff6ff; border-radius: 12px; padding: 24px 28px; border: 1px solid #bfdbfe; margin-bottom: 16px;">
    <p style="font-size: 12px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px;">&#x1F4F9; First Attempt Videos &mdash; Send Early Feedback</p>
    <table width="100%" cellpadding="0" cellspacing="0">${firstAttemptsHtml}</table>
  </div>`
      : ""
  }

  ${
    pendingApprovals.length > 0
      ? `
  <div style="background: #f0fdf4; border-radius: 12px; padding: 24px 28px; border: 1px solid #bbf7d0; margin-bottom: 16px;">
    <p style="font-size: 12px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px;">&#x2705; Modules Awaiting Your Approval</p>
    <table width="100%" cellpadding="0" cellspacing="0">${approvalsHtml}</table>
  </div>`
      : ""
  }

  <div style="text-align: center; margin-top: 24px;">
    <a href="${BASE_URL}/therapist" style="background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">Open MyoCoach Dashboard</a>
  </div>

  <div style="text-align: center; margin-top: 24px;">
    <p style="font-size: 12px; color: #cbd5e1; margin: 0;">Montrose Myo &middot; Chilliwack, BC</p>
  </div>
</div>`;
}

Deno.serve(async (_req) => {
  try {
    console.log("[daily-digest] Starting digest run...");

    // 1. Get first attempt videos uploaded in last 24h
    const { data: firstAttempts, error: videoErr } = await supabase
      .from("uploads")
      .select(
        `id, created_at, week_id, patient_id,
        patient:patients!inner(name, assigned_therapist_id,
          therapist:users!patients_assigned_therapist_id_fkey(email, name)),
        week:weeks(number)`
      )
      .eq("kind", "first_attempt")
      .gte(
        "created_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .not("patients.assigned_therapist_id", "is", null);

    if (videoErr) console.error("[daily-digest] Video query error:", videoErr);

    // 2. Get submitted modules awaiting approval
    const { data: pendingApprovals, error: approvalErr } = await supabase
      .from("patient_week_progress")
      .select(
        `id, completed_at, week_id, patient_id,
        patient:patients!inner(name, assigned_therapist_id,
          therapist:users!patients_assigned_therapist_id_fkey(email, name)),
        week:weeks(number)`
      )
      .eq("status", "submitted")
      .not("patients.assigned_therapist_id", "is", null);

    if (approvalErr)
      console.error("[daily-digest] Approval query error:", approvalErr);

    // 3. Group by therapist
    const therapistMap: Record<
      string,
      {
        email: string;
        name: string;
        firstAttempts: any[];
        pendingApprovals: any[];
      }
    > = {};

    (firstAttempts || []).forEach((u: any) => {
      const therapistId = u.patient?.assigned_therapist_id;
      const therapistEmail = u.patient?.therapist?.email;
      const therapistName = u.patient?.therapist?.name;
      if (!therapistId || !therapistEmail) return;
      if (!therapistMap[therapistId]) {
        therapistMap[therapistId] = {
          email: therapistEmail,
          name: therapistName || "Therapist",
          firstAttempts: [],
          pendingApprovals: [],
        };
      }
      therapistMap[therapistId].firstAttempts.push(u);
    });

    (pendingApprovals || []).forEach((p: any) => {
      const therapistId = p.patient?.assigned_therapist_id;
      const therapistEmail = p.patient?.therapist?.email;
      const therapistName = p.patient?.therapist?.name;
      if (!therapistId || !therapistEmail) return;
      if (!therapistMap[therapistId]) {
        therapistMap[therapistId] = {
          email: therapistEmail,
          name: therapistName || "Therapist",
          firstAttempts: [],
          pendingApprovals: [],
        };
      }
      therapistMap[therapistId].pendingApprovals.push(p);
    });

    // 4. Send email to each therapist with pending items
    const results = [];
    for (const [therapistId, data] of Object.entries(therapistMap)) {
      if (
        data.firstAttempts.length === 0 &&
        data.pendingApprovals.length === 0
      )
        continue;

      const html = buildDigestEmail(
        data.name,
        data.firstAttempts,
        data.pendingApprovals
      );

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MyoCoach <noreply@myocoach.ca>",
          to: [data.email],
          subject: "MyoCoach \u2014 Your Morning Summary",
          html,
        }),
      });

      const resBody = await res.json();

      // Log to email_log
      await supabase.from("email_log").insert({
        user_id: therapistId,
        email: data.email,
        template_name: "daily-digest",
        sent_at: new Date().toISOString(),
        status: res.ok ? "success" : "fail",
        provider_id: resBody?.id ?? null,
        error_message: resBody?.message ?? null,
      });

      if (res.ok) {
        console.log(`[daily-digest] Sent to ${data.email}`);
      } else {
        console.error(
          `[daily-digest] Failed for ${data.email}:`,
          JSON.stringify(resBody)
        );
      }

      results.push({ therapistId, status: res.status });
    }

    console.log(`[daily-digest] Done. Sent ${results.length} emails.`);
    return new Response(
      JSON.stringify({ sent: results.length, results }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[daily-digest] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
