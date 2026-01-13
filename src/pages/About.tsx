import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Award, Activity, Clock, Phone, Mail } from "lucide-react";
import { getPageTitle } from "@/lib/seo";
import montroseTeamPhoto from "@/assets/montrose-team-photo.jpg";
import samProfile from "@/assets/sam-profile.jpg";
import mattProfile from "@/assets/matt-profile.jpg";

const About = () => {
  return (
    <>
      <Helmet>
        <title>{getPageTitle("About")}</title>
        <meta 
          name="description" 
          content="Built with clinicians. Focused on families. Montrose Myo is created by Montrose Dental Centre to help patients follow through at home."
        />
        <meta property="og:title" content={getPageTitle("About")} />
        <meta 
          property="og:description" 
          content="Built with clinicians. Focused on families. Montrose Myo is created by Montrose Dental Centre to help patients follow through at home." 
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
          <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Built by clinicians. Focused on families.
              </h1>
              <p className="text-xl text-muted-foreground">
                Created by Montrose Dental Centre, we empower patients with the tools, 
                guidance, and support needed to succeed at home—making therapy clear, 
                accessible, and effective.
              </p>
            </div>
          </section>

          {/* Our Story */}
          <section className="py-16 bg-background">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
                  <div className="space-y-4 text-lg text-muted-foreground">
                    <p>
                      Montrose Dental Centre has served Abbotsford families for over thirty years. 
                      The team blends a relaxed, friendly environment with up-to-date techniques — 
                      earning trust through attention to detail and genuine care.
                    </p>
                    <p>
                      We built this program because great results need great habits. Patients told 
                      us they wanted simple steps, reminders, and a way to share progress between 
                      visits. That's why we turned our 24-week myofunctional approach into a guided, 
                      online experience.
                    </p>
                  </div>
                </div>
                
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={montroseTeamPhoto} 
                    alt="Montrose Dental Centre team" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Meet the Team */}
          <section className="py-16 bg-muted/50">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Team</h2>
                <p className="text-xl text-muted-foreground">
                  The Montrose team bringing this program to life
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-8">
                {/* Sam - Myofunctional Therapist */}
                <Card className="mb-8 border-2">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-6 items-center">
                      <div className="rounded-2xl overflow-hidden">
                        <img 
                          src={samProfile} 
                          alt="Samantha - Myofunctional Therapist at Montrose Dental Centre" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold mb-2">Samantha</h3>
                        <p className="text-primary font-semibold mb-3">Myofunctional Therapist</p>
                        <p className="text-muted-foreground text-lg">
                          Samantha is an Orofacial Myofunctional Therapist passionate about helping patients 
                          achieve better breathing, sleep, and overall health. With specialized training in 
                          orofacial myology, she guides patients through targeted exercises that retrain 
                          oral and facial muscles for optimal function. Samantha's insights have been 
                          instrumental in shaping this platform — her recommendations led to biweekly video 
                          submissions and real-time progress tracking, ensuring patients stay accountable 
                          and therapists can provide personalized feedback throughout the 24-week journey.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dr. Matt */}
                <Card className="mb-8 border-2">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-6 items-center">
                      <div className="rounded-2xl overflow-hidden shadow-lg">
                        <img 
                          src={mattProfile} 
                          alt="Dr. Matt Francisco, Dentist at Montrose Dental Centre" 
                          className="w-full h-auto object-cover aspect-square"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold mb-2">Dr. Matt Francisco</h3>
                        <p className="text-primary font-semibold mb-3">Dentist</p>
                        <p className="text-muted-foreground text-lg">
                          Dr. Matt empowers his patients to achieve excellent oral health. He combines 
                          best-in-class techniques and tools with a calm, comfortable experience for 
                          every age. He and his wife Sylvia are raising their three boys here in 
                          Abbotsford — you'll often see them around town.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Care Team */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-2xl">Your Montrose Care Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg text-muted-foreground">
                      An experienced, energetic group that loves helping families. From admin to 
                      chairside, our goal is a smooth, supportive experience from first login to 
                      final week.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* How We Care */}
          <section className="py-16 bg-background">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Care</h2>
                <p className="text-xl text-muted-foreground">Three pillars of the Montrose approach</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Clarity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Biweekly plans with step-by-step guidance and checklists. You always know what 
                      comes next.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Secure messaging and biweekly feedback from your therapist to keep you 
                      on track throughout your journey.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Modern care</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Techniques that range from orthodontic expansion and aligners to breathing and 
                      posture coaching.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>


          {/* Where to Find Us */}
          <section className="py-16 bg-muted/50">
            <div className="container max-w-3xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Where to Find Us</h2>
                <p className="text-xl text-muted-foreground">
                  Visit us in Abbotsford or reach out anytime
                </p>
              </div>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Office Hours
                      </h3>
                      <div className="space-y-1 text-muted-foreground ml-7">
                        <p>Monday: 8:00 AM – 12:00 PM (admin)</p>
                        <p>Tuesday – Thursday: 7:30 AM – 4:00 PM</p>
                        <p>Friday: 7:30 AM – 2:30 PM</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-primary" />
                        Contact
                      </h3>
                      <div className="space-y-1 ml-7">
                        <p className="text-muted-foreground">
                          Phone:{" "}
                          <a href="tel:604-853-5677" className="text-foreground hover:text-primary transition-colors">
                            604-853-5677
                          </a>
                        </p>
                        <p className="text-muted-foreground">
                          Email:{" "}
                          <a href="mailto:info@montrosedentalcentre.com" className="text-foreground hover:text-primary transition-colors">
                            info@montrosedentalcentre.com
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join the Montrose family in building healthier habits
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
        </main>

        <FooterPublic />
      </div>
    </>
  );
};

export default About;
