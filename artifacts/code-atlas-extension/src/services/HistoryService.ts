import * as vscode from 'vscode';
import type { StorageService } from '../storage/StorageService';
import { STORAGE_KEYS } from '../storage/StorageService';

const DEFAULT_MAX = 20;

export class HistoryService {
  constructor(private readonly storage: StorageService) {}

  private maxSize(): number {
    return (
      vscode.workspace.getConfiguration('codeAtlas').get<number>('historySize') ?? DEFAULT_MAX
    );
  }

  getAll(): string[] {
    return this.storage.get<string[]>(STORAGE_KEYS.HISTORY, []);
  }

  async push(id: string): Promise<void> {
    const current = this.getAll().filter((h) => h !== id);
    const updated = [id, ...current].slice(0, this.maxSize());
    await this.storage.set(STORAGE_KEYS.HISTORY, updated);
  }

  async clear(): Promise<void> {
    await this.storage.set(STORAGE_KEYS.HISTORY, []);
  }
}
