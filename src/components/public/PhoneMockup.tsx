import { Calendar, CheckCircle, Trophy, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const PhoneMockup = () => {
  return (
    <div className="relative mx-auto" style={{ width: "280px", height: "570px" }}>
      {/* iPhone Frame */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl p-3">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-10" />
        
        {/* Screen */}
        <div className="relative w-full h-full bg-background rounded-[2.5rem] overflow-hidden">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-background/95 backdrop-blur-sm flex items-center justify-between px-6 text-xs z-20">
            <span className="font-medium">9:41</span>
            <div className="flex gap-1 items-center">
              <div className="w-4 h-3 border border-foreground rounded-sm" />
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="absolute top-10 left-0 right-0 bottom-0 overflow-y-scroll scrollbar-hide">
            <div className="p-4 space-y-4 pb-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Module 2</h2>
                <p className="text-sm text-muted-foreground">Tongue Positioning & Breathing</p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2">
                <Card className="p-3 text-center">
                  <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">7</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </Card>
                <Card className="p-3 text-center">
                  <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold">340</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </Card>
                <Card className="p-3 text-center">
                  <CheckCircle className="w-4 h-4 text-success mx-auto mb-1" />
                  <div className="text-lg font-bold">85%</div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </Card>
              </div>

              {/* Progress */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Module Progress</span>
                  <span className="text-sm text-muted-foreground">6/7 days</span>
                </div>
                <Progress value={85} className="h-2" />
              </Card>

              {/* Exercises */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Today's Exercises</h3>
                
                <Card className="p-3 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Tongue Posture Hold</p>
                    <p className="text-xs text-muted-foreground">3 sets × 30 seconds</p>
                  </div>
                </Card>

                <Card className="p-3 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Nasal Breathing</p>
                    <p className="text-xs text-muted-foreground">10 minutes</p>
                  </div>
                </Card>

                <Card className="p-3 flex items-center gap-3 border-primary/50">
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">BOLT Score</p>
                    <p className="text-xs text-muted-foreground">Record your score</p>
                  </div>
                </Card>

                <Card className="p-3 flex items-center gap-3 opacity-50">
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Evening Check-in</p>
                    <p className="text-xs text-muted-foreground">Complete before bed</p>
                  </div>
                </Card>
              </div>

              {/* Video Upload Card */}
              <Card className="p-4 bg-primary/5">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Upload Exercise Video</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Record your tongue posture exercise for feedback
                    </p>
                    <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                      Record Video
                    </button>
                  </div>
                </div>
              </Card>

              {/* Recent Badges */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Recent Achievements</h3>
                <Card className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Module Warrior</p>
                    <p className="text-xs text-muted-foreground">Completed 7 days in a row</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
