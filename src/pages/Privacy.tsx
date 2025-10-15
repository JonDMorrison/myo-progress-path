import { Helmet } from "react-helmet-async";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { getPageTitle } from "@/lib/seo";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>{getPageTitle("Privacy Policy")}</title>
        <meta name="description" content="Montrose Myo Privacy Policy - How we protect your data" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <SkipToContent />
        <NavPublic />
        
        <main id="main-content" className="flex-1">
          <section className="py-16 md:py-24">
            <div className="container max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
              <p className="text-lg text-muted-foreground mb-8">Last updated: 2025</p>
              
              <div className="prose prose-lg max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                  <p>
                    Montrose Myo ("we," "our," or "us") provides a secure platform that delivers 
                    myofunctional therapy programs online. We are committed to protecting the 
                    privacy and security of your information in compliance with applicable laws, 
                    including the Health Insurance Portability and Accountability Act (HIPAA) in 
                    the United States and the Personal Information Protection and Electronic 
                    Documents Act (PIPEDA) in Canada.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                  <p>We collect and process only the information necessary to deliver therapy services:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Patient information:</strong> name, email, date of birth (if required), 
                      assigned therapist, consent records.
                    </li>
                    <li>
                      <strong>Program data:</strong> exercise progress, checklist results, BOLT scores, 
                      and uploaded videos.
                    </li>
                    <li>
                      <strong>Technical data:</strong> IP address, device type, browser, and activity 
                      logs for security and compliance.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">3. How We Use Information</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide patients with structured therapy programs and progress tracking.</li>
                    <li>Allow therapists to review, approve, and communicate feedback.</li>
                    <li>Securely store audit logs of access and actions (required under HIPAA/PIPEDA).</li>
                    <li>Improve adherence through reminders, nudges, and motivational features.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">4. Sharing of Information</h2>
                  <p>We do not sell or rent personal health information. Data is only shared:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>With your assigned therapist(s) or clinic administrator.</li>
                    <li>
                      With service providers (e.g., cloud hosting, email, SMS) under strict contracts 
                      and where required, Business Associate Agreements (BAAs).
                    </li>
                    <li>When required by law (e.g., court order, public health requirements).</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption in transit (TLS) and at rest.</li>
                    <li>Role-based access controls and enforced multi-factor authentication for staff.</li>
                    <li>Immutable audit logs to track all access to patient data.</li>
                    <li>Automatic session timeouts for inactive users.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">6. Patient Rights</h2>
                  <p>Patients may request:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>A copy of their records (export).</li>
                    <li>Correction of inaccuracies.</li>
                    <li>
                      Deletion/anonymization of their records (subject to legal retention requirements).
                    </li>
                    <li>
                      Information on when and how their data has been accessed (audit log summary).
                    </li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, contact us at{" "}
                    <a href="mailto:sam@montrosedental.ca" className="text-primary hover:underline">
                      sam@montrosedental.ca
                    </a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
                  <p>
                    Clinical records are retained as required by law (HIPAA: 6 years minimum). 
                    Deleted accounts are anonymized but audit logs are preserved.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">8. International Users</h2>
                  <p>
                    If you access the platform outside the United States or Canada, you consent 
                    to your information being processed and stored in our hosting region.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
                  <p>Questions or concerns? Contact our Privacy Officer:</p>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-semibold">Privacy Officer</p>
                    <p>
                      Email:{" "}
                      <a href="mailto:sam@montrosedental.ca" className="text-primary hover:underline">
                        sam@montrosedental.ca
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

export default Privacy;
