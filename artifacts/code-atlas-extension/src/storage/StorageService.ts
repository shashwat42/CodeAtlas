import * as vscode from 'vscode';

export class StorageService {
  constructor(private readonly context: vscode.ExtensionContext) {}

  get<T>(key: string, defaultValue: T): T {
    return this.context.globalState.get<T>(key, defaultValue);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.context.globalState.update(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.context.globalState.update(key, undefined);
  }
}

export const STORAGE_KEYS = {
  FAVORITES: 'codeAtlas.favorites',
  HISTORY: 'codeAtlas.history',
} as const;
