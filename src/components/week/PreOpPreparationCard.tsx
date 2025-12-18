import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ClipboardList } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PreOpPreparationCard() {
  return (
    <Card className="rounded-xl sm:rounded-2xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <ClipboardList className="h-5 w-5 text-primary" />
          Pre-Operative Preparation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          At this time, there is no separate written pre-operative protocol document to review.
        </p>
        
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Preparation for your procedure typically begins with a consultation. During this visit, your dental or medical provider will review your specific situation, explain what to expect, and give you any instructions needed to prepare.
        </p>
        
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Because preparation can vary depending on the individual and the type of procedure, it is important to follow the guidance provided directly by your care team.
        </p>

        <div className="pt-2">
          <h4 className="font-semibold text-foreground mb-2">What This Means for You</h4>
          <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-muted-foreground">
            <li>There are no additional pre-operative steps required unless they are given to you directly by your provider</li>
            <li>Any preparation instructions will be discussed during your consultation</li>
            <li>If myofunctional therapy is part of your care plan, your therapist will explain how it fits into your overall treatment timeline</li>
          </ul>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          If you have questions about how to prepare, please raise them during your consultation or contact your therapist for clarification.
        </p>

        <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Important Reminder:</strong> Always follow the instructions provided by your dental or medical provider. If you are unsure whether additional preparation is needed before your procedure, ask your provider or therapist before moving forward.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
