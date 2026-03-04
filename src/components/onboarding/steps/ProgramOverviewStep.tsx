import { Calendar, Target, TrendingUp } from "lucide-react";
import { isFrenectomyVariant } from "@/lib/constants";

interface ProgramOverviewStepProps {
  selectedPathway?: string | null;
}

export const ProgramOverviewStep = ({ selectedPathway }: ProgramOverviewStepProps) => {
  const isFrenectomy = isFrenectomyVariant(selectedPathway);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">{isFrenectomy ? 'Your Surgery & Recovery Journey' : 'Your module-based program structure'}</h2>
        <p className="text-lg text-muted-foreground">
          {isFrenectomy
            ? 'A structured pathway for optimal surgical outcomes and recovery'
            : 'A structured journey to better breathing and oral function'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-muted/50 rounded-lg text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="font-semibold mb-2">Module Structure</h3>
          <p className="text-sm text-muted-foreground">
            {isFrenectomy
              ? 'Biweekly modules before surgery, followed by post-op recovery phases'
              : 'Each module requires dedicated daily practice'}
          </p>
        </div>

        <div className="p-6 bg-muted/50 rounded-lg text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="font-semibold mb-2">Clear Goals</h3>
          <p className="text-sm text-muted-foreground">
            Track your progress with measurable metrics at the end of each module
          </p>
        </div>

        <div className="p-6 bg-muted/50 rounded-lg text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="font-semibold mb-2">Expert Feedback</h3>
          <p className="text-sm text-muted-foreground">
            Submit your results for clinical review to unlock your next module (Program Dependant)
          </p>
        </div>
      </div>

      {/* What to Expect */}
      <div className="mt-6 p-6 bg-primary/10 border border-primary/20 rounded-lg">
        <h3 className="font-semibold mb-2">What to Expect</h3>
        <ul className="space-y-2 text-sm">
          <li>• Complete daily exercises (5-15 minutes)</li>
          <li>• {isFrenectomy ? 'Achieve specific goals to qualify for surgery' : 'Build strength and muscle memory progressively'}</li>
          <li>• Submit module check-ins with your progress data & videos (Program Dependant)</li>
          <li>• Receive personalized feedback from your therapist (Program Dependant)</li>
          <li>• {isFrenectomy ? 'Move seamlessly through pre-op and post-op protocols' : 'Advance through all modules of the program'}</li>
        </ul>
      </div>
    </div>
  );
};
