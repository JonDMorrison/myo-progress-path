import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircle } from "lucide-react";
import { BOLTHelpContent } from "@/components/BOLTHelpContent";
import { NasalBreathingHelpContent } from "@/components/NasalBreathingHelpContent";
import { NasalUnblockModal } from "@/components/learn/NasalUnblockModal";
import { useWeekForm } from "@/hooks/useWeekForm";

interface WeekProgressFormProps {
  progress: any;
  week: any;
  readOnly?: boolean;
  onUpdate?: () => void;
}

export function WeekProgressForm({ progress, week, readOnly = false, onUpdate }: WeekProgressFormProps) {
  const { formData, updateField, isSaving, lastSaved } = useWeekForm(
    progress.id,
    {
      boltScore: progress.bolt_score?.toString() || '',
      nasalPct: progress.nasal_breathing_pct?.toString() || '',
      tonguePct: progress.tongue_on_spot_pct?.toString() || ''
    },
    { readOnly, onSaveComplete: onUpdate }
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {readOnly ? "Progress Summary" : "Biweekly Progress"}
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
