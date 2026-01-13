import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export function PreOpPreparationCard() {
  return (
    <Card className="rounded-xl sm:rounded-2xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <ClipboardList className="h-5 w-5 text-primary" />
          Functional Frenuloplasty Pre-Operative Protocol
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          A minimum of 6 weeks of myofunctional therapy is needed to prepare for a functional tongue tie release. However, the myofunctional therapist will determine when you are ready to proceed.
        </p>
        
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Leading up to the procedure, focus on goals and elimination of compensations as much as possible. Referral to a body worker may be recommended as well, depending on symptoms.
        </p>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Goals</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">1. Tongue Tone and Control</h4>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Work towards being able to move and point the tongue without struggling or compensations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground">2. Lingual Palatal Suction</h4>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                You will need to be able to hold a suction for 60 seconds without compensations prior to surgery. Focus on learning to maintain a suction without lifting the floor of the mouth and ensuring the back of the tongue is up and the tongue is contained within the upper arch / not overflowing onto the teeth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground">3. Compensations are reduced / eliminated as much as possible</h4>
              <div className="mt-2 space-y-3 pl-4">
                <div>
                  <p className="font-medium text-foreground">Floor of mouth elevation:</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Can you lift the tongue and suction without the floor of mouth also elevating?
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-foreground">Jaw lateralization:</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Can you move the tongue left and right without also moving the jaw?
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-foreground">Jaw protrusion:</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Can you stick the tongue out without protruding the jaw?
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-foreground">Neck engagement:</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Can you smile without engaging the neck?
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-foreground">Facial grimace:</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Can you do your exercises with a neutral face?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
          Accomplishing all of these goals prior to the surgery will help you achieve optimal results and a better surgical outcome.
        </p>
      </CardContent>
    </Card>
  );
}
