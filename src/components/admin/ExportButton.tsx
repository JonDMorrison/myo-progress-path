import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onExport: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function ExportButton({ onExport, loading = false, disabled = false }: ExportButtonProps) {
  return (
    <Button
      onClick={onExport}
      disabled={disabled || loading}
      variant="outline"
      className="gap-2 rounded-xl"
    >
      <Download className="h-4 w-4" />
      {loading ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
