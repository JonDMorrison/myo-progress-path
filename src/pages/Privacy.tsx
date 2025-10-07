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
        <meta name="description" content="MyoCoach Privacy Policy - How we protect your data" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <SkipToContent />
        <NavPublic />
        
        <main id="main-content" className="flex-1">
          <section className="py-16 md:py-24">
            <div className="container max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
              <p className="text-lg text-muted-foreground mb-8">Last updated: 2025</p>
              
              <div className="prose prose-lg max-w-none">
                <p>Privacy policy content will be added here.</p>
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
