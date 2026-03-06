import { BookOpen, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const keyArticles = [
  { slug: "program-specifics", title: "Program Specifics" },
  { slug: "compensations", title: "Compensations to Limit" },
  { slug: "frenectomy-pathway", title: "Frenectomy Pathway" },
  { slug: "therapy-kit", title: "Your Therapy Kit" },
];

export const LearnHubStep = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Learning Resources</h2>
        <p className="text-muted-foreground">
          Understanding the foundations of your therapy is essential for success
        </p>
      </div>

      <div className="bg-accent/50 rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold text-lg mb-3">Why This Matters</h3>
        <p className="text-muted-foreground text-sm sm:text-base mb-4">
          Before you begin your exercises, it's important to understand <strong>why</strong> you're doing them 
          and <strong>what to avoid</strong>. The Learning Hub contains essential information about:
        </p>
        <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>How myofunctional therapy works and its goals</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>What to expect during your program</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Compensations to watch for and avoid during exercises</span>
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Key Articles to Review</h3>
        <div className="grid gap-2">
          {keyArticles.map((article) => (
            <Link
              key={article.slug}
              to={`/learn/${article.slug}`}
              target="_blank"
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
            >
              <span className="font-medium text-sm sm:text-base">{article.title}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm text-center text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> You can always access the Learning Hub from your dashboard. 
          Take your time to review these articles—they'll help you get the most from your therapy.
        </p>
      </div>
    </div>
  );
};
