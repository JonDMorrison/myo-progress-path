import { LearnArticle } from "./learn";

/**
 * Simple fuzzy search implementation for Learn articles
 */
export function fuzzySearch(articles: LearnArticle[], query: string): LearnArticle[] {
  if (!query.trim()) return articles;

  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/);

  return articles
    .map(article => {
      let score = 0;
      const titleLower = article.title.toLowerCase();
      const tagsLower = article.tags.map(t => t.toLowerCase());

      // Exact title match (highest priority)
      if (titleLower === lowerQuery) {
        score += 100;
      }
      
      // Title contains full query
      if (titleLower.includes(lowerQuery)) {
        score += 50;
      }

      // All query words in title
      const titleWordsMatch = queryWords.every(word => titleLower.includes(word));
      if (titleWordsMatch) {
        score += 30;
      }

      // Each word in title adds to score
      queryWords.forEach(word => {
        if (titleLower.includes(word)) {
          score += 10;
        }
      });

      // Exact tag match
      if (tagsLower.some(tag => tag === lowerQuery)) {
        score += 40;
      }

      // Tag contains query
      if (tagsLower.some(tag => tag.includes(lowerQuery))) {
        score += 20;
      }

      // Each word in tags
      queryWords.forEach(word => {
        if (tagsLower.some(tag => tag.includes(word))) {
          score += 5;
        }
      });

      return { article, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.article);
}
