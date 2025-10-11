import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp } from "lucide-react";

interface PersonalizedHeroProps {
  patientName: string;
  onSendMessage: () => void;
}

export function PersonalizedHero({ patientName, onSendMessage }: PersonalizedHeroProps) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {patientName}! 👋
        </h1>
        <p className="text-muted-foreground mb-6">
          You're making great progress on your myofunctional therapy journey
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={onSendMessage} size="lg" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Message Therapist
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            View Progress
          </Button>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0" />
    </div>
  );
}
