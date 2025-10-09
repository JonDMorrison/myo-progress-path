import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { LearnCard } from "@/components/learn/LearnCard";
import { loadLearnIndex, LearnArticle } from "@/lib/learn";
import { Search } from "lucide-react";

export default function Learn() {
  const [articles, setArticles] = useState<LearnArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLearnIndex().then(setArticles);
  }, []);

  const filtered = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Learn Hub</h1>
          <p className="text-lg text-muted-foreground">Educational resources about myofunctional therapy</p>
        </div>

        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <LearnCard key={article.slug} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
}
