import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Calendar, Plus } from "lucide-react";

interface MaintenanceAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
  programVariant?: string;
  onAssigned?: () => void;
}

interface Week {
  id: string;
  number: number;
  title: string;
}

export function MaintenanceAssignmentDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  programVariant = "frenectomy",
  onAssigned,
}: MaintenanceAssignmentDialogProps) {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingWeeks, setLoadingWeeks] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadWeeks();
    }
  }, [open, programVariant]);

  const loadWeeks = async () => {
    setLoadingWeeks(true);
    try {
      const programTitle = programVariant === "non_frenectomy"
        ? "Non-Frenectomy Program"
        : "Frenectomy Program";

      const { data, error } = await supabase
        .from("weeks")
        .select("id, number, title, programs!inner(title)")
        .eq("programs.title", programTitle)
        .order("number");

      if (error) throw error;

      // Option B: maintenance assignments are module-level. Filter to odd weeks
      // (the anchor week of each module), so Sam sees one entry per module
      // rather than two. Week 25 (post-program review) is the only odd
      // single-week module; frenectomy weeks 9/10 are each anchors too.
      setWeeks(
        (data || [])
          .filter((w: any) =>
            w.number % 2 === 1 ||
            // Keep frenectomy post-op week 10 as its own module entry too.
            (programVariant !== "non_frenectomy" && w.number === 10)
          )
          .map((w: any) => ({
            id: w.id,
            number: w.number,
            title: w.title || `Module ${Math.ceil(w.number / 2)}`,
          }))
      );
    } catch (error) {
      console.error("Error loading weeks:", error);
    } finally {
      setLoadingWeeks(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedWeekId) {
      toast({
        title: "Select a week",
        description: "Please select a week to assign.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("maintenance_assignments").insert({
        patient_id: patientId,
        week_id: selectedWeekId,
        assigned_by: user.id,
        due_date: dueDate || null,
        notes: notes || null,
        status: "active",
      });

      if (error) throw error;

      // Create notification for patient (Option B: module-only label).
      const selectedWeek = weeks.find(w => w.id === selectedWeekId);
      const moduleNum = selectedWeek ? Math.ceil(selectedWeek.number / 2) : 0;
      const moduleLabel = `Module ${moduleNum}`;
      
      await supabase.from("notifications").insert({
        patient_id: patientId,
        body: `Your therapist assigned ${moduleLabel} for practice${dueDate ? ` (due ${dueDate})` : ""}.${notes ? ` Note: ${notes}` : ""}`,
        read: false,
      });

      toast({
        title: "Assignment created",
        description: `${moduleLabel} has been assigned to ${patientName}.`,
      });

      // Reset form
      setSelectedWeekId("");
      setDueDate("");
      setNotes("");
      onOpenChange(false);
      onAssigned?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Assign Practice Module
          </DialogTitle>
          <DialogDescription>
            Assign a previous module's exercises for {patientName} to practice during maintenance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Week</Label>
            <Select
              value={selectedWeekId}
              onValueChange={setSelectedWeekId}
              disabled={loadingWeeks}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingWeeks ? "Loading modules..." : "Choose a module"} />
              </SelectTrigger>
              <SelectContent>
                {weeks.map((week) => (
                  <SelectItem key={week.id} value={week.id}>
                    Module {Math.ceil(week.number / 2)}: {week.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date (optional)
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes for Patient (optional)</Label>
            <Textarea
              placeholder="E.g., Focus on the suction exercises, or practice these before your next appointment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedWeekId}>
            {loading ? "Assigning..." : "Assign Week"}
            <Plus className="h-4 w-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
