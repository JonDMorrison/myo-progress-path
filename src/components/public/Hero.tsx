import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Activity, Brain, Smile } from "lucide-react";
import { PhoneMockup } from "./PhoneMockup";

export const Hero = () => {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        
        {/* Floating Icons */}
        <Heart className="absolute top-24 left-12 w-20 h-20 text-secondary/10 animate-float hidden lg:block" />
        <Activity className="absolute top-1/3 right-16 w-24 h-24 text-primary/8 animate-float-delayed" style={{ animationDelay: '1s' }} />
        <Brain className="absolute bottom-32 left-1/4 w-16 h-16 text-primary-light/12 animate-float hidden xl:block" style={{ animationDelay: '2s' }} />
        <Smile className="absolute bottom-24 right-1/4 w-20 h-20 text-secondary/8 animate-float-delayed hidden lg:block" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative">
            {/* Glassmorphic accent behind content */}
            <div className="absolute -inset-4 glassmorphic rounded-3xl opacity-40 -z-10 hidden lg:block" />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight relative">
              Deliver Myofunctional Therapy Programs Your Patients Will Actually Follow
            </h1>
            <p className="text-xl text-muted-foreground">
              One place for weekly exercises, therapist feedback, and video reviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                <Link to="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="glassmorphic hover:bg-white/20">
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Existing patients:{" "}
              <Link to="/auth" className="text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
          
          <div className="flex items-center justify-center relative">
            {/* Glow effect behind phone */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-50" />
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
};
