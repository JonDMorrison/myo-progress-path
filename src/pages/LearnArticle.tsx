import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StickyTOC } from "@/components/learn/StickyTOC";
import { loadArticle } from "@/lib/learn";
import { ArrowLeft, BookOpen, Clock, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { NavPublic } from "@/components/public/NavPublic";
import { PatientHeader } from "@/components/layout/PatientHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
  const [programVariant, setProgramVariant] = useState<string | null>(null);

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
        const { data: patientData } = await supabase
          .from('patients')
          .select('program_variant')
          .eq('user_id', session.user.id)
          .single();
        setProgramVariant(patientData?.program_variant ?? null);
      }
    };

    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || "");
      } else {
        setProgramVariant(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [slug]);

  // Non-frenectomy patients: standard is the non-surgical pathway and should
  // not see frenectomy-only content. Only true frenectomy variants are excluded.
  const isNonFrenectomyPatient = programVariant !== null &&
    programVariant !== 'frenectomy' &&
    programVariant !== 'frenectomy_video';

  // Article requires login
  const isRestricted = slug && RESTRICTED_ARTICLES.includes(slug);
  // Article is frenectomy-only and this patient is on the non-surgical pathway
  const isWrongPathway = isAuthenticated && slug === 'frenectomy-pathway' && isNonFrenectomyPatient;

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

  if (isWrongPathway) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background">
        <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
            <Button variant="ghost" onClick={() => navigate("/learn")} className="hover:bg-accent">
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
            <h1 className="text-2xl font-bold mb-2">Not Available for Your Pathway</h1>
            <p className="text-muted-foreground mb-6">
              This article is for patients on the frenectomy pathway. It doesn't apply to your current program.
            </p>
            <Button variant="outline" onClick={() => navigate("/learn")}>
              Back to Learning Hub
            </Button>
          </Card>
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
            <h1 className="text-2xl font-bold mb-2">Login Required</h1>
            <p className="text-muted-foreground mb-6">
              This content is available to enrolled patients only. Please sign in to access your learning hub.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate("/learn")}>
                Back to Learning Hub
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

      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12 pb-24 sm:pb-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Article Hero Card */}
            <Card className="relative overflow-hidden p-4 sm:p-6 md:p-8 border-2 shadow-lg glassmorphic">
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
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent leading-tight pb-1">
                    {article.title}
                  </h1>
                </div>
              </div>
            </Card>

            {/* Article Content */}
            <Card className="p-4 sm:p-6 md:p-10 shadow-lg overflow-hidden">
              <article className="prose max-w-none">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: () => null, // Skip all h1s since title is in hero card
                    h2: ({node, ...props}) => {
                      const text = String(props.children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return <h2 id={id} className="clear-both" {...props} />;
                    },
                    h3: ({node, ...props}) => {
                      const text = String(props.children);
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return <h3 id={id} {...props} />;
                    },
                    p: ({node, children, ...props}) => {
                      // Check if paragraph contains only an image
                      const hasOnlyImage = node?.children?.length === 1 && 
                        node.children[0].type === 'element' && 
                        node.children[0].tagName === 'img';
                      
                      if (hasOnlyImage) {
                        // Return children directly without p wrapper so img float works
                        return <>{children}</>;
                      }
                      return <p {...props}>{children}</p>;
                    },
                    img: ({node, ...props}) => {
                      const className = props.className || '';
                      const src = props.src || '';
                      const alt = props.alt || '';
                      
                      // Full width for comparison or important diagrams
                      const shouldBeFullWidth = alt.toLowerCase().includes('comparison') || 
                                               alt.toLowerCase().includes('normal vs') ||
                                               className.includes('full-width');

                      if (className.includes('myokit-image') || src.includes('myokit') || shouldBeFullWidth) {
                        return (
                          <div className="my-8 flex justify-center">
                            <img 
                              {...props} 
                              className={cn(
                                "rounded-xl shadow-xl max-w-full h-auto",
                                shouldBeFullWidth ? "w-full md:w-[85%]" : ""
                              )}
                            />
                          </div>
                        );
                      }
                      
                      return (
                        <img 
                          {...props} 
                          className="float-right w-full sm:w-[45%] md:w-[35%] lg:w-[30%] ml-0 sm:ml-6 mb-4 sm:mb-6 mt-1 rounded-lg shadow-md clear-right max-sm:float-none"
                        />
                      );
                    },
                    // Style Vimeo embeds responsively
                    div: ({node, ...props}) => {
                      const style = props.style as React.CSSProperties | undefined;
                      if (style?.position === 'relative' && style?.padding) {
                        return (
                          <div 
                            {...props} 
                            className="my-6 rounded-lg overflow-hidden shadow-lg"
                          />
                        );
                      }
                      return <div {...props} />;
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
