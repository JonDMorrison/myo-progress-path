const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL || window.location.origin;

// Helper to get module-based labels from week number
function getModuleLabel(weekNumber: number): string {
  const moduleNum = Math.ceil(weekNumber / 2);
  const partLabel = weekNumber % 2 !== 0 ? 'Part One' : 'Part Two';
  return `Module ${moduleNum} ${partLabel}`;
}

export function submittedWeekEmail(
  therapistName: string,
  patientName: string,
  weekNumber: number,
  patientId: string
): { subject: string; html: string; text: string } {
  const reviewUrl = `${APP_BASE_URL}/review/${patientId}/${weekNumber}`;
  const moduleLabel = getModuleLabel(weekNumber);
  
  return {
    subject: `${moduleLabel} Submitted - ${patientName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${moduleLabel} Ready for Review</h2>
        <p>Hi ${therapistName},</p>
        <p><strong>${patientName}</strong> has submitted ${moduleLabel} for your review.</p>
        <p style="margin: 30px 0;">
          <a href="${reviewUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review ${moduleLabel}
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This is an automated notification from your Myofunctional Therapy Program.
        </p>
      </div>
    `,
    text: `${moduleLabel} Ready for Review\n\nHi ${therapistName},\n\n${patientName} has submitted ${moduleLabel} for your review.\n\nReview here: ${reviewUrl}`
  };
}

export function approvedWeekEmail(
  patientName: string,
  weekNumber: number
): { subject: string; html: string; text: string } {
  const loginUrl = `${APP_BASE_URL}/auth`;
  const moduleLabel = getModuleLabel(weekNumber);
  const nextModuleLabel = getModuleLabel(weekNumber + 1);
  
  return {
    subject: `${moduleLabel} Approved! 🎉`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Congratulations!</h2>
        <p>Hi ${patientName},</p>
        <p>Great work! Your therapist has approved <strong>${moduleLabel}</strong>.</p>
        <p>${nextModuleLabel} is now unlocked and ready for you to begin.</p>
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
    text: `Congratulations!\n\nHi ${patientName},\n\nGreat work! Your therapist has approved ${moduleLabel}.\n\n${nextModuleLabel} is now unlocked and ready for you to begin.\n\nLog in here: ${loginUrl}`
  };
}

export function needsMoreEmail(
  patientName: string,
  weekNumber: number,
  comment: string
): { subject: string; html: string; text: string } {
  const loginUrl = `${APP_BASE_URL}/auth`;
  const moduleLabel = getModuleLabel(weekNumber);
  
  return {
    subject: `${moduleLabel} - Additional Practice Needed`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">${moduleLabel} Update</h2>
        <p>Hi ${patientName},</p>
        <p>Your therapist has reviewed ${moduleLabel} and would like you to practice a bit more before moving forward.</p>
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
    text: `${moduleLabel} Update\n\nHi ${patientName},\n\nYour therapist has reviewed ${moduleLabel} and would like you to practice a bit more before moving forward.\n\nTherapist feedback:\n${comment}\n\nLog in here: ${loginUrl}`
  };
}

export function onboardingEmail(
  patientName: string,
  loginUrl: string,
  week1VideoUrl: string
): { subject: string; html: string; text: string } {
  const subject = "Welcome to Montrose Myo — Let's Get Started";
  const safeName = patientName?.trim() || "there";
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
                Over the coming modules, you'll build healthy habits for <strong>tongue posture</strong>, <strong>nasal breathing</strong>,
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

  return { subject, html, text };
}
