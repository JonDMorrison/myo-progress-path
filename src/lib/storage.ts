import { supabase } from "@/integrations/supabase/client";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
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
      error: `File size (${sizeMB}MB) exceeds the 100MB limit.` 
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
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
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

    // Create upload record in database
    const { error: insertError } = await supabase
      .from('uploads')
      .insert({
        patient_id: patientId,
        week_id: weekId,
        kind,
        file_url: fileUrl,
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Try to clean up uploaded file
      await supabase.storage.from('patient-videos').remove([filename]);
      return { success: false, error: insertError.message };
    }

    // Simulate progress for better UX (actual upload is already complete)
    if (onProgress) {
      onProgress(100);
    }

    return { success: true, fileUrl };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message || 'Upload failed' };
  }
}

/**
 * Get signed URL for viewing a video (admin/therapist access)
 */
export async function getVideoUrl(fileUrl: string): Promise<string> {
  // If it's already a signed URL, return it
  if (fileUrl.includes('token=')) {
    return fileUrl;
  }

  // Extract the path from the URL
  const urlParts = fileUrl.split('/patient-videos/');
  if (urlParts.length < 2) {
    return fileUrl;
  }

  const filePath = urlParts[1];

  // Generate new signed URL
  const { data, error } = await supabase.storage
    .from('patient-videos')
    .createSignedUrl(filePath, 3600); // 1 hour

  if (error) {
    console.error('Error generating signed URL:', error);
    return fileUrl;
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
