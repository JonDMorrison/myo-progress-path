import { PartyPopper, CalendarCheck, Dumbbell, Send, MessageSquare } from "lucide-react";

export const ReadyStep = () => {
  const steps = [
    { icon: CalendarCheck, text: "Your dashboard will have Module 1 ready to start" },
    { icon: Dumbbell, text: "Review your exercises and begin practicing daily" },
    { icon: Send, text: "At the end of each module, submit your check-in" },
    { icon: MessageSquare, text: "Your therapist will review and provide feedback" },
  ];

  return (
    <div className="text-center space-y-8">
      <div className="mx-auto w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center shadow-progress animate-bounce">
        <PartyPopper className="w-10 h-10 text-primary-foreground" />
      </div>
      
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold">You're All Set!</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
          Let's begin your journey to better breathing and oral health.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border/50 text-left"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm leading-snug pt-1.5">{step.text}</p>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl max-w-xl mx-auto">
        <p className="text-sm">
          <strong>Remember:</strong> Consistency is key! Try to practice your exercises at the same time each day to build a strong habit.
        </p>
      </div>
    </div>
  );
};
