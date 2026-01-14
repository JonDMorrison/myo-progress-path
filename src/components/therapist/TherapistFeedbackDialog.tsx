import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader, Video, Image, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TherapistFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
  weekId?: string;
  weekNumber?: number;
  exerciseId?: string;
  exerciseTitle?: string;
  progressId?: string;
  onSuccess?: () => void;
}

const TherapistFeedbackDialog = ({
  open,
  onOpenChange,
  patientId,
  patientName,
  weekId,
  weekNumber,
  exerciseId,
  exerciseTitle,
  progressId,
  onSuccess,
}: TherapistFeedbackDialogProps) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video must be under 100MB",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Photo must be under 10MB",
          variant: "destructive",
        });
        return;
      }
      setPhotoFile(file);
    }
  };

  const uploadFile = async (
    file: File,
    type: "video" | "photo",
    folderId: string
  ): Promise<string> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    if (!folderId) throw new Error("Missing patient folder");

    const ext = file.name.split(".").pop();
    const fileName = `${folderId}/${type}_${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("therapist-feedback")
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Failed to upload ${type}`);
    }

    // Store the storage path; the patient UI will generate a signed URL when viewing.
    return fileName;
  };

  const handleSubmit = async () => {
    if (!feedbackText.trim() && !videoFile && !photoFile) {
      toast({
        title: "Feedback required",
        description: "Please add text, video, or photo feedback.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch the patient's auth user id. We use this as the storage folder so
      // patients can access attachments with their own session.
      const { data: patientRow, error: patientError } = await supabase
        .from("patients")
        .select("user_id")
        .eq("id", patientId)
        .single();

      if (patientError) throw patientError;
      const patientUserId = patientRow?.user_id;
      if (!patientUserId) throw new Error("Patient account not found");

      let videoPath: string | null = null;
      let photoPath: string | null = null;

      // Upload files if present
      if (videoFile) {
        videoPath = await uploadFile(videoFile, "video", patientUserId);
      }
      if (photoFile) {
        photoPath = await uploadFile(photoFile, "photo", patientUserId);
      }

      // Insert feedback record
      const { error: insertError } = await supabase.from("therapist_feedback").insert({
        therapist_id: user.id,
        patient_id: patientId,
        week_id: weekId || null,
        exercise_id: exerciseId || null,
        progress_id: progressId || null,
        feedback_text: feedbackText.trim() || null,
        video_url: videoPath,
        photo_url: photoPath,
      });

      if (insertError) throw insertError;

      const context = exerciseTitle
        ? `for "${exerciseTitle}"`
        : weekNumber
          ? `for Week ${weekNumber}`
          : "";

      await supabase.from("notifications").insert({
        patient_id: patientId,
        body: `Your therapist has sent you feedback ${context}. Check your week for details.`,
        read: false,
      });

      toast({
        title: "Feedback Sent",
        description: `Feedback sent to ${patientName}`,
      });

      // Reset form
      setFeedbackText("");
      setVideoFile(null);
      setPhotoFile(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Feedback error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send feedback",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const context = exerciseTitle 
    ? `for "${exerciseTitle}"` 
    : weekNumber 
      ? `for Week ${weekNumber}` 
      : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Send personalized feedback to {patientName} {context}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Text Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Message (optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Type your feedback here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
            />
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <Label>Video (optional)</Label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
            />
            {videoFile ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Video className="h-5 w-5 text-primary" />
                <span className="text-sm flex-1 truncate">{videoFile.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setVideoFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => videoInputRef.current?.click()}
              >
                <Video className="h-4 w-4 mr-2" />
                Attach Video
              </Button>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            {photoFile ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Image className="h-5 w-5 text-primary" />
                <span className="text-sm flex-1 truncate">{photoFile.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setPhotoFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => photoInputRef.current?.click()}
              >
                <Image className="h-4 w-4 mr-2" />
                Attach Photo
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={uploading || (!feedbackText.trim() && !videoFile && !photoFile)}
          >
            {uploading && <Loader className="h-4 w-4 animate-spin mr-2" />}
            <Upload className="h-4 w-4 mr-2" />
            Send Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TherapistFeedbackDialog;
