import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Settings, Users, FileJson } from "lucide-react";
import { importProgram } from "@/lib/importProgram";
import { getAppFeatures, updateAppFeatures, clearFeaturesCache } from "@/lib/appSettings";

const AdminContent = () => {
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonPreview, setJsonPreview] = useState<any>(null);
  const [premiumVideo, setPremiumVideo] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadFeatures();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || userData.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Admin privileges required.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setLoading(false);
  };

  const loadFeatures = async () => {
    const features = await getAppFeatures();
    setPremiumVideo(features.premium_video);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFile(file);

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setJsonPreview(json);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Could not parse the selected file.",
        variant: "destructive",
      });
      setJsonFile(null);
      setJsonPreview(null);
    }
  };

  const handleImport = async () => {
    if (!jsonPreview) return;

    setImporting(true);
    try {
      const result = await importProgram(jsonPreview);

      if (result.success) {
        toast({
          title: "Import Successful!",
          description: `Created ${result.weeksCreated} weeks and ${result.exercisesCreated} exercises.`,
        });
        setJsonFile(null);
        setJsonPreview(null);
      } else {
        toast({
          title: "Import Failed",
          description: result.error || "Unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Import Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFeatureToggle = async (enabled: boolean) => {
    setPremiumVideo(enabled);
    const success = await updateAppFeatures({ premium_video: enabled });

    if (success) {
      clearFeaturesCache();
      toast({
        title: enabled ? "Premium Features Enabled" : "Premium Features Disabled",
        description: `Video uploads are now ${enabled ? "available" : "hidden"}.`,
      });
    } else {
      setPremiumVideo(!enabled);
      toast({
        title: "Update Failed",
        description: "Could not update feature settings.",
        variant: "destructive",
      });
    }
  };

  const handleCreateDemoUsers = async () => {
    try {
      // This is a simplified version - in production, you'd create via admin API
      toast({
        title: "Demo Users",
        description: "Use the auth page to create a therapist and patient account manually.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/therapist")} className="mb-3">
            <ArrowLeft className="mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Content Management</h1>
              <p className="text-sm text-muted-foreground">Import programs and manage settings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Import Program JSON */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-primary" />
              Import Program JSON
            </CardTitle>
            <CardDescription>
              Upload a JSON file matching the 24-week program structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-file">Select JSON File</Label>
              <Input
                id="json-file"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={importing}
              />
            </div>

            {jsonPreview && (
              <div className="bg-accent rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">Preview</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>Program:</strong> {jsonPreview.program}</p>
                  <p><strong>Weeks:</strong> {jsonPreview.weeks?.length || 0}</p>
                  <p><strong>Total Exercises:</strong> {
                    jsonPreview.weeks?.reduce((sum: number, w: any) => sum + (w.exercises?.length || 0), 0) || 0
                  }</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!jsonPreview || importing}
              className="w-full"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2" />
                  Validate & Import
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Feature Flags
            </CardTitle>
            <CardDescription>
              Control which features are available in the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="premium-video" className="text-base font-medium">
                  Premium Video Features
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable video uploads, thumbnails, and side-by-side review
                </p>
              </div>
              <Switch
                id="premium-video"
                checked={premiumVideo}
                onCheckedChange={handleFeatureToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Demo Helpers */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Demo & Testing Tools
            </CardTitle>
            <CardDescription>
              Quickly set up demo data for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={handleCreateDemoUsers}
              className="w-full"
            >
              Create Demo Users (Therapist + Patient)
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Demo tools help you quickly test the application workflow
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminContent;
