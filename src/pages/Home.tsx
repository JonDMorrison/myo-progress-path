import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { FAQ } from "@/components/public/FAQ";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Award, TrendingUp, Video, Phone, Mail, MapPin } from "lucide-react";
import { getPageTitle, getSchemaOrgData } from "@/lib/seo";

const Home = () => {
  const schemaData = getSchemaOrgData();

  const faqItems = [
    {
      question: "Can I start without video uploads?",
      answer: "Yes — begin on the Lite plan and upgrade to Premium anytime for video check-ins with your therapist."
    },
    {
      question: "How do I log in?",
      answer: "Use your email with either a password or one-click magic link for secure access."
    },
    {
      question: "Will my data be private?",
      answer: "Yes — we use secure accounts, private storage, and strict access controls to protect your information."
    },
    {
      question: "Who reviews my progress?",
      answer: "Your assigned Montrose therapist reviews your weekly submissions and provides personalized feedback."
    },
    {
      question: "Can I switch to Premium later?",
      answer: "Anytime! Upgrade to add video check-ins and get more detailed feedback from your therapist."
    }
  ];

  return (
    <>
      <Helmet>
        <title>{getPageTitle("Home")}</title>
        <meta 
          name="description" 
          content="Trusted Montrose care in a guided myofunctional program you can follow from home. Built by Dr. Matt Francisco and the Montrose Dental Centre team in Abbotsford." 
        />
        <meta property="og:title" content={getPageTitle("Home")} />
        <meta 
          property="og:description" 
          content="Trusted Montrose care in a guided myofunctional program you can follow from home." 
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
          {/* Hero */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    Trusted Montrose care — now in a guided myofunctional program you can follow from home
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8">
                    Built by Dr. Matt Francisco and the Montrose Dental Centre team in Abbotsford, 
                    this secure app turns weekly exercises into simple steps with feedback and (Premium) video check-ins.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg">
                      <Link to="/auth">Get Started</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link to="/how-it-works">How It Works</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted rounded-2xl aspect-video flex items-center justify-center">
                  <p className="text-muted-foreground">Dashboard Preview / App Mockup</p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Montrose */}
          <section className="py-16 bg-background">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Montrose</h2>
                <p className="text-xl text-muted-foreground">The care you trust, now in your hands</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Family-first dentistry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Calm, patient-centred care guided by a friendly, experienced team.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Modern techniques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      From orthodontic expansion to aligners, we bring the best tools to your care.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Real progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Clear weekly plans, checklists, and approvals keep you moving forward.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>(Premium) Video reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Share attempt videos and get therapist feedback without the commute.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Meet Dr. Matt */}
          <section className="py-16 bg-muted/50">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="bg-muted rounded-2xl aspect-square flex items-center justify-center">
                  <p className="text-muted-foreground">Dr. Matt Francisco Photo</p>
                </div>
                
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Dr. Matt Francisco</h2>
                  <div className="space-y-4 text-lg text-muted-foreground">
                    <p>
                      Dr. Matt empowers patients to build excellent oral health using modern 
                      techniques in a comfortable, friendly environment. He lives in Abbotsford 
                      with his wife Sylvia and their three boys — and brings the same care and 
                      energy into this program.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="lg" className="mt-6">
                    <Link to="/about">Learn more</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Sports Callout */}
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="container max-w-4xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Designed for active families
              </h2>
              <p className="text-xl opacity-90 mb-4">
                We know sports are a big part of Fraser Valley life. Dr. Matt even played 
                collegiate basketball — so our guidance emphasizes safe performance habits, 
                breathing, and recovery.
              </p>
              <p className="text-lg opacity-80">
                From custom sports guards to proper breathing mechanics, we help athletes 
                perform their best while protecting their health.
              </p>
            </div>
          </section>

          {/* Social Proof */}
          <section className="py-16 bg-background">
            <div className="container text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Trusted by families across Abbotsford
              </h2>
              
              <div className="flex flex-wrap justify-center gap-8 opacity-50">
                <div className="w-32 h-16 bg-muted rounded flex items-center justify-center text-sm">
                  Fraser Valley
                </div>
                <div className="w-32 h-16 bg-muted rounded flex items-center justify-center text-sm">
                  Community
                </div>
                <div className="w-32 h-16 bg-muted rounded flex items-center justify-center text-sm">
                  Excellence
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
                {faqItems.map((item, index) => (
                  <details key={index} className="group bg-background rounded-lg border p-6">
                    <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                      {item.question}
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-4 text-muted-foreground">{item.answer}</p>
                  </details>
                ))}
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
                  <Link to="/auth">Get Started</Link>
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
    </>
  );
};

export default Home;
