import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConsentStepProps {
  onConsentChange?: (accepted: boolean) => void;
}

export const ConsentStep = ({ onConsentChange }: ConsentStepProps) => {
  const [accepted, setAccepted] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [consentText, setConsentText] = useState("");
  const [consentVersion, setConsentVersion] = useState("1.0");

  useEffect(() => {
    loadPatientId();
    loadConsent();
  }, []);

  const loadPatientId = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      if (patient) {
        setPatientId(patient.id);
      }
    }
  };

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

  const handleAcceptChange = async (checked: boolean) => {
    setAccepted(checked);
    onConsentChange?.(checked);

    if (checked && patientId) {
      // Save consent acceptance
      await supabase
        .from('patients')
        .update({
          consent_accepted_at: new Date().toISOString(),
          consent_payload: {
            accepted: true,
            timestamp: new Date().toISOString(),
            version: consentVersion,
            text_excerpt: consentText.substring(0, 500)
          }
        })
        .eq('id', patientId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Consent Form</h2>
        <p className="text-lg text-muted-foreground">
          Please review and accept our consent form to continue
        </p>
      </div>

      <ScrollArea className="h-[400px] w-full border rounded-lg p-6 bg-muted/30">
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ 
          __html: consentText
            .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
            .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
            .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
            .replace(/\n\n/g, '</p><p class="mb-2">')
            .replace(/^(.+)$/gm, '<p class="mb-2">$1</p>')
        }} />
      </ScrollArea>

      <div className="flex items-start space-x-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Checkbox 
          id="consent-accept"
          checked={accepted}
          onCheckedChange={handleAcceptChange}
        />
        <label
          htmlFor="consent-accept"
          className="text-sm leading-relaxed cursor-pointer"
        >
          I acknowledge that I have read and fully understand the treatment considerations presented in this form. I consent to the Myofunctional Therapy program provided by Matt Francisco, DDS and Samantha Raniak, RDH, OMT at Montrose Dental Centre.
        </label>
      </div>
    </div>
  );
};
