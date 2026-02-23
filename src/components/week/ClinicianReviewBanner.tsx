import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getModuleInfo } from "@/lib/moduleUtils";

interface ClinicianReviewBannerProps {
  weekNumber: number;
  programVariant?: string;
}

export function ClinicianReviewBanner({ weekNumber, programVariant = 'frenectomy' }: ClinicianReviewBannerProps) {
  const moduleInfo = getModuleInfo(weekNumber, programVariant);
  const partLabel = weekNumber === moduleInfo.weekRange[0] ? 'Week 1' : 'Week 2';
  const displayLabel = moduleInfo.isWeekly 
    ? moduleInfo.displayLabel 
    : `${moduleInfo.moduleLabel} ${partLabel}`;

  return (
    <Alert className="border-warning bg-warning/10 mb-4">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="text-warning font-medium">
        {displayLabel}: Awaiting clinician confirmation.
      </AlertDescription>
    </Alert>
  );
}
