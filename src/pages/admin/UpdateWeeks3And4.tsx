import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, CheckCircle } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function UpdateWeeks3And4() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const { toast } = useToast();

  const handleUpdate = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch('/weeks-3-4-updated.json');
      const data = await response.json();

      const { data: programs } = await supabase
        .from('programs')
        .select('id')
        .limit(1)
        .single();

      if (!programs) throw new Error('No program found');

      let weeksUpdated = 0;
      let exercisesCreated = 0;

      for (const weekData of data.weeks) {
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
          }, { onConflict: 'program_id,number', ignoreDuplicates: false })
          .select()
          .single();

        if (weekError) throw weekError;
        weeksUpdated++;

        await supabase.from('exercises').delete().eq('week_id', week.id);

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
      toast({ title: "Success!", description: `Updated ${weeksUpdated} weeks with ${exercisesCreated} exercises` });
    } catch (error: any) {
      console.error('Update error:', error);
      setResult(`❌ Error: ${error.message}`);
      toast({ variant: "destructive", title: "Update failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Update Weeks 3-4" description="Update Weeks 3 and 4 with therapist content">
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Update Weeks 3 & 4
            </CardTitle>
            <CardDescription>Update with new exercise structure from therapist's PDF.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">What will be updated:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>5 exercises per week</li>
                <li>Frequency, duration, and completion targets</li>
                <li>Detailed compensations and instructions</li>
              </ul>
            </div>
            <Button onClick={handleUpdate} disabled={loading} className="w-full" size="lg">
              {loading ? "Updating..." : <><CheckCircle className="mr-2 h-5 w-5" />Update Weeks 3 & 4</>}
            </Button>
            {result && (
              <div className={`p-4 rounded-lg ${result.startsWith('✅') ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                <p className="font-mono text-sm">{result}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
