import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function UpdateWeeks5And6() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const { toast } = useToast();

  const handleUpdate = async () => {
    setLoading(true);
    setResult("");

    try {
      // Fetch the updated weeks data
      const response = await fetch("/weeks-5-6-updated.json");
      const data = await response.json();

      // Get the program ID
      const { data: programs, error: programError } = await supabase
        .from("programs")
        .select("id")
        .single();

      if (programError) throw programError;
      if (!programs) throw new Error("No program found");

      const programId = programs.id;
      let weeksUpdated = 0;
      let exercisesCreated = 0;

      // Process each week
      for (const weekData of data.weeks) {
        // Upsert the week
        const { data: week, error: weekError } = await supabase
          .from("weeks")
          .upsert(
            {
              program_id: programId,
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
              checklist_schema: [
                ...(weekData.tracking.nasal_breathing_percent
                  ? ["% Time Nasal Breathing"]
                  : []),
                ...(weekData.tracking.BOLT_score ? ["BOLT Score"] : []),
              ],
            },
            {
              onConflict: "program_id,number",
            }
          )
          .select()
          .single();

        if (weekError) {
          console.error(`Week ${weekData.week} upsert error:`, weekError);
          throw weekError;
        }

        weeksUpdated++;

        // Delete existing exercises for this week
        await supabase.from("exercises").delete().eq("week_id", week.id);

        // Insert new exercises
        for (const exercise of weekData.exercises) {
          const { error: exerciseError } = await supabase
            .from("exercises")
            .insert({
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

          if (!exerciseError) {
            exercisesCreated++;
          } else {
            console.error(`Exercise insert error:`, exerciseError);
          }
        }
      }

      const successMessage = `✅ Successfully updated ${weeksUpdated} weeks with ${exercisesCreated} exercises!`;
      setResult(successMessage);
      toast({
        title: "Update Complete",
        description: successMessage,
      });
    } catch (error: any) {
      const errorMessage = `❌ Error: ${error.message}`;
      setResult(errorMessage);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Update Weeks 5 & 6</CardTitle>
          <CardDescription>
            Import comprehensive exercise data for weeks 5-6 (Pre-Frenectomy Preparation)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">This will update:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Week 5: Pre-Frenectomy Preparation</li>
              <li>Week 6: Pre-Frenectomy Preparation (continued)</li>
              <li>5 exercises per week with complete details</li>
              <li>Exercise types: Active, Breathing, and Passive</li>
              <li>Frequency, duration, and completion targets</li>
              <li>Detailed instructions, props, and compensations</li>
              <li>Video upload requirements (first and last attempt)</li>
              <li>Tracking for nasal breathing percentage</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Exercises included:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Tongue in Cheek (Active - 1 min, 2x/day)</li>
              <li>K Sounds: Kuh, Guh, Unk (Active - 2 min, 2x/day)</li>
              <li>Lip Trace (Active - 1 min, 2x/day)</li>
              <li>4-7-8 Breathing Pattern (Breathing - 5 min, 1x/day)</li>
              <li>Middle of Tongue – One Elastic Hold (Passive - 10 min, 1x/day)</li>
            </ul>
          </div>

          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Updating..." : "Update Weeks 5 & 6"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.startsWith("✅")
                  ? "bg-green-50 text-green-900 border border-green-200"
                  : "bg-red-50 text-red-900 border border-red-200"
              }`}
            >
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
