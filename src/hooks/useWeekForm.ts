import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WeekFormData {
  boltScore: string;
  nasalPct: string;
  tonguePct: string;
}

interface UseWeekFormOptions {
  readOnly?: boolean;
  onSaveComplete?: () => void;
  patientId?: string;
  weekId?: string;
}

export function useWeekForm(
  progressId: string,
  initialData: WeekFormData,
  options: UseWeekFormOptions | boolean = false
) {
  // Handle legacy boolean parameter for backwards compatibility
  const {
    readOnly = false,
    onSaveComplete,
    patientId,
    weekId,
  } = typeof options === 'boolean'
    ? { readOnly: options, onSaveComplete: undefined, patientId: undefined, weekId: undefined }
    : options;

  const [formData, setFormData] = useState<WeekFormData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save after 1 second of inactivity (reduced from 3s for better UX)
  const debouncedSave = useDebouncedCallback(async (data: WeekFormData) => {
    if (readOnly) return;

    const payload = {
      bolt_score: data.boltScore ? parseInt(data.boltScore) : null,
      nasal_breathing_pct: data.nasalPct ? parseInt(data.nasalPct) : null,
      tongue_on_spot_pct: data.tonguePct ? parseInt(data.tonguePct) : null,
    };

    setIsSaving(true);
    try {
      let error = null;

      if (patientId && weekId) {
        const result = await supabase
          .from('patient_week_progress')
          .upsert(
            {
              patient_id: patientId,
              week_id: weekId,
              ...payload,
            },
            { onConflict: 'patient_id,week_id' }
          );
        error = result.error;
      } else {
        const result = await supabase
          .from('patient_week_progress')
          .update(payload)
          .eq('id', progressId);
        error = result.error;
      }

      if (error) throw error;

      setLastSaved(new Date());

      // Also save to localStorage as backup
      localStorage.setItem(`week_draft_${progressId}`, JSON.stringify(data));

      // Notify parent component that save is complete to refresh submission status
      onSaveComplete?.();
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Failed to auto-save progress');
    } finally {
      setIsSaving(false);
    }
  }, 1000);

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
