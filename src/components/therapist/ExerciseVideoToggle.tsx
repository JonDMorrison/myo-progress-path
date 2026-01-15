import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExerciseVideoToggleProps {
  exerciseId: string;
  exerciseTitle: string;
  videoRequired: boolean;
  onUpdate?: () => void;
}

export function ExerciseVideoToggle({
  exerciseId,
  exerciseTitle,
  videoRequired,
  onUpdate
}: ExerciseVideoToggleProps) {
  const [isRequired, setIsRequired] = useState(videoRequired);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('exercises')
        .update({ video_required: checked })
        .eq('id', exerciseId);

      if (error) throw error;

      setIsRequired(checked);
      toast({
        title: checked ? "Video required" : "Video optional",
        description: `${exerciseTitle} ${checked ? "now requires" : "no longer requires"} video submission.`,
      });
      onUpdate?.();
    } catch (error: any) {
      console.error('Error updating video requirement:', error);
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        id={`video-toggle-${exerciseId}`}
        checked={isRequired}
        onCheckedChange={handleToggle}
        disabled={saving}
      />
      <Label 
        htmlFor={`video-toggle-${exerciseId}`}
        className="flex items-center gap-1.5 text-xs cursor-pointer"
      >
        <Video className="h-3 w-3" />
        Video {isRequired ? "Required" : "Optional"}
      </Label>
    </div>
  );
}
