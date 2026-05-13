import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LearnHubReviewTaskProps {
  patientId: string;
  weekId: string;
  isCompleted: boolean;
  onUpdate?: () => void;
}

const keyArticles = [
  { slug: "program-specifics", title: "Program Specifics" },
  { slug: "compensations", title: "Compensations to Limit" },
  { slug: "frenectomy-pathway", title: "Frenectomy Pathway" },
  { slug: "therapy-kit", title: "Your Therapy Kit" },
];

export function LearnHubReviewTask({
  patientId,
  weekId,
  isCompleted,
  onUpdate
}: LearnHubReviewTaskProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      // When the Supabase weeks lookup fails, WeekDetail passes a synthetic
      // `json-week-N` id. Updating patient_week_progress with that id matches
      // zero rows silently — the patient sees a success toast but the value
      // never persists, and calc_week_progress keeps blocking submission.
      // Resolve to the real UUID before writing.
      let realWeekId = weekId;
      if (!weekId || weekId.startsWith('json-')) {
        const weekNum = parseInt((weekId || '').replace('json-week-', ''));
        if (!Number.isNaN(weekNum)) {
          const { data: weekData } = await supabase
            .from('weeks')
            .select('id')
            .eq('number', weekNum)
            .limit(1)
            .maybeSingle();
          if (weekData?.id) realWeekId = weekData.id;
        }
      }

      // .select() so we get the affected rows back and can verify the update
      // actually hit something — otherwise zero-row updates look successful.
      const { data: updatedRows, error } = await supabase
        .from('patient_week_progress')
        .update({ learn_hub_reviewed: checked })
        .eq('patient_id', patientId)
        .eq('week_id', realWeekId)
        .select('id');

      if (error) throw error;
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error(
          "Couldn't find a progress row to update. Please refresh the page and try again."
        );
      }

      setCompleted(checked);
      toast({
        title: checked ? "Task completed" : "Task unmarked",
        description: checked
          ? "Great! You've confirmed reviewing the Learning Hub."
          : "Task has been unmarked.",
      });
      onUpdate?.();
    } catch (error: any) {
      console.error('Error updating learn hub task:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-2xl border-2 border-primary/20 shadow-sm bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Required Task
          </CardTitle>
          <Badge variant={completed ? "default" : "secondary"}>
            {completed ? "Completed" : "Required"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="learn-hub-review"
            checked={completed}
            onCheckedChange={handleToggle}
            disabled={saving}
            className="mt-1"
          />
          <div className="flex-1">
            <label 
              htmlFor="learn-hub-review" 
              className="font-medium cursor-pointer block"
            >
              I have read the Learning Hub information
            </label>
            <p className="text-sm text-muted-foreground mt-1">
              Please review the key articles in the Learning Hub to understand your therapy goals and what to watch for during exercises.
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Key articles:</p>
          <div className="flex flex-wrap gap-2">
            {keyArticles.map((article) => (
              <Link
                key={article.slug}
                to={`/learn/${article.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-background border hover:bg-muted transition-colors"
              >
                {article.title}
                <ExternalLink className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
