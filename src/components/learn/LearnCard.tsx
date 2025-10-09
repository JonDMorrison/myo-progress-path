import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface LearnCardProps {
  slug: string;
  title: string;
  tags: string[];
}

export function LearnCard({ slug, title, tags }: LearnCardProps) {
  return (
    <Link to={`/learn/${slug}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg flex-1">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
