import { Helmet } from "react-helmet-async";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { getPageTitle } from "@/lib/seo";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>{getPageTitle("Terms of Service")}</title>
        <meta name="description" content="MyoCoach Terms of Service" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <SkipToContent />
        <NavPublic />
        
        <main id="main-content" className="flex-1">
          <section className="py-16 md:py-24">
            <div className="container max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
              <p className="text-lg text-muted-foreground mb-8">Last updated: 2025</p>
              
              <div className="prose prose-lg max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                  <p>
                    By using MyoCoach, you agree to these Terms of Service. If you do not agree, 
                    do not use the platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Services Provided</h2>
                  <p>
                    MyoCoach offers clinicians a platform to deliver therapy programs and monitor 
                    patient progress. Patients access their assigned programs through a secure login.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. Accounts & Security</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You must provide accurate information when registering.</li>
                    <li>You are responsible for safeguarding your account credentials.</li>
                    <li>Staff accounts (therapists, admins) must use multi-factor authentication.</li>
                    <li>Patients must notify us immediately if they suspect unauthorized access.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Use of Platform</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Patients may only upload information relevant to therapy.</li>
                    <li>Clinics must not use the platform for purposes outside clinical care.</li>
                    <li>We reserve the right to suspend accounts that violate these terms.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Privacy & Compliance</h2>
                  <p>
                    Use of the platform is governed by our Privacy Policy. Clinics are responsible 
                    for ensuring proper consents are collected from patients. We provide tools for 
                    consent capture, audit logs, and export/delete functions to support compliance 
                    with HIPAA and PIPEDA.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Data Ownership</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Patients own their personal health information.</li>
                    <li>Clinics own the treatment programs they create.</li>
                    <li>We act as a secure service provider and Business Associate.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
                  <p>
                    We provide the service "as is." We are not responsible for clinical outcomes, 
                    medical advice, or third-party system failures. Our liability is limited to the 
                    maximum extent permitted by law.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
                  <p>
                    We may suspend or terminate accounts for breach of these Terms. Clinics may 
                    cancel services with written notice in accordance with subscription terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">9. Governing Law</h2>
                  <p>
                    These Terms are governed by the laws of your jurisdiction and applicable 
                    federal laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">10. Contact</h2>
                  <p>For support, billing, or legal inquiries:</p>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-semibold">MyoCoach Support</p>
                    <p>
                      Email:{" "}
                      <a href="mailto:support@myocoach.com" className="text-primary hover:underline">
                        support@myocoach.com
                      </a>
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </main>

        <FooterPublic />
      </div>
    </>
  );
};

export default Terms;
