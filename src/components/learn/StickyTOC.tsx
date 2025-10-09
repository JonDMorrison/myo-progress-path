import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface StickyTOCProps {
  content: string;
}

export function StickyTOC({ content }: StickyTOCProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from markdown
    const lines = content.split('\n');
    const extracted: Heading[] = [];
    
    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        extracted.push({ id, text, level });
      }
    });
    
    setHeadings(extracted);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="lg:sticky lg:top-24 hidden lg:block">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-70">
          On This Page
        </h3>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <nav className="space-y-1">
            {headings.map(({ id, text, level }) => (
              <a
                key={id}
                href={`#${id}`}
                className={[
                  "block py-1 text-sm transition-colors hover:text-primary",
                  level === 2 && "pl-0",
                  level === 3 && "pl-4",
                  activeId === id ? "text-primary font-medium" : "text-muted-foreground"
                ].join(" ")}
              >
                {text}
              </a>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}
