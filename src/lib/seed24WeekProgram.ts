import { supabase } from "@/integrations/supabase/client";

interface Exercise {
  name: string;
  description: string;
}

interface WeekData {
  week: number;
  title: string;
  introduction: string;
  overview: string;
  objectives: string[];
  video_title?: string;
  video_url?: string;
  exercises: Exercise[];
  tracking: {
    nasal_breathing_percent?: boolean;
    BOLT_score?: boolean;
  };
  requires_video_first?: boolean;
  requires_video_last?: boolean;
}

export async function seed24WeekProgram(
  programId: string,
  weeksData: WeekData[]
): Promise<{
  success: boolean;
  weeksUpdated: number;
  exercisesCreated: number;
  error?: string;
}> {
  try {
    let weeksUpdated = 0;
    let exercisesCreated = 0;

    for (const weekData of weeksData) {
      // Upsert week by program_id + number
      const { data: week, error: weekError } = await supabase
        .from("weeks")
        .upsert(
          {
            program_id: programId,
            number: weekData.week,
            title: weekData.title,
            introduction: weekData.introduction,
            overview: weekData.overview,
            objectives: weekData.objectives,
            video_title: weekData.video_title || null,
            video_url: weekData.video_url || null,
            requires_bolt: weekData.tracking.BOLT_score || false,
            requires_video_first: weekData.requires_video_first || false,
            requires_video_last: weekData.requires_video_last || false,
            checklist_schema: [
              ...(weekData.tracking.nasal_breathing_percent ? ["% Time Nasal Breathing"] : []),
              ...(weekData.tracking.BOLT_score ? ["BOLT Score"] : []),
            ],
          },
          {
            onConflict: "program_id,number",
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (weekError) {
        console.error(`Week ${weekData.week} upsert error:`, weekError);
        continue;
      }

      weeksUpdated++;

      // Delete existing exercises for this week to avoid duplicates
      await supabase.from("exercises").delete().eq("week_id", week.id);

      // Insert exercises
      for (const exercise of weekData.exercises) {
        const { error: exerciseError } = await supabase
          .from("exercises")
          .insert({
            week_id: week.id,
            title: exercise.name,
            type: "active", // Default type for these exercises
            instructions: exercise.description,
            props: "",
            compensations: "",
            demo_video_url: "",
          });

        if (!exerciseError) {
          exercisesCreated++;
        }
      }
    }

    return {
      success: true,
      weeksUpdated,
      exercisesCreated,
    };
  } catch (error: any) {
    console.error("Seed error:", error);
    return {
      success: false,
      weeksUpdated: 0,
      exercisesCreated: 0,
      error: error.message,
    };
  }
}
