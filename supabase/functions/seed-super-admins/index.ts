import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security: Require a seed token
    const { seedToken } = await req.json();
    const expectedToken = Deno.env.get('SEED_TOKEN');

    if (!expectedToken || seedToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Invalid seed token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const seedUsers = [
      { 
        email: 'matt@montrosedentalcentre.com', 
        name: 'Matt (Master Admin)',
        password: 'montrose'
      },
      { 
        email: 'info@montrosedentalcentre.com', 
        name: 'Montrose Master Admin',
        password: 'montrose'
      },
    ];

    const results: any[] = [];

    for (const user of seedUsers) {
      console.log(`Processing user: ${user.email}`);
      
      // Try to create the user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { 
          role: 'super_admin', 
          name: user.name 
        }
      });

      if (error) {
        // Check if user already exists
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          console.log(`User ${user.email} already exists, updating role...`);
          
          // Update the role in users table
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'super_admin', name: user.name })
            .eq('email', user.email);

          if (updateError) {
            results.push({ 
              email: user.email, 
              status: 'error', 
              message: updateError.message 
            });
          } else {
            results.push({ 
              email: user.email, 
              status: 'updated', 
              message: 'Role updated to super_admin' 
            });
          }
        } else {
          results.push({ 
            email: user.email, 
            status: 'error', 
            message: error.message 
          });
        }
        continue;
      }

      // User created successfully
      const userId = data.user?.id;
      if (userId) {
        // Ensure role is set correctly (trigger should handle this, but double-check)
        await supabase
          .from('users')
          .update({ role: 'super_admin', name: user.name })
          .eq('id', userId);
      }

      results.push({ 
        email: user.email, 
        status: 'created',
        message: 'Super admin created successfully'
      });
    }

    console.log('Seeding complete:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Super admin seeding complete',
        results 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Seed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});