import { AlertCircle, CheckCircle2 } from "lucide-react";

export const BOLTHelpContent = () => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2">What is BOLT?</h4>
        <p className="text-sm text-muted-foreground">
          BOLT stands for <strong>Body Oxygen Level Test</strong>. It measures your CO2 tolerance and breathing efficiency.
        </p>
      </div>

      <div>
        <h4 className="font-semibold mb-2">How to perform the test:</h4>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Sit comfortably and breathe normally for 1-2 minutes</li>
          <li>After a normal exhale, gently pinch your nose closed</li>
          <li>Start your timer</li>
          <li>Hold your breath until you feel the <strong>first urge</strong> to breathe</li>
          <li>Stop the timer and record your score in seconds</li>
        </ol>
      </div>

      <div>
        <h4 className="font-semibold mb-2">What your score means:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <span><strong>&lt;10s:</strong> Needs significant improvement</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <span><strong>10-20s:</strong> Room for improvement</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span><strong>20-40s:</strong> Good breathing efficiency</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong>40s+:</strong> Excellent breathing efficiency</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground italic">
          Remember: BOLT is a measure of progress, not a competition. Focus on steady improvement over time.
        </p>
      </div>
    </div>
  );
};
