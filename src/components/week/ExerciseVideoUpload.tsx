import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Video, CheckCircle2, Loader2, Trash2, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { uploadVideoForExercise, validateVideoFile, deleteVideo, getVideoUrl } from "@/lib/storage";
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
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  const handlePlay = async (fileUrl: string) => {
    try {
      const signedUrl = await getVideoUrl(fileUrl);
      setPlayingUrl(signedUrl);
    } catch (e) {
      toast.error('Could not load video');
    }
  };

  useEffect(() => {
    loadExistingUploads();
  }, [patientId, weekId, exerciseId]);

  const loadExistingUploads = async () => {
    setIsLoading(true);
    let query = supabase
      .from('uploads')
      .select('id, kind, file_url, created_at')
      .eq('patient_id', patientId);

    if (exerciseId?.startsWith('json-')) {
      query = query.eq('exercise_key', exerciseId);
    } else {
      query = query.eq('exercise_id', exerciseId);
    }

    const { data, error } = await query;

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

    // Warn on large files
    const sizeMB = (file.size / (1024 * 1024)).toFixed(0);
    if (file.size > 20 * 1024 * 1024) {
      toast(`Large file (${sizeMB}MB) — upload may take a minute`, { icon: '⚠️' });
    }

    setUploadingKind(kind);

    const result = await uploadVideoForExercise(file, patientId, weekId, exerciseId, kind);
    
    if (result.success) {
      toast.success(`${kind === 'first_attempt' ? 'First' : 'Last'} attempt uploaded successfully`);

      // Notify therapist when a first attempt video is uploaded
      if (kind === 'first_attempt') {
        try {
          const { data: pat } = await supabase
            .from('patients')
            .select('id, assigned_therapist_id, user:users!user_id(name)')
            .eq('id', patientId)
            .single();

          if (pat?.assigned_therapist_id) {
            // Look up week number from week UUID to compute module number
            let moduleNum = 0;
            const realWeekId = weekId?.startsWith('json-') ? null : weekId;
            if (realWeekId) {
              const { data: weekRow } = await supabase
                .from('weeks')
                .select('number')
                .eq('id', realWeekId)
                .single();
              moduleNum = weekRow ? Math.ceil(weekRow.number / 2) : 0;
            }

            const patientName = (pat as any).user?.name || 'Your patient';
            const moduleLabel = moduleNum > 0 ? ` for Module ${moduleNum}` : '';
            await supabase.from('messages').insert({
              patient_id: patientId,
              therapist_id: pat.assigned_therapist_id,
              week_id: realWeekId,
              body: `📹 ${patientName} uploaded their first attempt video${moduleLabel}. Tap to review and send early feedback.`,
              sent_by: 'system',
            });
          }
        } catch (e) {
          // Non-critical — don't block the upload flow
          console.error('Failed to send first-attempt notification:', e);
        }
      }

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
          
          <label className="cursor-pointer" data-testid="upload-first-attempt-label">
            <input
              type="file"
              accept="video/mp4,video/quicktime"
              className="hidden"
              data-testid="upload-first-attempt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('first_attempt', file);
              }}
              disabled={uploadingKind !== null}
            />
            <Button
              variant={hasFirstAttempt ? "default" : "outline"}
              size="sm"
              className={`w-full ${hasFirstAttempt ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
              disabled={uploadingKind !== null}
              asChild
            >
              <span>
                {uploadingKind === 'first_attempt' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                ) : hasFirstAttempt ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Uploaded</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Upload First Attempt</>
                )}
              </span>
            </Button>
          </label>
          {hasFirstAttempt && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 flex-1"
                onClick={() => {
                  const upload = uploads.find(u => u.kind === 'first_attempt');
                  if (upload) handlePlay(upload.file_url);
                }}
              >
                <Play className="h-3 w-3 mr-1" /> Watch
              </Button>
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
          )}
        </div>

        {/* Last Attempt */}
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Attempt</span>
            {hasLastAttempt && <CheckCircle2 className="h-4 w-4 text-success" />}
          </div>
          
          <label className="cursor-pointer" data-testid="upload-last-attempt-label">
            <input
              type="file"
              accept="video/mp4,video/quicktime"
              className="hidden"
              data-testid="upload-last-attempt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect('last_attempt', file);
              }}
              disabled={uploadingKind !== null}
            />
            <Button
              variant={hasLastAttempt ? "default" : "outline"}
              size="sm"
              className={`w-full ${hasLastAttempt ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
              disabled={uploadingKind !== null}
              asChild
            >
              <span>
                {uploadingKind === 'last_attempt' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                ) : hasLastAttempt ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Uploaded</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Upload Last Attempt</>
                )}
              </span>
            </Button>
          </label>
          {hasLastAttempt && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 flex-1"
                onClick={() => {
                  const upload = uploads.find(u => u.kind === 'last_attempt');
                  if (upload) handlePlay(upload.file_url);
                }}
              >
                <Play className="h-3 w-3 mr-1" /> Watch
              </Button>
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
          )}
        </div>
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!playingUrl} onOpenChange={(open) => { if (!open) setPlayingUrl(null); }}>
        <DialogContent className="max-w-2xl p-2">
          {playingUrl && (
            <video
              src={playingUrl}
              controls
              autoPlay
              className="w-full rounded-lg"
              style={{ maxHeight: '80vh' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
