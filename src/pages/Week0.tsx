import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingQuiz } from "@/components/quiz/OnboardingQuiz";
import { BookOpen, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Week0() {
  const [quizCompleted, setQuizCompleted] = useState(false);
  const navigate = useNavigate();

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (patient) {
        await supabase.from("onboarding_progress").upsert({
          patient_id: patient.id,
          completed_steps: ["week0"],
          completed_at: new Date().toISOString()
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Start Here: Introduction to Myofunctional Therapy</h1>
          <p className="text-lg text-muted-foreground">Learn the fundamentals before beginning Week 1</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-8">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                What is Myofunctional Therapy?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Myofunctional therapy retrains the muscles of your mouth, tongue, and face to work properly for breathing, swallowing, and resting positions.</p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/learn/intro-to-myofunctional-therapy")}>
                Read Full Introduction
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Four Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="space-y-1">
                <li>• Nasal Breathing</li>
                <li>• Lip Seal</li>
                <li>• Proper Chewing & Swallowing</li>
                <li>• Tongue Posture on "The Spot"</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate("/learn/four-goals")}>
                Learn About the Four Goals
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl mb-8">
          <CardHeader>
            <CardTitle>Expectations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Practice twice daily:</strong> Each session takes 10-15 minutes</p>
            <p><strong>Quality over quantity:</strong> Focus on proper form, use a mirror</p>
            <p><strong>Two-week rule:</strong> If you pause for more than 2 weeks, repeat the previous week</p>
            <Button variant="outline" onClick={() => navigate("/learn/expectations")}>Read Full Expectations</Button>
          </CardContent>
        </Card>

        <OnboardingQuiz onComplete={handleQuizComplete} />

        <Card className="rounded-2xl mt-8">
          <CardHeader>
            <CardTitle>Program Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Daily Format</h3>
              <p className="text-muted-foreground">
                Each day includes <strong>3 active exercises</strong>, <strong>1 passive exercise</strong>, and <strong>1 breathing/posture exercise</strong> (some weeks may vary).
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Use a Mirror</h3>
              <p className="text-muted-foreground">
                Active exercises require a mirror to ensure proper form and minimize compensations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Supporting Materials</h3>
              <p className="text-muted-foreground">
                Videos and photos guide each exercise. Charts help track your nasal breathing % and tongue-on-spot %.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/learn/program-specifics")}>
              <BookOpen className="w-4 h-4 mr-2" />
              Read Full Program Specifics
            </Button>
          </CardContent>
        </Card>

        {quizCompleted && (
          <div className="mt-8 text-center">
            <Button size="lg" onClick={() => navigate("/week/1")}>
              Go to Week 1
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
