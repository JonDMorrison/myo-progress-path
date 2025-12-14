import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TherapistAssignmentSelectProps {
  patientId: string;
  currentTherapistId: string | null;
  currentTherapistName: string | null;
  onAssigned?: () => void;
}

interface Therapist {
  id: string;
  name: string | null;
  email: string;
}

export const TherapistAssignmentSelect = ({
  patientId,
  currentTherapistId,
  currentTherapistName,
  onAssigned
}: TherapistAssignmentSelectProps) => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .in('role', ['therapist', 'admin', 'super_admin'])
        .order('name');

      if (error) throw error;
      setTherapists(data || []);
    } catch (error) {
      console.error('Failed to load therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (therapistId: string) => {
    if (therapistId === currentTherapistId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update({ assigned_therapist_id: therapistId === 'unassigned' ? null : therapistId })
        .eq('id', patientId);

      if (error) throw error;
      
      toast.success('Therapist assigned successfully');
      onAssigned?.();
    } catch (error) {
      console.error('Failed to assign therapist:', error);
      toast.error('Failed to assign therapist');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }

  return (
    <Select
      value={currentTherapistId || 'unassigned'}
      onValueChange={handleAssign}
      disabled={saving}
    >
      <SelectTrigger className="w-[180px] h-8 text-xs">
        <SelectValue placeholder="Assign therapist">
          {currentTherapistName || 'Unassigned'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {therapists.map((therapist) => (
          <SelectItem key={therapist.id} value={therapist.id}>
            {therapist.name || therapist.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
