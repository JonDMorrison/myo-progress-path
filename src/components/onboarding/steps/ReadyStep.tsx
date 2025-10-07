import { PartyPopper } from "lucide-react";

export const ReadyStep = () => {
  return (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center shadow-progress animate-bounce">
        <PartyPopper className="w-10 h-10 text-primary-foreground" />
      </div>
      
      <h1 className="text-4xl font-bold">
        You're All Set!
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Congratulations! You've completed the onboarding process. 
        Let's begin your journey to better breathing and oral health.
      </p>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-4">What Happens Next?</h3>
        <ul className="space-y-3 text-left max-w-md mx-auto text-sm">
          <li className="flex items-start">
            <span className="text-primary mr-2 text-lg">1.</span>
            <span>You'll see your dashboard with Week 1 ready to start</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2 text-lg">2.</span>
            <span>Review your week's exercises and begin practicing daily</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2 text-lg">3.</span>
            <span>At the end of the week, submit your check-in data</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2 text-lg">4.</span>
            <span>Your therapist will review and provide feedback</span>
          </li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm">
          <strong>Remember:</strong> Consistency is key! Try to practice your exercises at the same time each day to build a strong habit.
        </p>
      </div>
    </div>
  );
};
