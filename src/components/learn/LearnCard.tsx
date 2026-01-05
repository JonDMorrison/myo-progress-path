import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface LearnCardProps {
  slug: string;
  title: string;
  tags: string[];
  description?: string;
}

export function LearnCard({ slug, title, tags, description }: LearnCardProps) {
  return (
    <Link to={`/learn/${slug}`} className="block h-full group">
      <Card className="relative h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 bg-gradient-to-br from-card via-card to-accent/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-2 relative">
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
        {description && (
          <CardContent className="pt-0 pb-4 relative">
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
