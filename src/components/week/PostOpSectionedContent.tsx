import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, AlertTriangle, Activity } from "lucide-react";
import { WEEK_9_SUBSECTIONS, WEEK_10_INFO } from "@/lib/moduleUtils";
import { WeekExercisesList } from "./WeekExercisesList";

interface PostOpSectionedContentProps {
  weekNumber: number;
  exercises: any[];
  patientId: string;
  weekId: string;
  existingCompletions?: Record<string, number>;
  onUpdate?: () => void;
  readOnly?: boolean;
}

/**
 * Renders Week 9 with two distinct sub-sections (Days 1-3, Days 4-7)
 * or Week 10 as Days 8-14
 */
export function PostOpSectionedContent({
  weekNumber,
  exercises,
  patientId,
  weekId,
  existingCompletions = {},
  onUpdate,
  readOnly = false,
}: PostOpSectionedContentProps) {
  
  if (weekNumber === 9) {
    // Week 9 has TWO sub-sections: Days 1-3 and Days 4-7
    // We'll split exercises based on their instructions or tags
    // For now, show both sections with appropriate exercises
    
    // Days 1-3: minimal activity exercises (gentle movement only)
    // Days 4-7: gentle versions of regular exercises
    const days1to3Exercises = exercises.filter(e => 
      e.instructions?.toLowerCase().includes('days 1-3') ||
      e.instructions?.toLowerCase().includes('day 1') ||
      e.instructions?.toLowerCase().includes('minimal')
    );
    
    const days4to7Exercises = exercises.filter(e => 
      !days1to3Exercises.includes(e)
    );

    return (
      <div className="space-y-6">
        {/* Post-Op Week 9 Header */}
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning" />
              <CardTitle className="text-lg">Post-Frenectomy Recovery Week</CardTitle>
            </div>
            <CardDescription>
              This week is divided into two phases to support your healing process.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Sectioned Accordion for Days 1-3 and Days 4-7 */}
        <Accordion type="multiple" defaultValue={['days-1-3', 'days-4-7']} className="space-y-4">
          {/* Days 1-3 Section */}
          <AccordionItem value="days-1-3" className="border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <Badge variant="outline" className="border-warning text-warning">
                  {WEEK_9_SUBSECTIONS[0].label}
                </Badge>
                <div>
                  <h3 className="font-semibold">Recovery Phase 1</h3>
                  <p className="text-sm text-muted-foreground">Minimal activity, gentle movement only</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4">
              <div className="space-y-4">
                {/* Guidance Card */}
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="font-medium text-blue-900 dark:text-blue-100">Days 1–3 Protocol</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {WEEK_9_SUBSECTIONS[0].description}
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                          <li>Rest and allow the surgical site to begin healing</li>
                          <li>Very gentle tongue lifts only—no stretching</li>
                          <li>Follow all post-operative care instructions from Dr. Caylor</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exercises for Days 1-3 */}
                {days1to3Exercises.length > 0 ? (
                  <WeekExercisesList
                    exercises={days1to3Exercises}
                    patientId={patientId}
                    weekId={weekId}
                    existingCompletions={existingCompletions}
                    onUpdate={onUpdate}
                    readOnly={readOnly}
                  />
                ) : (
                  <div className="text-center py-6 text-muted-foreground border rounded-lg bg-muted/10">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No formal exercises for Days 1–3</p>
                    <p className="text-sm">Focus on rest and gentle movement as tolerated</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Days 4-7 Section */}
          <AccordionItem value="days-4-7" className="border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <Badge variant="outline" className="border-warning text-warning">
                  {WEEK_9_SUBSECTIONS[1].label}
                </Badge>
                <div>
                  <h3 className="font-semibold">Recovery Phase 2</h3>
                  <p className="text-sm text-muted-foreground">Begin gentle exercises</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4">
              <div className="space-y-4">
                {/* Guidance Card */}
                <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Activity className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="font-medium text-green-900 dark:text-green-100">Days 4–7 Protocol</p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          {WEEK_9_SUBSECTIONS[1].description}
                        </p>
                        <ul className="text-sm text-green-700 dark:text-green-300 list-disc list-inside space-y-1">
                          <li>Begin gentle Lingual Palatal Suction</li>
                          <li>Practice gentle Tongue Trace</li>
                          <li>Perform Floor of Mouth Massage as directed</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exercises for Days 4-7 */}
                {days4to7Exercises.length > 0 ? (
                  <WeekExercisesList
                    exercises={days4to7Exercises}
                    patientId={patientId}
                    weekId={weekId}
                    existingCompletions={existingCompletions}
                    onUpdate={onUpdate}
                    readOnly={readOnly}
                  />
                ) : (
                  <div className="text-center py-6 text-muted-foreground border rounded-lg bg-muted/10">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">Exercises coming soon</p>
                    <p className="text-sm">Check back for Days 4–7 exercises</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  // Week 10: Days 8-14 (single section, but with context)
  if (weekNumber === 10) {
    return (
      <div className="space-y-6">
        {/* Post-Op Week 10 Header — includes Vedder bottom-of-form note
            so the Beyond Two Weeks + Dr. Caylor copy lives inside the
            yellow Days 8-14 card rather than duplicating in the page-
            level introduction. */}
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning" />
              <CardTitle className="text-lg">Post-Frenectomy {WEEK_10_INFO.label}</CardTitle>
            </div>
            <CardDescription>
              {WEEK_10_INFO.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              <strong>Your active participation is important to the post-operative healing process</strong>, particularly the active myofunctional exercises. The tissue will continue to contract during these next several weeks, so consistent exercise prevents permanent contraction.
            </p>
            <p>
              <strong>Beyond One Week:</strong> Resume normal diet and activities and continue with active exercises as directed by your myofunctional therapist. The wound will continue to heal for several months and contraction is normal, but stretching throughout the first 6-8 weeks will avoid permanent contraction. Continue to self-assess — if you feel tension, continue to do stretches.
            </p>
            <p>
              Your post-op session should be scheduled 1 week after release to check wound healing and tongue mobility.
            </p>
            <p>
              If you have concerns during the healing period, you can call or text Dr. Caylor at <a href="tel:7789087158" className="font-medium underline">778-908-7158</a>.
            </p>
          </CardContent>
        </Card>

        {/* Regular exercises list for Week 10 */}
        <WeekExercisesList
          exercises={exercises}
          patientId={patientId}
          weekId={weekId}
          existingCompletions={existingCompletions}
          onUpdate={onUpdate}
          readOnly={readOnly}
        />
      </div>
    );
  }

  // Fallback: not a post-op week, render normal exercises
  return (
    <WeekExercisesList
      exercises={exercises}
      patientId={patientId}
      weekId={weekId}
      existingCompletions={existingCompletions}
      onUpdate={onUpdate}
      readOnly={readOnly}
    />
  );
}
