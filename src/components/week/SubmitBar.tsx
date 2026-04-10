import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight, Lock } from "lucide-react";

interface SubmitButtonProps {
  onComplete: () => void;
  canSubmit?: boolean;
  loading?: boolean;
}

export function SubmitButton({
  onComplete,
  canSubmit = false,
  loading = false,
}: SubmitButtonProps) {
  return (
    <div className="pt-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-1000 fill-mode-both">
      <div className={cn(
        "rounded-[3rem] p-8 md:p-12 transition-all duration-700",
        canSubmit
          ? "bg-slate-900 shadow-2xl shadow-primary/20 ring-1 ring-white/10"
          : "bg-slate-50 border border-slate-100"
      )}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                canSubmit ? "bg-primary text-white scale-110" : "bg-slate-200 text-slate-400"
              )}>
                {canSubmit ? <CheckCircle2 className="w-5 h-5 animate-pulse" /> : <Lock className="w-5 h-5" />}
              </div>
              <h3 className={cn(
                "text-2xl font-black tracking-tighter italic",
                canSubmit ? "text-white" : "text-slate-400"
              )}>
                {canSubmit ? "READY FOR SHIPMENT" : "TASKS REMAINING"}
              </h3>
            </div>
            <p className={cn(
              "text-sm font-medium leading-relaxed max-w-sm",
              canSubmit ? "text-slate-400" : "text-slate-400"
            )}>
              {canSubmit
                ? "Excellent progress! Your biweekly session data is complete and ready for your therapist's clinical review."
                : "Complete all exercises in Part Two, then record your biometrics (BOLT score, nasal breathing %, tongue on spot %) to submit this module for review."
              }
            </p>
          </div>

          <Button
            onClick={onComplete}
            disabled={!canSubmit || loading}
            className={cn(
              "h-20 px-12 rounded-[2rem] text-xl font-black tracking-tighter transition-all duration-500 min-w-[280px] shadow-2xl relative overflow-hidden group",
              canSubmit
                ? "bg-primary hover:bg-primary-light text-white hover:scale-105 active:scale-95"
                : "bg-slate-200 text-slate-400"
            )}
          >
            {/* Glossy Overlay for Ready State */}
            {canSubmit && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}

            <div className="flex items-center gap-3">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>SYNCINGContent...</span>
                </div>
              ) : (
                <>
                  <span>{canSubmit ? "SUBMIT FOR REVIEW" : "LOCKED"}</span>
                  <ChevronRight className={cn("w-6 h-6 transition-transform group-hover:translate-x-1", !canSubmit && "opacity-20")} />
                </>
              )}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
