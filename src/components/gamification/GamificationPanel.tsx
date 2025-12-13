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
            <TabsTrigger value="badges" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Badges</span>
              <span className="sm:hidden">🏅</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
              <span className="hidden sm:inline">Challenges</span>
              <span className="sm:hidden">🎯</span>
            </TabsTrigger>
            <TabsTrigger value="points" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
              <span className="hidden sm:inline">Points</span>
              <span className="sm:hidden">🏆</span>
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
