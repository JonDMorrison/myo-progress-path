import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Phone, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FrenectomyConsultTaskProps {
  patientId: string;
  weekId: string;
  isCompleted: boolean;
  onUpdate?: () => void;
}

export function FrenectomyConsultTask({
  patientId,
  weekId,
  isCompleted,
  onUpdate
}: FrenectomyConsultTaskProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('patient_week_progress')
        .update({ frenectomy_consult_booked: checked })
        .eq('patient_id', patientId)
        .eq('week_id', weekId);

      if (error) throw error;

      setCompleted(checked);
      toast({
        title: checked ? "Task completed" : "Task unmarked",
        description: checked 
          ? "Great! Your frenectomy consultation has been noted." 
          : "Task has been unmarked.",
      });
      onUpdate?.();
    } catch (error: any) {
      console.error('Error updating consult task:', error);
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
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
            <Phone className="h-5 w-5 text-primary" />
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
            id="frenectomy-consult"
            checked={completed}
            onCheckedChange={handleToggle}
            disabled={saving}
            className="mt-1"
          />
          <div className="flex-1">
            <label 
              htmlFor="frenectomy-consult" 
              className="font-medium cursor-pointer block"
            >
              Book a frenectomy consultation with Vedder Dental
            </label>
            <p className="text-sm text-muted-foreground mt-1">
              Before you can complete Week 1, please contact Vedder Dental to schedule your frenectomy consultation appointment.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <a
            href="tel:+16046569313"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Phone className="h-4 w-4" />
            Call (604) 656-9313
          </a>
          <a
            href="https://vedderdental.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Visit Website
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
