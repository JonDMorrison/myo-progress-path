import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { SkipToContent } from "@/components/public/SkipToContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, ExternalLink } from "lucide-react";
import { getPageTitle } from "@/lib/seo";
import resourcesHero from "@/assets/resources-hero.jpg";

const Resources = () => {
  const researchArticles = [
    {
      title: "Myofunctional Therapy to Treat Obstructive Sleep Apnea: A Systematic Review",
      authors: "Camacho et al.",
      journal: "Sleep",
      year: "2015",
      description: "Comprehensive review demonstrating the effectiveness of myofunctional therapy for sleep-disordered breathing.",
      url: "https://academic.oup.com/sleep/article/38/5/669/2416985"
    },
    {
      title: "Effects of Orofacial Myofunctional Therapy on Sleep-Disordered Breathing in Children",
      authors: "Villa et al.",
      journal: "Sleep Medicine",
      year: "2015",
      description: "Study showing significant improvements in pediatric sleep apnea following myofunctional therapy.",
      url: "https://pubmed.ncbi.nlm.nih.gov/25819416/"
    },
    {
      title: "Myofunctional Therapy and Prefabricated Functional Appliances",
      authors: "Guilleminault & Huang",
      journal: "Sleep Medicine Clinics",
      year: "2017",
      description: "Research on the role of myofunctional therapy in treating sleep-disordered breathing across age groups.",
      url: "https://pubmed.ncbi.nlm.nih.gov/28778231/"
    }
  ];

  const recommendedBooks = [
    {
      title: "Jaws: The Story of a Hidden Epidemic",
      author: "Sandra Kahn & Paul R. Ehrlich",
      description: "Explores how modern lifestyles have affected jaw development and breathing, and what we can do about it.",
      category: "General Interest"
    },
    {
      title: "Breath: The New Science of a Lost Art",
      author: "James Nestor",
      description: "A fascinating journey into the science of breathing and its profound effects on health and performance.",
      category: "General Interest"
    },
    {
      title: "The Oxygen Advantage",
      author: "Patrick McKeown",
      description: "Practical techniques for improving breathing patterns, athletic performance, and overall health.",
      category: "Breathing Techniques"
    },
    {
      title: "Myofunctional Therapy: A Novel Approach",
      author: "Joy L. Moeller",
      description: "Clinical guide to myofunctional therapy techniques and treatment protocols.",
      category: "Clinical/Professional"
    }
  ];

  return (
    <>
      <Helmet>
        <title>{getPageTitle("Research & Resources")}</title>
        <meta 
          name="description" 
          content="Evidence-based research articles and recommended reading about myofunctional therapy, breathing, and oral health." 
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
                Evidence-based information and recommended reading about myofunctional therapy
              </p>
            </div>
          </section>

          {/* Research Articles */}
          <section className="py-16 bg-background">
            <div className="container max-w-5xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Peer-Reviewed Research</h2>
              </div>

              <div className="space-y-6">
                {researchArticles.map((article, index) => (
                  <Card key={index} className="border-2 hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {article.authors} • {article.journal} ({article.year})
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{article.description}</p>
                      <Button asChild variant="outline" size="sm">
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          Read Article
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-8 bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> These research articles are provided for educational purposes. 
                    Individual results may vary. Always consult with healthcare professionals about your 
                    specific situation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Recommended Books */}
          <section className="py-16 bg-muted/50">
            <div className="container max-w-5xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Recommended Reading</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {recommendedBooks.map((book, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <CardTitle className="text-lg leading-tight flex-1">
                          {book.title}
                        </CardTitle>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                          {book.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">by {book.author}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{book.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Learning Resources CTA */}
          <section className="py-16 bg-background">
            <div className="container max-w-4xl text-center">
              <h2 className="text-3xl font-bold mb-4">
                Want to Learn More?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Explore our educational articles covering all aspects of myofunctional therapy
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/learn">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Browse Learning Hub
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/register">Get Started</Link>
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

export default Resources;
