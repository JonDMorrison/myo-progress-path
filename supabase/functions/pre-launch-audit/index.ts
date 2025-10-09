import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type CheckResult = { section: string; status: 'PASS' | 'FAIL' | 'WARN'; details?: string };

async function checkDatabase(): Promise<CheckResult> {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    return {
      section: 'Database Connection',
      status: 'PASS',
      details: `${count} users`,
    };
  } catch (e: any) {
    return { section: 'Database Connection', status: 'FAIL', details: e?.message };
  }
}

async function checkWeekPages(): Promise<CheckResult> {
  try {
    const { data: weeks, error } = await supabase
      .from('weeks')
      .select('number, title')
      .order('number');
    
    if (error) throw error;
    
    const expectedWeeks = 25; // Week 0-24
    const actualWeeks = weeks?.length || 0;
    
    if (actualWeeks >= expectedWeeks) {
      return {
        section: 'Week Pages',
        status: 'PASS',
        details: `${actualWeeks}/25 weeks`,
      };
    }
    
    return {
      section: 'Week Pages',
      status: 'FAIL',
      details: `${actualWeeks}/25 weeks (missing ${expectedWeeks - actualWeeks})`,
    };
  } catch (e: any) {
    return { section: 'Week Pages', status: 'FAIL', details: e?.message };
  }
}

async function checkLearnHub(): Promise<CheckResult> {
  try {
    // Check if learn articles exist by fetching the index
    const baseUrl = Deno.env.get('VITE_APP_BASE_URL') || 'https://app.example.com';
    const response = await fetch(`${baseUrl}/content/learn/index.json`);
    
    if (!response.ok) {
      return {
        section: 'Learn Hub Data',
        status: 'FAIL',
        details: `HTTP ${response.status}`,
      };
    }
    
    const articles = await response.json();
    const count = Array.isArray(articles) ? articles.length : 0;
    
    if (count >= 5) {
      return {
        section: 'Learn Hub Data',
        status: 'PASS',
        details: `${count} articles`,
      };
    }
    
    return {
      section: 'Learn Hub Data',
      status: 'WARN',
      details: `Only ${count} articles found`,
    };
  } catch (e: any) {
    return { section: 'Learn Hub Data', status: 'FAIL', details: e?.message };
  }
}

async function checkHIPAA(): Promise<CheckResult> {
  try {
    // Check encryption setting
    const { data: settings, error: settingsErr } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'encryption_enabled')
      .single();
    
    if (settingsErr) {
      return { section: 'HIPAA Settings', status: 'FAIL', details: 'app_settings read failed' };
    }
    
    if (!settings?.value) {
      return { section: 'HIPAA Settings', status: 'FAIL', details: 'Encryption not enabled' };
    }
    
    // Test audit_log write
    const { error: auditErr } = await supabase
      .from('audit_log')
      .insert({
        action: 'prelaunch_audit_test',
        target_type: 'system',
        metadata: { note: 'pre-launch test', timestamp: new Date().toISOString() },
      });
    
    if (auditErr) {
      return { section: 'HIPAA Settings', status: 'FAIL', details: 'audit_log write failed' };
    }
    
    return { section: 'HIPAA Settings', status: 'PASS' };
  } catch (e: any) {
    return { section: 'HIPAA Settings', status: 'FAIL', details: e?.message };
  }
}

async function checkVimeoPrivacy(): Promise<CheckResult> {
  try {
    const { data: weeks, error } = await supabase
      .from('weeks')
      .select('number, title, video_url');
    
    if (error) {
      return { section: 'Video Privacy', status: 'FAIL', details: 'weeks query failed' };
    }
    
    const publicVideos: number[] = [];
    
    for (const week of weeks || []) {
      if (!week.video_url) continue;
      
      const url = week.video_url.toLowerCase();
      // Flag videos that might be public
      if (url.includes('/public/') || url.includes('youtube.com') || url.includes('youtu.be')) {
        publicVideos.push(week.number);
      }
    }
    
    if (publicVideos.length === 0) {
      return { section: 'Video Privacy', status: 'PASS' };
    }
    
    return {
      section: 'Video Privacy',
      status: 'WARN',
      details: `Review weeks: ${publicVideos.slice(0, 5).join(', ')}${publicVideos.length > 5 ? '...' : ''}`,
    };
  } catch (e: any) {
    return { section: 'Video Privacy', status: 'FAIL', details: e?.message };
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[pre-launch-audit] Starting audit...');
    
    const results: CheckResult[] = [];
    
    // Run all checks
    results.push(await checkDatabase());
    results.push(await checkWeekPages());
    results.push(await checkLearnHub());
    results.push(await checkHIPAA());
    results.push(await checkVimeoPrivacy());
    
    // Determine overall status
    const hasFail = results.some(r => r.status === 'FAIL');
    const hasWarn = results.some(r => r.status === 'WARN');
    const overallStatus = hasFail ? 'FAIL' : hasWarn ? 'WARN' : 'PASS';
    
    // Build summary
    const summary = results
      .map(r => {
        const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌';
        return `${icon} ${r.section}: ${r.status}${r.details ? ` (${r.details})` : ''}`;
      })
      .join('\n');
    
    console.log('\n=== AUDIT RESULTS ===\n' + summary);
    
    // Save to database
    const { error: logErr } = await supabase
      .from('prelaunch_audit_log')
      .insert({
        status: overallStatus,
        summary,
        results,
        auditor_id: null, // System-initiated
      });
    
    if (logErr) {
      console.error('[prelaunch_audit_log] insert failed:', logErr);
    }
    
    return new Response(
      JSON.stringify({
        ok: !hasFail,
        status: overallStatus,
        results,
        summary,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[pre-launch-audit] Unexpected error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
