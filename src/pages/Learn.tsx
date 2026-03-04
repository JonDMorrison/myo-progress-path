import { useEffect, useState } from "react";
import { LearnCard } from "@/components/learn/LearnCard";
import { SearchBar } from "@/components/learn/SearchBar";
import { loadLearnIndex, LearnArticle } from "@/lib/learn";
import { fuzzySearch } from "@/lib/searchLearn";
import { BookOpen, Brain, Stethoscope, Heart, Activity } from "lucide-react";
import { NavPublic } from "@/components/public/NavPublic";
import { FooterPublic } from "@/components/public/FooterPublic";
import { PatientHeader } from "@/components/layout/PatientHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import learnHubHero from "@/assets/learn-hub-hero.jpg";

// Articles that require authentication (logged-in only)
const RESTRICTED_ARTICLES = [
  'therapy-kit'
];

export default function Learn() {
  const [articles, setArticles] = useState<LearnArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || "");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || "");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadLearnIndex().then((data) => {
      setArticles(data);
      setIsLoading(false);
    });
  }, []);

  // Filter out restricted articles for non-authenticated users
  const availableArticles = isAuthenticated 
    ? articles 
    : articles.filter(article => !RESTRICTED_ARTICLES.includes(article.slug));

  const filtered = fuzzySearch(availableArticles, searchTerm);

  return (
    <>
      {isAuthenticated ? <PatientHeader userName={userName} /> : <NavPublic />}
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/10">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary-light/5 to-transparent border-b">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={learnHubHero} 
            alt="" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95" />
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Radial Gradient Overlays */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-glow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 max-w-6xl relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Glassmorphic Icon Badge */}
            <div className="inline-flex items-center justify-center p-4 rounded-3xl glassmorphic mb-6 shadow-[0_0_40px_rgba(0,149,255,0.3)] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light opacity-20 rounded-3xl" />
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary relative z-10" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
              Learn Hub
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Discover educational resources and evidence-based information about myofunctional therapy
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
        {/* Search Section */}
        <div className="mb-8 sm:mb-12 max-w-2xl mx-auto">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by title, tag, or keyword..."
          />
          {searchTerm && (
            <p className="mt-3 text-sm text-muted-foreground text-center">
              Found {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground animate-pulse">Loading Learn Hub...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article) => (
              <LearnCard key={article.slug} {...article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-accent/50 mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms</p>
          </div>
        )}
      </div>
      </div>
      <FooterPublic />
      {isAuthenticated && <BottomNav />}
    </>
  );
}
