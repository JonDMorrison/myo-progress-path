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
import { isFrenectomyVariant } from "@/lib/constants";

interface ProgramCompletionModalProps {
  open: boolean;
  onClose: () => void;
  completionNote?: string | null;
  therapistName?: string | null;
  programVariant?: string | null;
}

export const ProgramCompletionModal = ({
  open,
  onClose,
  completionNote,
  therapistName,
  programVariant
}: ProgramCompletionModalProps) => {
  const isFrenectomyPathway = isFrenectomyVariant(programVariant);
  useEffect(() => {
    if (open) {
      // Trigger confetti celebration
      const duration = 5000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
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
              You've Completed Your 12 Module Myofunctional Therapy Program!
            </p>

            <p>
              By completing this program you should notice improvements in your mouth breathing,
              tongue posture, lip seal, and swallowing. You may also experience less facial/TMD
              pain and headaches, less clenching and grinding, improved sleep quality, improved
              sleep apnea scores, better digestion and reduced allergy symptoms. Look back and
              review how far you have come by reviewing your first and last BOLT scores and
              module progress charts.
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

            {/* Moving Forward Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Moving Forward
              </h3>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
                <h4 className="text-xl font-bold text-primary mb-3">Post Program Review And Maintenance</h4>
                <p className="text-sm leading-relaxed italic">
                  Congratulations on reaching this milestone. Maintenance is key to ensuring your results last a lifetime.
                  Continue to monitor your habits and revisit your favorite exercises periodically to keep your muscles toned and your breathing optimal.
                </p>
              </div>

              <p>
                Moving forward you should no longer need to continue practicing exercises as long
                as you continue to accomplish each of the four goals. You will want to ensure you
                are nasal breathing and have the correct tongue posture <strong>95+% of the time</strong>.
              </p>

              <div className="grid gap-4">
                {/* Eating Guidelines */}
                <Card className="border-success/30 bg-success/5">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-success">While Eating</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Continue to chew with your mouth closed, avoid overly large bites,
                          and chew thoroughly using the teeth while avoiding mashing or sucking
                          on food with the tongue.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Swallowing Guidelines */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Repeat className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-primary">When Swallowing</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ensure the tongue is on the spot when swallowing and not pushing
                          forward into the teeth (tongue thrust). Facial grimace should be
                          avoided and muscles should always be relaxed while swallowing.
                          The same rules apply when drinking with the addition of ensuring
                          you are swallowing quietly.
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
                          sleep, exercise, and stress. If symptoms return or you find yourself
                          reverting to old patterns, revisit key exercises from your program.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Four Goals Quick Reference */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">The Four Goals to Maintain</h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👃</span>
                    <span>Nasal breathing 95+%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👅</span>
                    <span>Correct tongue posture</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👄</span>
                    <span>Lips sealed at rest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <span>Correct swallowing pattern</span>
                  </div>
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
