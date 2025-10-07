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

const HowItWorks = () => {
  return (
    <>
      <Helmet>
        <title>{getPageTitle("How It Works")}</title>
        <meta 
          name="description" 
          content="From PDF to progress in three simple steps. Learn how MyoCoach helps clinics deliver structured myofunctional therapy programs." 
        />
        <meta property="og:title" content={getPageTitle("How It Works")} />
        <meta 
          property="og:description" 
          content="From PDF to progress in three simple steps. Learn how MyoCoach helps clinics deliver structured myofunctional therapy programs." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/placeholder.svg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <SkipToContent />
        <NavPublic />
        
        <main id="main-content" className="flex-1">
          {/* Header */}
          <section className="py-16 md:py-24">
            <div className="container max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                From PDF to Progress—In Three Steps
              </h1>
              <p className="text-xl text-muted-foreground">
                MyoCoach transforms how you deliver myofunctional therapy programs
              </p>
            </div>
          </section>

          {/* Steps */}
          <section className="py-16 bg-muted/50">
            <div className="container max-w-5xl">
              <div className="grid gap-12">
                <StepCard
                  stepNumber={1}
                  title="Assign the Program"
                  description="Import your weekly exercises using our template and enroll your patient. Define which weeks require BOLT scores, which need video uploads, and add any custom instructions."
                />
                <StepCard
                  stepNumber={2}
                  title="Guide & Track"
                  description="Patients see their current week, check off exercises, record BOLT scores and percentages. They can message you with questions and track their progress streak."
                />
                <StepCard
                  stepNumber={3}
                  title="Review & Approve"
                  description="Review submissions with one click to approve and unlock the next week. With Premium, compare first vs. last attempt videos side-by-side and receive AI-powered technique suggestions."
                />
              </div>
            </div>
          </section>

          {/* Feature Deep Dive */}
          <section className="py-16">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
                <p className="text-xl text-muted-foreground">
                  Comprehensive features for modern therapy delivery
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  icon={FileText}
                  title="Programs & Weeks"
                  description="Content editor with flags for BOLT scores and required uploads. Import from templates or create custom programs."
                />
                <FeatureCard
                  icon={MessageSquare}
                  title="Messaging & Notes"
                  description="Built-in messaging keeps communication in context. Add private therapist notes for internal tracking."
                />
                <FeatureCard
                  icon={CheckCircle}
                  title="Approvals Workflow"
                  description="One-click approve or request more practice. Patients only advance when ready."
                />
                <FeatureCard
                  icon={Video}
                  title="Video Uploads & Thumbnails"
                  description="Premium feature: Patients upload exercise attempts. Auto-generated thumbnails for quick review."
                />
                <FeatureCard
                  icon={BarChart3}
                  title="Reports & Exports"
                  description="Track adherence, completion trends, and BOLT progression. Export patient data for records."
                />
                <FeatureCard
                  icon={Award}
                  title="Gamification"
                  description="Streaks, points, badges, and optional leaderboards boost patient engagement and adherence."
                />
              </div>
            </div>
          </section>

          {/* Lite vs Premium */}
          <section className="py-16 bg-muted/50">
            <div className="container max-w-5xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Lite vs Premium</h2>
                <p className="text-xl text-muted-foreground">
                  Choose the plan that fits your practice
                </p>
              </div>

              <div className="bg-card rounded-2xl border-2 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Feature</th>
                        <th className="text-center p-4 font-semibold">Lite</th>
                        <th className="text-center p-4 font-semibold bg-primary/5">Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: "Program Delivery", lite: true, premium: true },
                        { feature: "Messaging", lite: true, premium: true },
                        { feature: "Checklists & Tracking", lite: true, premium: true },
                        { feature: "Reporting", lite: true, premium: true },
                        { feature: "Gamification", lite: true, premium: true },
                        { feature: "Video Uploads", lite: false, premium: true },
                        { feature: "Side-by-Side Review", lite: false, premium: true },
                        { feature: "AI Feedback Suggestions", lite: false, premium: true },
                      ].map((row, index) => (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="p-4">{row.feature}</td>
                          <td className="text-center p-4">
                            {row.lite ? (
                              <Check className="w-5 h-5 text-success mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                          <td className="text-center p-4 bg-primary/5">
                            {row.premium ? (
                              <Check className="w-5 h-5 text-success mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section className="py-16">
            <div className="container max-w-3xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Getting Started</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Ready to transform your therapy delivery? Create your account and start onboarding patients today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/auth">Create Your Account</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="mailto:demo@myocoach.com">Book a Demo</a>
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
