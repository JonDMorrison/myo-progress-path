import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StickyTOC } from "@/components/learn/StickyTOC";
import { loadArticle } from "@/lib/learn";
import { ArrowLeft, BookOpen, Clock, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { NavPublic } from "@/components/public/NavPublic";
import { PatientHeader } from "@/components/layout/PatientHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { supabase } from "@/integrations/supabase/client";

// Articles that require authentication (logged-in only)
// Public: intro-to-myofunctional-therapy, four-goals, expectations, structural-changes, 
//         health-effects, sleep-apnea, children-signs, causes-in-infancy
const RESTRICTED_ARTICLES = [
  'program-specifics',
  'compensations',
  'frenectomy-pathway',
  'therapy-kit'
];

export default function LearnArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<{ title: string; content: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Parallel loading: Check auth AND load article simultaneously
    const loadData = async () => {
      const [{ data: { session } }] = await Promise.all([
        supabase.auth.getSession(),
        slug ? loadArticle(slug).then(setArticle) : Promise.resolve()
      ]);
      
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || "");
      }
    };

    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [slug]);

  // Check if article is restricted and user is not authenticated
  const isRestricted = slug && RESTRICTED_ARTICLES.includes(slug);
  
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isRestricted && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background">
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
        
        <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl">
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              This article is available to registered users. Please sign in to access this content.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate("/learn")}>
                Back to Learn Hub
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
    <>
      {isAuthenticated ? <PatientHeader userName={userName} /> : <NavPublic />}
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

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 sm:pb-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Article Hero Card */}
            <Card className="relative overflow-hidden p-6 sm:p-8 border-2 shadow-lg glassmorphic">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className="p-3 rounded-xl glassmorphic shrink-0 shadow-[0_0_30px_rgba(0,149,255,0.2)]">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1 backdrop-blur-sm bg-background/40 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      {readingTime} min read
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent leading-tight pb-1">
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
    {isAuthenticated && <BottomNav />}
    </>
  );
}
