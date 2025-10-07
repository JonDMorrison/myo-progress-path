import { sendEmail } from "./mailer";
import { submittedWeekEmail, approvedWeekEmail, needsMoreEmail } from "./emailTemplates";

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
