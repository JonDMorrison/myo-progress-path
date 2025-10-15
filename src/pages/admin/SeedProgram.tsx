import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { seed24WeekProgram } from "@/lib/seed24WeekProgram";
import { supabase } from "@/integrations/supabase/client";

const SeedProgram = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Fetch the 24-week program JSON
      const response = await fetch("/24-week-program.json");
      const weeksData = await response.json();

      // Get or create the program
      const { data: programs } = await supabase
        .from("programs")
        .select("*")
        .eq("title", "Myofunctional Therapy with Frenectomy - 24 Week")
        .maybeSingle();

      let programId: string;

      if (!programs) {
        // Create new program
        const { data: newProgram, error: programError } = await supabase
          .from("programs")
          .insert({
            title: "Myofunctional Therapy with Frenectomy - 24 Week",
            description: "Complete 24-week myofunctional therapy program with detailed weekly guidance",
            weeks_count: 24,
          })
          .select()
          .single();

        if (programError) throw programError;
        programId = newProgram.id;
      } else {
        programId = programs.id;
      }

      // Seed the program
      const seedResult = await seed24WeekProgram(programId, weeksData);

      if (seedResult.success) {
        setResult(seedResult);
        toast({
          title: "Success!",
          description: `Updated ${seedResult.weeksUpdated} weeks with ${seedResult.exercisesCreated} exercises`,
        });
      } else {
        throw new Error(seedResult.error || "Seed failed");
      }
    } catch (error: any) {
      console.error("Seed error:", error);
      toast({
        title: "Seed Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Seed 24-Week Program</CardTitle>
          <CardDescription>
            Import or update the complete 24-week Montrose Myo program with introductions, objectives, and exercises
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">What this does:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Updates all 24 weeks with titles, introductions, and overviews</li>
              <li>Sets learning objectives for each week</li>
              <li>Updates exercises for each week</li>
              <li>Configures video upload requirements</li>
              <li>Sets tracking requirements (BOLT score, nasal breathing %)</li>
            </ul>
          </div>

          <Button
            onClick={handleSeed}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                Seeding Program...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Seed/Update 24-Week Program
              </>
            )}
          </Button>

          {result && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-semibold">Seed Completed Successfully</h3>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                <p>Weeks updated: {result.weeksUpdated}</p>
                <p>Exercises created: {result.exercisesCreated}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SeedProgram;
