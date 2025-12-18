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
  // Peer-reviewed research from PubMed and academic journals
  const researchArticles = [
    {
      title: "Myofunctional Therapy to Treat Obstructive Sleep Apnea: A Systematic Review and Meta-analysis",
      authors: "Camacho M, Certal V, Abdullatif J, et al.",
      journal: "Sleep",
      year: "2015",
      description: "Landmark review showing myofunctional therapy significantly reduces sleep apnea severity in both children and adults.",
      url: "https://pubmed.ncbi.nlm.nih.gov/25348130/"
    },
    {
      title: "Effects of Orofacial Myofunctional Therapy on Obstructive Sleep Apnea in Children",
      authors: "Villa MP, Brasili L, Ferretti A, et al.",
      journal: "Sleep and Breathing",
      year: "2015",
      description: "Pediatric study demonstrating improvements in sleep-disordered breathing after myofunctional therapy.",
      url: "https://pubmed.ncbi.nlm.nih.gov/25819416/"
    },
    {
      title: "Orofacial Myofunctional Disorders: A Review",
      authors: "Huang YS, Guilleminault C.",
      journal: "Sleep Medicine Clinics",
      year: "2017",
      description: "Comprehensive overview of how orofacial myofunctional disorders affect breathing and sleep.",
      url: "https://pubmed.ncbi.nlm.nih.gov/28778231/"
    },
    {
      title: "Mouth Breathing, Allergies, and 'Adenoid Face'",
      authors: "Jefferson Y.",
      journal: "General Dentistry",
      year: "2010",
      description: "Explains how chronic mouth breathing affects facial development and overall health.",
      url: "https://pubmed.ncbi.nlm.nih.gov/20478797/"
    },
    {
      title: "Myofunctional Therapy (Oropharyngeal Exercises) for Obstructive Sleep Apnea",
      authors: "Guimarães KC, Drager LF, Genta PR, et al.",
      journal: "American Journal of Respiratory and Critical Care Medicine",
      year: "2009",
      description: "Early clinical trial showing oropharyngeal exercises reduce snoring and sleep apnea severity.",
      url: "https://pubmed.ncbi.nlm.nih.gov/19406983/"
    },
    {
      title: "The Effects of Tongue Position on Mandibular Muscle Activity",
      authors: "Ohmure H, Miyawaki S, Nagata J, et al.",
      journal: "Journal of Oral Rehabilitation",
      year: "2008",
      description: "Research on how tongue posture influences jaw muscle function and stability.",
      url: "https://pubmed.ncbi.nlm.nih.gov/18318771/"
    },
    {
      title: "Nasal Airway Obstruction and Craniofacial Development",
      authors: "Harari D, Redlich M, Miri S, et al.",
      journal: "American Journal of Orthodontics and Dentofacial Orthopedics",
      year: "2010",
      description: "Study linking nasal obstruction to changes in facial growth patterns in children.",
      url: "https://pubmed.ncbi.nlm.nih.gov/20197169/"
    },
    {
      title: "The Effect of Myofunctional Therapy on Orthodontic Treatment Outcomes",
      authors: "Saccomanno S, Antonini G, D'Alatri L, et al.",
      journal: "European Journal of Paediatric Dentistry",
      year: "2012",
      description: "Demonstrates how myofunctional therapy supports orthodontic treatment stability.",
      url: "https://pubmed.ncbi.nlm.nih.gov/22762173/"
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
