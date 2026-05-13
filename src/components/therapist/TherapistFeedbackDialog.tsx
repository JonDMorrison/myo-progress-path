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
import { Badge } from "@/components/ui/badge";
import { Loader, Video, Image, X, Upload, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Pre-defined feedback options therapists can quickly select
const FEEDBACK_OPTIONS = {
  positive: [
    "Great form! Keep it up.",
    "Excellent tongue positioning.",
    "Good breathing technique.",
    "Nice improvement from last week!",
    "Well done with the exercises.",
  ],
  corrective: [
    "Try to relax your jaw more.",
    "Focus on keeping lips sealed.",
    "Watch your tongue placement.",
    "Slow down the movement.",
    "Practice in front of a mirror.",
  ],
  instructional: [
    "Review the demo video again.",
    "Try this exercise twice daily.",
    "Take a short break if you feel strain.",
    "Focus on nasal breathing.",
    "Keep your posture upright.",
  ],
};

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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video must be under 500MB",
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
    // Combine selected options with custom text
    const combinedFeedback = [
      ...selectedOptions,
      feedbackText.trim(),
    ].filter(Boolean).join("\n\n");

    if (!combinedFeedback && !videoFile && !photoFile) {
      toast({
        title: "Feedback required",
        description: "Please select feedback options, add text, video, or photo.",
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
      const uploadedPaths: string[] = [];

      // Upload files if present. Track every uploaded path so we can clean
      // them up if the DB insert fails — otherwise the bucket accumulates
      // orphaned attachments.
      try {
        if (videoFile) {
          videoPath = await uploadFile(videoFile, "video", patientUserId);
          uploadedPaths.push(videoPath);
        }
        if (photoFile) {
          photoPath = await uploadFile(photoFile, "photo", patientUserId);
          uploadedPaths.push(photoPath);
        }

        // Insert feedback record
        const { error: insertError } = await supabase.from("therapist_feedback").insert({
          therapist_id: user.id,
          patient_id: patientId,
          week_id: weekId || null,
          progress_id: progressId || null,
          exercise_id: exerciseId || null,
          feedback_text: combinedFeedback || null,
          video_url: videoPath || null,
          photo_url: photoPath || null,
        });

        if (insertError) throw insertError;
      } catch (uploadOrInsertError) {
        if (uploadedPaths.length > 0) {
          try {
            await supabase.storage.from("therapist-feedback").remove(uploadedPaths);
          } catch (cleanupError) {
            console.warn("Failed to clean up orphaned feedback uploads", cleanupError);
          }
        }
        throw uploadOrInsertError;
      }

      const getContextLabel = () => {
        if (exerciseTitle) return `for "${exerciseTitle}"`;
        if (weekNumber) {
          // Option B: module-only label (no Part 1/2).
          return `for Module ${Math.ceil(weekNumber / 2)}`;
        }
        return '';
      };
      const context = getContextLabel();

      const { error: notifyError } = await supabase.from("notifications").insert({
        patient_id: patientId,
        body: `Your therapist has sent you feedback ${context}. Check your module for details.`,
        read: false,
      });
      // The feedback record already saved successfully — a notification
      // failure shouldn't block the success toast, but we need to surface it
      // so silent notification failures don't go unnoticed in production.
      if (notifyError) {
        console.warn("Notification insert failed after feedback saved:", notifyError);
        toast({
          title: "Feedback Sent (notification failed)",
          description: `Feedback saved for ${patientName}, but the patient notification could not be created: ${notifyError.message}`,
        });
      } else {
        toast({
          title: "Feedback Sent",
          description: `Feedback sent to ${patientName}`,
        });
      }

      // Reset form
      setFeedbackText("");
      setSelectedOptions([]);
      setVideoFile(null);
      setPhotoFile(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Feedback error:", error);
      const isRlsRejection =
        error?.code === "42501" ||
        /row-level security|violates row-level/i.test(error?.message || "");
      const supabaseDetail = [error?.code, error?.details, error?.hint]
        .filter(Boolean)
        .join(" — ");
      const baseMessage = error?.message || "Failed to send feedback";
      const description = isRlsRejection
        ? `Permission denied by database (RLS). You may not be assigned to this patient. ${supabaseDetail ? `(${supabaseDetail})` : ""}`.trim()
        : supabaseDetail
        ? `${baseMessage} (${supabaseDetail})`
        : baseMessage;
      toast({
        title: "Error sending feedback",
        description,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const context = exerciseTitle
    ? `for "${exerciseTitle}"`
    : weekNumber
      ? `for Module ${Math.ceil(weekNumber / 2)}`
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

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Quick Feedback Options */}
          <div className="space-y-3">
            <Label className="text-green-600">✓ Positive Feedback</Label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_OPTIONS.positive.map((option) => (
                <Badge
                  key={option}
                  variant={selectedOptions.includes(option) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedOptions.includes(option)
                      ? "bg-green-600 hover:bg-green-700"
                      : "hover:bg-green-50 border-green-200"
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  {selectedOptions.includes(option) && <Check className="h-3 w-3 mr-1" />}
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-amber-600">⚡ Corrections</Label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_OPTIONS.corrective.map((option) => (
                <Badge
                  key={option}
                  variant={selectedOptions.includes(option) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedOptions.includes(option)
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "hover:bg-amber-50 border-amber-200"
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  {selectedOptions.includes(option) && <Check className="h-3 w-3 mr-1" />}
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-blue-600">📋 Instructions</Label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_OPTIONS.instructional.map((option) => (
                <Badge
                  key={option}
                  variant={selectedOptions.includes(option) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedOptions.includes(option)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-blue-50 border-blue-200"
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  {selectedOptions.includes(option) && <Check className="h-3 w-3 mr-1" />}
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Selected count */}
          {selectedOptions.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedOptions.length} option{selectedOptions.length > 1 ? "s" : ""} selected
            </p>
          )}

          {/* Custom Text Feedback */}
          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="feedback">Additional Message (optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Add custom feedback..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
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
            disabled={uploading || (selectedOptions.length === 0 && !feedbackText.trim() && !videoFile && !photoFile)}
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
