import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { syncProgramData } from "@/lib/syncProgramData";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layout/AdminLayout";

const SeedProgram = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/24-week-program.json");
      const weeksData = await response.json();

      // Use the new syncProgramData function
      const seedResult = await syncProgramData(weeksData);

      if (seedResult.errors.length === 0) {
        setResult(seedResult);
        toast({
          title: "Success!",
          description: `Synced ${seedResult.weeksSynced} weeks and ${seedResult.exercisesSynced} exercises across variants.`,
        });
      } else {
        throw new Error(`Sync completed with ${seedResult.errors.length} errors: ${seedResult.errors[0]}`);
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
    <AdminLayout title="Seed Program" description="Import or update the complete 24-week Montrose Myo program">
      <div className="max-w-2xl">
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
                  <p>Weeks synced: {result.weeksSynced}</p>
                  <p>Exercises synced: {result.exercisesSynced}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SeedProgram;
