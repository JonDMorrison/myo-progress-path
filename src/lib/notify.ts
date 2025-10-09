import { sendEmail } from "./mailer";
import { submittedWeekEmail, approvedWeekEmail, needsMoreEmail, onboardingEmail } from "./emailTemplates";
import { supabase } from "@/integrations/supabase/client";

export async function notifyTherapistSubmission(
  therapistEmail: string,
  therapistName: string,
  patientName: string,
  patientId: string,
  weekNumber: number
): Promise<void> {
  const template = submittedWeekEmail(therapistName, patientName, weekNumber, patientId);
  await sendEmail({
    to: therapistEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

export async function notifyPatientApproval(
  patientEmail: string,
  patientName: string,
  weekNumber: number
): Promise<void> {
  const template = approvedWeekEmail(patientName, weekNumber);
  await sendEmail({
    to: patientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

export async function notifyPatientNeedsMore(
  patientEmail: string,
  patientName: string,
  weekNumber: number,
  comment: string
): Promise<void> {
  const template = needsMoreEmail(patientName, weekNumber, comment);
  await sendEmail({
    to: patientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

export async function notifyNewPatientWelcome(
  patientEmail: string,
  patientName: string,
  patientId: string
): Promise<void> {
  // Fetch Week 1 video URL from app_settings
  const { data: settings } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'week1_video_url')
    .single();

  const week1VideoUrl = (settings?.value as string) || 'https://vimeo.com/placeholder';
  const loginUrl = `${window.location.origin}/auth`;
  
  const template = onboardingEmail(patientName, loginUrl, week1VideoUrl);
  
  await sendEmail({
    to: patientEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    userId: patientId,
    templateName: 'onboarding'
  });
}
