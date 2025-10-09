import { Helmet } from "react-helmet-async";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { LearnMoreSlice } from "@/components/public/LearnMoreSlice";
import { getPageTitle } from "@/lib/seo";

export default function WhatIsMyofunctionalTherapy() {
  return (
    <>
      <Helmet>
        <title>{getPageTitle("What Is Myofunctional Therapy")}</title>
        <meta 
          name="description" 
          content="Learn about myofunctional therapy - a specialized program designed to retrain the muscles of your mouth, tongue, and face for better breathing, sleep, and overall health." 
        />
        <meta property="og:title" content={getPageTitle("What Is Myofunctional Therapy")} />
        <meta 
          property="og:description" 
          content="Learn about myofunctional therapy - a specialized program designed to retrain the muscles of your mouth, tongue, and face for better breathing, sleep, and overall health." 
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <SkipToContent />
        <NavPublic />
        
        <main id="main-content" className="flex-1">
          {/* Hero Section */}
          <section className="py-16 md:py-24">
            <div className="container max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                What Is Myofunctional Therapy?
              </h1>
              <p className="text-xl text-muted-foreground text-center mb-12">
                A comprehensive approach to retraining oral and facial muscles
              </p>

              <div className="prose prose-lg max-w-none">
                <p>
                  Myofunctional therapy is a specialized program of exercises designed to correct improper function of the tongue and facial muscles. These exercises help retrain the muscles of the mouth, tongue, and face to work together properly for breathing, swallowing, speaking, and resting positions.
                </p>

                <h2>What Does Myofunctional Therapy Address?</h2>
                <p>
                  Myofunctional therapy addresses orofacial myofunctional disorders (OMDs), which are patterns involving the muscles and functions of the face and mouth. These disorders can affect:
                </p>
                <ul>
                  <li>Breathing patterns and nasal airflow</li>
                  <li>Facial skeletal growth and development</li>
                  <li>Chewing and swallowing patterns</li>
                  <li>Speech clarity and articulation</li>
                  <li>Sleep quality and sleep-disordered breathing</li>
                  <li>Overall health and well-being</li>
                </ul>

                <h2>The Four Primary Goals</h2>
                <p>
                  Myofunctional therapy focuses on achieving four primary goals that work together to improve oral and facial muscle function:
                </p>
                <ol>
                  <li><strong>Nasal Breathing</strong> - Breathing through the nose for optimal oxygenation and health</li>
                  <li><strong>Lip Seal</strong> - Maintaining a gentle lip seal at rest to support nasal breathing</li>
                  <li><strong>Proper Swallowing</strong> - Swallowing correctly without using facial muscles</li>
                  <li><strong>Tongue Posture</strong> - Keeping the tongue on the roof of the mouth at rest</li>
                </ol>

                <h2>How Does It Work?</h2>
                <p>
                  Through consistent practice of specific exercises, patients develop new muscle patterns and habits. The program typically includes:
                </p>
                <ul>
                  <li>Active exercises performed in front of a mirror</li>
                  <li>Passive exercises that can be done during daily activities</li>
                  <li>Breathing exercises to establish nasal breathing</li>
                  <li>Progress tracking and therapist feedback</li>
                  <li>Regular check-ins and adjustments</li>
                </ul>

                <h2>What Results Can You Expect?</h2>
                <p>
                  When exercises are performed consistently and correctly, most patients experience:
                </p>
                <ul>
                  <li>Improved nasal breathing and reduced mouth breathing</li>
                  <li>Better sleep quality and reduced snoring</li>
                  <li>Enhanced facial symmetry and development</li>
                  <li>Reduced TMJ discomfort and tension headaches</li>
                  <li>Clearer speech and improved swallowing</li>
                  <li>Better overall health and energy levels</li>
                </ul>

                <h2>Who Can Benefit?</h2>
                <p>
                  Myofunctional therapy can help people of all ages, from young children to adults. It's particularly beneficial for those with:
                </p>
                <ul>
                  <li>Chronic mouth breathing</li>
                  <li>Sleep-disordered breathing or sleep apnea</li>
                  <li>Tongue tie or restricted oral tissues</li>
                  <li>TMJ dysfunction or jaw pain</li>
                  <li>Speech difficulties related to tongue position</li>
                  <li>Orthodontic concerns or dental crowding</li>
                  <li>Facial development concerns in children</li>
                </ul>

                <p>
                  Myofunctional therapy is not just about exercises—it's about creating lasting change in how your muscles function, leading to better breathing, sleep, and overall health for life.
                </p>
              </div>
            </div>
          </section>

          {/* Further Reading Section */}
          <LearnMoreSlice />
        </main>

        <FooterPublic />
      </div>
    </>
  );
}
