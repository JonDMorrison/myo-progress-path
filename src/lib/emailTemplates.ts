const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL || window.location.origin;

export function submittedWeekEmail(
  therapistName: string,
  patientName: string,
  weekNumber: number,
  patientId: string
): { subject: string; html: string; text: string } {
  const reviewUrl = `${APP_BASE_URL}/review/${patientId}/${weekNumber}`;
  
  return {
    subject: `Week ${weekNumber} Submitted - ${patientName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Week ${weekNumber} Ready for Review</h2>
        <p>Hi ${therapistName},</p>
        <p><strong>${patientName}</strong> has submitted Week ${weekNumber} for your review.</p>
        <p style="margin: 30px 0;">
          <a href="${reviewUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Week ${weekNumber}
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This is an automated notification from your Myofunctional Therapy Program.
        </p>
      </div>
    `,
    text: `Week ${weekNumber} Ready for Review\n\nHi ${therapistName},\n\n${patientName} has submitted Week ${weekNumber} for your review.\n\nReview here: ${reviewUrl}`
  };
}

export function approvedWeekEmail(
  patientName: string,
  weekNumber: number
): { subject: string; html: string; text: string } {
  const loginUrl = `${APP_BASE_URL}/auth`;
  
  return {
    subject: `Week ${weekNumber} Approved! 🎉`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Congratulations!</h2>
        <p>Hi ${patientName},</p>
        <p>Great work! Your therapist has approved <strong>Week ${weekNumber}</strong>.</p>
        <p>Week ${weekNumber + 1} is now unlocked and ready for you to begin.</p>
        <p style="margin: 30px 0;">
          <a href="${loginUrl}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Continue Your Program
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Keep up the excellent progress!
        </p>
      </div>
    `,
    text: `Congratulations!\n\nHi ${patientName},\n\nGreat work! Your therapist has approved Week ${weekNumber}.\n\nWeek ${weekNumber + 1} is now unlocked and ready for you to begin.\n\nLog in here: ${loginUrl}`
  };
}

export function needsMoreEmail(
  patientName: string,
  weekNumber: number,
  comment: string
): { subject: string; html: string; text: string } {
  const loginUrl = `${APP_BASE_URL}/auth`;
  
  return {
    subject: `Week ${weekNumber} - Additional Practice Needed`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Week ${weekNumber} Update</h2>
        <p>Hi ${patientName},</p>
        <p>Your therapist has reviewed Week ${weekNumber} and would like you to practice a bit more before moving forward.</p>
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Therapist feedback:</strong></p>
          <p style="margin: 8px 0 0 0;">${comment}</p>
        </div>
        <p style="margin: 30px 0;">
          <a href="${loginUrl}" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Continue Practicing
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Don't worry - this is a normal part of the process. Keep practicing!
        </p>
      </div>
    `,
    text: `Week ${weekNumber} Update\n\nHi ${patientName},\n\nYour therapist has reviewed Week ${weekNumber} and would like you to practice a bit more before moving forward.\n\nTherapist feedback:\n${comment}\n\nLog in here: ${loginUrl}`
  };
}
