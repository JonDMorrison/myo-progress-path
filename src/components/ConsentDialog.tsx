import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

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
          <div className="prose prose-sm max-w-none">
            <h1 className="text-xl font-bold mb-4">Informed Consent</h1>
            
            <h2 className="text-lg font-semibold mt-4 mb-3">Before You Continue</h2>
            <p className="text-muted-foreground mb-4">
              Please review these important articles in the Learning Hub to understand your treatment:
            </p>
            
            <div className="space-y-2 mb-6">
              <Link 
                to="/learn/program-details" 
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-lg border bg-accent/50 hover:bg-accent transition-colors group"
              >
                <span className="font-medium">Program Details</span>
                <span className="text-sm text-muted-foreground">— 24-week structure, family enrollment, multidisciplinary support</span>
                <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary" />
              </Link>
              <Link 
                to="/learn/treatment-outcomes" 
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-lg border bg-accent/50 hover:bg-accent transition-colors group"
              >
                <span className="font-medium">Treatment Outcomes</span>
                <span className="text-sm text-muted-foreground">— Limitations, risks, results, relapse prevention</span>
                <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary" />
              </Link>
              <Link 
                to="/learn/specific-treatment-concerns" 
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-lg border bg-accent/50 hover:bg-accent transition-colors group"
              >
                <span className="font-medium">Specific Treatment Concerns</span>
                <span className="text-sm text-muted-foreground">— TMJ, speech, orthodontics, allergies, tongue-tie</span>
                <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary" />
              </Link>
            </div>

            <hr className="my-4" />

            <h2 className="text-lg font-semibold mt-4 mb-3">Consent to Undergo Myofunctional Therapy Treatment</h2>
            
            <p className="mb-3">
              I acknowledge that I have read and fully understand the treatment considerations presented in the articles linked above and in this form. I also understand that there are problems that can occur and that actual results may differ from the anticipated results.
            </p>
            
            <p className="mb-3">
              I acknowledge that I have been given the opportunity to discuss this form and ask any questions.
            </p>
            
            <p className="mb-3">
              I consent to the Myofunctional Therapy program provided by Matt Francisco, DDS and Samantha Raniak, RDH, OMT at Montrose Dental Centre.
            </p>
            
            <p className="text-muted-foreground">
              I understand that my program fee covers only Myofunctional Therapy, and that treatment provided by other dental or medical professionals is not included in the cost.
            </p>
          </div>
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
