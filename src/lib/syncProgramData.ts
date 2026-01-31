import { supabase } from "@/integrations/supabase/client";

export async function syncProgramData(weeksData: any[]) {
    console.log("Starting sync with", weeksData.length, "weeks of data...");

    const results = {
        weeksSynced: 0,
        exercisesSynced: 0,
        errors: [] as string[]
    };

    // We sync for both variants: 'frenectomy' and 'without_frenectomy'
    const variants = ['frenectomy', 'without_frenectomy'];

    for (const variant of variants) {
        for (const weekData of weeksData) {
            try {
                // 1. Upsert Week
                const { data: week, error: weekError } = await supabase
                    .from('weeks')
                    .upsert({
                        number: weekData.week,
                        title: weekData.title,
                        overview: weekData.overview || weekData.introduction,
                        video_url: weekData.video_url || null,
                        video_title: weekData.video_title || null,
                        objectives: weekData.objectives || [],
                        requires_video_first: weekData.requires_video_first || false,
                        requires_video_last: weekData.requires_video_last || false,
                        requires_bolt: weekData.tracking?.BOLT_score || false,
                        program_variant: variant
                    }, {
                        onConflict: 'number,program_variant'
                    })
                    .select()
                    .single();

                if (weekError) throw weekError;
                results.weeksSynced++;

                // 2. Clear existing exercises for this specific week to ensure clean sync
                await supabase.from('exercises').delete().eq('week_id', week.id);

                // 3. Insert Exercises
                if (weekData.exercises && weekData.exercises.length > 0) {
                    const exercisesToInsert = weekData.exercises.map((ex: any, index: number) => ({
                        week_id: week.id,
                        title: ex.name,
                        type: ex.name.toLowerCase().includes('bolt') ? 'test' : 'active',
                        instructions: ex.description,
                        order_index: index,
                        completion_target: 1,
                        video_required: false,
                        media_status: 'pending'
                    }));

                    const { error: exError } = await supabase
                        .from('exercises')
                        .insert(exercisesToInsert);

                    if (exError) throw exError;
                    results.exercisesSynced += exercisesToInsert.length;
                }

            } catch (err: any) {
                console.error(`Error syncing week ${weekData.week} for ${variant}:`, err);
                results.errors.push(`Week ${weekData.week} (${variant}): ${err.message}`);
            }
        }
    }

    return results;
}
