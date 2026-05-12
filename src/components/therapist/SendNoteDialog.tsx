import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";

interface SendNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  weekNumber: number | null;
  onSend: (note: string) => Promise<void>;
}

const SendNoteDialog = ({
  open,
  onOpenChange,
  patientName,
  weekNumber,
  onSend,
}: SendNoteDialogProps) => {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!note.trim()) return;
    
    setSending(true);
    try {
      await onSend(note);
      setNote("");
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Note</DialogTitle>
          <DialogDescription>
            {weekNumber
              ? `Send a note to ${patientName} for Module ${Math.ceil(weekNumber / 2)}`
              : `Send a note to ${patientName}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Message</Label>
            <Textarea
              id="note"
              placeholder="Type your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!note.trim() || sending}>
            {sending && <Loader className="h-4 w-4 animate-spin mr-2" />}
            Send Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendNoteDialog;
