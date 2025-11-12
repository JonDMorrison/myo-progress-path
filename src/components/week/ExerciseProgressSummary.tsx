import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ExerciseProgressSummaryProps {
  completedCount: number;
  totalCount: number;
}

export function ExerciseProgressSummary({ 
  completedCount, 
  totalCount 
}: ExerciseProgressSummaryProps) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  return (
    <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">
                {completedCount} of {totalCount} Exercises Completed
              </span>
            </div>
          </div>
          <span className="text-2xl font-bold text-primary">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
        {completedCount < totalCount && (
          <p className="text-sm text-muted-foreground mt-3">
            Mark exercises as complete as you practice them
          </p>
        )}
        {completedCount === totalCount && totalCount > 0 && (
          <p className="text-sm text-success mt-3 font-medium">
            Great work! All exercises completed
          </p>
        )}
      </CardContent>
    </Card>
  );
}
