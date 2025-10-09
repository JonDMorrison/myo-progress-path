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
              <ul className="list-disc pl-5 space-y-2">
                <li>Rub the sides of your nose, cheeks, and above eyebrows.</li>
                <li>Blow instead of sniffle when your nose runs.</li>
                <li>Continue until congestion eases.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-lg mb-3">Exercise 2 – Breath-Hold Reset</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Take 3 normal breaths, in and out naturally.</li>
                <li>After the 3rd exhale, pinch your nose and hold your breath.</li>
                <li>Optional: gently nod your head up and down or side to side.</li>
                <li>Hold until you feel a mild air hunger, then inhale through your nose.</li>
                <li>Repeat 3–5 times as needed.</li>
              </ol>
            </section>

            <p className="text-sm text-muted-foreground border-t pt-4">
              * The more you breathe through your nose, the less congested you'll be.
            </p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
