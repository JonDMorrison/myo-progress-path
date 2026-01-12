import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WeekFormData {
  boltScore: string;
  nasalPct: string;
  tonguePct: string;
}

export function useWeekForm(progressId: string, initialData: WeekFormData, readOnly: boolean = false) {
  const [formData, setFormData] = useState<WeekFormData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save after 3 seconds of inactivity (disabled in read-only mode)
  const debouncedSave = useDebouncedCallback(async (data: WeekFormData) => {
    if (readOnly) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patient_week_progress')
        .update({
          bolt_score: data.boltScore ? parseInt(data.boltScore) : null,
          nasal_breathing_pct: data.nasalPct ? parseInt(data.nasalPct) : null,
          tongue_on_spot_pct: data.tonguePct ? parseInt(data.tonguePct) : null,
        })
        .eq('id', progressId);

      if (error) throw error;

      setLastSaved(new Date());

      // Also save to localStorage as backup
      localStorage.setItem(`week_draft_${progressId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Failed to auto-save progress');
    } finally {
      setIsSaving(false);
    }
  }, 3000);

  const updateField = useCallback((field: keyof WeekFormData, value: string) => {
    if (readOnly) return;
    
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    debouncedSave(newData);
  }, [formData, debouncedSave, readOnly]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(`week_draft_${progressId}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData({ ...initialData, ...parsed });
      } catch (error) {
        console.error('Failed to parse draft:', error);
      }
    }
  }, [progressId]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`week_draft_${progressId}`);
  }, [progressId]);

  return {
    formData,
    updateField,
    isSaving,
    lastSaved,
    clearDraft
  };
}
