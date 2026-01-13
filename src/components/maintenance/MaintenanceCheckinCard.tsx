import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, Wind, Target, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceCheckinCardProps {
  patientId: string;
  onCheckinComplete?: () => void;
}

export function MaintenanceCheckinCard({ patientId, onCheckinComplete }: MaintenanceCheckinCardProps) {
  const [nasalBreathing, setNasalBreathing] = useState(80);
  const [tongueOnSpot, setTongueOnSpot] = useState(80);
  const [boltScore, setBoltScore] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("maintenance_checkins").insert({
        patient_id: patientId,
        nasal_breathing_percent: nasalBreathing,
        tongue_on_spot_percent: tongueOnSpot,
        bolt_score: boltScore ? parseInt(boltScore) : null,
        notes: notes || null,
      });

      if (error) throw error;

      toast({
        title: "Check-in submitted!",
        description: "Your weekly progress has been recorded.",
      });

      // Reset form
      setNasalBreathing(80);
      setTongueOnSpot(80);
      setBoltScore("");
      setNotes("");
      
      onCheckinComplete?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl sm:rounded-2xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Weekly Maintenance Check-in
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Track your progress during the maintenance phase. Submit a quick check-in each week to stay on track.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-500" />
                Nasal Breathing
              </Label>
              <span className="text-sm font-medium">{nasalBreathing}%</span>
            </div>
            <Slider
              value={[nasalBreathing]}
              onValueChange={(v) => setNasalBreathing(v[0])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Tongue on Spot
              </Label>
              <span className="text-sm font-medium">{tongueOnSpot}%</span>
            </div>
            <Slider
              value={[tongueOnSpot]}
              onValueChange={(v) => setTongueOnSpot(v[0])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-orange-500" />
              BOLT Score (optional)
            </Label>
            <Input
              type="number"
              placeholder="Enter your BOLT score in seconds"
              value={boltScore}
              onChange={(e) => setBoltScore(e.target.value)}
              min={0}
              max={120}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any observations or concerns this week..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="w-full"
        >
          {submitting ? "Submitting..." : "Submit Check-in"}
        </Button>
      </CardContent>
    </Card>
  );
}
