import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircle } from "lucide-react";
import { BOLTHelpContent } from "@/components/BOLTHelpContent";
import { NasalBreathingHelpContent } from "@/components/NasalBreathingHelpContent";
import { NasalUnblockModal } from "@/components/learn/NasalUnblockModal";
import { useWeekForm } from "@/hooks/useWeekForm";
import { VideoUpload } from "./VideoUpload";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WeekProgressFormProps {
  progress: any;
  week: any;
  patientId?: string;
  readOnly?: boolean;
}

export function WeekProgressForm({ progress, week, patientId, readOnly = false }: WeekProgressFormProps) {
  const { formData, updateField, isSaving, lastSaved } = useWeekForm(
    progress.id,
    {
      boltScore: progress.bolt_score?.toString() || '',
      nasalPct: progress.nasal_breathing_pct?.toString() || '',
      tonguePct: progress.tongue_on_spot_pct?.toString() || ''
    },
    readOnly // Pass readOnly to prevent updates
  );

  const [uploads, setUploads] = useState<any[]>([]);

  useEffect(() => {
    if (patientId && week?.id) {
      loadUploads();
    }
  }, [patientId, week?.id]);

  const loadUploads = async () => {
    if (!patientId || !week?.id) return;
    
    const { data } = await supabase
      .from("uploads")
      .select("*")
      .eq("patient_id", patientId)
      .eq("week_id", week.id)
      .order("created_at", { ascending: false });

    setUploads(data || []);
  };

  const hasFirstVideo = uploads.some((u) => u.kind === 'first_attempt');
  const hasLastVideo = uploads.some((u) => u.kind === 'last_attempt');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {readOnly ? "Progress Summary" : "Weekly Progress"}
      </h3>
      
      {/* Auto-save indicator - only show when not read-only */}
      {!readOnly && (
        <div className="text-sm text-muted-foreground text-right">
          {isSaving && <span>Saving...</span>}
          {lastSaved && !isSaving && (
            <span>Saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s ago</span>
          )}
        </div>
      )}

      {/* Video Uploads Section */}
      {(week?.requires_video_first || week?.requires_video_last) && patientId && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
          <h4 className="font-medium text-sm">Exercise Videos</h4>
          {!readOnly && (
            <p className="text-sm text-muted-foreground">
              Record yourself performing the exercises. Your therapist will review these to provide personalized feedback.
            </p>
          )}
          
          {week?.requires_video_first && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">First Attempt (Beginning of Week)</Label>
              <VideoUpload
                patientId={patientId}
                weekId={week.id}
                kind="first_attempt"
                onUploadComplete={loadUploads}
                hasExisting={hasFirstVideo}
                disabled={readOnly || progress?.status === 'submitted' || progress?.status === 'approved'}
              />
            </div>
          )}

          {week?.requires_video_last && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Last Attempt (End of Week)</Label>
              <VideoUpload
                patientId={patientId}
                weekId={week.id}
                kind="last_attempt"
                onUploadComplete={loadUploads}
                hasExisting={hasLastVideo}
                disabled={readOnly || progress?.status === 'submitted' || progress?.status === 'approved'}
              />
            </div>
          )}
        </div>
      )}

      {/* BOLT Score */}
      {week?.requires_bolt && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="bolt-score">BOLT Score (seconds)</Label>
            <HoverCard>
              <HoverCardTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <BOLTHelpContent />
              </HoverCardContent>
            </HoverCard>
          </div>
          <Input
            id="bolt-score"
            type="number"
            min="0"
            max="120"
            value={formData.boltScore}
            onChange={(e) => updateField('boltScore', e.target.value)}
            placeholder="Enter your BOLT score"
            disabled={readOnly}
            className={readOnly ? "bg-muted" : ""}
          />
          <p className="text-xs text-muted-foreground">
            0-120 seconds. Higher is better.
          </p>
        </div>
      )}

      {/* Nasal Breathing % */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="nasal-pct">% Nasal Breathing (awake)</Label>
          <HoverCard>
            <HoverCardTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <NasalBreathingHelpContent />
            </HoverCardContent>
          </HoverCard>
        </div>
        <Input
          id="nasal-pct"
          type="number"
          min="0"
          max="100"
          value={formData.nasalPct}
          onChange={(e) => updateField('nasalPct', e.target.value)}
          placeholder="Enter percentage"
          disabled={readOnly}
          className={readOnly ? "bg-muted" : ""}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Estimate the percentage of time you breathed through your nose while awake.
          </p>
          <NasalUnblockModal />
        </div>
      </div>

      {/* Tongue Posture % */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="tongue-pct">% Tongue on Spot</Label>
          <HoverCard>
            <HoverCardTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <p className="font-medium">Tongue Posture</p>
                <p className="text-sm">
                  The "spot" is the roof of your mouth just behind your front teeth.
                  Your tongue should rest there naturally throughout the day.
                </p>
                <p className="text-sm">
                  Estimate how often you noticed your tongue in the correct position.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <Input
          id="tongue-pct"
          type="number"
          min="0"
          max="100"
          value={formData.tonguePct}
          onChange={(e) => updateField('tonguePct', e.target.value)}
          placeholder="Enter percentage"
          disabled={readOnly}
          className={readOnly ? "bg-muted" : ""}
        />
        <p className="text-xs text-muted-foreground">
          Estimate the percentage of time your tongue was on the "spot".
        </p>
      </div>
    </div>
  );
}
