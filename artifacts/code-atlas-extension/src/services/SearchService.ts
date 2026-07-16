import type { ApiEntry, SearchResult } from '../models/types';

export class SearchService {
  constructor(private readonly getEntries: () => ApiEntry[]) {}

  search(query: string): SearchResult[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: SearchResult[] = [];

    for (const entry of this.getEntries()) {
      const score = this.score(entry, q);
      if (score > 0) {
        results.push({ entry, score });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 50);
  }

  private score(entry: ApiEntry, query: string): number {
    let score = 0;

    // Exact name match
    const lname = entry.name.toLowerCase();
    if (lname === query) return 1000;

    // Name starts with query
    if (lname.startsWith(query)) score += 100;

    // Name contains query
    if (lname.includes(query)) score += 50;

    // Category match
    const lcat = entry.category.toLowerCase();
    if (lcat === query) score += 80;
    if (lcat.includes(query)) score += 30;

    // Language match
    if (entry.language.toLowerCase().includes(query)) score += 20;

    // Keywords
    for (const kw of entry.keywords) {
      if (kw.toLowerCase() === query) score += 60;
      if (kw.toLowerCase().includes(query)) score += 20;
    }

    // Description contains query
    if (entry.description.toLowerCase().includes(query)) score += 15;

    // Fuzzy: all query chars present in name in order
    if (score === 0 && this.fuzzyMatch(lname, query)) score += 5;

    return score;
  }

  private fuzzyMatch(text: string, query: string): boolean {
    let ti = 0;
    for (let qi = 0; qi < query.length; qi++) {
      const found = text.indexOf(query[qi], ti);
      if (found === -1) return false;
      ti = found + 1;
    }
    return true;
  }
}
