import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, Activity, ClipboardCheck } from "lucide-react";
import { WEEK_10_INFO } from "@/lib/moduleUtils";
import { WeekExercisesList } from "./WeekExercisesList";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

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
 * Post-frenectomy weeks 9 (Module 5) and 10 (Module 6).
 * Layout per Sam's spec — protocol text in the colored cards themselves,
 * not in separate accordion items. Caylor consultation checkbox is a
 * required completion item gated by patient_week_progress.frenectomy_consult_booked.
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
  const [consultChecked, setConsultChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!patientId || !weekId || readOnly) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("patient_week_progress")
        .select("frenectomy_consult_booked")
        .eq("patient_id", patientId)
        .eq("week_id", weekId)
        .maybeSingle();
      if (!cancelled && data) setConsultChecked(!!(data as any).frenectomy_consult_booked);
    })();
    return () => { cancelled = true; };
  }, [patientId, weekId, readOnly]);

  const handleConsultToggle = async (checked: boolean) => {
    if (readOnly) return;
    setSaving(true);
    setConsultChecked(checked);
    try {
      const { error } = await supabase
        .from("patient_week_progress")
        .upsert(
          {
            patient_id: patientId,
            week_id: weekId,
            frenectomy_consult_booked: checked,
          },
          { onConflict: "patient_id,week_id" }
        );

      if (error) throw error;
      onUpdate?.();
    } catch (e) {
      console.error("Failed to save consult checkbox:", e);
      setConsultChecked(!checked); // rollback
    } finally {
      setSaving(false);
    }
  };

  if (weekNumber === 9) {
    // Module 5 — Days 1-3 + Days 4-7
    // Filter out the legacy protocol-tab entries — the protocol copy now lives
    // in the blue/green cards below, so the duplicate accordion items must
    // not render even though they remain in the program JSON for backward
    // index-stability of historical exercise_completions / exercise_key data.
    const HIDDEN_M5_PROTOCOL_NAMES = new Set([
      "Days 1-3: Minimal Activity Protocol",
      "Days 4-7: Wound Care and Active Participation",
    ]);
    const visibleExercises = exercises.filter(
      (e) => !HIDDEN_M5_PROTOCOL_NAMES.has((e.name || e.title || "").trim())
    );
    // Filter exercises by name suffix for clean grouping
    const days1to3Exercises = visibleExercises.filter(e =>
      (e.name || e.title || "").includes("(Days 1-3)") ||
      (e.name || e.title || "") === "Floor of Mouth Massage (Days 1-3)"
    );
    const days4to7Exercises = visibleExercises.filter(e => !days1to3Exercises.includes(e));

    return (
      <div className="space-y-6">
        {/* Header */}
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

        {/* Required Task: Caylor consultation booked */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="consult-booked"
                  data-testid="consult-booked-checkbox"
                  checked={consultChecked}
                  onCheckedChange={(v) => handleConsultToggle(!!v)}
                  disabled={readOnly || saving}
                />
                <label
                  htmlFor="consult-booked"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!readOnly && !saving) handleConsultToggle(!consultChecked);
                  }}
                  className="text-sm font-medium leading-tight cursor-pointer"
                >
                  Post-Op Consultation with Dr Laura Caylor has been booked for 1 week after frenectomy to check wound healing and tongue mobility
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion type="multiple" defaultValue={["days-1-3", "days-4-7"]} className="space-y-4">
          {/* Recovery Phase 1: Days 1-3 */}
          <AccordionItem value="days-1-3" className="border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <Badge variant="outline" className="border-warning text-warning">Days 1-3</Badge>
                <div>
                  <h3 className="font-semibold">Recovery Phase 1</h3>
                  <p className="text-sm text-muted-foreground">Minimal activity, gentle movement only</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4">
              <div className="space-y-4">
                {/* Days 1-3 protocol — now lives in the dark blue card itself */}
                <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700">
                  <CardContent className="p-5 space-y-4 text-sm leading-relaxed">
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Exercise Integration:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-900 dark:text-blue-100">
                        <li>If no sutures are placed, start active exercises/stretches the next day (skip to day 4 protocol)</li>
                        <li>If sutures are placed, start active exercises with myofunctional therapist on day 4. Light tongue movements are encouraged right away, such as gently lifting the tongue up and down, left and right.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Days 1-3:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-900 dark:text-blue-100">
                        <li>You do not need to do any exercises or stretches on the first day. Talk and eat as normally as you can and avoid sharp, crunchy, spicy or acidic food. Soft, cold foods are best.</li>
                        <li>Passive tongue exercises can be started right away: With the mouth comfortably open, gently reach your tongue up to touch the spot and move the tongue left and right to touch the inside of the cheeks. A gentle Floor of Mouth Massage should also be done with clean hands to help reduce tension.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Pain control:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-900 dark:text-blue-100">
                        <li>You should expect some mild swelling, pain, and/or discomfort as a normal process of wound healing.</li>
                        <li>Pain is usually controlled with over-the-counter Advil and/or Tylenol.</li>
                        <li>Symptoms usually self-resolve over the course of 1-2 weeks with proper rest and myofunctional therapy.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Wound care:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-900 dark:text-blue-100">
                        <li>It is recommended to lightly rinse with salt water several times a day to reduce the risk of infection.</li>
                        <li>A little bit of extra strength Orajel can be applied on the wound and covered with gauze as needed — not required but is an option if additional pain control is needed.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Floor of Mouth Massage (Days 1-3) — nested inside Phase 1 */}
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
                    <p className="font-medium">No formal exercises for Days 1-3</p>
                    <p className="text-sm">Focus on rest and gentle movement as tolerated</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Recovery Phase 2: Days 4-7 */}
          <AccordionItem value="days-4-7" className="border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <Badge variant="outline" className="border-warning text-warning">Days 4-7</Badge>
                <div>
                  <h3 className="font-semibold">Recovery Phase 2</h3>
                  <p className="text-sm text-muted-foreground">Begin gentle exercises</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4">
              <div className="space-y-4">
                {/* Days 4-7 protocol now lives in the green card itself */}
                <Card className="border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-700">
                  <CardContent className="p-5 space-y-3 text-sm leading-relaxed text-green-900 dark:text-green-100">
                    <p>
                      <strong>Wound care:</strong> You can use a very soft toothbrush to gently brush excess granulation tissue off the sutures. Sutures will dissolve on their own within a week.
                    </p>
                    <p>
                      <strong>Optional:</strong> A little bit of extra strength Orajel can be applied on the wound and covered with gauze as needed prior to exercises to make them more tolerable.
                    </p>
                    <p>
                      <strong>Your active participation is important to the post-operative success of treatment.</strong> It is normal to experience discomfort while doing exercises during the post-operative period. Do not let this discourage you from doing them properly. We encourage you to push through the discomfort, but not to the point of frank pain.
                    </p>
                    <p>
                      The tissue will begin to contract during this time, so this is when active myofunctional exercises become the most important.
                    </p>
                  </CardContent>
                </Card>

                {/* Days 4-7 exercises */}
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
                    <p className="text-sm">Check back for Days 4-7 exercises</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  if (weekNumber === 10) {
    // Module 6 — Days 8-14 + Beyond One/Two Weeks
    return (
      <div className="space-y-6">
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning" />
              <CardTitle className="text-lg">Post-Frenectomy {WEEK_10_INFO.label}</CardTitle>
            </div>
            <CardDescription>{WEEK_10_INFO.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <div>
              <p className="font-semibold mb-1">Beyond One Week:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Start to incorporate more exercises and stretches, as directed by this program</li>
                <li>Your Post-Op Consultation with Dr Laura Caylor should have been completed</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">Beyond Two Weeks:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Resume normal diet and activities and continue with the active exercises in your program.</li>
                <li>The wound will continue to heal for several months and contraction is normal, but stretching throughout the first 6-8 weeks will avoid permanent contraction.</li>
                <li>Continue to self-assess throughout this time — if you feel tension, continue to do stretches.</li>
              </ul>
            </div>
            <p>
              <strong>Your active participation is important to the post-operative success of treatment.</strong> It is normal to experience discomfort while doing exercises during the post-operative period. Do not let this discourage you from doing them properly. We encourage you to push through the discomfort, but not to the point of frank pain.
            </p>
            <p>
              If you have concerns during the healing period, you can call or text Dr. Caylor at <a href="tel:7789087158" className="font-medium underline">778-908-7158</a>.
            </p>
          </CardContent>
        </Card>

        {/* Required Task: Caylor consultation completed */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 flex items-center gap-3">
              <Checkbox
                id="consult-completed"
                data-testid="consult-completed-checkbox"
                checked={consultChecked}
                onCheckedChange={(v) => handleConsultToggle(!!v)}
                disabled={readOnly || saving}
              />
              <label
                htmlFor="consult-completed"
                onClick={(e) => {
                  e.preventDefault();
                  if (!readOnly && !saving) handleConsultToggle(!consultChecked);
                }}
                className="text-sm font-medium leading-tight cursor-pointer"
              >
                Post-Op Consultation with Dr Laura Caylor has been completed to check wound healing and tongue mobility
              </label>
            </div>
          </CardContent>
        </Card>

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
