import { supabase } from "@/integrations/supabase/client";

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime']; // .mp4 and .mov

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
  error: string | null;
}

/**
 * Validates video file before upload
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Only .mp4 and .mov video files are allowed.' 
    };
  }

  // Check file size
  if (file.size > MAX_VIDEO_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { 
      valid: false, 
      error: `File size (${sizeMB}MB) exceeds the 500MB limit.` 
    };
  }

  return { valid: true };
}

/**
 * Upload video to Supabase storage with progress tracking
 */
export async function uploadVideo(
  file: File,
  patientId: string,
  weekId: string,
  kind: 'first_attempt' | 'last_attempt',
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; fileUrl?: string; uploadId?: string; error?: string }> {
  try {
    // Validate file
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `${patientId}/${weekId}/${kind}_${timestamp}.${ext}`;

    // Upload to storage bucket (patient-videos is private)
    const { data, error: uploadError } = await supabase.storage
      .from('patient-videos')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Generate signed URL (not public URL since bucket is private)
    const { data: urlData } = await supabase.storage
      .from('patient-videos')
      .createSignedUrl(filename, 60 * 60 * 24 * 365); // 1 year expiry

    const fileUrl = urlData?.signedUrl || '';

    // Create upload record in database and get the ID
    const { data: insertData, error: insertError } = await supabase
      .from('uploads')
      .insert({
        patient_id: patientId,
        week_id: weekId?.startsWith('json-') ? null : weekId,
        kind,
        file_url: fileUrl,
      })
      .select('id')
      .single();

    if (insertError || !insertData) {
      console.error('Database insert error:', insertError);
      // Try to clean up uploaded file
      await supabase.storage.from('patient-videos').remove([filename]);
      return { success: false, error: insertError?.message || 'Failed to create upload record' };
    }

    // AI video analysis disabled - feedback is therapist-only

    // Simulate progress for better UX (actual upload is already complete)
    if (onProgress) {
      onProgress(100);
    }

    return { success: true, fileUrl, uploadId: insertData.id };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message || 'Upload failed' };
  }
}

/**
 * Upload video for a specific exercise
 */
export async function uploadVideoForExercise(
  file: File,
  patientId: string,
  weekId: string,
  exerciseId: string,
  kind: 'first_attempt' | 'last_attempt',
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; fileUrl?: string; uploadId?: string; error?: string }> {
  try {
    // Validate file
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename with exercise ID
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `${patientId}/${weekId}/exercise_${exerciseId}/${kind}_${timestamp}.${ext}`;

    // Upload to storage bucket (patient-videos is private)
    const { data, error: uploadError } = await supabase.storage
      .from('patient-videos')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Generate signed URL (not public URL since bucket is private)
    const { data: urlData } = await supabase.storage
      .from('patient-videos')
      .createSignedUrl(filename, 60 * 60 * 24 * 365); // 1 year expiry

    const fileUrl = urlData?.signedUrl || '';

    // Create upload record in database with exercise_id
    const { data: insertData, error: insertError } = await supabase
      .from('uploads')
      .insert({
        patient_id: patientId,
        week_id: weekId?.startsWith('json-') ? null : weekId,
        exercise_id: exerciseId,
        kind,
        file_url: fileUrl,
      })
      .select('id')
      .single();

    if (insertError || !insertData) {
      console.error('Database insert error:', insertError);
      // Try to clean up uploaded file
      await supabase.storage.from('patient-videos').remove([filename]);
      return { success: false, error: insertError?.message || 'Failed to create upload record' };
    }

    // AI video analysis disabled - feedback is therapist-only

    // Simulate progress for better UX (actual upload is already complete)
    if (onProgress) {
      onProgress(100);
    }

    return { success: true, fileUrl, uploadId: insertData.id };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message || 'Upload failed' };
  }
}

/**
 * Check if a signed URL is expired or about to expire
 */
function isUrlExpired(url: string): boolean {
  if (!url.includes('token=')) return true;
  
  // Extract token expiry from URL (Supabase uses exp parameter)
  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    if (!token) return true;
    
    // Decode JWT payload (base64) to get exp
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const expiry = payload.exp * 1000; // Convert to ms
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minute buffer
    
    return now >= (expiry - buffer);
  } catch {
    return true; // Assume expired if we can't parse
  }
}

/**
 * Extract file path from a storage URL or signed URL
 */
function extractFilePath(fileUrl: string): string | null {
  // Handle both signed URLs and direct paths
  const urlParts = fileUrl.split('/patient-videos/');
  if (urlParts.length < 2) return null;
  
  // Remove query params
  return urlParts[1].split('?')[0];
}

/**
 * Get signed URL for viewing a video (admin/therapist access)
 * Always generates a fresh URL to avoid expiry issues
 */
export async function getVideoUrl(fileUrl: string): Promise<string> {
  // Always refresh if URL is expired or near expiry
  if (fileUrl.includes('token=') && !isUrlExpired(fileUrl)) {
    return fileUrl;
  }

  const filePath = extractFilePath(fileUrl);
  if (!filePath) {
    console.warn('Could not extract file path from URL:', fileUrl);
    return fileUrl;
  }

  // Generate new signed URL (1 hour expiry)
  const { data, error } = await supabase.storage
    .from('patient-videos')
    .createSignedUrl(filePath, 3600);

  if (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Video not available - please try again');
  }

  return data.signedUrl;
}

/**
 * Delete a video upload
 */
export async function deleteVideo(
  uploadId: string,
  fileUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract filename from URL
    const urlParts = fileUrl.split('/patient-videos/');
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid file URL' };
    }

    const filename = urlParts[1].split('?')[0]; // Remove query params

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('patient-videos')
      .remove([filename]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', uploadId);

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Delete failed' };
  }
}
