import { Helmet } from "react-helmet-async";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Lock } from "lucide-react";
import { getPageTitle } from "@/lib/seo";

const About = () => {
  return (
    <>
      <Helmet>
        <title>{getPageTitle("About")}</title>
        <meta 
          name="description" 
          content="Built with clinicians, for better adherence. Learn about MyoCoach's mission to simplify therapy delivery and improve patient outcomes." 
        />
        <meta property="og:title" content={getPageTitle("About")} />
        <meta 
          property="og:description" 
          content="Built with clinicians, for better adherence. Learn about MyoCoach's mission to simplify therapy delivery and improve patient outcomes." 
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
                Built with Clinicians, for Better Adherence
              </h1>
              <p className="text-xl text-muted-foreground">
                Our mission is to simplify therapy delivery and strengthen feedback loops, 
                helping clinics achieve better patient outcomes through structured, engaging programs.
              </p>
            </div>
          </section>

          {/* Our Story */}
          <section className="py-16 bg-muted/50">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
                  <div className="space-y-4 text-lg text-muted-foreground">
                    <p>
                      MyoCoach was born from a simple observation: therapists were spending hours 
                      creating PDF exercise sheets, patients struggled to stay on track, and meaningful 
                      feedback was limited to occasional in-person visits.
                    </p>
                    <p>
                      We knew there had to be a better way. By working directly with myofunctional 
                      therapists, we built a platform that structures programs into manageable weekly 
                      steps, enables asynchronous video review, and motivates patients through 
                      engagement features.
                    </p>
                    <p>
                      The result? Therapists save time, patients stay engaged, and outcomes improve. 
                      That's what drives us every day.
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted rounded-2xl aspect-video flex items-center justify-center">
                  <p className="text-muted-foreground">Team Photo / Office Space</p>
                </div>
              </div>
            </div>
          </section>

          {/* What We Believe */}
          <section className="py-16">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Believe</h2>
                <p className="text-xl text-muted-foreground">The principles that guide our work</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Clarity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Simple, structured steps beat lengthy instruction manuals. Patients succeed 
                      when they know exactly what to do next.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Feedback is the difference between trying and improving. Our platform makes 
                      therapist-patient connection seamless and effective.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Privacy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Patient data deserves the highest protection. We implement patient-first 
                      practices at every level of our platform.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Team/Advisors */}
          <section className="py-16 bg-muted/50">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Team</h2>
                <p className="text-xl text-muted-foreground">
                  Healthcare professionals and technologists working together
                </p>
              </div>

              {/* TODO: Add team member avatars and bios */}
              <div className="grid md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6 text-center">
                      <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4" />
                      <h3 className="font-semibold mb-1">Team Member {i}</h3>
                      <p className="text-sm text-muted-foreground">Role Title</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="py-16">
            <div className="container max-w-2xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Interested in a demo or have questions about MyoCoach? We'd love to hear from you.
              </p>
              <a 
                href="mailto:demo@myocoach.com"
                className="text-lg text-primary hover:underline font-semibold"
              >
                demo@myocoach.com
              </a>
            </div>
          </section>
        </main>

        <FooterPublic />
      </div>
    </>
  );
};

export default About;
