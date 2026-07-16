export interface Parameter {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
}

export interface CodeExample {
  title: string;
  code: string;
  description?: string;
}

export interface ApiEntry {
  id: string;
  name: string;
  category: string;
  language: string;
  description: string;
  syntax: string;
  parameters: Parameter[];
  returns: string;
  examples: CodeExample[];
  related: string[];
  complexity?: string;
  docs: string;
  keywords: string[];
  deprecated?: boolean;
  version?: string;
  browserSupport?: string;
  commonMistakes?: string[];
  bestPractices?: string[];
  performanceNotes?: string;
  useCases?: string[];
}

export interface LanguageData {
  language: string;
  version: string;
  entries: ApiEntry[];
}

export interface TreeNodeType {
  kind: 'language' | 'category' | 'entry';
}

export interface SearchResult {
  entry: ApiEntry;
  score: number;
}
