import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, FileText, ExternalLink, Building2, Search } from "lucide-react";
import { getPageTitle } from "@/lib/seo";
import resourcesHero from "@/assets/resources-hero.jpg";
import breathBook from "@/assets/books/breath-book.jpg";
import oxygenBook from "@/assets/books/oxygen-advantage-book.jpg";
import tongueTiedBook from "@/assets/books/tongue-tied-book.jpg";
import gaspBook from "@/assets/books/gasp-book.jpg";

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const researchArticles = [
    {
      title: "The Anatomical Relationships of the Tongue with the Body System",
      authors: "Bordoni B, Morabito B, Mitrano R, et al.",
      journal: "Cureus",
      year: "2019",
      description: "Explores how the tongue connects anatomically to multiple body systems and functions.",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6390887/"
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
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4003643/"
    },
    {
      title: "Mouth Breathing and Its Relationship to Some Oral and Medical Conditions: Physiopathological Mechanisms Involved",
      authors: "Pacheco MC, Casagrande CF, Teixeira LP, et al.",
      journal: "Revista CEFAC",
      year: "2015",
      description: "Reviews how chronic mouth breathing contributes to various oral and medical conditions.",
      url: "https://www.redalyc.org/pdf/1804/180445640008.pdf"
    },
    {
      title: "Myofunctional Therapy to Treat Obstructive Sleep Apnea: A Systematic Review and Meta-analysis",
      authors: "Camacho M, Certal V, Abdullatif J, et al.",
      journal: "Sleep",
      year: "2015",
      description: "Landmark review showing myofunctional therapy significantly reduces sleep apnea severity.",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4402674/"
    },
    {
      title: "Relapse of Anterior Open Bites Treated with Orthodontic Appliances with and without Orofacial Myofunctional Therapy",
      authors: "Justiniano IC.",
      journal: "American Journal of Orthodontics and Dentofacial Orthopedics",
      year: "2017",
      description: "Demonstrates that myofunctional therapy helps prevent relapse after orthodontic treatment.",
      url: "https://aomtinfo.org/wp-content/uploads/2017/04/AJODO_RelapseAnteriorOpenBite.pdf"
    }
  ];

  const clinicalResources = [
    {
      name: "International Association of Orofacial Myology (IAOM)",
      description: "The main professional organization for orofacial myofunctional therapy. Sets training and certification standards for therapists.",
      url: "https://iaom.com/"
    },
    {
      name: "MyoMentor",
      description: "The education and training resource used to develop our Montrose Myo programs. Their website provides basic explanations about what myofunctional therapy is, why it matters, and how exercises are taught and applied in practice",
      url: "https://www.myomentor.com/"
    },
    {
      name: "AirVoel",
      description: "Get your sleep apnea formally diagnosed without visiting your doctor’s office. Their home sleep testing equipment is approved by FDA and Health Canada. AirVoel also sells CPAP machines, masks, and accessories",
      url: "https://airvoel.ca/"
    }
  ];

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
      cover: tongueTiedBook
    },
    {
      title: "GASP!: Airway Health – The Hidden Path to Wellness",
      author: "Dr. Michael Gelb",
      description: "Explains the connection between airway health, breathing, and whole-body wellness.",
      cover: gaspBook
    },
    {
      title: "The Oxygen Advantage",
      author: "Patrick McKeown",
      description: "Science-based breathing techniques to improve performance, health, and sleep quality.",
      cover: oxygenBook
    }
  ];

  const filterItem = (item: any) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.title || item.name || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query) ||
      (item.authors || item.author || "").toLowerCase().includes(query)
    );
  };

  const filteredResearch = researchArticles.filter(filterItem);
  const filteredClinical = clinicalResources.filter(filterItem);
  const filteredBooks = recommendedBooks.filter(filterItem);

  return (
    <>
      <Helmet>
        <title>{getPageTitle("Research & Resources")}</title>
        <meta 
          name="description" 
          content="Evidence-based research, clinical resources, and recommended reading." 
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <SkipToContent />
        <NavPublic />
        
        <main id="main-content" className="flex-1">
          <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container max-w-4xl text-center relative px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Research & Resources</h1>
              <p className="text-xl text-muted-foreground mb-10">
                Evidence-based information on orofacial myofunctional therapy and airway health
              </p>
              
              <div className="max-w-md mx-auto relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search articles, books, or organizations..." 
                  className="pl-12 h-14 rounded-2xl border-2 focus-visible:ring-primary/20 bg-background/50 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Peer-Reviewed Research */}
          <section className="py-16">
            <div className="container max-w-5xl px-4">
              <div className="flex items-center gap-3 mb-8">
                <FileText className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Research Papers</h2>
              </div>
              
              <div className="space-y-4">
                {filteredResearch.map((article, index) => (
                  <Card key={index} className="border hover:shadow-lg transition-all rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-1">{article.title}</h3>
                          <p className="text-sm text-primary font-medium mb-3">
                            {article.authors} • <em>{article.journal}</em> ({article.year})
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">{article.description}</p>
                        </div>
                        <Button asChild variant="outline" className="rounded-xl border-2 hover:bg-primary hover:text-white transition-all shrink-0">
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            View Study <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredResearch.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed rounded-3xl text-muted-foreground">
                    No articles found matching your search.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Clinical Organizations */}
          <section className="py-16 bg-muted/30">
            <div className="container max-w-5xl px-4">
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Clinical Resources</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClinical.map((resource, index) => (
                  <Card key={index} className="border hover:shadow-lg transition-all h-full rounded-2xl flex flex-col">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-3">{resource.name}</h3>
                      <p className="text-sm text-muted-foreground mb-6 flex-1">{resource.description}</p>
                      <Button asChild variant="ghost" className="text-primary font-bold justify-start p-0 h-auto hover:bg-transparent hover:text-primary/80">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          Visit Website <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Recommended Books */}
          <section className="py-16">
            <div className="container max-w-5xl px-4">
              <div className="flex items-center gap-3 mb-8">
                <BookOpen className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Recommended Reading</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {filteredBooks.map((book, index) => (
                  <Card key={index} className="border-none shadow-premium hover:shadow-2xl transition-all rounded-[2rem] overflow-hidden group bg-white">
                    <div className="flex flex-col sm:flex-row h-full">
                      <div className="sm:w-2/5 shrink-0 bg-slate-50 p-6 flex items-center justify-center">
                        {book.cover ? (
                          <img 
                            src={book.cover} 
                            alt={book.title}
                            className="w-full shadow-lg rounded-lg transform group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <BookOpen className="w-16 h-16 text-slate-200" />
                        )}
                      </div>
                      <div className="flex-1 p-8 flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-1 leading-tight">{book.title}</h3>
                        <p className="text-sm text-primary font-semibold mb-4 italic">by {book.author}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{book.description}</p>
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
