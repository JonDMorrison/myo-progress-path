import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

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
    const { data: { session } } = await supabase.auth.getSession();
    const patientName = session?.user?.user_metadata?.name || session?.user?.email || "Patient";
    const consentTextContent = `# Consent to Treatment

I, **${patientName}**, acknowledge and agree to the following terms:

## Program Details

By signing this agreement, you will be able to purchase a comprehensive myofunctional therapy program. This includes a module-based sequence of exercises and, depending on the tier purchased, a brief evaluation done biweekly by a myofunctional therapist through video submissions and written feedback.

There are two different programs available based on whether you require a tongue tie surgery/frenectomy or not. This is determined by a tongue tie grading scale and will be assessed during your airway exam at Montrose Dental Centre.

There is an option to have multiple family members do the same myofunctional therapy program as long as they have the same grade of tongue tie. If additional people would still like to have the weekly evaluations from the myofunctional therapist then an additional fee will be charged.

This program may also require additional treatment outside of our center. You may need to coordinate with other healthcare providers, such as a medical doctor, allergist, ENT, dentist, orthodontist, physiotherapist, chiropractor, massage therapist, or speech language pathologist. This will provide multi-disciplinary support for your airway and myofunctional needs. This will be discussed at your airway exam.

## Limitations and Risks

Generally, informed and cooperative patients can achieve successful results from myofunctional therapy. As with any form of treatment, there are limitations and risks. These are seldom serious enough to indicate that you should not undergo treatment.

This at-home program was developed to reduce the cost and the number of in-person appointments for the patient. It is important to understand that this is not as ideal as seeing a myofunctional therapist in person every 2 weeks who can provide you with case-by-case care. Every patient presents with unique symptoms and circumstances, but we wanted to create a more accessible option for patients. For patients with more complicated cases, we will be referring them to Pearl OMT.

The most common risks associated with myofunctional therapy are pain and fatigue of the orofacial muscles during or after exercises.

## Results and Commitment

To achieve optimal results, it is recommended that patients practice all their exercises, twice per day, in the mirror. It is not only important to do these exercises, but to do them as instructed. We cannot guarantee your results if the provided exercises are not completed. The success of your therapy depends on the level of cooperation and involvement you take. Developing an awareness of your breathing and oral postures is crucial; ultimately, this is a skill each patient will need to cultivate on their own.

## Relapse

Completing treatment does not guarantee perfect breathing or oral and facial musculature for life. Therapy helps develop awareness of correct breathing, swallowing, facial muscle function, resting posture of the lips and tongue, and poor habits. Without maintaining this awareness, old habits and muscle patterns can resurface months or years later.

## Specific Treatment Concerns

### Allergies or Other Breathing Concerns
In some cases, it may be necessary to work with a specialist (MD, allergist, or ENT) to manage and control airway issues related to breathing **prior to** myofunctional therapy.

### Temporomandibular Joint (TMJ) Dysfunction
Many patients find relief from TMJ problems (pain, headaches, ear problems). However, TMJ issues are often multi-faceted and can be rooted in non-muscular causes, so outcomes may vary. Treatment by other medical or dental specialists may be necessary.

### Speech Therapy
Myofunctional therapy has been shown to improve speech when muscular concerns are the underlying issue. However, due to the wide variation in causes for speech concerns, we cannot guarantee that myofunctional therapy alone will improve your speech.

### Orthodontics or Palatal Expansion
In order to create the space required for adequate tongue placement, a referral to an orthodontist and/or oral surgeon may be required **prior to** myofunctional therapy.

### Ankyloglossia (Tongue-Tie) and Frenectomy
If a tongue tie (a tight or restricted lingual frenum) is causing your myofunctional disorder, a frenectomy is recommended.

- **Assessment:** Occasionally, further tongue mobility restrictions are noticed during therapy, and it may be determined at any point that a frenectomy is indicated.
- **Provider:** If a frenectomy is needed, you will be referred to Dr. Laura Caylor at Vedder Dental Clinic. There is an additional fee for the consultation and the procedure (approximately $1,000, often covered by basic dental insurance at 80%+).
- **Protocols:** For patients undergoing a frenectomy, the program includes pre-frenectomy exercises and post-frenectomy healing protocols. If these are not strictly followed, it is possible for the frenum to reattach.

## Consent Statement

I acknowledge that I have read and fully understand the treatment considerations presented here. I understand that problems can occur and that actual results may differ from anticipated results. I have been given the opportunity to ask questions.

I consent to the Myofunctional Therapy program provided by Matt Francisco, DDS and Samantha Raniak, RDH, OMT at Montrose Dental Centre. I understand that my program fee covers only Myofunctional Therapy, and that treatment provided by other dental or medical professionals is not included in the cost.`;
    setConsentText(consentTextContent);
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
        <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:underline prose-strong:text-foreground prose-li:text-muted-foreground">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{consentText}</ReactMarkdown>
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
          I acknowledge that I have read and fully understand the treatment considerations presented in this form. I consent to the Myofunctional Therapy program provided by Matt Francisco, DDS and Samantha Raniak, RDH, OMT at Montrose Dental Centre.
        </label>
      </div>
    </div>
  );
};
