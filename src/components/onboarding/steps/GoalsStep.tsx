import { Target } from "lucide-react";

export const GoalsStep = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Set Your Goals</h2>
        <p className="text-lg text-muted-foreground">
          What do you hope to achieve with myofunctional therapy?
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Common Goals</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Better nasal breathing during day and night</li>
            <li>• Improved sleep quality</li>
            <li>• Reduced snoring</li>
            <li>• Stronger tongue and oral muscles</li>
            <li>• Better posture and jaw alignment</li>
            <li>• Enhanced athletic performance</li>
          </ul>
        </div>

        <div className="p-6 bg-primary/10 border border-primary/20 rounded-lg">
          <h3 className="font-semibold mb-2">Your Personal Journey</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Everyone's therapy journey is unique. Your therapist will work with you to create a personalized plan based on your specific needs and goals.
          </p>
          <p className="text-sm text-muted-foreground">
            You can discuss your specific goals with your therapist during your first week or through the messaging system at any time.
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Setting Yourself Up for Success</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Practice exercises at the same time each day</li>
            <li>• Set reminders on your phone</li>
            <li>• Track your progress in the app</li>
            <li>• Don't hesitate to message your therapist with questions</li>
            <li>• Celebrate small wins along the way</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
