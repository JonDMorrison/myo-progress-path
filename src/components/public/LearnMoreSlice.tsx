import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, AlertCircle, Calendar, Package } from "lucide-react";

export function LearnMoreSlice() {
  const articles = [
    {
      slug: "program-specifics",
      title: "Program Specifics",
      description: "Daily format, exercise types, and what to expect from your therapy journey.",
      icon: BookOpen
    },
    {
      slug: "compensations",
      title: "Compensations to Limit",
      description: "Learn to recognize and avoid compensatory muscle patterns during exercises.",
      icon: AlertCircle
    },
    {
      slug: "frenectomy-pathway",
      title: "Frenectomy Pathway",
      description: "Timeline, readiness criteria, and what to expect if tongue tie release is needed.",
      icon: Calendar
    },
    {
      slug: "therapy-kit",
      title: "Your Therapy Kit",
      description: "Everything included in your myofunctional therapy kit and how to use each item.",
      icon: Package
    }
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Further Reading</h2>
          <p className="text-xl text-muted-foreground">
            Deep dive into program details and preparation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {articles.map((article) => {
            const Icon = article.icon;
            return (
              <Card key={article.slug} className="rounded-2xl hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{article.title}</CardTitle>
                      <CardDescription>{article.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/learn/${article.slug}`}>Read Article</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <Link to="/learn">
              <BookOpen className="w-4 h-4 mr-2" />
              View All Articles
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
