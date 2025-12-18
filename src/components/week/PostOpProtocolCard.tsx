import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Stethoscope, Calendar, AlertTriangle, Heart } from "lucide-react";

export function PostOpProtocolCard() {
  return (
    <Card className="rounded-xl sm:rounded-2xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Stethoscope className="h-5 w-5 text-primary" />
          Functional Frenuloplasty Post-Operative Protocol
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exercise Integration Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Exercise Integration
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span><strong>If no sutures are placed:</strong> Start active exercises/stretches with myofunctional therapist the next day (skip to day 4 protocol).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span><strong>If sutures are placed:</strong> Start active exercises with myofunctional therapist on day 3. Light tongue movements are encouraged right away. (see below)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span>Your next myofunctional therapy session should be scheduled <strong>1 week after release</strong> to check wound healing, tongue mobility, and adjust exercises if ready.</span>
            </li>
          </ul>
        </div>

        {/* Timeline Accordion */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Post-Op Exercises Timeline</h4>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {/* Day 1-3 */}
            <AccordionItem value="day-1-3" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded text-xs font-medium">
                    Day 1–3
                  </span>
                  <span className="font-medium">Initial Recovery</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  You do not need to do any exercises or stretches on the first day. Talk and eat as normally as you can and avoid spicy or acidic food.
                </p>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <h5 className="font-medium text-sm mb-2">Passive Tongue Exercises (can start right away):</h5>
                  <p className="text-sm text-muted-foreground">
                    With the mouth comfortably open, gently reach your tongue up to touch the spot and move the tongue left and right to touch the inside of the cheeks.
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Pain Control:</h5>
                  <p className="text-sm text-muted-foreground">
                    You should expect some mild swelling, pain, and/or discomfort as a normal process of wound healing. Pain is usually controlled with over-the-counter Advil and/or Tylenol. Symptoms usually self-resolve over the course of 1–2 weeks with proper rest and myofunctional therapy.
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Wound Care:</h5>
                  <p className="text-sm text-muted-foreground">
                    It is recommended to lightly rinse with salt water several times a day to reduce the risk of infection. A little bit of extra strength orajel can be applied on the wound and covered with gauze as needed. This is not required, but an option if additional pain control is needed.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Days 4-7 */}
            <AccordionItem value="day-4-7" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                    Days 4–7
                  </span>
                  <span className="font-medium">Active Recovery Begins</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 space-y-4">
                <Alert className="bg-primary/5 border-primary/20">
                  <AlertDescription className="text-sm">
                    <strong>Important:</strong> The tissue will begin to contract during this time, so this is when active myofunctional exercises become the most important.
                  </AlertDescription>
                </Alert>

                <div>
                  <h5 className="font-medium text-sm mb-2">Wound Care:</h5>
                  <p className="text-sm text-muted-foreground">
                    You can use a very soft toothbrush to gently brush excess granulation tissue off the sutures. Sutures will dissolve on their own within a week.
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Optional:</h5>
                  <p className="text-sm text-muted-foreground">
                    A little bit of extra strength orajel can be applied on the wound and covered with gauze as needed prior to exercises to make them more tolerable.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Beyond 1 Week */}
            <AccordionItem value="beyond-1-week" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
                    Beyond 1 Week
                  </span>
                  <span className="font-medium">Expanding Exercises</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <p className="text-sm text-muted-foreground">
                  Start to incorporate more exercises and stretches, as directed by your myofunctional therapist.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Beyond Two Weeks */}
            <AccordionItem value="beyond-2-weeks" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs font-medium">
                    Beyond 2 Weeks
                  </span>
                  <span className="font-medium">Return to Normal</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Resume normal diet and activities and continue with active exercises as directed by your myofunctional therapist. The wound will continue to heal for several months and contraction is normal, but stretching throughout the first 6–8 weeks will avoid permanent contraction.
                </p>
                <p className="text-sm text-muted-foreground">
                  You should continue to self-assess throughout this time. If you feel tension, continue to do stretches.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Important Notes */}
        <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 space-y-2">
            <p className="font-semibold">Your active participation is important to the post-operative success of treatment.</p>
            <p className="text-sm">
              It is normal to experience discomfort while doing exercises during the post-operative period. Do not let this discourage you from doing them properly. We encourage you to push through the discomfort, but not to the point of frank pain.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
