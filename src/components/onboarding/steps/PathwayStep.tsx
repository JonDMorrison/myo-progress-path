import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { ACCESS_CODE_MAP, isFrenectomyVariant, requiresVideo, getBaseVariant } from "@/lib/constants";

interface PathwayStepProps {
  onPathwayChange?: (pathway: string) => void;
  initialPathway?: string | null;
}

export const PathwayStep = ({ onPathwayChange, initialPathway }: PathwayStepProps) => {
  const [accessCode, setAccessCode] = useState("");
  const [resolvedVariant, setResolvedVariant] = useState<string | null>(initialPathway || null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadExistingPathway();
  }, []);

  const loadExistingPathway = async () => {
    // Intentionally do nothing. The patient must re-enter their access code
    // every onboarding session — we never trust a DB-side default to satisfy
    // the pathway requirement, because the DB default ('frenectomy') would
    // let a patient skip code entry and silently land on the video pathway.
  };

  const handleCodeChange = (value: string) => {
    const code = value.toLowerCase().trim();
    setAccessCode(value);
    setError(null);
    setSaved(false);

    // Live validate
    const variant = ACCESS_CODE_MAP[code];
    if (variant) {
      setResolvedVariant(variant);
    } else {
      setResolvedVariant(null);
    }
  };

  const handleCodeSubmit = async () => {
    const code = accessCode.toLowerCase().trim();
    const variant = ACCESS_CODE_MAP[code];

    if (!variant) {
      setError(
        code.length === 0
          ? "Please enter a valid access code to continue."
          : "Invalid access code. Please check your code and try again."
      );
      onPathwayChange?.("");
      return;
    }

    setResolvedVariant(variant);
    onPathwayChange?.(variant);

    // Save to patient record
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error: updateError } = await supabase
        .from('patients')
        .update({ program_variant: getBaseVariant(variant) as any })
        .eq('user_id', session.user.id);
      if (updateError) {
        console.error('Failed to save pathway:', updateError);
      }
      setSaved(true); // Show success regardless — variant is in memory for UI
    } catch (error) {
      console.error('Error saving pathway:', error);
    }
  };

  const getPathwayLabel = () => {
    if (!resolvedVariant) return null;
    const isFren = isFrenectomyVariant(resolvedVariant);
    const hasVideo = requiresVideo(resolvedVariant);
    return {
      pathway: isFren ? "Frenectomy Program" : "Non-Frenectomy Program",
      video: hasVideo ? "Video Submissions Included" : "No Video Submissions",
    };
  };

  const label = getPathwayLabel();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Enter Your Access Code</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Your therapist has provided you with an access code that determines your treatment pathway.
          Please enter it below.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="access-code" className="text-base font-medium">
            Access Code
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="access-code"
              type="text"
              placeholder="Enter your access code..."
              value={accessCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              onBlur={handleCodeSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCodeSubmit();
              }}
              className={`pl-10 h-14 text-lg rounded-xl border-2 transition-all ${
                saved
                  ? 'border-emerald-500 bg-emerald-50'
                  : error
                  ? 'border-destructive bg-destructive/5'
                  : resolvedVariant
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              }`}
            />
            {saved && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {label && (
          <div className="p-5 bg-primary/5 border-2 border-primary/20 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">
                  {isFrenectomyVariant(resolvedVariant) ? '🩺' : '💚'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-lg">{label.pathway}</p>
                <p className={`text-sm font-medium ${
                  requiresVideo(resolvedVariant) 
                    ? 'text-blue-600' 
                    : 'text-muted-foreground'
                }`}>
                  {requiresVideo(resolvedVariant) ? '📹 ' : ''}
                  {label.video}
                </p>
              </div>
            </div>
          </div>
        )}

        {!resolvedVariant && !error && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Please enter the access code provided by your therapist to continue.
          </p>
        )}
      </div>
    </div>
  );
};