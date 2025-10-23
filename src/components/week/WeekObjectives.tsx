import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { LearnChips } from "./LearnChips";

interface WeekObjectivesProps {
  objectives: string[];
  weekNumber: number;
}

export function WeekObjectives({ objectives, weekNumber }: WeekObjectivesProps) {
  if (!objectives || objectives.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Learning Objectives
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {objectives.map((objective: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{objective}</span>
            </li>
          ))}
        </ul>
        
        {/* Learn More Chips */}
        <div className="pt-4 border-t">
          <LearnChips weekNumber={weekNumber} />
        </div>
      </CardContent>
    </Card>
  );
}
