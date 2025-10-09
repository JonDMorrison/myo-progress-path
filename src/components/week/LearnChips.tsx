import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { learnLinksByWeek, getArticleTitle, loadLearnIndex, LearnArticle } from "@/lib/learn";
import { useEffect, useState } from "react";

interface LearnChipsProps {
  weekNumber: number;
}

export function LearnChips({ weekNumber }: LearnChipsProps) {
  const [articles, setArticles] = useState<LearnArticle[]>([]);
  const slugs = learnLinksByWeek[weekNumber];

  useEffect(() => {
    loadLearnIndex().then(setArticles);
  }, []);

  if (!slugs || slugs.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <BookOpen className="w-3 h-3" />
        Learn more:
      </span>
      {slugs.map((slug) => {
        const [baseSlug, anchor] = slug.split('#');
        const title = getArticleTitle(slug, articles);
        const linkTo = anchor ? `/learn/${baseSlug}#${anchor}` : `/learn/${baseSlug}`;
        
        return (
          <Link key={slug} to={linkTo}>
            <Badge variant="secondary" className="hover:bg-primary/20 transition-colors cursor-pointer">
              {anchor ? anchor.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : title}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}
