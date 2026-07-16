import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import type { ApiEntry, LanguageData } from '../models/types';

const DATA_FILES = ['javascript.json', 'typescript.json', 'nodejs.json'];

export class DocumentationService {
  private entries: Map<string, ApiEntry> = new Map();
  private languageData: LanguageData[] = [];

  constructor(private readonly extensionUri: vscode.Uri) {
    this.loadAll();
  }

  private loadAll(): void {
    for (const file of DATA_FILES) {
      try {
        const filePath = path.join(this.extensionUri.fsPath, 'docs', 'data', file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data: LanguageData = JSON.parse(raw);
        this.languageData.push(data);
        for (const entry of data.entries) {
          this.entries.set(entry.id, entry);
        }
      } catch (err) {
        // Log silently — data file may not exist in dev
      }
    }
  }

  getAllEntries(): ApiEntry[] {
    return Array.from(this.entries.values());
  }

  getEntry(id: string): ApiEntry | undefined {
    return this.entries.get(id);
  }

  getLanguages(): string[] {
    return this.languageData.map((d) => d.language);
  }

  getCategories(language: string): string[] {
    const entries = this.getEntriesForLanguage(language);
    const categories = new Set(entries.map((e) => e.category));
    return Array.from(categories).sort();
  }

  getEntriesForLanguage(language: string): ApiEntry[] {
    return this.getAllEntries().filter((e) => e.language === language);
  }

  getEntriesForCategory(language: string, category: string): ApiEntry[] {
    return this.getAllEntries()
      .filter((e) => e.language === language && e.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  resolveRelated(ids: string[]): ApiEntry[] {
    return ids.map((id) => this.entries.get(id)).filter((e): e is ApiEntry => e !== undefined);
  }
}
