export type ImageCitation = {
  label: string;
  href: string;
};

function normalize(path: string): string {
  if (!path) return "";
  let p = path.trim();
  const proto = p.match(/^https?:\/\/[^/]+(\/.*)$/i);
  if (proto) p = proto[1];
  p = p.split("?")[0].split("#")[0];
  if (!p.startsWith("/")) p = "/" + p;
  return p.toLowerCase();
}

const CITATIONS: Record<string, ImageCitation> = {
  "/images/learn/the-spot.jpg": {
    label: "Image source",
    href: "https://www.airwaysmyo.ca/post/unveiling-the-myo-spot-tongue-posture-s-vital-role-in-airway-function-and-myofunctional-therapy",
  },
  "/images/learn/vu-hickey.png": {
    label: "Image source",
    href: "https://www.wikihow.com/Tongue-Posture",
  },
  "/images/learn/palate-comparison-new.jpg": {
    label: "Image source",
    href: "https://www.ualberta.ca/en/airway-research/media-library/constriction-no-xbite.jpg",
  },
};

export function getImageCitation(src: string | undefined | null): ImageCitation | null {
  if (!src) return null;
  return CITATIONS[normalize(src)] ?? null;
}
