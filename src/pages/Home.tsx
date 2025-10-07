import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { PhoneMockup } from "@/components/public/PhoneMockup";
import { Check, Heart, Award, TrendingUp, Video, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPageTitle, getSchemaOrgData } from "@/lib/seo";
import montroseTeamPhoto from "@/assets/montrose-team-photo.jpg";

const Home = () => {
  const schemaData = getSchemaOrgData();

  const faqItems = [
    {
      question: "Can I start without video uploads?",
      answer: "You can complete weeks without video uploads if your therapist hasn't enabled them for that week."
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
      question: "How do video check-ins work?",
      answer: "Upload videos of your exercise attempts and get detailed feedback from your therapist without extra visits."
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
                    this secure app turns weekly exercises into simple steps with feedback and video check-ins.
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
                        <p className="font-semibold">Weekly guided exercises</p>
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
                        <p className="font-semibold">Therapist feedback on your progress</p>
                        <p className="text-muted-foreground">Get personalized guidance from the Montrose team</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Video check-ins</p>
                        <p className="text-muted-foreground">Upload videos and get detailed feedback without extra visits</p>
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

          {/* Why Montrose */}
          <section className="py-16 bg-muted/50">
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
                    <CardTitle>Family-first care</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Over 30 years serving Abbotsford families with calm, patient-centred dentistry
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
                      From expansion to aligners, we use the latest tools for your best results
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Clear progress tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      See your improvement week by week with easy-to-follow plans and check-ins
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Convenient care</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Follow your program at home and get feedback without extra office visits
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* About Montrose */}
          <section className="py-16 bg-background">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="rounded-2xl overflow-hidden shadow-lg order-2 lg:order-1">
                  <img 
                    src={montroseTeamPhoto} 
                    alt="Montrose Dental Centre team" 
                    className="w-full h-auto object-contain"
                  />
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
                      We created MyoCoach because we saw our patients needed more than just in-office 
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
