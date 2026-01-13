import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { PhoneMockup } from "@/components/public/PhoneMockup";
import { WhyMontroseDifferent } from "@/components/public/WhyMontroseDifferent";
import { Check, Heart, Award, TrendingUp, Video, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPageTitle, getSchemaOrgData } from "@/lib/seo";
import montroseTeamPhoto from "@/assets/montrose-team-photo.jpg";
import therapySession from "@/assets/therapy-session.jpg";
import familyExercises from "@/assets/family-exercises.jpg";
import digitalTherapy from "@/assets/orofacial-therapy.jpg";
const Home = () => {
  const schemaData = getSchemaOrgData();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  useEffect(() => {
    checkAuthAndRedirect();
  }, []);
  
  const checkAuthAndRedirect = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      // User is logged in, redirect to appropriate dashboard
      const {
        data: userData
      } = await supabase.from("users").select("role").eq("id", session.user.id).single();
      if (userData?.role === "patient") {
        navigate("/patient");
      } else if (userData?.role === "therapist" || userData?.role === "admin" || userData?.role === "super_admin") {
        navigate("/therapist");
      }
    } else {
      setIsLoggedIn(false);
    }
  };
  const faqItems = [{
    question: "Can I start without video uploads?",
    answer: "You can complete weeks without video uploads if your therapist hasn't enabled them for that week."
  }, {
    question: "How do I log in?",
    answer: "Use your email with either a password or one-click magic link for secure access."
  }, {
    question: "Will my data be private?",
    answer: "Yes — we use secure accounts, private storage, and strict access controls to protect your information."
  }, {
    question: "Who reviews my progress?",
    answer: "Your assigned therapist at Montrose reviews your biweekly submissions and provides feedback on your exercises."
  }, {
    question: "How do video check-ins work?",
    answer: "Each week, you upload videos of your exercises for your therapist to review and provide personalized guidance."
  }];
  return <>
      <Helmet>
        <title>{getPageTitle("Home")}</title>
        <meta name="description" content="Trusted Montrose care in a guided myofunctional program you can follow from home. Built by Dr. Matt Francisco and the Montrose Dental Centre team in Abbotsford." />
        <meta property="og:title" content={getPageTitle("Home")} />
        <meta property="og:description" content="Trusted Montrose care in a guided myofunctional program you can follow from home." />
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
          {/* Hero */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    Trusted Montrose care — now in a guided myofunctional program you can follow from home
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8">Built by the Montrose Dental Centre team in Abbotsford, this secure app turns daily exercises into simple steps with feedback and biweekly video check-ins.</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg">
                      <Link to={isLoggedIn ? "/dashboard" : "/register"}>
                        {isLoggedIn ? "Continue to Dashboard" : "Get Started"}
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link to="/how-it-works">How It Works</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <PhoneMockup />
                </div>
              </div>
            </div>
          </section>

          {/* How It Helps You */}
          <section className="py-16 bg-background">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Your Path to Better Breathing and Oral Health
                </h2>
                <p className="text-xl text-muted-foreground">
                  A structured program that fits into your life
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold mb-4">What you'll get:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Guided exercises</p>
                        <p className="text-muted-foreground">Clear instructions for each week's focus, from tongue posture to breathing techniques</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Simple checklists to stay on track</p>
                        <p className="text-muted-foreground">Check off your daily progress and build healthy habits</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Progress reviews</p>
                        <p className="text-muted-foreground">Receive timely feedback from your therapist at scheduled review intervals</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Video check-ins</p>
                        <p className="text-muted-foreground">Submit exercise videos for review by your therapist</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold mb-4">How it helps:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold">Improve breathing patterns</p>
                        <p className="text-muted-foreground">Learn to breathe through your nose naturally, day and night</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold">Strengthen oral muscles</p>
                        <p className="text-muted-foreground">Build proper tongue posture and jaw positioning</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold">Support orthodontic treatment</p>
                        <p className="text-muted-foreground">Get better, longer-lasting results from braces or aligners</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold">Feel more energized</p>
                        <p className="text-muted-foreground">Better sleep quality and daytime energy from improved breathing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Professional Care Section - NEW */}
          <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img src={therapySession} alt="Professional myofunctional therapy consultation at Montrose Dental Centre" className="w-full h-auto object-cover" />
                </div>
                
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Expert Guidance Every Step of the Way
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Our Orofacial Myofunctional Therapist reviews your biweekly submissions and provides 
                    personalized feedback to ensure you're performing exercises correctly and 
                    achieving your health goals.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Video Review System</p>
                        <p className="text-muted-foreground text-sm">Submit exercise videos for professional assessment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Personalized Feedback</p>
                        <p className="text-muted-foreground text-sm">Receive guidance tailored to your progress</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Proven Results</p>
                        <p className="text-muted-foreground text-sm">Evidence-based exercises that deliver lasting improvements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Montrose is Different */}
          <WhyMontroseDifferent />

          {/* Family Wellness Section - NEW */}
          <section className="py-16 bg-background">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Built for Busy Families
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    We understand that modern families are busy. That's why Montrose Myo brings 
                    professional therapy guidance directly to your home, on your schedule.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Practice at Home</p>
                        <p className="text-muted-foreground">No need to commute—exercises fit into your daily routine</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Family-Friendly</p>
                        <p className="text-muted-foreground">Suitable for children and adults alike</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Self-Paced Progress</p>
                        <p className="text-muted-foreground">Move forward when you're ready, with therapist oversight</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-2xl overflow-hidden shadow-2xl order-1 lg:order-2">
                  <img src={familyExercises} alt="Family practicing breathing exercises together at home" className="w-full h-auto object-cover" />
                </div>
              </div>
            </div>
          </section>

          {/* Digital Platform Section - NEW */}
          <section className="py-16 bg-gradient-to-br from-accent/10 to-background">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Modern Technology, Personal Touch
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Our digital platform combines the convenience of technology with the expertise 
                  of professional myofunctional therapy
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Clear, Concise Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Video and written explanations for each exercise, accessible anytime on your device
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Track Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Monitor your improvements with built-in progress tracking and milestone celebrations
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Stay Connected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Secure messaging and scheduled check-ins keep you connected with your therapist
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-2xl max-w-3xl mx-auto">
                <img src={digitalTherapy} alt="Using Montrose Myo digital platform on mobile devices" className="w-full h-auto object-cover" />
              </div>
            </div>
          </section>

          {/* About Montrose */}
          <section className="py-16 bg-background">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="rounded-2xl overflow-hidden shadow-lg order-2 lg:order-1">
                  <img src={montroseTeamPhoto} alt="Montrose Dental Centre team" className="w-full h-auto object-contain" />
                </div>
                
                <div className="order-1 lg:order-2">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    About Montrose Dental Centre
                  </h2>
                  <p className="text-xl text-primary mb-6">
                    Serving Abbotsford families for over 30 years
                  </p>
                  <div className="space-y-4 text-lg text-muted-foreground">
                    <p>
                      At Montrose Dental Centre, we've built our reputation on providing exceptional, 
                      family-friendly dental care in a warm and welcoming environment. Our experienced 
                      team combines the latest dental techniques with a genuine commitment to each 
                      patient's comfort and well-being.
                    </p>
                    <p>
                      We created Montrose Myo because we saw our patients needed more than just in-office 
                      visits. They needed a way to build healthy habits at home, track their progress, 
                      and get guidance between appointments. This program brings over three decades of 
                      clinical expertise directly to you.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="lg" className="mt-6">
                    <Link to="/about">Learn more about our team</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>


          {/* FAQ */}
          <section className="py-16 bg-muted/50">
            <div className="container max-w-3xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-xl text-muted-foreground">Everything you need to know</p>
              </div>
              
              <div className="space-y-4">
                {faqItems.map((item, index) => <details key={index} className="group bg-background rounded-lg border p-6">
                    <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                      {item.question}
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-4 text-muted-foreground">{item.answer}</p>
                  </details>)}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to start your first week?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join families across the Fraser Valley improving their oral health
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/how-it-works">How It Works</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="py-12 bg-muted/50 border-t">
            <div className="container">
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Montrose Dental Centre, Abbotsford, BC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:604-853-5677" className="hover:text-foreground transition-colors">
                    604-853-5677
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:info@montrosedentalcentre.com" className="hover:text-foreground transition-colors">
                    info@montrosedentalcentre.com
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <FooterPublic />
      </div>
    </>;
};
export default Home;