import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { LearnArticle, getArticleTitle } from "@/lib/learn";

interface RelatedWeeksProps {
  slugs: string[];
  articles: LearnArticle[];
}

export function RelatedWeeks({ slugs, articles }: RelatedWeeksProps) {
  if (slugs.length === 0) return null;

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="w-5 h-5" />
          Learn More
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {slugs.map((slug) => {
          const [baseSlug, anchor] = slug.split('#');
          const title = getArticleTitle(slug, articles);
          const linkTo = anchor ? `/learn/${baseSlug}#${anchor}` : `/learn/${baseSlug}`;
          
          return (
            <Link key={slug} to={linkTo}>
              <Button variant="outline" className="w-full justify-start" size="sm">
                {title}
                {anchor && ` - ${anchor.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
