import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConsentDialogProps {
  open: boolean;
  patientId: string;
  onConsent: () => void;
}

export function ConsentDialog({ open, patientId, onConsent }: ConsentDialogProps) {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [consentText, setConsentText] = useState("");
  const [consentVersion, setConsentVersion] = useState("1.0");

  // Load consent text from app_settings
  useState(() => {
    const loadConsent = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "consent_latest")
        .single();
      
      if (data?.value && typeof data.value === 'object' && data.value !== null) {
        const consentData = data.value as { version?: string; md?: string };
        setConsentVersion(consentData.version || "1.0");
        setConsentText(consentData.md || "# Consent to Treatment\n\nI understand and agree to participate in the myofunctional therapy program.");
      }
    };
    loadConsent();
  });

  const handleAccept = async () => {
    if (!agreed || !signature.trim()) {
      toast.error("Please agree to the terms and provide your signature");
      return;
    }

    setLoading(true);
    try {
      const consentPayload = {
        version: consentVersion,
        text_excerpt: consentText.substring(0, 500),
        signature,
        timestamp: new Date().toISOString(),
        ua: navigator.userAgent
      };

      const { error } = await supabase
        .from("patients")
        .update({
          consent_accepted_at: new Date().toISOString(),
          consent_signature: signature,
          consent_payload: consentPayload
        })
        .eq("id", patientId);

      if (error) throw error;

      toast.success("Consent recorded successfully");
      onConsent();
    } catch (error) {
      console.error("Consent error:", error);
      toast.error("Failed to record consent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Consent to Treatment</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="prose prose-sm" dangerouslySetInnerHTML={{ 
            __html: consentText
              .replace(/^# (.+)$/gm, '<strong>$1</strong>')
              .replace(/\n/g, '<br>') 
          }} />
        </ScrollArea>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="agree" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <Label htmlFor="agree" className="text-sm cursor-pointer">
              I have read and agree to the terms above
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Your Full Name (Signature)</Label>
            <Input
              id="signature"
              placeholder="Type your full name"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              disabled={!agreed}
            />
            <p className="text-xs text-muted-foreground">
              By typing your name, you are electronically signing this consent form.
            </p>
          </div>

          <Button 
            onClick={handleAccept} 
            disabled={!agreed || !signature.trim() || loading}
            className="w-full"
          >
            {loading ? "Recording..." : "Accept and Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
