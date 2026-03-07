import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileJson, Users } from "lucide-react";
import { importProgram } from "@/lib/importProgram";
import { AdminLayout } from "@/components/layout/AdminLayout";

const AdminContent = () => {
  const [importing, setImporting] = useState(false);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonPreview, setJsonPreview] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  // Auth + role check handled by ProtectedRoute in App.tsx

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

  const handleCreateDemoUsers = async () => {
    try {
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
    <AdminLayout title="Content Import" description="Import programs and manage settings">
      <div className="max-w-3xl space-y-6">
        {/* Import Program JSON */}
        <Card>
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

        {/* Consent Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-primary" />
              Consent Form Text
            </CardTitle>
            <CardDescription>
              Edit the consent form shown to patients on first login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consent-text">Consent Text (Markdown supported)</Label>
              <Textarea
                id="consent-text"
                rows={10}
                defaultValue="# Consent to Treatment

I understand and agree to participate in the myofunctional therapy program."
                className="font-mono text-sm"
              />
            </div>
            <Button variant="outline" className="w-full" disabled>
              Save Consent Text (Coming Soon)
            </Button>
            <p className="text-xs text-muted-foreground">
              Consent version will auto-increment when changed
            </p>
          </CardContent>
        </Card>

        {/* Demo Helpers */}
        <Card>
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
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
