import { supabase } from "@/integrations/supabase/client";

interface Exercise {
  number?: number;
  title: string;
  type: string;
  instructions?: string;
  props?: string;
  compensations?: string;
  demo_video_url?: string;
}

interface Week {
  week_start: number;
  week_end: number;
  exercises: Exercise[];
  checklist?: {
    items: string[];
  };
}

interface ProgramJSON {
  program: string;
  weeks: Week[];
}

const DEFAULT_CHECKLIST = [
  "Each active exercise 28 times",
  "Passive 14 times",
  "Breathing 14 times",
  "% Time Nasal Breathing",
  "% Time Tongue on Spot"
];

export async function importProgram(jsonData: ProgramJSON): Promise<{
  success: boolean;
  weeksCreated: number;
  exercisesCreated: number;
  error?: string;
}> {
  try {
    // Validate JSON structure
    if (!jsonData.program || !jsonData.weeks || !Array.isArray(jsonData.weeks)) {
      return { success: false, weeksCreated: 0, exercisesCreated: 0, error: "Invalid JSON structure" };
    }

    // Create program
    const { data: program, error: programError } = await supabase
      .from("programs")
      .insert({
        title: jsonData.program,
        description: "Imported 24-week myofunctional therapy program",
        weeks_count: 24,
      })
      .select()
      .single();

    if (programError) {
      console.error("Program insert error:", programError);
      return { success: false, weeksCreated: 0, exercisesCreated: 0, error: programError.message };
    }

    let totalExercises = 0;
    let weekNumber = 1;

    // Import weeks and exercises
    for (const weekData of jsonData.weeks) {
      // Create week
      const weekTitle = weekData.week_start === weekData.week_end
        ? `Week ${weekData.week_start}`
        : `Weeks ${weekData.week_start}-${weekData.week_end}`;

      const checklistItems = weekData.checklist?.items || DEFAULT_CHECKLIST;

      const { data: week, error: weekError } = await supabase
        .from("weeks")
        .insert({
          program_id: program.id,
          number: weekNumber,
          title: weekTitle,
          requires_bolt: weekNumber === 1,
          requires_video_first: false,
          requires_video_last: false,
          checklist_schema: checklistItems,
        })
        .select()
        .single();

      if (weekError) {
        console.error("Week insert error:", weekError);
        continue;
      }

      // Map exercise type
      const mapExerciseType = (type: string): string => {
        const normalized = type.toLowerCase();
        if (normalized.includes("active")) return "active";
        if (normalized.includes("passive")) return "passive";
        if (normalized.includes("breath")) return "breathing";
        if (normalized.includes("posture")) return "posture";
        if (normalized.includes("test") || normalized.includes("bolt")) return "test";
        return "active";
      };

      // Create exercises
      for (const exercise of weekData.exercises) {
        const { error: exerciseError } = await supabase
          .from("exercises")
          .insert([{
            week_id: week.id,
            title: exercise.title,
            type: mapExerciseType(exercise.type) as "active" | "passive" | "breathing" | "posture" | "test",
            instructions: exercise.instructions || "",
            props: exercise.props || "",
            compensations: exercise.compensations || "",
            demo_video_url: exercise.demo_video_url || "",
          }]);

        if (!exerciseError) {
          totalExercises++;
        }
      }

      weekNumber++;
    }

    return {
      success: true,
      weeksCreated: jsonData.weeks.length,
      exercisesCreated: totalExercises,
    };
  } catch (error: any) {
    console.error("Import error:", error);
    return {
      success: false,
      weeksCreated: 0,
      exercisesCreated: 0,
      error: error.message,
    };
  }
}
