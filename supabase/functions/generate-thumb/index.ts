import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { upload_id } = await req.json();

    if (!upload_id) {
      throw new Error('upload_id is required');
    }

    // Get upload details
    const { data: upload, error: uploadError } = await supabaseClient
      .from('uploads')
      .select('*, patients(id)')
      .eq('id', upload_id)
      .single();

    if (uploadError) throw uploadError;
    if (!upload.file_url) throw new Error('No file_url found');

    // For now, mark as attempted but not implemented
    // TODO: Implement actual thumbnail generation with ffmpeg
    // This would require:
    // 1. Download video from signed URL
    // 2. Extract frame at 3s using ffmpeg
    // 3. Upload thumbnail to storage
    // 4. Update uploads.thumb_url

    console.log('[THUMB] Would generate thumbnail for:', upload_id);
    console.log('[THUMB] File URL:', upload.file_url);

    // Mark as attempted (failed for now until ffmpeg is set up)
    await supabaseClient
      .from('uploads')
      .update({ thumb_failed: true })
      .eq('id', upload_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Thumbnail generation queued (not yet implemented)' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
