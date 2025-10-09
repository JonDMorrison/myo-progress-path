import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface LearnCardProps {
  slug: string;
  title: string;
  tags: string[];
}

export function LearnCard({ slug, title, tags }: LearnCardProps) {
  return (
    <Link to={`/learn/${slug}`} className="block h-full group">
      <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-light shrink-0 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-medium px-2.5 py-0.5">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
