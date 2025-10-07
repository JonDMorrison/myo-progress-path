import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PhoneMockup } from "./PhoneMockup";

export const Hero = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Deliver Myofunctional Therapy Programs Your Patients Will Actually Follow
            </h1>
            <p className="text-xl text-muted-foreground">
              One place for weekly exercises, therapist feedback, and video reviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
};
