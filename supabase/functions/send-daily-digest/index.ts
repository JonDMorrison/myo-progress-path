import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL =
  Deno.env.get("FROM_EMAIL") || "Montrose Myo <onboarding@resend.dev>";
const APP_URL = "https://myocoach.ca";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const hours = Math.round((now - then) / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function buildVideoRow(
  patientName: string,
  moduleNum: number,
  uploadedAt: string,
  patientId: string,
  weekNumber: number
): string {
  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #bfdbfe;">
        <p style="font-size: 14px; font-weight: 600; color: #1e3a8a; margin: 0;">${patientName}</p>
        <p style="font-size: 12px; color: #3b82f6; margin: 4px 0 0;">Module ${moduleNum} &mdash; uploaded ${timeAgo(uploadedAt)}</p>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #bfdbfe; text-align: right; vertical-align: middle;">
        <a href="${APP_URL}/review/${patientId}/${weekNumber}"
           style="background: #2563eb; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          View &amp; Respond
        </a>
      </td>
    </tr>`;
}

function buildApprovalRow(
  patientName: string,
  moduleNum: number,
  submittedAt: string,
  patientId: string,
  weekNumber: number,
  overdue: boolean
): string {
  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0;">
        <p style="font-size: 14px; font-weight: 600; color: #14532d; margin: 0;">
          ${patientName}${overdue ? ' <span style="color: #dc2626; font-size: 11px;">OVERDUE</span>' : ""}
        </p>
        <p style="font-size: 12px; color: #16a34a; margin: 4px 0 0;">Module ${moduleNum} &mdash; submitted ${timeAgo(submittedAt)}</p>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0; text-align: right; vertical-align: middle;">
        <a href="${APP_URL}/review/${patientId}/${weekNumber}"
           style="background: #16a34a; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Review &amp; Approve
        </a>
      </td>
    </tr>`;
}

function buildEmail(
  therapistName: string,
  videoRows: string,
  approvalRows: string,
  videoCount: number,
  approvalCount: number
): string {
  const videosSection =
    videoCount > 0
      ? `
  <div style="background: #eff6ff; border-radius: 12px; padding: 24px; border: 1px solid #bfdbfe; margin-bottom: 16px;">
    <p style="font-size: 13px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px;">&#x1F4F9; First Attempt Videos &mdash; Send Feedback</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
      ${videoRows}
    </table>
  </div>`
      : "";

  const approvalsSection =
    approvalCount > 0
      ? `
  <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; border: 1px solid #bbf7d0; margin-bottom: 16px;">
    <p style="font-size: 13px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px;">&#x2705; Modules Awaiting Approval</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
      ${approvalRows}
    </table>
  </div>`
      : "";

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="${APP_URL}/favicon.png" width="48" height="48" style="border-radius: 10px;" alt="MyoCoach" />
    <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 8px;">MyoCoach</div>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
    <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Good morning, ${therapistName} &#x1F44B;</p>
    <p style="font-size: 14px; color: #64748b; margin: 0;">Here's what needs your attention today.</p>
  </div>

  ${videosSection}
  ${approvalsSection}

  <div style="text-align: center; margin-top: 24px;">
    <a href="${APP_URL}/therapist" style="display: inline-block; background: #0f172a; color: white; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; margin-bottom: 16px;">
      Open Dashboard
    </a>
    <p style="font-size: 12px; color: #cbd5e1; margin-top: 16px;">Montrose Myo &middot; Chilliwack, BC</p>
    <p style="font-size: 11px; color: #e2e8f0;">You're receiving this because you're a registered therapist on MyoCoach.</p>
  </div>
</div>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[daily-digest] Starting digest run...");

    // 1. First attempt videos uploaded in the last 24h
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: recentVideos, error: videoErr } = await supabase
      .from("uploads")
      .select(
        "patient_id, created_at, week_id, patients!inner(id, name, assigned_therapist_id), weeks!inner(number)"
      )
      .eq("kind", "first_attempt")
      .gte("created_at", twentyFourHoursAgo)
      .not("patients.assigned_therapist_id", "is", null);

    if (videoErr) {
      console.error("[daily-digest] Video query error:", videoErr);
    }

    // 2. Pending approvals (submitted modules)
    const { data: pendingApprovals, error: approvalErr } = await supabase
      .from("patient_week_progress")
      .select(
        "patient_id, submitted_at, week_id, patients!inner(id, name, assigned_therapist_id), weeks!inner(number)"
      )
      .eq("status", "submitted")
      .not("patients.assigned_therapist_id", "is", null);

    if (approvalErr) {
      console.error("[daily-digest] Approval query error:", approvalErr);
    }

    // 3. Build per-therapist digest
    const therapistMap: Record<
      string,
      {
        videos: any[];
        approvals: any[];
      }
    > = {};

    for (const v of recentVideos || []) {
      const therapistId = (v as any).patients?.assigned_therapist_id;
      if (!therapistId) continue;
      if (!therapistMap[therapistId])
        therapistMap[therapistId] = { videos: [], approvals: [] };
      therapistMap[therapistId].videos.push(v);
    }

    for (const a of pendingApprovals || []) {
      const therapistId = (a as any).patients?.assigned_therapist_id;
      if (!therapistId) continue;
      if (!therapistMap[therapistId])
        therapistMap[therapistId] = { videos: [], approvals: [] };
      therapistMap[therapistId].approvals.push(a);
    }

    const therapistIds = Object.keys(therapistMap);

    if (therapistIds.length === 0) {
      console.log("[daily-digest] No therapists have pending items. Skipping.");
      return new Response(
        JSON.stringify({ ok: true, sent: 0, reason: "no pending items" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Fetch therapist details
    const { data: therapists } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", therapistIds);

    const therapistLookup: Record<string, { name: string; email: string }> = {};
    for (const t of therapists || []) {
      therapistLookup[t.id] = { name: t.name || "Therapist", email: t.email };
    }

    // 5. Send emails
    let sentCount = 0;
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;

    for (const therapistId of therapistIds) {
      const info = therapistLookup[therapistId];
      if (!info?.email) {
        console.warn(`[daily-digest] No email for therapist ${therapistId}`);
        continue;
      }

      const { videos, approvals } = therapistMap[therapistId];

      // Build video rows
      const videoRowsHtml = videos
        .map((v: any) => {
          const weekNum = v.weeks?.number || 1;
          const moduleNum = Math.ceil(weekNum / 2);
          return buildVideoRow(
            v.patients?.name || "Patient",
            moduleNum,
            v.created_at,
            v.patient_id,
            weekNum
          );
        })
        .join("");

      // Build approval rows
      const approvalRowsHtml = approvals
        .map((a: any) => {
          const weekNum = a.weeks?.number || 1;
          const moduleNum = Math.ceil(weekNum / 2);
          const submittedAt = a.submitted_at || a.created_at || new Date().toISOString();
          const isOverdue =
            new Date(submittedAt).getTime() < fortyEightHoursAgo;
          return buildApprovalRow(
            a.patients?.name || "Patient",
            moduleNum,
            submittedAt,
            a.patient_id,
            weekNum,
            isOverdue
          );
        })
        .join("");

      const html = buildEmail(
        info.name,
        videoRowsHtml,
        approvalRowsHtml,
        videos.length,
        approvals.length
      );

      // Send via Resend
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: info.email,
          subject: "MyoCoach \u2014 Your Morning Summary",
          html,
        }),
      });

      const result = await res.json();

      // Log to email_log
      await supabase.from("email_log").insert({
        user_id: therapistId,
        email: info.email,
        template_name: "daily-digest",
        sent_at: new Date().toISOString(),
        status: res.ok ? "success" : "fail",
        provider_id: result?.id ?? null,
        error_message: result?.message ?? null,
      });

      if (res.ok) {
        sentCount++;
        console.log(`[daily-digest] Sent to ${info.email}`);
      } else {
        console.error(
          `[daily-digest] Failed for ${info.email}:`,
          JSON.stringify(result)
        );
      }
    }

    console.log(`[daily-digest] Done. Sent ${sentCount} emails.`);
    return new Response(
      JSON.stringify({ ok: true, sent: sentCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[daily-digest] Unexpected error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
