import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Video, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadVideoForExercise, validateVideoFile, deleteVideo } from "@/lib/storage";
import { toast } from "sonner";

interface ExerciseVideoUploadProps {
  patientId: string;
  weekId: string;
  exerciseId: string;
  exerciseTitle: string;
  onUploadComplete?: () => void;
}

interface ExistingUpload {
  id: string;
  kind: 'first_attempt' | 'last_attempt';
  file_url: string;
  created_at: string;
}

export function ExerciseVideoUpload({
  patientId,
  weekId,
  exerciseId,
  exerciseTitle,
  onUploadComplete
}: ExerciseVideoUploadProps) {
  const [uploads, setUploads] = useState<ExistingUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingKind, setUploadingKind] = useState<'first_attempt' | 'last_attempt' | null>(null);

  useEffect(() => {
    loadExistingUploads();
  }, [patientId, weekId, exerciseId]);

  const loadExistingUploads = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('uploads')
      .select('id, kind, file_url, created_at')
      .eq('patient_id', patientId)
      .eq('week_id', weekId?.startsWith('json-') ? '00000000-0000-0000-0000-000000000000' : weekId)
      .eq('exercise_id', exerciseId?.startsWith('json-') ? '00000000-0000-0000-0000-000000000000' : exerciseId);

    if (!error && data) {
      setUploads(data as ExistingUpload[]);
    }
    setIsLoading(false);
  };

  const hasFirstAttempt = uploads.some(u => u.kind === 'first_attempt');
  const hasLastAttempt = uploads.some(u => u.kind === 'last_attempt');

  const handleFileSelect = async (kind: 'first_attempt' | 'last_attempt', file: File) => {
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploadingKind(kind);
    
    const result = await uploadVideoForExercise(file, patientId, weekId, exerciseId, kind);
    
    if (result.success) {
      toast.success(`${kind === 'first_attempt' ? 'First' : 'Last'} attempt uploaded successfully`);
      await loadExistingUploads();
      onUploadComplete?.();
    } else {
      toast.error(result.error || 'Upload failed');
    }
    
    setUploadingKind(null);
  };

  const handleDelete = async (uploadId: string, fileUrl: string) => {
    const result = await deleteVideo(uploadId, fileUrl);
    if (result.success) {
      toast.success('Video deleted');
      await loadExistingUploads();
      onUploadComplete?.();
    } else {
      toast.error(result.error || 'Delete failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-dashed">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Video className="h-4 w-4 text-primary" />
        <span>Your Video Submissions</span>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <AlertDescription className="text-xs">
          <strong>Last attempt videos</strong> should be submitted after exercise has been completed 2x/day for 14 days (unless otherwise noted).
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* First Attempt */}
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">First Attempt</span>
            {hasFirstAttempt && <CheckCircle2 className="h-4 w-4 text-success" />}
          </div>
          
          {hasFirstAttempt ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>✓ Uploaded</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-destructive hover:text-destructive"
                onClick={() => {
                  const upload = uploads.find(u => u.kind === 'first_attempt');
                  if (upload) handleDelete(upload.id, upload.file_url);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect('first_attempt', file);
                }}
                disabled={uploadingKind !== null}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={uploadingKind !== null}
                asChild
              >
                <span>
                  {uploadingKind === 'first_attempt' ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" /> Upload Video</>
                  )}
                </span>
              </Button>
            </label>
          )}
        </div>

        {/* Last Attempt */}
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Attempt</span>
            {hasLastAttempt && <CheckCircle2 className="h-4 w-4 text-success" />}
          </div>
          
          {hasLastAttempt ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>✓ Uploaded</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-destructive hover:text-destructive"
                onClick={() => {
                  const upload = uploads.find(u => u.kind === 'last_attempt');
                  if (upload) handleDelete(upload.id, upload.file_url);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect('last_attempt', file);
                }}
                disabled={uploadingKind !== null}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={uploadingKind !== null}
                asChild
              >
                <span>
                  {uploadingKind === 'last_attempt' ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" /> Upload Video</>
                  )}
                </span>
              </Button>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
