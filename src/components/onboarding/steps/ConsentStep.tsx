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

  useEffect(() => {
    loadPatientId();
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
            version: '1.0'
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

      <ScrollArea className="h-[300px] w-full border rounded-lg p-6 bg-muted/30">
        <div className="space-y-4 text-sm">
          <h3 className="font-semibold text-base">MyoCoach Program Consent</h3>
          
          <p>
            By accepting this consent form, you acknowledge and agree to participate in the MyoCoach myofunctional therapy program under the supervision of Montrose Dental Centre.
          </p>

          <h4 className="font-semibold">Program Overview</h4>
          <p>
            The MyoCoach program is a 24-week structured myofunctional therapy program designed to improve breathing patterns, tongue posture, and oral muscle function. You will receive weekly exercises, track your progress, and submit regular check-ins for therapist review.
          </p>

          <h4 className="font-semibold">Your Responsibilities</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Complete daily exercises as instructed</li>
            <li>Submit accurate weekly check-in data</li>
            <li>Upload video recordings when required</li>
            <li>Communicate with your therapist about any concerns</li>
            <li>Follow safety guidelines for all exercises</li>
          </ul>

          <h4 className="font-semibold">Privacy & Data</h4>
          <p>
            Your personal information, progress data, and video submissions are stored securely and are only accessible to your assigned therapist and authorized clinic staff. We comply with all applicable privacy regulations.
          </p>

          <h4 className="font-semibold">Video Recording Consent</h4>
          <p>
            You consent to record and submit videos of yourself performing exercises. These videos are used solely for therapeutic assessment and feedback. They will not be shared outside of your care team without explicit consent.
          </p>

          <h4 className="font-semibold">Risks & Limitations</h4>
          <p>
            Myofunctional therapy is generally safe when performed correctly. However, if you experience pain, discomfort, or any adverse effects, stop the exercises immediately and contact your therapist. This program does not replace medical treatment and should be used in conjunction with appropriate medical care.
          </p>

          <h4 className="font-semibold">Withdrawal</h4>
          <p>
            You may withdraw from the program at any time by contacting your therapist or clinic administrator. Your data will be retained according to our privacy policy and legal requirements.
          </p>

          <p className="text-muted-foreground italic">
            Last updated: October 2025
          </p>
        </div>
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
          I have read and understood the consent form above. I agree to participate in the MyoCoach program and consent to the collection and use of my data as described.
        </label>
      </div>
    </div>
  );
};
