interface ResponsiveVideoProps {
  src: string;
  title: string;
}

export function ResponsiveVideo({ src, title }: ResponsiveVideoProps) {
  return (
    <div className="mt-4 rounded-2xl border overflow-hidden shadow-sm">
      <div className="aspect-video bg-muted">
        <iframe
          src={src}
          title={title}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}
