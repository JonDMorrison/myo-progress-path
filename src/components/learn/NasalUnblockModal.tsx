import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function NasalUnblockModal() {
  const [open, setOpen] = useState(false);

  // Allow Escape key to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border px-4 py-2 shadow-sm hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        I'm Congested
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Nasal Unblocking Exercises
            </h2>

            <div className="space-y-4 text-sm leading-relaxed">
              <section>
                <strong>Exercise 1 – Sinus Massage</strong>
                <ul className="list-disc pl-5 mt-1">
                  <li>Rub the sides of your nose, cheeks, and above eyebrows.</li>
                  <li>Blow instead of sniffle when your nose runs.</li>
                  <li>Continue until congestion eases.</li>
                </ul>
              </section>

              <section>
                <strong>Exercise 2 – Breath-Hold Reset</strong>
                <ol className="list-decimal pl-5 mt-1">
                  <li>Take 3 normal breaths, in and out naturally.</li>
                  <li>After the 3rd exhale, pinch your nose and hold your breath.</li>
                  <li>Optional: gently nod your head up and down or side to side.</li>
                  <li>Hold until you feel a mild air hunger, then inhale through your nose.</li>
                  <li>Repeat 3–5 times as needed.</li>
                </ol>
              </section>
            </div>

            <p className="mt-4 text-xs opacity-70">
              * The more you breathe through your nose, the less congested you'll be.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
