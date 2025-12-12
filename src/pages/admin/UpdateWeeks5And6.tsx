import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function UpdateWeeks5And6() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const { toast } = useToast();

  const handleUpdate = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/weeks-5-6-updated.json");
      const data = await response.json();

      const { data: programs, error: programError } = await supabase.from("programs").select("id").single();
      if (programError) throw programError;
      if (!programs) throw new Error("No program found");

      let weeksUpdated = 0;
      let exercisesCreated = 0;

      for (const weekData of data.weeks) {
        const { data: week, error: weekError } = await supabase
          .from("weeks")
          .upsert({
            program_id: programs.id,
            number: weekData.week,
            title: weekData.title,
            introduction: weekData.introduction,
            overview: weekData.overview,
            objectives: weekData.objectives,
            video_title: weekData.video_title,
            video_url: weekData.video_url,
            requires_bolt: weekData.tracking.BOLT_score || false,
            requires_video_first: weekData.requires_video_first || false,
            requires_video_last: weekData.requires_video_last || false,
          }, { onConflict: "program_id,number" })
          .select()
          .single();

        if (weekError) throw weekError;
        weeksUpdated++;

        await supabase.from("exercises").delete().eq("week_id", week.id);

        for (const exercise of weekData.exercises) {
          const { error: exerciseError } = await supabase.from("exercises").insert({
            week_id: week.id,
            title: exercise.name,
            type: exercise.type,
            frequency: exercise.frequency,
            duration: exercise.duration,
            completion_target: exercise.completion_target,
            instructions: exercise.description,
            props: exercise.props,
            compensations: exercise.compensations,
            demo_video_url: exercise.demo_video_url || "",
          });
          if (!exerciseError) exercisesCreated++;
        }
      }

      setResult(`✅ Successfully updated ${weeksUpdated} weeks with ${exercisesCreated} exercises!`);
      toast({ title: "Update Complete", description: `Updated ${weeksUpdated} weeks` });
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Update Weeks 5-6" description="Import exercise data for weeks 5-6 (Pre-Frenectomy Preparation)">
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Update Weeks 5 & 6</CardTitle>
            <CardDescription>Import comprehensive exercise data for weeks 5-6</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">This will update:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Week 5 & 6: Pre-Frenectomy Preparation</li>
                <li>5 exercises per week with complete details</li>
                <li>Instructions, props, and compensations</li>
              </ul>
            </div>
            <Button onClick={handleUpdate} disabled={loading} className="w-full" size="lg">
              {loading ? "Updating..." : "Update Weeks 5 & 6"}
            </Button>
            {result && (
              <div className={`p-4 rounded-lg ${result.startsWith("✅") ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                {result}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
