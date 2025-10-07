import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAppFeatures } from "@/lib/appSettings";
import { notifyTherapistSubmission } from "@/lib/notify";

const WeekDetail = () => {
  const { weekNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [premiumEnabled, setPremiumEnabled] = useState(false);

  // Form state
  const [boltScore, setBoltScore] = useState("");
  const [nasalPct, setNasalPct] = useState("");
  const [tonguePct, setTonguePct] = useState("");

  useEffect(() => {
    loadWeekData();
    loadFeatures();
  }, [weekNumber]);

  const loadFeatures = async () => {
    const features = await getAppFeatures();
    setPremiumEnabled(features.premium_video);
  };

  const loadWeekData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get patient
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Get week
      const { data: weekData, error: weekError } = await supabase
        .from("weeks")
        .select("*")
        .eq("number", parseInt(weekNumber || "1"))
        .single();

      if (weekError) throw weekError;
      setWeek(weekData);

      // Get exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercises")
        .select("*")
        .eq("week_id", weekData.id)
        .order("title");

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData || []);

      // Get or create progress
      let { data: progressData, error: progressError } = await supabase
        .from("patient_week_progress")
        .select("*")
        .eq("patient_id", patientData.id)
        .eq("week_id", weekData.id)
        .maybeSingle();

      if (!progressData && !progressError) {
        // Create progress entry
        const { data: newProgress, error: createError } = await supabase
          .from("patient_week_progress")
          .insert({
            patient_id: patientData.id,
            week_id: weekData.id,
            status: "open",
          })
          .select()
          .single();

        if (createError) throw createError;
        progressData = newProgress;
      }

      setProgress(progressData);
      if (progressData) {
        setBoltScore(progressData.bolt_score?.toString() || "");
        setNasalPct(progressData.nasal_breathing_pct?.toString() || "");
        setTonguePct(progressData.tongue_on_spot_pct?.toString() || "");
      }

      // Get messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*, therapist:therapist_id(name)")
        .eq("patient_id", patientData.id)
        .eq("week_id", weekData.id)
        .order("created_at", { ascending: true });

      setMessages(messagesData || []);
    } catch (error: any) {
      console.error("Error loading week data:", error);
      toast({
        title: "Error",
        description: "Failed to load week data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!progress) return;

    try {
      const { error } = await supabase
        .from("patient_week_progress")
        .update({
          bolt_score: boltScore ? parseInt(boltScore) : null,
          nasal_breathing_pct: nasalPct ? parseInt(nasalPct) : null,
          tongue_on_spot_pct: tonguePct ? parseInt(tonguePct) : null,
        })
        .eq("id", progress.id);

      if (error) throw error;

      toast({
        title: "Progress saved!",
        description: "Your progress has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canSubmit = async () => {
    if (!patient || !week || !progress) return false;

    // Call server-side validation
    const { data, error } = await supabase.rpc('calc_week_progress', {
      _patient_id: patient.id,
      _week_id: week.id
    });

    if (error) {
      console.error('Progress calculation error:', error);
      return false;
    }

    // Check if 100% complete
    const progressData = data as { percent_complete: number; missing: string[] };
    const isComplete = progressData?.percent_complete === 100;
    
    // Check if already submitted or approved
    const notYetReviewed = progress?.status === "open" || progress?.status === "needs_more";
    
    return isComplete && notYetReviewed;
  };

  const handleSubmitForReview = async () => {
    if (!progress || !patient) return;

    const canSubmitNow = await canSubmit();
    if (!canSubmitNow) {
      // Get missing items
      const { data } = await supabase.rpc('calc_week_progress', {
        _patient_id: patient.id,
        _week_id: week.id
      });

      const progressData = data as { missing: string[] };
      const missing = progressData?.missing || ['Unknown requirements'];
      
      toast({
        title: "Incomplete Data",
        description: `Missing: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Save current data first
      await handleSaveProgress();

      // Then submit for review
      const { error } = await supabase
        .from("patient_week_progress")
        .update({
          status: "submitted",
          completed_at: new Date().toISOString(),
        })
        .eq("id", progress.id);

      if (error) throw error;

      // Log event
      await supabase.from("events").insert({
        patient_id: patient.id,
        type: "submitted_week",
        meta: {
          week_number: parseInt(weekNumber || "1"),
          timestamp: new Date().toISOString(),
        },
      });

      // Notify therapist
      if (patient.assigned_therapist_id) {
        const { data: therapist } = await supabase
          .from("users")
          .select("email, name")
          .eq("id", patient.assigned_therapist_id)
          .single();

        if (therapist) {
          await notifyTherapistSubmission(
            therapist.email,
            therapist.name || "Therapist",
            patient.user?.name || "Patient",
            patient.id,
            parseInt(weekNumber || "1")
          );
        }
      }

      toast({
        title: "Submitted for review!",
        description: "Your therapist will review your progress soon.",
      });

      navigate("/patient");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !patient || !week) return;

    try {
      const { error } = await supabase.from("messages").insert({
        patient_id: patient.id,
        week_id: week.id,
        therapist_id: patient.assigned_therapist_id,
        body: newMessage,
      });

      if (error) throw error;

      setNewMessage("");
      loadWeekData();

      toast({
        title: "Message sent!",
        description: "Your therapist will respond soon.",
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
          <p className="text-muted-foreground">Loading week details...</p>
        </div>
      </div>
    );
  }

  const getExerciseIcon = (type: string) => {
    const icons: Record<string, string> = {
      active: "🏃",
      passive: "🧘",
      breathing: "💨",
      posture: "🧍",
      test: "📊",
    };
    return icons[type] || "📝";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-3">
            <ArrowLeft className="mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Week {weekNumber}</h1>
              <p className="text-muted-foreground">{week?.title}</p>
            </div>
            {progress && (
              <Badge
                variant="outline"
                className={
                  progress.status === "approved"
                    ? "bg-success/10 text-success border-success/20"
                    : progress.status === "submitted"
                    ? "bg-warning/10 text-warning border-warning/20"
                    : "bg-primary/10 text-primary border-primary/20"
                }
              >
                {progress.status}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exercises */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Exercises</CardTitle>
                <CardDescription>Complete each exercise as instructed</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {exercises.map((exercise, idx) => (
                    <AccordionItem key={exercise.id} value={`exercise-${idx}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <span className="text-2xl">{getExerciseIcon(exercise.type)}</span>
                          <div>
                            <p className="font-semibold">{exercise.title}</p>
                            <p className="text-sm text-muted-foreground capitalize">{exercise.type} Exercise</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-3">
                        {exercise.instructions && (
                          <div>
                            <h4 className="font-medium mb-1">Instructions:</h4>
                            <p className="text-muted-foreground">{exercise.instructions}</p>
                          </div>
                        )}
                        {exercise.props && (
                          <div>
                            <h4 className="font-medium mb-1">Props needed:</h4>
                            <p className="text-muted-foreground">{exercise.props}</p>
                          </div>
                        )}
                        {exercise.compensations && (
                          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                            <h4 className="font-medium text-warning flex items-center gap-2 mb-1">
                              <AlertCircle className="w-4 h-4" />
                              Watch for compensations:
                            </h4>
                            <p className="text-sm">{exercise.compensations}</p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Checklist & Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Week Progress</CardTitle>
                <CardDescription>Track your daily practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {week?.requires_bolt && (
                    <div className="space-y-2">
                      <Label htmlFor="bolt">BOLT Score (seconds)</Label>
                      <Input
                        id="bolt"
                        type="number"
                        value={boltScore}
                        onChange={(e) => setBoltScore(e.target.value)}
                        placeholder="Enter your BOLT score"
                        disabled={progress?.status === "submitted" || progress?.status === "approved"}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="nasal">% Time Nasal Breathing</Label>
                    <Input
                      id="nasal"
                      type="number"
                      min="0"
                      max="100"
                      value={nasalPct}
                      onChange={(e) => setNasalPct(e.target.value)}
                      placeholder="0-100%"
                      disabled={progress?.status === "submitted" || progress?.status === "approved"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tongue">% Time Tongue on Spot</Label>
                    <Input
                      id="tongue"
                      type="number"
                      min="0"
                      max="100"
                      value={tonguePct}
                      onChange={(e) => setTonguePct(e.target.value)}
                      placeholder="0-100%"
                      disabled={progress?.status === "submitted" || progress?.status === "approved"}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleSaveProgress}
                    disabled={progress?.status === "submitted" || progress?.status === "approved"}
                    className="flex-1"
                  >
                    Save Progress
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleSubmitForReview}
                    disabled={!canSubmit()}
                    className="flex-1"
                  >
                    <CheckCircle2 className="mr-2" />
                    Submit for Review
                  </Button>
                </div>

                {!canSubmit() && progress?.status !== "submitted" && progress?.status !== "approved" && (
                  <div className="text-xs text-muted-foreground text-center bg-warning/10 border border-warning/20 rounded p-2">
                    Complete all required fields to submit for review
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Messages */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Chat with your therapist</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No messages yet. Start a conversation!
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.therapist_id ? "bg-accent" : "bg-primary/10"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {msg.therapist_id ? msg.therapist?.name || "Therapist" : "You"}
                        </p>
                        <p className="text-sm">{msg.body}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    disabled={progress?.status === "approved"}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || progress?.status === "approved"}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WeekDetail;
