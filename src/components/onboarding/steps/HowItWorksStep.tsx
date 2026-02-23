import { CheckCircle, MessageSquare, Trophy, Video } from "lucide-react";

export const HowItWorksStep = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-lg text-muted-foreground">
          Your routine made simple
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Daily Exercises</h3>
            <p className="text-sm text-muted-foreground">
              Practice your assigned exercises consistently. Consistency is key to building new muscle memory and breathing patterns.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Biweekly Check-ins (Program Dependant)</h3>
            <p className="text-sm text-muted-foreground">
              Every two weeks, submit your BOLT score, breathing percentages, and video recordings. This helps your therapist track your progress.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Therapist Feedback (Program Dependant)</h3>
            <p className="text-sm text-muted-foreground">
              Your therapist reviews your submissions and provides feedback. They may approve your week or request more practice.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Earn Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Build streaks, earn points, and unlock badges as you progress. Gamification makes the journey more engaging!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
