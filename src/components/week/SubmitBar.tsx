import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SubmitBarProps {
  onComplete: () => void;
  canSubmit?: boolean;
  loading?: boolean;
  missingRequirements?: string[];
}

export function SubmitBar({ 
  onComplete, 
  canSubmit = true, 
  loading = false,
  missingRequirements = []
}: SubmitBarProps) {
  return (
    <div className="fixed bottom-16 sm:bottom-4 inset-x-0 z-30">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-2xl border bg-card/95 backdrop-blur-sm shadow-lg p-3 flex flex-col gap-3">
          {!canSubmit && missingRequirements.length > 0 && (
            <Alert variant="default" className="border-primary/20 bg-primary/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Complete these items to submit:</span>
                <ul className="mt-1 ml-4 list-disc text-sm">
                  {missingRequirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={onComplete}
            disabled={!canSubmit || loading}
            className="flex-1 h-11 rounded-xl shadow-sm"
            size="lg"
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
