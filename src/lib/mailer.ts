// Email service using Resend via edge function
import { supabase } from "@/integrations/supabase/client";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId?: string;
  templateName?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        userId: options.userId,
        templateName: options.templateName,
      },
    });

    if (error) {
      console.error('[sendEmail] Error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    if (!data?.ok) {
      throw new Error(`Email send failed: ${data?.error || 'Unknown error'}`);
    }

  } catch (err) {
    console.error('[sendEmail] Unexpected error:', err);
    throw err;
  }
}
