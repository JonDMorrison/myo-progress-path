import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface ProgramCompletionModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProgramCompletionModal = ({ open, onClose }: ProgramCompletionModalProps) => {
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
              You've Completed Your 24-Week Myofunctional Therapy Program!
            </p>
            
            <p>
              By completing this program you should notice improvements in your mouth breathing, tongue posture, lip seal, and swallowing. You may also experience less facial/TMD pain and headaches, less clenching and grinding, improved sleep quality, improved sleep apnea scores, better digestion and reduced allergy symptoms. Look back and review how far you have come by reviewing your first and last BOLT scores and weekly progress charts.
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 my-4">
              <h3 className="font-semibold text-lg mb-3">Moving Forward - Maintenance Guidelines:</h3>
              <p className="mb-3">
                You should no longer need to continue practicing exercises as long as you continue to accomplish each of the four goals. You will want to ensure you are nasal breathing and have the correct tongue posture <strong>95+% of the time</strong>.
              </p>
              
              <div className="space-y-2 text-sm">
                <p><strong>While eating:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Continue to chew with your mouth closed</li>
                  <li>Avoid overly large bites</li>
                  <li>Chew thoroughly using the teeth</li>
                  <li>Avoid mashing or sucking on food with the tongue</li>
                </ul>
                
                <p className="mt-3"><strong>When swallowing:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Keep tongue on the spot (not pushing forward into teeth - tongue thrust)</li>
                  <li>Avoid facial grimace and keep muscles relaxed</li>
                  <li>When drinking, ensure you are swallowing quietly</li>
                </ul>
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