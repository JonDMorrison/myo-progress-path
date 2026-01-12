import { Calendar, Target, TrendingUp } from "lucide-react";

export const ProgramOverviewStep = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Your 24-Week Program</h2>
        <p className="text-lg text-muted-foreground">
          A structured journey to better breathing and oral function
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-muted/50 rounded-lg text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="font-semibold mb-2">Weekly Structure</h3>
          <p className="text-sm text-muted-foreground">
            Each week includes daily exercises, with check-ins every two weeks
          </p>
        </div>

        <div className="p-6 bg-muted/50 rounded-lg text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="font-semibold mb-2">Clear Goals</h3>
          <p className="text-sm text-muted-foreground">
            Track your progress with measurable metrics every two weeks
          </p>
        </div>

        <div className="p-6 bg-muted/50 rounded-lg text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="font-semibold mb-2">Continuous Progress</h3>
          <p className="text-sm text-muted-foreground">
            Build habits progressively with expert feedback every two weeks
          </p>
        </div>
      </div>

      {/* What to Expect */}
      <div className="mt-6 p-6 bg-primary/10 border border-primary/20 rounded-lg">
        <h3 className="font-semibold mb-2">What to Expect</h3>
        <ul className="space-y-2 text-sm">
          <li>• Complete daily exercises (5-15 minutes)</li>
          <li>• Submit biweekly check-ins with your progress data</li>
          <li>• Receive personalized feedback from your therapist</li>
          <li>• Unlock new exercises as you advance through weeks</li>
        </ul>
      </div>
    </div>
  );
};
