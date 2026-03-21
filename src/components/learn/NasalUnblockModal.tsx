import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NasalUnblockModal() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="rounded-xl border px-4 py-2 shadow-sm hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2">
          I'm Congested
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-xl">Nasal Unblocking Exercises</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">

            <section>
              <h3 className="font-semibold text-lg mb-3">Exercise 1 – Sinus Massage</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Rub the sides of your nose, cheeks, and above eyebrows.</li>
                  <li>Blow instead of sniffle when your nose runs.</li>
                  <li>Continue until congestion eases.</li>
                </ul>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src="https://player.vimeo.com/video/1143179571?badge=0&autopause=0&player_id=0&app_id=58479"
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    title="Sinus Massage"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">Exercise 2 – Breath-Hold Reset</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Take 3 normal breaths, in and out naturally.</li>
                  <li>After the 3rd exhale, pinch your nose and hold your breath.</li>
                  <li>Gently nod your head up and down or side to side.</li>
                  <li>Hold until you feel a mild air hunger, then inhale through your nose.</li>
                  <li>Repeat 3–5 times as needed.</li>
                </ol>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src="https://player.vimeo.com/video/1143179656?badge=0&autopause=0&player_id=0&app_id=58479"
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    title="Breath-Hold Reset"
                  />
                </div>
              </div>
            </section>

            <section className="bg-rose-50 dark:bg-rose-950/20 rounded-[2rem] p-8 border border-rose-100 dark:border-rose-900/30">
              <h3 className="font-bold text-rose-900 dark:text-rose-100 text-lg mb-3">⚠️ Medical Advisory</h3>
              <p className="text-sm text-rose-800 dark:text-rose-200 mb-4 leading-relaxed">
                If you have constant, severe nasal obstruction that does not respond to these exercises, you may require a medical evaluation. Please consult your physician or an ENT specialist if you experience:
              </p>
              <ul className="list-disc pl-5 text-sm text-rose-700 dark:text-rose-300 space-y-2 font-medium">
                <li>Chronic one-sided obstruction (difficulty breathing through only one nostril)</li>
                <li>Nasal polyps or significant deviated septum</li>
                <li>Persistent facial pain or pressure</li>
                <li>Difficulty breathing through your nose during sleep (even with mouth tape)</li>
              </ul>
            </section>

            <div className="text-sm text-muted-foreground border-t pt-6 space-y-3 px-2">
              <p className="font-medium">• The more you breathe through your nose, the less congested you will be. Mouth breathing causes over breathing which forces the body to produce more congestion to try to reduce your breathing.</p>
              <p className="font-medium">• These exercises will be very helpful for the duration of your program, it is important to use as needed to encourage nasal breathing at all times, even when sick or suffering from allergies.</p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
