import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface SessionTimeoutWarningProps {
  open: boolean;
  remainingSeconds: number;
  onContinue: () => void;
}

export function SessionTimeoutWarning({
  open,
  remainingSeconds,
  onContinue
}: SessionTimeoutWarningProps) {
  const minutes = Math.floor(remainingSeconds / 60000);
  const seconds = Math.floor((remainingSeconds % 60000) / 1000);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            <AlertDialogTitle>Session Timeout Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Your session will expire due to inactivity in{" "}
            <span className="font-semibold text-warning">
              {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
            </span>
            .
            <br />
            <br />
            Please click "Continue Session" to remain logged in, or you will be
            automatically logged out for security.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onContinue}>
            Continue Session
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
