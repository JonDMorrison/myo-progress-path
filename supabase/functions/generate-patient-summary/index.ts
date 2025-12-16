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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check user role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || (userData.role !== "therapist" && userData.role !== "admin")) {
      throw new Error("Insufficient permissions");
    }

    const { patientId } = await req.json();

    // Get patient data
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select(`
        id,
        program_variant,
        consent_accepted_at,
        consent_signature,
        consent_payload,
        assigned_therapist_id,
        users!patients_user_id_fkey (
          name,
          email
        )
      `)
      .eq("id", patientId)
      .single();

    if (patientError || !patient) {
      throw new Error("Patient not found");
    }

    // Check access
    if (userData.role === "therapist" && patient.assigned_therapist_id !== user.id) {
      throw new Error("Access denied");
    }

    // Get therapist info
    const { data: therapist } = await supabase
      .from("users")
      .select("name")
      .eq("id", patient.assigned_therapist_id)
      .single();

    // Get week progress
    const { data: progress } = await supabase
      .from("v_weekly_metrics")
      .select("*")
      .eq("patient_id", patientId)
      .order("week_number", { ascending: true });

    // Get messages/comments
    const { data: messages } = await supabase
      .from("messages")
      .select(`
        body,
        created_at,
        therapist_id,
        weeks!messages_week_id_fkey (
          number
        )
      `)
      .eq("patient_id", patientId)
      .not("therapist_id", "is", null)
      .order("created_at", { ascending: true });

    // Generate HTML for PDF
    const html = generateHTML({
      patient,
      therapist,
      progress,
      messages,
    });

    // For now, return HTML (in production, convert to PDF using a library)
    // You could use: puppeteer, wkhtmltopdf, or a PDF generation service
    const pdfFilename = `patient-summary-${patientId}-${Date.now()}.html`;
    
    // Upload to consents bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("consents")
      .upload(pdfFilename, new Blob([html], { type: "text/html" }), {
        contentType: "text/html",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Generate signed URL (expires in 5 minutes)
    const { data: signedData } = await supabase.storage
      .from("consents")
      .createSignedUrl(pdfFilename, 300);

    console.log(`Generated patient summary for ${patientId}`);

    return new Response(
      JSON.stringify({ 
        url: signedData?.signedUrl,
        filename: pdfFilename 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in generate-patient-summary:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

function generateHTML(data: any) {
  const { patient, therapist, progress, messages } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Patient Summary - ${patient.users.name}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      margin: 0;
      color: #2563eb;
    }
    .info-section {
      margin-bottom: 30px;
    }
    .info-section h2 {
      color: #2563eb;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
    .consent-box {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Montrose Myo Patient Summary</h1>
    <p><strong>Patient:</strong> ${patient.users.name}</p>
    <p><strong>Email:</strong> ${patient.users.email}</p>
    <p><strong>Program:</strong> ${patient.program_variant}</p>
    <p><strong>Assigned Therapist:</strong> ${therapist?.name || "Not assigned"}</p>
  </div>

  <div class="info-section">
    <h2>Consent Record</h2>
    <div class="consent-box">
      <p><strong>Accepted:</strong> ${patient.consent_accepted_at ? new Date(patient.consent_accepted_at).toLocaleDateString() : "Not accepted"}</p>
      <p><strong>Signature:</strong> ${patient.consent_signature || "N/A"}</p>
      ${patient.consent_payload ? `<p><strong>Version:</strong> ${patient.consent_payload.version}</p>` : ""}
    </div>
  </div>

  <div class="info-section">
    <h2>Week-by-Week Progress</h2>
    <table>
      <thead>
        <tr>
          <th>Week #</th>
          <th>Status</th>
          <th>Completed</th>
          <th>BOLT</th>
          <th>Nasal %</th>
          <th>Tongue %</th>
        </tr>
      </thead>
      <tbody>
        ${progress?.map((p: any) => `
          <tr>
            <td>${p.week_number}</td>
            <td>${p.status}</td>
            <td>${p.completed_at ? new Date(p.completed_at).toLocaleDateString() : "-"}</td>
            <td>${p.bolt_score || "-"}</td>
            <td>${p.nasal_breathing_pct !== null ? p.nasal_breathing_pct + "%" : "-"}</td>
            <td>${p.tongue_on_spot_pct !== null ? p.tongue_on_spot_pct + "%" : "-"}</td>
          </tr>
        `).join("") || "<tr><td colspan='6'>No progress data</td></tr>"}
      </tbody>
    </table>
  </div>

  <div class="info-section">
    <h2>Therapist Comments</h2>
    ${messages && messages.length > 0 ? messages.map((m: any) => `
      <div style="margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
        <p style="margin: 0; font-size: 12px; color: #666;">
          Week ${m.weeks?.number} • ${new Date(m.created_at).toLocaleDateString()}
        </p>
        <p style="margin: 5px 0 0 0;">${m.body}</p>
      </div>
    `).join("") : "<p>No therapist comments</p>"}
  </div>

  <div class="footer">
    <p>Generated by Montrose Myo on ${new Date().toLocaleString()}</p>
    <p>This document is confidential and intended for clinical records only.</p>
  </div>
</body>
</html>
  `;
}
