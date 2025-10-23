import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Target } from "lucide-react";
import { PointsHistory } from "./PointsHistory";
import { BadgeShowcase } from "./BadgeShowcase";
import { ActiveChallenges } from "./ActiveChallenges";

interface GamificationPanelProps {
  patientId: string;
  clinicId: string;
}

export function GamificationPanel({ patientId, clinicId }: GamificationPanelProps) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Achievements & Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="badges" className="gap-2">
              <Award className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Target className="h-4 w-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="points" className="gap-2">
              <Trophy className="h-4 w-4" />
              Points
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="badges" className="mt-4">
            <BadgeShowcase patientId={patientId} />
          </TabsContent>
          
          <TabsContent value="challenges" className="mt-4">
            <ActiveChallenges patientId={patientId} clinicId={clinicId} />
          </TabsContent>
          
          <TabsContent value="points" className="mt-4">
            <PointsHistory patientId={patientId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
