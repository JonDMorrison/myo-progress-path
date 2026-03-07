import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Stethoscope, AlertTriangle, CheckCircle2, Phone, Calendar } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { Section } from "@/components/ui/Section";

// Verbatim content from MFT_with_Frenectomy.docx

const PRE_OP_PROTOCOL = {
  title: "Functional Frenuloplasty Pre-Operative Protocol",
  author: "Dr. Laura Caylor",
  clinic: "Vedder Dental Clinic",
  intro: "A minimum of 6 weeks of myofunctional therapy is needed to prepare for a functional tongue tie release. However, the myofunctional therapist will determine when you are ready to proceed.",
  leadingNote: "Leading up to the procedure, focus on goals and elimination of compensations as much as possible. Referral to a body worker may be recommended as well, depending on symptoms.",
  goals: [
    {
      title: "Tongue Tone and Control",
      description: "Work towards being able to move and point the tongue without struggling or compensations.",
    },
    {
      title: "Lingual Palatal Suction",
      description: "You will need to be able to hold a suction for 60 seconds without compensations prior to surgery. Focus on learning to maintain a suction without lifting the floor of the mouth and ensuring the back of the tongue is up and the tongue is contained within the upper arch/not overflowing onto the teeth.",
    },
    {
      title: "Compensations are reduced/eliminated as much as possible",
      items: [
        "Floor of mouth elevation: Can you lift the tongue and suction without the floor of mouth also elevating?",
        "Jaw lateralization: Can you move the tongue left and right without also moving the jaw?",
        "Jaw Protrusion: Can you stick the tongue out without protruding the jaw?",
        "Neck engagement: Can you smile without engaging the neck?",
        "Facial Grimace: Can you do your exercises with a neutral face?",
      ],
    },
  ],
  closingNote: "Accomplishing all of these goals prior to the surgery will help you achieve optimal results and a better surgical outcome.",
};

const POST_OP_PROTOCOL = {
  title: "Functional Frenuloplasty Post-Operative Protocol",
  author: "Dr. Laura Caylor",
  clinic: "Vedder Dental Clinic",
  exerciseIntegration: "If no sutures are placed, start active exercises/stretches with myofunctional therapist the next day (skip to day 4 protocol). If sutures are placed, start active exercises with myofunctional therapist on day 3. Light tongue movements are encouraged right away.",
  followUpNote: "Your next myofunctional therapy session should be scheduled 1 week after release to check wound healing, tongue mobility, and adjust exercises if ready.",
  timeline: [
    {
      period: "Day 1-3",
      instructions: "You do not need to do any exercises or stretches on the first day. Talk and eat as normally as you can and avoid spicy or acidic food.",
      details: [
        "Passive tongue exercises can be started right away: With the mouth comfortably open, gently reach your tongue up to touch the spot and move the tongue left and right to touch the inside of the cheeks.",
      ],
      painControl: "You should expect some mild swelling, pain, and/or discomfort as a normal process of wound healing. Pain is usually controlled with over-the-counter Advil &/or Tylenol. Symptoms usually self-resolve over the course of 1-2 weeks with proper rest and myofunctional therapy.",
      woundCare: "It is recommended to lightly rinse with salt water several times a day to reduce the risk of infection. A little bit of extra strength orajel can be applied on the wound and covered with gauze as needed - this is not required, but an option if additional pain control is needed.",
    },
    {
      period: "Days 4-7",
      instructions: "The tissue will begin to contract during this time, so this is when active myofunctional exercises become the most important.",
      woundCare: "You can use a very soft toothbrush to gently brush excess granulation tissue off the sutures. Sutures will dissolve on their own within a week.",
      optional: "A little bit of extra strength orajel can be applied on the wound and covered with gauze as needed prior to exercises to make them more tolerable.",
    },
    {
      period: "Beyond 1 week",
      instructions: "Start to incorporate more exercises and stretches, as directed by your myofunctional therapist.",
    },
    {
      period: "Beyond Two Weeks",
      instructions: "Resume normal diet and activities & continue with active exercises as directed by your myofunctional therapist. The wound will continue to heal for several months and contraction is normal, but stretching throughout the first 6-8 weeks will avoid permanent contraction. You should continue to self-assess throughout this time - if you feel tension, continue to do stretches.",
    },
  ],
  importantNote: "Your active participation is important to the post-operative success of treatment. It is normal to experience discomfort while doing exercises during the post-operative period. Do not let this discourage you from doing them properly. We encourage you to push through the discomfort, but not to the point of frank pain.",
  contactInfo: "If you have concerns during the healing period, you can call or text Dr. Caylor at 778-905-7158.",
};

const ProtocolDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isFrenectomyOverview = slug === 'frenectomy';
  const isPreOp = slug === 'pre-op-protocol' || slug === 'pre-op';
  const protocol = isPreOp ? PRE_OP_PROTOCOL : POST_OP_PROTOCOL;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setPatient(patientData);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading protocol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <Button variant="ghost" onClick={() => navigate("/patient")} className="rounded-xl -ml-2 gap-1 sm:gap-2 px-2 sm:px-4 text-sm">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Stethoscope className="h-3 w-3 mr-1" />
              Clinical Protocol
            </Badge>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">
              {protocol.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {protocol.author} • {protocol.clinic}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-4xl">
        <MobileContainer>
          <div className="space-y-6">
            {isPreOp ? (
              /* Pre-Operative Protocol Content */
              <>
                <Section delay={0}>
                  <Card className="rounded-xl border shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {PRE_OP_PROTOCOL.intro}
                      </p>
                      <p className="text-muted-foreground leading-relaxed mt-4">
                        {PRE_OP_PROTOCOL.leadingNote}
                      </p>
                    </CardContent>
                  </Card>
                </Section>

                <Section delay={100}>
                  <Card className="rounded-xl border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Pre-Operative Goals</CardTitle>
                      <CardDescription>
                        Complete these goals before your procedure
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {PRE_OP_PROTOCOL.goals.map((goal, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
                              {index + 1}
                            </span>
                            {goal.title}
                          </h4>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground ml-8">
                              {goal.description}
                            </p>
                          )}
                          {goal.items && (
                            <ul className="ml-8 mt-2 space-y-2">
                              {goal.items.map((item, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </Section>

                <Section delay={200}>
                  <Card className="rounded-xl border-success/30 bg-success/5">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <p className="text-success-foreground font-medium">
                          {PRE_OP_PROTOCOL.closingNote}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Section>
              </>
            ) : (
              /* Post-Operative Protocol Content */
              <>
                <Section delay={0}>
                  <Card className="rounded-xl border shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Exercise Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {POST_OP_PROTOCOL.exerciseIntegration}
                      </p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {POST_OP_PROTOCOL.followUpNote}
                      </p>
                    </CardContent>
                  </Card>
                </Section>

                <Section delay={100}>
                  <Card className="rounded-xl border shadow-sm">
                    <CardHeader>
                      <CardTitle>Post-Op Exercises Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="multiple" defaultValue={['day-1-3', 'days-4-7']} className="space-y-2">
                        {POST_OP_PROTOCOL.timeline.map((phase, index) => (
                          <AccordionItem
                            key={index}
                            value={phase.period.toLowerCase().replace(/\s+/g, '-')}
                            className="border rounded-lg overflow-hidden"
                          >
                            <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 hover:no-underline">
                              <div className="flex items-center gap-3 text-left">
                                <Badge variant="outline" className="border-warning text-warning">
                                  {phase.period}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 py-4 space-y-3">
                              <p className="text-sm text-muted-foreground">
                                {phase.instructions}
                              </p>
                              {phase.details && (
                                <ul className="space-y-2">
                                  {phase.details.map((detail, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                      <span>{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {phase.painControl && (
                                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Pain Control</p>
                                  <p className="text-sm text-blue-800 dark:text-blue-200">{phase.painControl}</p>
                                </div>
                              )}
                              {phase.woundCare && (
                                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">Wound Care</p>
                                  <p className="text-sm text-green-800 dark:text-green-200">{phase.woundCare}</p>
                                </div>
                              )}
                              {phase.optional && (
                                <p className="text-sm text-muted-foreground italic">
                                  Optional: {phase.optional}
                                </p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </Section>

                <Section delay={200}>
                  <Card className="rounded-xl border-warning/30 bg-warning/5">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-warning-foreground mb-2">Important</p>
                          <p className="text-sm text-muted-foreground">
                            {POST_OP_PROTOCOL.importantNote}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Section>

                <Section delay={300}>
                  <Card className="rounded-xl border shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Questions or Concerns?</p>
                          <p className="text-sm text-muted-foreground">
                            {POST_OP_PROTOCOL.contactInfo}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Section>
              </>
            )}

            {/* Back to Dashboard Button */}
            <div className="flex justify-center pt-4">
              <Button onClick={() => navigate("/patient")} variant="outline" className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </MobileContainer>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProtocolDetail;
