import { Button } from "@/components/ui/button";

interface SubmitBarProps {
  onComplete: () => void;
  canSubmit?: boolean;
  loading?: boolean;
}

export function SubmitBar({ onComplete, canSubmit = true, loading = false }: SubmitBarProps) {
  return (
    <div className="fixed bottom-16 sm:bottom-4 inset-x-0 z-30">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-2xl border bg-card/95 backdrop-blur-sm shadow-lg p-3 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onComplete}
            disabled={!canSubmit || loading}
            className="flex-1 h-11 rounded-xl shadow-sm"
            size="lg"
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
