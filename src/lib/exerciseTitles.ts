import { supabase } from "@/integrations/supabase/client";

type TitleMap = Map<string, string>;

export async function buildExerciseTitleMap(opts: {
  weekIds: string[];
  weekNumbers: number[];
  programVariant: string | null | undefined;
}): Promise<TitleMap> {
  const map: TitleMap = new Map();
  const { weekIds, weekNumbers, programVariant } = opts;

  if (weekIds.length > 0) {
    const { data } = await supabase
      .from("exercises")
      .select("id, title")
      .in("week_id", weekIds);
    (data || []).forEach((ex: any) => {
      if (ex?.id && ex?.title) map.set(ex.id, ex.title);
    });
  }

  try {
    const response = await fetch("/24-week-program.json");
    const programData = await response.json();
    const jsonVariant = programVariant === "frenectomy" ? "frenectomy" : "standard";
    const wanted = new Set(weekNumbers);
    (programData as any[])
      .filter((entry) => wanted.has(entry.week) && entry.program_variant === jsonVariant)
      .forEach((entry) => {
        (entry.exercises || []).forEach((ex: any, index: number) => {
          if (ex?.name) map.set(`json-${entry.week}-${index}`, ex.name);
        });
      });
  } catch {
    // JSON fetch failed — resolution falls back to whatever the DB provided
  }

  return map;
}

export function resolveExerciseTitle(
  upload: { exercise_id?: string | null; exercise_key?: string | null },
  titleMap: TitleMap
): string | null {
  if (upload.exercise_id) {
    const t = titleMap.get(upload.exercise_id);
    if (t) return t;
  }
  if (upload.exercise_key) {
    const t = titleMap.get(upload.exercise_key);
    if (t) return t;
  }
  return null;
}
