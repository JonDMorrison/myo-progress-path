export const learnLinksByWeek: Record<number, string[]> = {
  1: ["program-specifics", "compensations"],
  2: ["program-specifics", "compensations#neck-engagement"],
  3: ["program-specifics", "compensations#facial-grimace"],
  4: ["compensations#jaw-protrusion"],
  5: ["compensations#floor-of-mouth-activation"],
  6: ["program-specifics", "compensations#jaw-lateralization"],
  7: ["compensations"],
  8: ["compensations#mouth-breathing-nasal-unblocking"],
  9: ["program-specifics"],
  10: ["compensations"],
  11: ["program-specifics"],
  12: ["program-specifics"],
  13: ["compensations"],
  14: ["program-specifics"],
  15: ["compensations#mouth-breathing-nasal-unblocking"],
  16: ["program-specifics"],
  17: ["compensations#mouth-breathing-nasal-unblocking"],
  18: ["program-specifics"],
  19: ["compensations"],
  20: ["frenectomy-pathway", "compensations"],
  21: ["program-specifics"],
  22: ["program-specifics"],
  23: ["frenectomy-pathway"],
  24: ["program-specifics"]
};

export interface LearnArticle {
  slug: string;
  title: string;
  tags: string[];
  description?: string;
  content?: string;
}

export async function loadLearnIndex(): Promise<LearnArticle[]> {
  try {
    const response = await fetch('/content/learn/index.json');
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Failed to load learn index:', error);
    return [];
  }
}

export async function loadArticle(slug: string): Promise<{ title: string; content: string } | null> {
  try {
    const index = await loadLearnIndex();
    const article = index.find(a => a.slug === slug);
    if (!article) return null;

    const response = await fetch(`/content/learn/${slug}.md`);
    const content = await response.text();
    
    return {
      title: article.title,
      content
    };
  } catch (error) {
    console.error(`Failed to load article ${slug}:`, error);
    return null;
  }
}

export function getArticleTitle(slug: string, articles: LearnArticle[]): string {
  const parts = slug.split('#');
  const baseSlug = parts[0];
  const article = articles.find(a => a.slug === baseSlug);
  return article?.title || baseSlug;
}

const glossary: Record<string, string> = {
  "incisive papilla": "The small bump on the roof of your mouth just behind your upper front teeth",
  "the spot": "The area on the roof of your mouth behind your front teeth where your tongue should rest",
  "nitric oxide": "A gas produced in the nasal passages that improves oxygen absorption and has antimicrobial properties",
  "UARS": "Upper Airway Resistance Syndrome - a sleep breathing disorder that causes sleep fragmentation without full apneas",
  "BOLT score": "Body Oxygen Level Test - measures breath-hold time to assess breathing efficiency",
  "adenoids": "Lymphoid tissue in the back of the throat that can obstruct breathing when enlarged",
  "tonsils": "Lymphoid tissue at the back of the mouth that can obstruct breathing when enlarged",
  "SARPE": "Surgically Assisted Rapid Palatal Expansion",
  "MARPE": "Miniscrew-Assisted Rapid Palatal Expansion",
  "LPR": "Laryngopharyngeal Reflux - acid reflux that reaches the throat and voice box",
  "ankyloglossia": "Tongue tie - a condition where the lingual frenulum restricts tongue movement",
  "AHI": "Apnea-Hypopnea Index - measures the number of breathing pauses per hour during sleep"
};

export function getGlossaryTerm(term: string): string | undefined {
  return glossary[term.toLowerCase()];
}
