import { Sparkles } from "lucide-react";

export const WelcomeStep = () => {
  return (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center shadow-progress">
        <Sparkles className="w-10 h-10 text-primary-foreground" />
      </div>
      
      <h1 className="text-4xl font-bold">
        Welcome to MyoCoach!
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        We're excited to guide you through your myofunctional therapy journey. 
        Let's take a few minutes to show you around and get you started.
      </p>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          This quick tour will introduce you to:
        </p>
        <ul className="mt-4 space-y-2 text-left max-w-md mx-auto">
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Your 24-week program structure</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>How weekly check-ins work</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Video upload guidelines</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">✓</span>
            <span>Setting your personal goals</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
