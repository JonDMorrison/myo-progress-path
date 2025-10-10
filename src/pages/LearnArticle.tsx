import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StickyTOC } from "@/components/learn/StickyTOC";
import { loadArticle } from "@/lib/learn";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function LearnArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    if (slug) {
      loadArticle(slug).then(setArticle);
    }
  }, [slug]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  // Estimate reading time (rough: 200 words per minute)
  const wordCount = article.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/learn")} 
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learn Hub
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Article Hero Card */}
            <Card className="p-6 sm:p-8 border-2 shadow-lg bg-gradient-to-br from-card to-accent/10">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {readingTime} min read
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                    {article.title}
                  </h1>
                </div>
              </div>
            </Card>

            {/* Article Content */}
            <Card className="p-6 sm:p-10 shadow-lg">
              <article className="prose">
                <ReactMarkdown
                  components={{
                    h1: () => null, // Skip all h1s since title is in hero card
                    h2: ({node, ...props}) => {
                      const text = String(props.children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return <h2 id={id} {...props} />;
                    },
                    h3: ({node, ...props}) => {
                      const text = String(props.children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return <h3 id={id} {...props} />;
                    },
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </article>
            </Card>

            {/* Bottom Navigation */}
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/learn")}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Learn Hub
              </Button>
            </div>
          </div>
          
          {/* Sidebar - TOC is hidden on mobile, shown as sticky on desktop */}
          <StickyTOC content={article.content} />
        </div>
      </div>
    </div>
  );
}
