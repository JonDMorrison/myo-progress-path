interface SectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function Section({ children, className = "", delay = 0 }: SectionProps) {
  return (
    <section
      className={`opacity-0 translate-y-2 animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}
