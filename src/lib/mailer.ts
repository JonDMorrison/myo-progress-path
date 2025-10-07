// Email service - connect to Resend later
// For now, logs emails to console

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log('[EMAIL] Would send:', {
    to: options.to,
    subject: options.subject,
    preview: options.text?.substring(0, 100) || options.html.substring(0, 100)
  });
  
  // TODO: Implement with Resend
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: process.env.MAIL_FROM || 'noreply@example.com',
  //   to: options.to,
  //   subject: options.subject,
  //   html: options.html,
  //   text: options.text
  // });
}
