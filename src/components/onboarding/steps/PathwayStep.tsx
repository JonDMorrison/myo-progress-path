import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Stethoscope, Heart } from "lucide-react";

interface PathwayStepProps {
  onPathwayChange?: (pathway: 'frenectomy' | 'non_frenectomy') => void;
  initialPathway?: 'frenectomy' | 'non_frenectomy' | null;
}

export const PathwayStep = ({ onPathwayChange, initialPathway }: PathwayStepProps) => {
  const [selectedPathway, setSelectedPathway] = useState<'frenectomy' | 'non_frenectomy' | null>(
    initialPathway || null
  );

  useEffect(() => {
    // Load existing pathway selection if any
    loadExistingPathway();
  }, []);

  const loadExistingPathway = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: patient } = await supabase
        .from('patients')
        .select('program_variant')
        .eq('user_id', session.user.id)
        .single();

      if (patient?.program_variant && patient.program_variant !== 'standard') {
        setSelectedPathway(patient.program_variant as 'frenectomy' | 'non_frenectomy');
        onPathwayChange?.(patient.program_variant as 'frenectomy' | 'non_frenectomy');
      }
    } catch (error) {
      console.error('Error loading pathway:', error);
    }
  };

  const handlePathwayChange = async (value: 'frenectomy' | 'non_frenectomy') => {
    setSelectedPathway(value);
    onPathwayChange?.(value);

    // Save to patient record
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Save to patient record - cast to any to handle enum type until types regenerate
      await supabase
        .from('patients')
        .update({ program_variant: value as any })
        .eq('user_id', session.user.id);
    } catch (error) {
      console.error('Error saving pathway:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Select Your Treatment Pathway</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Your myofunctional therapy program will be customized based on your treatment plan.
          Please select the option that matches your situation.
        </p>
      </div>

      <RadioGroup
        value={selectedPathway || undefined}
        onValueChange={(value) => handlePathwayChange(value as 'frenectomy' | 'non_frenectomy')}
        className="grid gap-4 max-w-xl mx-auto"
      >
        <Label
          htmlFor="frenectomy"
          className={`flex items-start gap-4 p-6 border-2 rounded-xl cursor-pointer transition-all ${selectedPathway === 'frenectomy'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
            }`}
        >
          <RadioGroupItem value="frenectomy" id="frenectomy" className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">I am preparing for a frenectomy (Tongue tie surgery)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This pathway includes pre-surgical preparation exercises and post-frenectomy
              recovery phases to help you get the best results from your procedure.
            </p>
          </div>
        </Label>

        <Label
          htmlFor="non_frenectomy"
          className={`flex items-start gap-4 p-6 border-2 rounded-xl cursor-pointer transition-all ${selectedPathway === 'non_frenectomy'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
            }`}
        >
          <RadioGroupItem value="non_frenectomy" id="non_frenectomy" className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">I am NOT having a frenectomy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This pathway focuses on developing proper oral function through a progressive
              24-week program without surgical intervention.
            </p>
          </div>
        </Label>
      </RadioGroup>

      {!selectedPathway && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Please select your treatment pathway to continue
        </p>
      )}
    </div>
  );
};