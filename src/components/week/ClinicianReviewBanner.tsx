import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClinicianReviewBannerProps {
  weekNumber: number;
}

export function ClinicianReviewBanner({ weekNumber }: ClinicianReviewBannerProps) {
  return (
    <Alert className="border-warning bg-warning/10 mb-4">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="text-warning font-medium">
        Week {weekNumber}: Awaiting clinician confirmation.
      </AlertDescription>
    </Alert>
  );
}
