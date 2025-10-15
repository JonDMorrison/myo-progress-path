import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Clock, Target } from "lucide-react";

export function WhyMontroseDifferent() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Montrose is Different
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our approach makes myofunctional therapy more accessible and effective 
            for busy families
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">One-Size-Fits-All Program</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p className="mb-4">
                We've designed a comprehensive program that works for most patients. This 
                standardized approach allows us to help more families without compromising on quality.
              </p>
              <p>
                While personalized, our proven system follows a structured path that has helped 
                countless patients achieve their therapy goals.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Lower Cost</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p className="mb-4">
                By combining proven exercises with self-paced digital delivery, we keep costs 
                down without sacrificing results.
              </p>
              <p>
                You get professional guidance and support at a fraction of the cost of 
                traditional one-on-one therapy sessions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Fewer Appointments</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p className="mb-4">
                Practice at home on your schedule, submit your progress online, and receive 
                feedback digitally. No need for weekly in-office visits.
              </p>
              <p>
                We're here when you need us, but you don't have to disrupt your busy 
                schedule with frequent appointments.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Self-Paced with Oversight</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p className="mb-4">
                Move through the program at your own pace while staying accountable. Your 
                therapist reviews each week's progress before you advance.
              </p>
              <p>
                This balanced approach gives you flexibility while ensuring you master each 
                step before moving forward.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
