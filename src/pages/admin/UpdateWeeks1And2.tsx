import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, CheckCircle } from "lucide-react";

export default function UpdateWeeks1And2() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const { toast } = useToast();

  const handleUpdate = async () => {
    setLoading(true);
    setResult("");

    try {
      // Fetch the JSON data
      const response = await fetch('/weeks-1-2-updated.json');
      const data = await response.json();

      // Get the program
      const { data: programs } = await supabase
        .from('programs')
        .select('id')
        .limit(1)
        .single();

      if (!programs) {
        throw new Error('No program found');
      }

      let weeksUpdated = 0;
      let exercisesCreated = 0;

      // Process each week
      for (const weekData of data.weeks) {
        // Upsert week
        const { data: week, error: weekError } = await supabase
          .from('weeks')
          .upsert({
            program_id: programs.id,
            number: weekData.number,
            title: weekData.title,
            introduction: weekData.introduction,
            overview: weekData.overview,
            objectives: weekData.objectives,
            video_title: weekData.video_title || null,
            video_url: weekData.video_url || null,
            requires_bolt: weekData.requires_bolt || false,
            requires_video_first: weekData.requires_video_first || false,
            requires_video_last: weekData.requires_video_last || false,
          }, {
            onConflict: 'program_id,number',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (weekError) throw weekError;
        weeksUpdated++;

        // Delete existing exercises for this week
        await supabase
          .from('exercises')
          .delete()
          .eq('week_id', week.id);

        // Insert new exercises
        for (const exerciseData of weekData.exercises) {
          const { error: exerciseError } = await supabase
            .from('exercises')
            .insert({
              week_id: week.id,
              type: exerciseData.type,
              title: exerciseData.title,
              frequency: exerciseData.frequency || null,
              duration: exerciseData.duration || null,
              completion_target: exerciseData.completion_target || 0,
              instructions: exerciseData.instructions || null,
              props: exerciseData.props || null,
              compensations: exerciseData.compensations || null,
              demo_video_url: exerciseData.demo_video_url || null,
            });

          if (exerciseError) throw exerciseError;
          exercisesCreated++;
        }
      }

      setResult(`✅ Successfully updated ${weeksUpdated} weeks and created ${exercisesCreated} exercises`);
      toast({
        title: "Success!",
        description: `Updated ${weeksUpdated} weeks with ${exercisesCreated} exercises`,
      });
    } catch (error: any) {
      console.error('Update error:', error);
      setResult(`❌ Error: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Update Weeks 1 & 2 with Therapist Content
          </CardTitle>
          <CardDescription>
            This will update Weeks 1 and 2 with the new exercise structure from the myofunctional therapist's PDF.
            Both weeks will have the same exercises with daily completion tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">What will be updated:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>5 exercises per week: Clicks & Tick-Tocks, Brushing, Tongue Trace, BOLT Test, Elastic Hold</li>
              <li>Frequency and duration tracking (e.g., "2x/day", "2 minutes")</li>
              <li>Completion targets (28 sessions for active, 14 for passive)</li>
              <li>Detailed compensations and instructions</li>
              <li>Frenectomy consultation tracking</li>
            </ul>
          </div>

          <Button 
            onClick={handleUpdate} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              "Updating..."
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Update Weeks 1 & 2
              </>
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg ${result.startsWith('✅') ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              <p className="font-mono text-sm whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
