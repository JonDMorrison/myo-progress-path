import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Phone, AlertCircle } from "lucide-react";

interface FrenectomyConsultReminderProps {
  weekNumber: number;
}

export function FrenectomyConsultReminder({ weekNumber }: FrenectomyConsultReminderProps) {
  if (weekNumber !== 2) return null;
  
  return (
    <Alert className="border-warning/50 bg-warning/10">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning">Friendly Reminder</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        <p className="mb-2">
          Don't forget to schedule your frenectomy consultation with Vedder Dental if you haven't already. 
          This is an important step in your therapy journey.
        </p>
        <a
          href="tel:+16046569313"
          className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
        >
          <Phone className="h-3 w-3" />
          Call (604) 656-9313
        </a>
      </AlertDescription>
    </Alert>
  );
}
