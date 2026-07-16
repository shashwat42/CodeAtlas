import * as vscode from 'vscode';
import type { DocumentationService } from '../../services/DocumentationService';
import type { FavoritesService } from '../../services/FavoritesService';
import type { HistoryService } from '../../services/HistoryService';
import { LanguageNode, CategoryNode, EntryNode } from './CodeAtlasTreeItem';
import type { AnyNode } from './CodeAtlasTreeItem';

// ─── Main Browse Tree ────────────────────────────────────────────────────────

export class CodeAtlasTreeProvider implements vscode.TreeDataProvider<AnyNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AnyNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private readonly docs: DocumentationService,
    private readonly favorites: FavoritesService
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: AnyNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AnyNode): AnyNode[] {
    if (!element) {
      return this.docs.getLanguages().map((lang) => new LanguageNode(lang));
    }

    if (element instanceof LanguageNode) {
      return this.docs
        .getCategories(element.language)
        .map((cat) => new CategoryNode(cat, element.language));
    }

    if (element instanceof CategoryNode) {
      return this.docs
        .getEntriesForCategory(element.language, element.category)
        .map((entry) => new EntryNode(entry, this.favorites.isFavorite(entry.id)));
    }

    return [];
  }
}

// ─── Favorites Tree ──────────────────────────────────────────────────────────

export class FavoritesTreeProvider implements vscode.TreeDataProvider<EntryNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<EntryNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private readonly docs: DocumentationService,
    private readonly favorites: FavoritesService
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: EntryNode): vscode.TreeItem {
    return element;
  }

  getChildren(): EntryNode[] {
    const ids = this.favorites.getAll();
    return ids
      .map((id) => this.docs.getEntry(id))
      .filter((e) => e !== undefined)
      .map((e) => new EntryNode(e!, true));
  }
}

// ─── History Tree ─────────────────────────────────────────────────────────────

export class HistoryTreeProvider implements vscode.TreeDataProvider<EntryNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<EntryNode | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private readonly docs: DocumentationService,
    private readonly history: HistoryService,
    private readonly favorites: FavoritesService
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: EntryNode): vscode.TreeItem {
    return element;
  }

  getChildren(): EntryNode[] {
    const ids = this.history.getAll();
    return ids
      .map((id) => this.docs.getEntry(id))
      .filter((e) => e !== undefined)
      .map((e) => new EntryNode(e!, this.favorites.isFavorite(e!.id)));
  }
}
