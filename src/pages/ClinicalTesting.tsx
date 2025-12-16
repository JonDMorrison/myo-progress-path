import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  FileText, 
  Stethoscope, 
  UserCheck, 
  ClipboardList,
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ChecklistState {
  [key: string]: boolean;
}

interface NotesState {
  [key: string]: string;
}

const STORAGE_KEY_CHECKLIST = "clinical-testing-checklist";
const STORAGE_KEY_NOTES = "clinical-testing-notes";

const ClinicalTesting = () => {
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [notes, setNotes] = useState<NotesState>({});

  // Load from localStorage on mount
  useEffect(() => {
    const savedChecklist = localStorage.getItem(STORAGE_KEY_CHECKLIST);
    const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
    if (savedChecklist) setChecklist(JSON.parse(savedChecklist));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  }, [notes]);

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateNote = (id: string, value: string) => {
    setNotes(prev => ({ ...prev, [id]: value }));
  };


  const exportReport = () => {
    const patientItems = [
      "patient-account", "patient-onboarding", "patient-pathway", "patient-week0",
      "patient-exercises", "patient-videos", "patient-submit", "patient-feedback", "patient-week2"
    ];
    const therapistItems = [
      "therapist-login", "therapist-inbox", "therapist-review", "therapist-videos",
      "therapist-approve", "therapist-note", "therapist-patient-feedback", "therapist-unlock"
    ];

    const patientComplete = patientItems.filter(id => checklist[id]).length;
    const therapistComplete = therapistItems.filter(id => checklist[id]).length;

    let report = `# Clinical Testing Report\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;
    report += `## Summary\n`;
    report += `- Patient Testing: ${patientComplete}/${patientItems.length} complete\n`;
    report += `- Therapist Testing: ${therapistComplete}/${therapistItems.length} complete\n\n`;
    
    if (notes["patient-notes"]) {
      report += `## Patient Testing Notes\n${notes["patient-notes"]}\n\n`;
    }
    if (notes["therapist-notes"]) {
      report += `## Therapist Testing Notes\n${notes["therapist-notes"]}\n\n`;
    }
    if (notes["bugs"]) {
      report += `## Bugs Found\n${notes["bugs"]}\n\n`;
    }
    if (notes["clinical-concerns"]) {
      report += `## Clinical Concerns\n${notes["clinical-concerns"]}\n\n`;
    }

    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinical-testing-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report exported", description: "Download should begin shortly." });
  };

  const CheckItem = ({ id, label }: { id: string; label: string }) => (
    <label className="flex items-start gap-3 py-2 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2">
      <Checkbox
        checked={checklist[id] || false}
        onCheckedChange={() => toggleCheck(id)}
        className="mt-0.5"
      />
      <span className={checklist[id] ? "text-muted-foreground line-through" : ""}>
        {label}
      </span>
    </label>
  );

  return (
    <>
      <Helmet>
        <title>Clinical Testing Protocol | Montrose Myo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ClipboardList className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Clinical Testing Protocol</h1>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Purpose Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Purpose
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What We Are Testing</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Patients can register, complete onboarding, and progress through weekly exercises</li>
                  <li>Therapists can review patient submissions and provide feedback</li>
                  <li>The two treatment pathways (Frenectomy vs Non-Frenectomy) display the correct content</li>
                  <li>Videos upload and play correctly</li>
                  <li>Exercise instructions are clear and clinically accurate</li>
                </ul>
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">✅ Please Report</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Steps that don't work as expected</li>
                    <li>• Confusing instructions</li>
                    <li>• Missing information</li>
                    <li>• Exercises in wrong order/week</li>
                    <li>• Clinically incorrect content</li>
                    <li>• Error messages</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">❌ Out of Scope</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Visual design preferences</li>
                    <li>• New feature ideas</li>
                    <li>• Future improvements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Testing Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Patient Testing Checklist
                <Badge variant="outline" className="ml-auto">
                  {Object.entries(checklist).filter(([k, v]) => k.startsWith("patient-") && v).length}/9
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <CheckItem id="patient-account" label="Account created successfully" />
                <CheckItem id="patient-onboarding" label="Completed all 8 onboarding steps" />
                <CheckItem id="patient-pathway" label="Pathway selection worked correctly (Frenectomy vs Non-Frenectomy)" />
                <CheckItem id="patient-week0" label="Completed Week 0 and unlocked Week 1" />
                <CheckItem id="patient-exercises" label="All 5 Week 1 exercises are present and clear" />
                <CheckItem id="patient-videos" label="Videos uploaded successfully (First & Last Attempt)" />
                <CheckItem id="patient-submit" label="Week submitted for review" />
                <CheckItem id="patient-feedback" label="Received therapist feedback" />
                <CheckItem id="patient-week2" label="Week 2 unlocked after approval" />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2 text-sm">Patient Testing Notes</h3>
                <Textarea
                  placeholder="Add notes about patient testing experience, issues found, etc."
                  value={notes["patient-notes"] || ""}
                  onChange={(e) => updateNote("patient-notes", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Therapist Testing Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Therapist Testing Checklist
                <Badge variant="outline" className="ml-auto">
                  {Object.entries(checklist).filter(([k, v]) => k.startsWith("therapist-") && v).length}/8
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <CheckItem id="therapist-login" label="Logged in to therapist dashboard" />
                <CheckItem id="therapist-inbox" label="Patient submission visible in inbox" />
                <CheckItem id="therapist-review" label="Review panel opened correctly" />
                <CheckItem id="therapist-videos" label="Videos played without issues" />
                <CheckItem id="therapist-approve" label="Successfully approved a week" />
                <CheckItem id="therapist-note" label="Successfully sent feedback note" />
                <CheckItem id="therapist-patient-feedback" label="Patient received the feedback" />
                <CheckItem id="therapist-unlock" label="Next week unlocked for patient" />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2 text-sm">Therapist Testing Notes</h3>
                <Textarea
                  placeholder="Add notes about therapist testing experience, issues found, etc."
                  value={notes["therapist-notes"] || ""}
                  onChange={(e) => updateNote("therapist-notes", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Issue Reporting Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Issue Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  🐛 Bugs Found
                </h3>
                <Textarea
                  placeholder="Buttons that don't work, pages that don't load, error messages, unexpected behavior..."
                  value={notes["bugs"] || ""}
                  onChange={(e) => updateNote("bugs", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  ⚠️ Clinical Concerns
                </h3>
                <Textarea
                  placeholder="Exercises in wrong week, instructions that could lead to incorrect technique, anything that could mislead patients..."
                  value={notes["clinical-concerns"] || ""}
                  onChange={(e) => updateNote("clinical-concerns", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-sm">How to Report Issues</h3>
                <p className="text-sm text-muted-foreground">
                  For each issue, note: <strong>Where</strong> (what page), <strong>What</strong> (expected vs actual), 
                  <strong> Steps</strong> (what you did), <strong>Severity</strong> (blocking or minor).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What NOT to Test */}
          <Card className="mb-6 border-dashed">
            <CardHeader>
              <CardTitle className="text-muted-foreground">What NOT to Test Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>❌ <strong>New Feature Ideas</strong> — "It would be nice if the app could also..."</li>
                <li>❌ <strong>Workflow Redesigns</strong> — "I think the whole process should be reorganized..."</li>
                <li>❌ <strong>Cosmetic Preferences</strong> — "I don't like the color/font..."</li>
                <li>❌ <strong>Content That Doesn't Exist Yet</strong> — "Week 15 should have..."</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Save these for after we confirm core functionality works. Your feedback is valuable — just not right now.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground py-8">
            <p>Thank you for testing Montrose Myo.</p>
            <p>Your clinical expertise ensures this tool is safe and effective for patients.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClinicalTesting;
