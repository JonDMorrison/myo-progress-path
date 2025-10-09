import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wind } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NasalUnblockModalProps {
  trigger?: React.ReactNode;
}

export function NasalUnblockModal({ trigger }: NasalUnblockModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Wind className="w-4 h-4 mr-2" />
            I'm Congested
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nasal Unblocking Quick Help</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-6">
            <p className="text-muted-foreground">
              If a plugged nose is preventing nasal breathing, use these exercises:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-card">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                  Sinus Massage
                </h3>
                <ul className="space-y-2 text-sm ml-8">
                  <li>• Rub along the <strong>sides of nose</strong>, <strong>cheeks</strong> beside the nose, and <strong>above eyebrows</strong>.</li>
                  <li>• If your nose gets runny, <strong>blow</strong> (don't sniffle).</li>
                  <li>• Continue until congestion eases.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border bg-card">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                  Breath-Hold Reset
                </h3>
                <ol className="space-y-2 text-sm ml-8 list-decimal">
                  <li>Take <strong>3 normal breaths</strong>, in/out naturally.</li>
                  <li>After the 3rd exhale, <strong>pinch your nose</strong> and hold your breath.</li>
                  <li>Optional: gently <strong>nod</strong> head up/down or side/side.</li>
                  <li>Hold until you feel a <strong>mild air hunger</strong>.</li>
                  <li><strong>Mouth closed</strong>, inhale <strong>through your nose</strong>; keep nose breathing as it normalizes.</li>
                  <li>Repeat <strong>3–5 times</strong> as needed.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <h4 className="font-semibold text-sm mb-2">Tips</h4>
                <ul className="space-y-1 text-sm">
                  <li>• If only one nostril is blocked, <strong>cover the clear side</strong> and breathe through the blocked nostril to open it.</li>
                  <li>• Don't talk/laugh or mouth-breathe during the drill—it slows results.</li>
                  <li>• If no air passes initially, do Exercise 1 first or use a small amount of nasal spray.</li>
                </ul>
                <p className="mt-3 text-sm italic">
                  💡 The more you breathe through your nose, the <strong>less congested</strong> you'll be.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function NasalUnblockLink() {
  return (
    <NasalUnblockModal
      trigger={
        <button className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          <Wind className="w-3 h-3" />
          Nasal unblocking exercises
        </button>
      }
    />
  );
}
