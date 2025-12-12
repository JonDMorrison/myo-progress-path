import { Activity, Clock, Gauge } from "lucide-react";
import { BOLTHelpContent } from "@/components/BOLTHelpContent";

export const BOLTInstructionsStep = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Activity className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold">Understanding Your BOLT Score</h2>
        <p className="text-muted-foreground text-lg">
          Learn how to measure and track your breathing efficiency
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 my-8">
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
          <Clock className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold mb-1">1-2 Minutes</h3>
          <p className="text-sm text-muted-foreground">Breathe normally to prepare</p>
        </div>
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
          <Gauge className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Hold Comfortably</h3>
          <p className="text-sm text-muted-foreground">Until first urge to breathe</p>
        </div>
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
          <Activity className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Track Progress</h3>
          <p className="text-sm text-muted-foreground">Record your score weekly</p>
        </div>
      </div>

      {/* Tongue position reminder */}
      <div className="flex gap-4 items-center p-4 bg-accent/30 rounded-lg border border-accent">
        <img 
          src="/images/learn/the-spot.jpg" 
          alt="The Spot - tongue rest position"
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
        <div>
          <h4 className="font-semibold text-sm">Remember: Tongue Position</h4>
          <p className="text-xs text-muted-foreground">
            During the BOLT test, keep your tongue resting on the spot (incisive papilla) behind your upper front teeth.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <BOLTHelpContent />
      </div>

      <div className="bg-accent/50 border border-accent rounded-lg p-4">
        <p className="text-sm">
          <strong>Important:</strong> You'll be asked to record your BOLT score each week. Don't worry if your first score is low—most people start with scores under 20 seconds. The goal is steady improvement through consistent practice.
        </p>
      </div>
    </div>
  );
};
