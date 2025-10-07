import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { Hero } from "@/components/public/Hero";
import { FeatureCard } from "@/components/public/FeatureCard";
import { TestimonialCard } from "@/components/public/TestimonialCard";
import { FAQ } from "@/components/public/FAQ";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Video, TrendingUp, Check, Shield } from "lucide-react";
import { getPageTitle, getSchemaOrgData } from "@/lib/seo";

const Home = () => {
  const schemaData = getSchemaOrgData();

  return (
    <>
      <Helmet>
        <title>{getPageTitle("Home")}</title>
        <meta 
          name="description" 
          content="Deliver myofunctional therapy programs your patients will actually follow. Structured weekly exercises, therapist feedback, and video reviews all in one place." 
        />
        <meta property="og:title" content={getPageTitle("Home")} />
        <meta 
          property="og:description" 
          content="Deliver myofunctional therapy programs your patients will actually follow. Structured weekly exercises, therapist feedback, and video reviews all in one place." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/placeholder.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <SkipToContent />
        <NavPublic />
        
        <main id="main-content" className="flex-1">
          <Hero />

          {/* Value Props */}
          <section className="py-16 bg-muted/50">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Clinics Choose MyoCoach</h2>
                <p className="text-xl text-muted-foreground">Everything you need to deliver effective myofunctional therapy</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard
                  icon={Calendar}
                  title="Structured Weekly Programs"
                  description="Assign content once and guide patients step-by-step through their therapy journey."
                />
                <FeatureCard
                  icon={CheckCircle}
                  title="Therapist Review Workflow"
                  description="Approve or request more practice in one click. Streamlined feedback for better outcomes."
                />
                <FeatureCard
                  icon={Video}
                  title="(Premium) Video Check-ins"
                  description="Patients upload exercise attempts. Compare side-by-side with AI-powered insights."
                />
                <FeatureCard
                  icon={TrendingUp}
                  title="Patient Motivation"
                  description="Streaks, badges, and gentle reminders keep patients engaged and adherent."
                />
              </div>
            </div>
          </section>

          {/* How It Helps */}
          <section className="py-16">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Save Time. Improve Outcomes. Deliver Professional Care.
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    MyoCoach transforms how clinics deliver myofunctional therapy programs. 
                    Reduce administrative overhead, increase patient adherence, and focus on what matters most—helping patients succeed.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {[
                    "Weekly program structure keeps patients on track",
                    "One-click approvals save therapist time",
                    "Video comparison reveals technique improvements",
                    "Automated reminders boost adherence",
                    "Comprehensive reporting tracks progress",
                    "PIPEDA-friendly data protection"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-success mt-0.5 flex-shrink-0" />
                      <p className="text-lg">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Social Proof */}
          <section className="py-16 bg-muted/50">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Clinics</h2>
                <p className="text-xl text-muted-foreground">See what therapists are saying</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <TestimonialCard
                  quote="MyoCoach transformed our practice. Patient adherence increased 40% in the first month."
                  author="Dr. Sarah Johnson"
                  role="Myofunctional Therapist"
                />
                <TestimonialCard
                  quote="The video review feature is game-changing. I can provide better feedback than ever before."
                  author="Michael Chen"
                  role="Clinical Director"
                />
                <TestimonialCard
                  quote="Our patients love the structured approach. Finally, a platform built for our specialty."
                  author="Emily Rodriguez"
                  role="Therapy Coordinator"
                />
              </div>

              {/* TODO: Add clinic logos */}
              <div className="flex justify-center gap-8 opacity-50">
                <div className="w-32 h-16 bg-muted rounded flex items-center justify-center text-sm">Logo 1</div>
                <div className="w-32 h-16 bg-muted rounded flex items-center justify-center text-sm">Logo 2</div>
                <div className="w-32 h-16 bg-muted rounded flex items-center justify-center text-sm">Logo 3</div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="py-16">
            <div className="container max-w-4xl">
              <div className="bg-card border-2 rounded-2xl p-8 md:p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl font-bold mb-4">Privacy-First by Design</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Role-based access control, private storage, and consent capture ensure patient data stays protected. 
                  PIPEDA-friendly architecture means your clinic data is secure.
                </p>
              </div>
            </div>
          </section>

          <FAQ />

          {/* Final CTA */}
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="container text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Patients Moving?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join clinics using MyoCoach to deliver better therapy outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/auth">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/how-it-works">How It Works</Link>
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

export default Home;
