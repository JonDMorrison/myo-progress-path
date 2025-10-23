import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get patients who need reminders
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select(`
        id,
        last_reminder_sent,
        user:users!inner(id, email, name),
        clinic:clinics(name)
      `)
      .eq('status', 'active')
      .or('last_reminder_sent.is.null,last_reminder_sent.lt.' + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (patientsError) throw patientsError;

    const remindersToSend: string[] = [];

    for (const patient of patients || []) {
      const user = Array.isArray(patient.user) ? patient.user[0] : patient.user;
      if (!user) continue;
      // Check if patient has activity today
      const { data: todayProgress } = await supabase
        .from('patient_week_progress')
        .select('id')
        .eq('patient_id', patient.id)
        .gte('updated_at', new Date().toISOString().split('T')[0])
        .limit(1);

      if (todayProgress && todayProgress.length > 0) {
        // Patient has been active today, skip reminder
        continue;
      }

      // Check if patient has pending exercises
      const { data: currentWeek } = await supabase
        .from('patient_week_progress')
        .select('id, week:weeks!inner(number, title)')
        .eq('patient_id', patient.id)
        .eq('status', 'open')
        .order('week_id', { ascending: true })
        .limit(1)
        .single();

      if (!currentWeek) continue;
      
      const week = Array.isArray(currentWeek.week) ? currentWeek.week[0] : currentWeek.week;
      if (!week) continue;

      // Send email reminder
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: user.email,
          subject: 'Time for your daily myofunctional therapy exercises',
          html: `
            <h2>Hi ${user.name},</h2>
            <p>This is a friendly reminder to complete your exercises for <strong>Week ${week.number}</strong>.</p>
            <p>Consistency is key to seeing results in your myofunctional therapy journey!</p>
            <p><a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/week/${week.number}" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Continue Your Exercises</a></p>
            <p>Keep up the great work!</p>
            <p>- The Montrose Myo Team</p>
          `,
          userId: user.id,
          templateName: 'daily_reminder'
        }
      });

      if (emailError) {
        console.error('Failed to send email to', user.email, emailError);
        continue;
      }

      // Create in-app notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          patient_id: patient.id,
          body: `Don't forget to complete your Week ${week.number} exercises today!`,
          sent_email: true
        });

      if (notificationError) {
        console.error('Failed to create notification', notificationError);
      }

      // Update last reminder sent
      await supabase
        .from('patients')
        .update({ last_reminder_sent: new Date().toISOString() })
        .eq('id', patient.id);

      remindersToSend.push(user.email);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: remindersToSend.length,
        recipients: remindersToSend
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in send-reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
