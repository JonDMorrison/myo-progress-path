import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface PathwayStepProps {
  onPathwayChange?: (pathway: string) => void;
  initialPathway?: string | null;
}

export const PathwayStep = ({ onPathwayChange, initialPathway }: PathwayStepProps) => {
  const [accessCode, setAccessCode] = useState("");
  const [resolvedVariant, setResolvedVariant] = useState<string | null>(initialPathway || null);
  const [requiresVideo, setRequiresVideo] = useState<boolean | null>(null);
  const [approvalPending, setApprovalPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleCodeChange = (value: string) => {
    setAccessCode(value);
    setError(null);
    setSaved(false);
    setApprovalPending(false);
    setResolvedVariant(null);
    setRequiresVideo(null);
  };

  const handleCodeSubmit = async () => {
    const normalizedCode = accessCode.trim().toUpperCase();
    if (!normalizedCode) {
      setError("Please enter a valid access code to continue.");
      onPathwayChange?.("");
      return;
    }

    try {
      const { data: codeRow, error: codeError } = await (supabase as any)
        .from("access_codes")
        .select("id, code, program_variant, requires_video, approval_required, expires_at, max_uses, uses")
        .eq("code", normalizedCode)
        .eq("active", true)
        .maybeSingle();

      if (codeError) throw codeError;
      if (!codeRow) {
        setError("Invalid access code. Please check your code and try again.");
        onPathwayChange?.("");
        return;
      }

      if (codeRow.expires_at && new Date(codeRow.expires_at).getTime() < Date.now()) {
        setError("This access code has expired.");
        onPathwayChange?.("");
        return;
      }

      if (codeRow.max_uses !== null && codeRow.uses >= codeRow.max_uses) {
        setError("This access code has already been used.");
        onPathwayChange?.("");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const approvedAt = codeRow.approval_required ? null : new Date().toISOString();
      const { error: updateError } = await (supabase as any)
        .from("patients")
        .update({
          program_variant: codeRow.program_variant,
          requires_video: codeRow.requires_video,
          access_code_id: codeRow.id,
          access_requested_at: new Date().toISOString(),
          access_approved_at: approvedAt,
          access_approved_by: null,
        })
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      setResolvedVariant(codeRow.program_variant);
      setRequiresVideo(codeRow.requires_video);
      setApprovalPending(codeRow.approval_required);
      setSaved(true);
      onPathwayChange?.(codeRow.program_variant);
    } catch (err) {
      console.error("Error saving access code:", err);
      setError("Unable to save your access code. Please try again.");
      onPathwayChange?.("");
    }
  };

  const label = resolvedVariant ? {
    pathway: resolvedVariant === "frenectomy" ? "Frenectomy Program" : "Non-Frenectomy Program",
    video: requiresVideo ? "Video Submissions Included" : "No Video Submissions",
  } : null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Enter Your Access Code</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Enter the code provided by your care team.</p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="access-code" className="text-base font-medium">Access Code</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="access-code"
              type="text"
              placeholder="Enter your access code..."
              value={accessCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              onBlur={handleCodeSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCodeSubmit(); }}
              className={`pl-10 h-14 text-lg rounded-xl border-2 transition-all ${saved ? 'border-emerald-500 bg-emerald-50' : error ? 'border-destructive bg-destructive/5' : 'border-border'}`}
            />
            {saved && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />}
          </div>
        </div>

        {error && <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg"><AlertCircle className="h-4 w-4 flex-shrink-0" /><span>{error}</span></div>}

        {label && (
          <div className="p-5 bg-primary/5 border-2 border-primary/20 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-lg">{resolvedVariant === "frenectomy" ? '🩺' : '💚'}</span></div>
              <div><p className="font-semibold text-lg">{label.pathway}</p><p className={`text-sm font-medium ${requiresVideo ? 'text-blue-600' : 'text-muted-foreground'}`}>{requiresVideo ? '📹 ' : ''}{label.video}</p></div>
            </div>
            {approvalPending && <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3"><Clock className="h-4 w-4 mt-0.5 flex-shrink-0" /><span>Access accepted. Module access is pending review.</span></div>}
          </div>
        )}

        {!resolvedVariant && !error && <p className="text-center text-sm text-muted-foreground mt-4">Please enter your access code to continue.</p>}
      </div>
    </div>
  );
};
