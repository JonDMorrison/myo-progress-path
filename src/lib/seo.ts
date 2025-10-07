export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: string;
}

export const DEFAULT_SEO = {
  siteName: "MyoCoach",
  defaultImage: "/placeholder.svg",
  twitterHandle: "@myocoach",
};

export const getPageTitle = (title: string) => {
  return `${title} | ${DEFAULT_SEO.siteName}`;
};

export const getSchemaOrgData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MyoCoach",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
};
