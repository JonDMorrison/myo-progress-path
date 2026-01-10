import { Helmet } from "react-helmet-async";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, ExternalLink, Building2 } from "lucide-react";
import { getPageTitle } from "@/lib/seo";
import resourcesHero from "@/assets/resources-hero.jpg";
import breathBook from "@/assets/books/breath-book.jpg";
import oxygenBook from "@/assets/books/oxygen-advantage-book.jpg";

const Resources = () => {
  // Peer-reviewed research - Sam's curated list with publicly available links
  const researchArticles = [
    {
      title: "The Anatomical Relationships of the Tongue with the Body System",
      authors: "Bordoni B, Morabito B, Mitrano R, et al.",
      journal: "Cureus",
      year: "2019",
      description: "Explores how the tongue connects anatomically to multiple body systems and functions.",
      url: "https://pubmed.ncbi.nlm.nih.gov/30838167/"
    },
    {
      title: "Functional Improvements of Speech, Feeding, and Sleep After Lingual Frenectomy Tongue-Tie Release: A Prospective Cohort Study",
      authors: "Baxter R, Merkel-Walsh R, Baxter BS, et al.",
      journal: "Clinical Pediatrics",
      year: "2020",
      description: "Demonstrates improvements in speech, feeding, and sleep after tongue-tie release procedures.",
      url: "https://tonguetieal.com/wp-content/uploads/2020/05/Baxter-et-al-2020-Feeding-Speech-Sleep-Improvements.pdf"
    },
    {
      title: "Breastfeeding and Snoring: A Birth Cohort Study",
      authors: "Montgomery-Downs HE, Crabtree VM, Sans Capdevila O, et al.",
      journal: "PLoS ONE",
      year: "2007",
      description: "Birth cohort study examining the relationship between breastfeeding duration and childhood snoring.",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3885662/"
    },
    {
      title: "Effects of Orofacial Myofunctional Therapy on Temporomandibular Disorders",
      authors: "De Felício CM, De Oliveira MM, Da Silva MA.",
      journal: "Cranio",
      year: "2010",
      description: "Shows how myofunctional therapy can help reduce temporomandibular joint (TMJ) dysfunction symptoms.",
      url: "https://rachelbarnhartdds.com/wp-content/uploads/2018/09/effects-of-orofacial-myofunctional-therapy-on-temporomandibular-disorders.pdf"
    },
    {
      title: "Gastroesophageal Reflux Disease and Sleep Disorders: Evidence for a Causal Link and Therapeutic Implications",
      authors: "Orr WC.",
      journal: "Journal of Neurogastroenterology and Motility",
      year: "2010",
      description: "Examines the bidirectional relationship between GERD and sleep disorders.",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2879818/"
    },
    {
      title: "Implications of Mouth Breathing on the Pulmonary Function and Respiratory Muscles",
      authors: "Trabalon M, Schaal B.",
      journal: "International Journal of Pediatrics",
      year: "2012",
      description: "Explains how mouth breathing affects lung function and respiratory muscle development.",
      url: "https://www.redalyc.org/pdf/1693/169344655028.pdf"
    },
    {
      title: "Assessment of Lingual Frenulum Lengths in Skeletal Malocclusion",
      authors: "Arora R, Verma S, Sharma R.",
      journal: "Journal of Clinical and Diagnostic Research",
      year: "2014",
      description: "Investigates the connection between tongue-tie and skeletal bite problems.",
      url: "http://pmc.ncbi.nlm.nih.gov/articles/PMC4003643/"
    },
    {
      title: "Mouth Breathing and Its Relationship to Some Oral and Medical Conditions: Physiopathological Mechanisms Involved",
      authors: "Pacheco MC, Casagrande CF, Teixeira LP, et al.",
      journal: "Revista CEFAC",
      year: "2015",
      description: "Reviews how chronic mouth breathing contributes to various oral and systemic health conditions.",
      url: "https://www.redalyc.org/pdf/1804/180445640008.pdf"
    },
    {
      title: "Myofunctional Therapy to Treat Obstructive Sleep Apnea: A Systematic Review and Meta-analysis",
      authors: "Camacho M, Certal V, Abdullatif J, et al.",
      journal: "Sleep",
      year: "2015",
      description: "Landmark review showing myofunctional therapy significantly reduces sleep apnea severity in both children and adults.",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4402674/"
    },
    {
      title: "Relapse of Anterior Open Bites Treated with Orthodontic Appliances with and without Orofacial Myofunctional Therapy",
      authors: "Justiniano IC.",
      journal: "American Journal of Orthodontics and Dentofacial Orthopedics",
      year: "2017",
      description: "Demonstrates that myofunctional therapy helps prevent relapse after orthodontic treatment for open bite.",
      url: "https://aomtinfo.org/wp-content/uploads/2017/04/AJODO_RelapseAnteriorOpenBite.pdf"
    }
  ];

  // Clinical and professional organizations - curated for patient helpfulness
  const clinicalResources = [
    {
      name: "International Association of Orofacial Myology (IAOM)",
      description: "The main professional organization for orofacial myofunctional therapy. Sets training and certification standards for therapists. Use their Find a Provider directory to locate certified therapists near you.",
      url: "https://iaom.com/"
    },
    {
      name: "MyoMentor",
      description: "Education and training resource focused on myofunctional therapy. Provides basic explanations about what myofunctional therapy is, why it matters, and how exercises are taught and applied in practice.",
      url: "https://www.myomentor.com/"
    },
    {
      name: "Air Voel",
      description: "CPAP supply and sleep apnea equipment provider. Helpful for finding machines, masks, and accessories if you have sleep-disordered breathing or use a CPAP device.",
      url: "https://airvoel.ca/"
    }
  ];

  // Clinician-approved book list only
  const recommendedBooks = [
    {
      title: "Breath: The New Science of a Lost Art",
      author: "James Nestor",
      description: "Explores how breathing affects every system in the body and why modern habits have compromised our health.",
      cover: breathBook
    },
    {
      title: "Tongue-Tied",
      author: "Richard Baxter, DMD, MS",
      description: "Comprehensive guide to tongue-tie and its effects on feeding, speech, sleep, and development.",
      cover: null
    },
    {
      title: "GASP!: Airway Health – The Hidden Path to Wellness",
      author: "Dr. Michael Gelb",
      description: "Explains the connection between airway health, breathing, and whole-body wellness.",
      cover: null
    },
    {
      title: "The Oxygen Advantage",
      author: "Patrick McKeown",
      description: "Science-based breathing techniques to improve performance, health, and sleep quality.",
      cover: oxygenBook
    }
  ];

  return (
    <>
      <Helmet>
        <title>{getPageTitle("Research & Resources")}</title>
        <meta 
          name="description" 
          content="Evidence-based research, clinical resources, and recommended reading on orofacial myofunctional therapy, airway health, and breathing science." 
        />
        <meta property="og:title" content={getPageTitle("Research & Resources")} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <SkipToContent />
        <NavPublic />
        
        <main id="main-content" className="flex-1">
          {/* Hero */}
          <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={resourcesHero} 
                alt="" 
                className="w-full h-full object-cover opacity-15"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background" />
            </div>
            <div className="container max-w-4xl text-center relative">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Research & Resources
              </h1>
              <p className="text-xl text-muted-foreground">
                Evidence-based information on orofacial myofunctional therapy, airway health, and breathing science
              </p>
            </div>
          </section>

          {/* Section 1: Peer-Reviewed Research */}
          <section className="py-16 bg-background">
            <div className="container max-w-5xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Peer-Reviewed Research</h2>
              </div>
              <p className="text-muted-foreground mb-8 max-w-3xl">
                Published studies from medical and scientific journals supporting the effectiveness of myofunctional therapy for breathing, sleep, and orofacial function.
              </p>

              <div className="space-y-4">
                {researchArticles.map((article, index) => (
                  <Card key={index} className="border hover:shadow-md transition-all">
                    <CardContent className="py-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {article.authors} • <em>{article.journal}</em> ({article.year})
                          </p>
                          <p className="text-muted-foreground text-sm">{article.description}</p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="shrink-0 self-start">
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            View Study
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-8 bg-muted/50 border-muted">
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">
                    These research articles are provided for educational purposes. Individual results may vary. 
                    Always consult with qualified healthcare professionals about your specific situation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 2: Clinical & Professional Resources */}
          <section className="py-16 bg-muted/50">
            <div className="container max-w-5xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Clinical & Professional Resources</h2>
              </div>
              <p className="text-muted-foreground mb-8 max-w-3xl">
                Reputable organizations in the fields of orofacial myology, airway health, and sleep medicine.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clinicalResources.map((resource, index) => (
                  <Card key={index} className="border hover:shadow-md transition-all h-full">
                    <CardContent className="py-5 h-full flex flex-col">
                      <h3 className="font-semibold mb-2">{resource.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-1">{resource.description}</p>
                      <Button asChild variant="ghost" size="sm" className="self-start -ml-2">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          Visit Website
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: Recommended Reading */}
          <section className="py-16 bg-background">
            <div className="container max-w-5xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Recommended Reading</h2>
              </div>
              <p className="text-muted-foreground mb-8 max-w-3xl">
                Books we reference in practice that provide valuable insights into breathing, airway health, and myofunctional therapy.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                {recommendedBooks.map((book, index) => (
                  <Card key={index} className="border overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {book.cover ? (
                        <div className="sm:w-1/3 flex-shrink-0 bg-muted">
                          <img 
                            src={book.cover} 
                            alt={`${book.title} book cover`}
                            className="w-full h-full object-cover aspect-[2/3] sm:aspect-auto"
                          />
                        </div>
                      ) : (
                        <div className="sm:w-1/3 flex-shrink-0 bg-muted flex items-center justify-center aspect-[2/3] sm:aspect-auto">
                          <BookOpen className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <h3 className="text-lg font-semibold leading-tight mb-1">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">by {book.author}</p>
                        <p className="text-muted-foreground text-sm">{book.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>

        <FooterPublic />
      </div>
    </>
  );
};

export default Resources;
