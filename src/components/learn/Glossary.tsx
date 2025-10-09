import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { getGlossaryTerm } from "@/lib/learn";

interface GlossaryProps {
  term: string;
  children: React.ReactNode;
}

export function Glossary({ term, children }: GlossaryProps) {
  const definition = getGlossaryTerm(term);
  
  if (!definition) {
    return <>{children}</>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="underline decoration-dotted cursor-help text-primary">
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{term}</h4>
          <p className="text-sm text-muted-foreground">{definition}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
