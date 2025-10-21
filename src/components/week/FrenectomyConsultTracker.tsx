import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FrenectomyConsultTrackerProps {
  patientId: string;
  weekId: string;
  isBooked: boolean;
  onUpdate?: () => void;
}

export function FrenectomyConsultTracker({ 
  patientId, 
  weekId, 
  isBooked, 
  onUpdate 
}: FrenectomyConsultTrackerProps) {
  const [checked, setChecked] = useState(isBooked);
  const { toast } = useToast();

  const handleToggle = async (newValue: boolean) => {
    setChecked(newValue);

    const { error } = await supabase
      .from('patient_week_progress')
      .update({ frenectomy_consult_booked: newValue })
      .eq('patient_id', patientId)
      .eq('week_id', weekId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status. Please try again.",
      });
      setChecked(checked);
    } else {
      toast({
        title: newValue ? "Marked as completed" : "Unmarked",
        description: newValue 
          ? "Frenectomy consultation has been booked or completed." 
          : "Frenectomy consultation status updated.",
      });
      onUpdate?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Frenectomy Consultation
        </CardTitle>
        <CardDescription>
          Schedule or complete your consultation with Dr. Laura Caylor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="frenectomy-consult"
            checked={checked}
            onCheckedChange={handleToggle}
          />
          <Label 
            htmlFor="frenectomy-consult"
            className="text-sm font-normal cursor-pointer"
          >
            Consultation has been booked or completed
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
