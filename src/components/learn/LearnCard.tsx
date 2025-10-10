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
      <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 bg-gradient-to-br from-card via-card to-accent/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-light shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {title}
              </CardTitle>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 relative">
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-medium px-3 py-1 shadow-sm">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-3 py-1">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
