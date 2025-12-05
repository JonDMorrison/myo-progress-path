interface ResponsiveVideoProps {
  src: string;
  title: string;
  portrait?: boolean;
}

export function ResponsiveVideo({ src, title, portrait = false }: ResponsiveVideoProps) {
  return (
    <div className={`mt-4 rounded-2xl border overflow-hidden shadow-sm ${portrait ? 'max-w-xs mx-auto' : ''}`}>
      <div className={`${portrait ? 'aspect-[9/16]' : 'aspect-video'} bg-muted`}>
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
