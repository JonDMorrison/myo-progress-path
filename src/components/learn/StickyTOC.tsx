import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List } from "lucide-react";

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
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <Card className="border-2 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <List className="w-4 h-4 text-primary" />
              On This Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-250px)]">
              <nav className="space-y-1">
                {headings.map(({ id, text, level }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`
                      block py-2 px-3 rounded-lg text-sm transition-all duration-200
                      ${level === 2 ? 'pl-3' : level === 3 ? 'pl-6' : 'pl-9'}
                      ${activeId === id 
                        ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }
                    `}
                  >
                    {text}
                  </a>
                ))}
              </nav>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
