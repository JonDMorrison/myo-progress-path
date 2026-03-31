import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { StepCard } from "@/components/public/StepCard";
import { FeatureCard } from "@/components/public/FeatureCard";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  MessageSquare, 
  CheckCircle, 
  Video, 
  BarChart3, 
  Award,
  FileText,
  Check,
  X
} from "lucide-react";
import { getPageTitle } from "@/lib/seo";
import howItWorksHero from "@/assets/how-it-works-hero.jpg";

const HowItWorks = () => {
  return (
    <>
      <Helmet>
        <title>{getPageTitle("How It Works")}</title>
        <meta 
          name="description" 
          content="Your step-by-step guide to myofunctional therapy. Learn how to complete exercises, track progress, and get personalized feedback from your therapist."
        />
        <meta property="og:title" content={getPageTitle("How It Works")} />
        <meta 
          property="og:description" 
          content="Your step-by-step guide to myofunctional therapy. Learn how to complete exercises, track progress, and get personalized feedback from your therapist." 
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <SkipToContent />
        <NavPublic />
        
        <main id="main-content" className="flex-1">
          {/* Header */}
          <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={howItWorksHero} 
                alt="" 
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background" />
            </div>
            <div className="container max-w-4xl text-center relative">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Your Journey to Better Breathing
              </h1>
              <p className="text-xl text-muted-foreground">
                A simple, guided program that fits into your daily routine
              </p>
            </div>
          </section>

          {/* Steps */}
          <section className="py-16 bg-muted/50">
            <div className="container max-w-5xl">
              <div className="grid gap-12">
                <StepCard
                  stepNumber={1}
                  title="Get Your Exam"
                  description="Complete your exam at Montrose Dental Centre to determine a treatment plan and which myofunctional therapy program will best suit your needs."
                />
                <StepCard
                  stepNumber={2}
                  title="Start Your Program"
                  description="Enroll using the access code received post payment and exam. You'll see your personalized 24-week program with clear exercises for each week. Everything you need is in one place—instructions, videos, and progress tracking."
                />
                <StepCard
                  stepNumber={3}
                  title="Practice & Record"
                  description="Complete your daily exercises at home, check them off as you go, and record your BOLT score and breathing metrics. Upload videos of your technique so your therapist can review your progress, if your selected program allows."
                />
                <StepCard
                  stepNumber={4}
                  title="Get Feedback & Advance"
                  description="Your therapist reviews your submissions and provides personalized feedback. Once approved, your next week unlocks automatically. If adjustments are needed, you'll receive clear guidance. (Program Dependent)"
                />
              </div>
            </div>
          </section>

          {/* Feature Deep Dive */}
          <section className="py-16">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">What You'll Get</h2>
                <p className="text-xl text-muted-foreground">
                  Tools designed to help you succeed
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  icon={FileText}
                  title="Biweekly Exercise Plans"
                  description="Clear instructions and video demonstrations for each exercise. You'll always know exactly what to do and how to do it."
                />
                <FeatureCard
                  icon={MessageSquare}
                  title="Direct Communication"
                  description="Message your therapist anytime with questions or concerns (Program Dependant). Get answers without waiting for your next appointment."
                />
                <FeatureCard
                  icon={CheckCircle}
                  title="Personalized Feedback"
                  description="Your therapist reviews your progress and provides guidance tailored to your technique and needs. (Program Dependant)"
                />
                <FeatureCard
                  icon={Video}
                  title="Video Check-ins"
                  description="Upload videos of your exercises so your therapist can see your form and provide specific corrections. (Program Dependant)"
                />
                <FeatureCard
                  icon={BarChart3}
                  title="Progress Tracking"
                  description="Watch your BOLT scores improve and see your breathing metrics trend upward throughout the program."
                />
                <FeatureCard
                  icon={Award}
                  title="Stay Motivated"
                  description="Earn badges and build streaks as you complete exercises. Celebrate your consistency and progress."
                />
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section className="py-16">
            <div className="container max-w-3xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Begin?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                If you've been referred by Montrose Dental Centre, you'll receive a passcode to create your account and start your program.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="mailto:info@montrosedentalcentre.com">Questions? Contact Us</a>
                </Button>
              </div>
            </div>
          </section>

          {/* Learn More Section */}
          <section className="py-16 bg-muted/50">
            <div className="container max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn More About Myofunctional Therapy</h2>
                <p className="text-xl text-muted-foreground">
                  Explore our educational resources
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Link to="/learn/intro-to-myofunctional-therapy" className="block">
                  <FeatureCard
                    icon={FileText}
                    title="Introduction to Myofunctional Therapy"
                    description="Learn the fundamentals of myofunctional therapy and how it can improve breathing, sleep, and overall health."
                  />
                </Link>
                <Link to="/learn/four-goals" className="block">
                  <FeatureCard
                    icon={Check}
                    title="The Four Goals"
                    description="Discover the four primary goals of myofunctional therapy: nasal breathing, lip seal, proper swallowing, and tongue posture."
                  />
                </Link>
                <Link to="/learn/expectations" className="block">
                  <FeatureCard
                    icon={FileText}
                    title="Expectations"
                    description="Understand what to expect from your myofunctional therapy journey, including time commitment and practice guidelines."
                  />
                </Link>
                <Link to="/learn/sleep-apnea" className="block">
                  <FeatureCard
                    icon={Award}
                    title="Sleep Apnea & Myofunctional Therapy"
                    description="Learn how myofunctional therapy can significantly improve sleep apnea symptoms and sleep quality."
                  />
                </Link>
              </div>
              <div className="text-center">
                <Button asChild size="lg">
                  <Link to="/learn">View All Articles</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <FooterPublic />
      </div>
    </>
  );
};

export default HowItWorks;
