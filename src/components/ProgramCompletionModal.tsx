import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Award, Heart, Eye, Repeat } from "lucide-react";
import confetti from "canvas-confetti";

interface ProgramCompletionModalProps {
  open: boolean;
  onClose: () => void;
  completionNote?: string | null;
  therapistName?: string | null;
}

export const ProgramCompletionModal = ({ 
  open, 
  onClose,
  completionNote,
  therapistName 
}: ProgramCompletionModalProps) => {
  useEffect(() => {
    if (open) {
      // Trigger confetti celebration
      const duration = 5000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center mb-4 flex items-center justify-center gap-2">
            <span className="text-5xl">🏆</span>
            <span>Congratulations!</span>
            <span className="text-5xl">🎉</span>
          </DialogTitle>
          <DialogDescription className="text-base space-y-4 text-foreground">
            <p className="text-xl font-semibold text-center text-primary">
              You've Completed Your Myofunctional Therapy Program!
            </p>
            
            <p>
              By completing this program you should notice improvements in your mouth breathing, 
              tongue posture, lip seal, and swallowing. You may also experience less facial/TMD 
              pain and headaches, less clenching and grinding, improved sleep quality, improved 
              sleep apnea scores, better digestion and reduced allergy symptoms.
            </p>

            {/* Therapist Personalized Note */}
            {completionNote && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary mb-2">
                        A Personal Note from {therapistName || 'Your Therapist'}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{completionNote}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className="my-4" />

            {/* Key Maintenance Principles */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Your Long-Term Success Plan
              </h3>
              
              <div className="grid gap-4">
                {/* Habit Awareness */}
                <Card className="border-success/30 bg-success/5">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-success">Habit Awareness</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your new habits should now feel natural. Be mindful of nasal breathing 
                          and tongue posture throughout the day. If you catch yourself reverting 
                          to old patterns, gently redirect without stress.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Long-term Carryover */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Repeat className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-primary">Long-Term Carryover</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aim for <strong>95%+ consistency</strong> with nasal breathing and 
                          correct tongue posture. No formal exercises needed anymore—just 
                          maintain these healthy patterns as your new normal.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Self-Monitoring */}
                <Card className="border-warning/30 bg-warning/5">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-warning">Self-Monitoring</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Check in with yourself periodically. Notice how you breathe during 
                          sleep, exercise, and stress. Review your first and last BOLT scores 
                          to appreciate your progress. If symptoms return, revisit key exercises.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Daily Reminders */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Daily Life Reminders</h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium mb-1">While eating:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Chew with mouth closed</li>
                    <li>Take smaller bites</li>
                    <li>Chew thoroughly with teeth</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">When swallowing:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Keep tongue on the spot</li>
                    <li>Keep face muscles relaxed</li>
                    <li>Swallow quietly</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-center text-lg font-medium text-primary mt-6">
              You've earned the "Program Champion" badge! 🏆
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button onClick={onClose} size="lg" className="px-8">
            Continue to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
