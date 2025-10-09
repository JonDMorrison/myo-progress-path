import { useEffect, useState } from "react";
import { LearnCard } from "@/components/learn/LearnCard";
import { SearchBar } from "@/components/learn/SearchBar";
import { loadLearnIndex, LearnArticle } from "@/lib/learn";
import { fuzzySearch } from "@/lib/searchLearn";

export default function Learn() {
  const [articles, setArticles] = useState<LearnArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLearnIndex().then(setArticles);
  }, []);

  const filtered = fuzzySearch(articles, searchTerm);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Learn Hub</h1>
          <p className="text-base sm:text-lg text-muted-foreground">Educational resources about myofunctional therapy</p>
        </div>

        <div className="mb-6 sm:mb-8 max-w-md mx-auto">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by title, tag, or keyword..."
          />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <LearnCard key={article.slug} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
}
