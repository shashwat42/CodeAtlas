import * as vscode from 'vscode';
import type { ApiEntry } from '../../models/types';

export type NodeKind = 'language' | 'category' | 'entry';

export class LanguageNode extends vscode.TreeItem {
  readonly kind: NodeKind = 'language';

  constructor(public readonly language: string) {
    super(language, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = new vscode.ThemeIcon('book');
    this.contextValue = 'language';
    this.tooltip = `Browse ${language} APIs`;
  }
}

export class CategoryNode extends vscode.TreeItem {
  readonly kind: NodeKind = 'category';

  constructor(
    public readonly category: string,
    public readonly language: string
  ) {
    super(category, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = new vscode.ThemeIcon('folder');
    this.contextValue = 'category';
    this.tooltip = `${language} → ${category}`;
  }
}

export class EntryNode extends vscode.TreeItem {
  readonly kind: NodeKind = 'entry';

  constructor(
    public readonly entry: ApiEntry,
    public readonly isFavorite: boolean = false
  ) {
    super(entry.name, vscode.TreeItemCollapsibleState.None);
    this.description = entry.returns ? `→ ${entry.returns}` : undefined;
    this.tooltip = entry.description;
    this.iconPath = isFavorite
      ? new vscode.ThemeIcon('star-full', new vscode.ThemeColor('charts.yellow'))
      : new vscode.ThemeIcon('symbol-method');
    this.contextValue = isFavorite ? 'entry.favorite' : 'entry';
    this.command = {
      command: 'codeAtlas.openEntry',
      title: 'Open Documentation',
      arguments: [entry.id],
    };

    if (entry.deprecated) {
      this.description = '⚠ deprecated';
      this.iconPath = new vscode.ThemeIcon('warning');
    }
  }
}

export type AnyNode = LanguageNode | CategoryNode | EntryNode;
