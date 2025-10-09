export const learnLinksByWeek: Record<number, string[]> = {
  1: ["intro-to-myofunctional-therapy", "four-goals#nasal-breathing"],
  2: ["four-goals#nasal-breathing"],
  3: ["four-goals#lip-seal"],
  4: ["four-goals#tongue-posture"],
  5: ["four-goals#tongue-posture"],
  6: ["four-goals#chewing-and-swallowing"],
  7: ["four-goals#chewing-and-swallowing"],
  8: ["sleep-apnea", "health-effects"],
  11: ["expectations"],
  12: ["expectations"],
  15: ["health-effects"],
  17: ["sleep-apnea"],
  20: ["sleep-apnea", "health-effects"]
};

export interface LearnArticle {
  slug: string;
  title: string;
  tags: string[];
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
  "incisive papilla": "The small bump on the roof of your mouth just behind your upper front teeth, also called 'the spot'",
  "the spot": "The incisive papilla - where your tongue should rest",
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
