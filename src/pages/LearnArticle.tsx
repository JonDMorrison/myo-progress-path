import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StickyTOC } from "@/components/learn/StickyTOC";
import { loadArticle } from "@/lib/learn";
import { ArrowLeft } from "lucide-react";
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

  if (!article) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate("/learn")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Learn Hub
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
          <article className="prose prose-sm max-w-prose mx-auto lg:mx-0">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>
          
          <StickyTOC content={article.content} />
        </div>
      </div>
    </div>
  );
}
