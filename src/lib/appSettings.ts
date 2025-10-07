import { supabase } from "@/integrations/supabase/client";

export interface AppFeatures {
  premium_video: boolean;
}

let cachedFeatures: AppFeatures | null = null;

export async function getAppFeatures(): Promise<AppFeatures> {
  if (cachedFeatures) {
    return cachedFeatures;
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "features")
    .single();

  if (error || !data) {
    console.error("Failed to load app features:", error);
    return { premium_video: false };
  }

  cachedFeatures = data.value as unknown as AppFeatures;
  return cachedFeatures;
}

export async function updateAppFeatures(features: Partial<AppFeatures>): Promise<boolean> {
  const current = await getAppFeatures();
  const updated = { ...current, ...features };

  const { error } = await supabase
    .from("app_settings")
    .update({ value: updated, updated_at: new Date().toISOString() })
    .eq("key", "features");

  if (error) {
    console.error("Failed to update features:", error);
    return false;
  }

  cachedFeatures = updated;
  return true;
}

export function clearFeaturesCache() {
  cachedFeatures = null;
}
