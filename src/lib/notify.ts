// Notification stubs - to be implemented with email service

export async function notifyTherapistSubmission(
  therapistEmail: string,
  patientName: string,
  weekNumber: number
): Promise<void> {
  console.log(`[NOTIFY] Therapist ${therapistEmail}: Patient ${patientName} submitted Week ${weekNumber}`);
  // TODO: Send email via edge function
}

export async function notifyPatientApproval(
  patientEmail: string,
  weekNumber: number,
  note?: string
): Promise<void> {
  console.log(`[NOTIFY] Patient ${patientEmail}: Week ${weekNumber} approved. Note: ${note || "None"}`);
  // TODO: Send email via edge function
}

export async function notifyPatientNeedsMore(
  patientEmail: string,
  weekNumber: number,
  comment: string
): Promise<void> {
  console.log(`[NOTIFY] Patient ${patientEmail}: Week ${weekNumber} needs more practice. Comment: ${comment}`);
  // TODO: Send email via edge function
}
