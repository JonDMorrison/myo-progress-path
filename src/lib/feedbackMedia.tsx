import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, Loader, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FEEDBACK_BUCKET = "therapist-feedback";

type FeedbackMediaType = "video" | "photo";

export function cleanFeedbackBody(body: string | null | undefined): string {
  const cleaned = (body || "")
    .replace(/\[video attached\]/gi, "")
    .replace(/\[photo attached\]/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned || "Rich feedback";
}

export async function resolveFeedbackMediaUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const { data, error } = await supabase.storage
    .from(FEEDBACK_BUCKET)
    .createSignedUrl(value, 60 * 60);

  if (error) {
    console.error("Failed to resolve feedback media URL:", error);
    return null;
  }

  return data?.signedUrl || null;
}

interface FeedbackMediaButtonsProps {
  videoUrl?: string | null;
  photoUrl?: string | null;
  className?: string;
}

export function FeedbackMediaButtons({ videoUrl, photoUrl, className = "" }: FeedbackMediaButtonsProps) {
  const [opening, setOpening] = useState<FeedbackMediaType | null>(null);

  const openMedia = async (value: string | null | undefined, type: FeedbackMediaType) => {
    if (!value || opening) return;

    setOpening(type);
    try {
      const resolvedUrl = await resolveFeedbackMediaUrl(value);
      if (resolvedUrl) {
        window.open(resolvedUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setOpening(null);
    }
  };

  if (!videoUrl && !photoUrl) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {videoUrl && (
        <Button type="button" variant="outline" size="sm" onClick={() => openMedia(videoUrl, "video")} disabled={opening !== null}>
          {opening === "video" ? <Loader className="h-4 w-4 mr-1 animate-spin" /> : <Video className="h-4 w-4 mr-1" />}
          Watch Video
        </Button>
      )}
      {photoUrl && (
        <Button type="button" variant="outline" size="sm" onClick={() => openMedia(photoUrl, "photo")} disabled={opening !== null}>
          {opening === "photo" ? <Loader className="h-4 w-4 mr-1 animate-spin" /> : <Image className="h-4 w-4 mr-1" />}
          View Photo
        </Button>
      )}
    </div>
  );
}
