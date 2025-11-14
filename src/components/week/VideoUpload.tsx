import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadVideo } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  patientId: string;
  weekId: string;
  kind: 'first_attempt' | 'last_attempt';
  onUploadComplete?: () => void;
  disabled?: boolean;
  hasExisting?: boolean;
  className?: string;
}

export function VideoUpload({
  patientId,
  weekId,
  kind,
  onUploadComplete,
  disabled = false,
  hasExisting = false,
  className = ""
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadVideo(
        file,
        patientId,
        weekId,
        kind,
        (uploadProgress) => {
          clearInterval(progressInterval);
          setProgress(uploadProgress);
        }
      );

      clearInterval(progressInterval);

      if (result.success) {
        setProgress(100);
        toast({
          title: "Upload Complete",
          description: "Your video has been uploaded successfully.",
        });
        
        // Call completion callback after a brief delay
        setTimeout(() => {
          onUploadComplete?.();
          setUploading(false);
          setProgress(0);
        }, 1000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setUploading(false);
      setProgress(0);
    }

    // Reset input
    event.target.value = '';
  };

  const triggerFileInput = () => {
    const input = document.getElementById(`video-upload-${kind}`) as HTMLInputElement;
    input?.click();
  };

  const label = kind === 'first_attempt' ? 'First Attempt' : 'Last Attempt';

  if (hasExisting && !disabled) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="text-sm font-medium">Video uploaded</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={triggerFileInput}
            disabled={uploading || disabled}
            className="rounded-lg"
          >
            Replace
          </Button>
        </div>
        <input
          id={`video-upload-${kind}`}
          type="file"
          accept="video/mp4,video/quicktime"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="p-3 bg-muted/50 border border-border/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Frame your video:</strong> Include your neck and lower face. Match the reference example for best results.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={triggerFileInput}
        disabled={uploading || disabled}
        className="w-full h-12 rounded-xl"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            Upload {label}
          </>
        )}
      </Button>

      {uploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {progress}% complete
          </p>
        </div>
      )}

      {!uploading && !hasExisting && (
        <p className="text-xs text-muted-foreground text-center">
          Max 100MB • .mp4 or .mov only
        </p>
      )}

      <input
        id={`video-upload-${kind}`}
        type="file"
        accept="video/mp4,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
