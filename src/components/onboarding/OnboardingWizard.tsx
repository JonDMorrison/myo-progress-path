import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { WelcomeStep } from "./steps/WelcomeStep";
import { PathwayStep } from "./steps/PathwayStep";
import { ProgramOverviewStep } from "./steps/ProgramOverviewStep";
import { HowItWorksStep } from "./steps/HowItWorksStep";
import { BOLTInstructionsStep } from "./steps/BOLTInstructionsStep";
import { VideoGuideStep } from "./steps/VideoGuideStep";
import { GoalsStep } from "./steps/GoalsStep";
import { ConsentStep } from "./steps/ConsentStep";
import { ReadyStep } from "./steps/ReadyStep";

const steps = [
  { id: 'welcome', component: WelcomeStep, title: 'Welcome' },
  { id: 'pathway', component: PathwayStep, title: 'Treatment Pathway' },
  { id: 'program', component: ProgramOverviewStep, title: 'Program Overview' },
  { id: 'how-it-works', component: HowItWorksStep, title: 'How It Works' },
  { id: 'bolt-instructions', component: BOLTInstructionsStep, title: 'BOLT Test' },
  { id: 'videos', component: VideoGuideStep, title: 'Video Uploads' },
  { id: 'goals', component: GoalsStep, title: 'Your Goals' },
  { id: 'consent', component: ConsentStep, title: 'Consent' },
  { id: 'ready', component: ReadyStep, title: 'All Set!' },
];

export const OnboardingWizard = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<'frenectomy' | 'non_frenectomy' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadOnboardingProgress();
  }, []);

  const loadOnboardingProgress = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get patient record
      const { data: patient } = await supabase
        .from('patients')
        .select('id, consent_accepted_at')
        .eq('user_id', session.user.id)
        .single();

      if (!patient) {
        toast({
          title: "Error",
          description: "Patient record not found",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      setPatientId(patient.id);

      // Check if onboarding already completed
      const { data: progress } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('patient_id', patient.id)
        .maybeSingle();

      if (progress?.completed_at) {
        navigate('/patient');
        return;
      }

      if (progress) {
        const completedStepIds = Array.isArray(progress.completed_steps) 
          ? progress.completed_steps as string[]
          : [];
        setCompletedSteps(completedStepIds);
        const stepIndex = steps.findIndex(s => s.id === progress.current_step);
        if (stepIndex >= 0) setCurrentStepIndex(stepIndex);
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  };

  const saveProgress = async (stepId: string, completed: boolean = false) => {
    if (!patientId) return;

    try {
      const newCompletedSteps = completed 
        ? [...new Set([...completedSteps, stepId])]
        : completedSteps;

      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          patient_id: patientId,
          current_step: stepId,
          completed_steps: newCompletedSteps,
          completed_at: completed && stepId === 'ready' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      if (completed) {
        setCompletedSteps(newCompletedSteps);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleNext = async () => {
    const currentStep = steps[currentStepIndex];
    
    // Validate pathway step
    if (currentStep.id === 'pathway' && !selectedPathway) {
      toast({
        title: "Selection required",
        description: "Please select your treatment pathway to continue",
        variant: "destructive",
      });
      return;
    }
    
    // Validate consent step
    if (currentStep.id === 'consent' && !consentAccepted) {
      toast({
        title: "Consent required",
        description: "Please accept the consent form to continue",
        variant: "destructive",
      });
      return;
    }

    // Save progress
    await saveProgress(currentStep.id, true);

    // Move to next step or finish
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      await saveProgress(steps[currentStepIndex + 1].id, false);
    } else {
      // Onboarding complete - redirect to Week 0
      navigate('/week-0');
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const currentStep = steps[currentStepIndex];
  const StepComponent = currentStep.component;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-elevated">
        <CardContent className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px] mb-8">
            <StepComponent 
              onConsentChange={currentStep.id === 'consent' ? setConsentAccepted : undefined}
              onPathwayChange={currentStep.id === 'pathway' ? setSelectedPathway : undefined}
              initialPathway={currentStep.id === 'pathway' ? selectedPathway : undefined}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button onClick={handleNext}>
              {isLastStep ? 'Go to Dashboard' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
