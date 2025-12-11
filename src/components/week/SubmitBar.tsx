import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  onComplete: () => void;
  canSubmit?: boolean;
  loading?: boolean;
}

export function SubmitButton({ 
  onComplete, 
  canSubmit = true, 
  loading = false,
}: SubmitButtonProps) {
  return (
    <Button
      onClick={onComplete}
      disabled={!canSubmit || loading}
      className="rounded-xl shadow-sm"
      size="default"
    >
      {loading ? "Submitting..." : "Submit for Review"}
    </Button>
  );
}
