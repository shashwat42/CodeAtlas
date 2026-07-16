import * as vscode from 'vscode';
import { StorageService } from './storage/StorageService';
import { DocumentationService } from './services/DocumentationService';
import { SearchService } from './services/SearchService';
import { FavoritesService } from './services/FavoritesService';
import { HistoryService } from './services/HistoryService';
import { CodeAtlasTreeProvider, FavoritesTreeProvider, HistoryTreeProvider } from './views/tree/CodeAtlasTreeProvider';
import { WebviewProvider } from './views/webview/WebviewProvider';
import { SearchViewProvider } from './views/search/SearchViewProvider';
import { registerCommands } from './commands/index';

export function activate(context: vscode.ExtensionContext): void {
  // ── Services ──────────────────────────────────────────────────────────────
  const storage = new StorageService(context);
  const docs = new DocumentationService(context.extensionUri);
  const searchService = new SearchService(() => docs.getAllEntries());
  const favorites = new FavoritesService(storage);
  const history = new HistoryService(storage);

  // ── Tree Providers ────────────────────────────────────────────────────────
  const treeProvider = new CodeAtlasTreeProvider(docs, favorites);
  const favoritesProvider = new FavoritesTreeProvider(docs, favorites);
  const historyProvider = new HistoryTreeProvider(docs, history, favorites);

  const refreshTrees = () => {
    treeProvider.refresh();
    favoritesProvider.refresh();
  };
  const refreshHistory = () => historyProvider.refresh();

  // ── Webview ───────────────────────────────────────────────────────────────
  const webview = new WebviewProvider(
    context.extensionUri,
    docs,
    favorites,
    history,
    refreshTrees,
    refreshHistory
  );

  // ── Search Sidebar View ───────────────────────────────────────────────────
  const searchViewProvider = new SearchViewProvider(searchService, (id) => webview.open(id));

  // ── Register Views ────────────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('codeAtlasTree', treeProvider),
    vscode.window.registerTreeDataProvider('codeAtlasFavorites', favoritesProvider),
    vscode.window.registerTreeDataProvider('codeAtlasHistory', historyProvider),
    vscode.window.registerWebviewViewProvider('codeAtlasSearch', searchViewProvider)
  );

  // ── Register Commands ─────────────────────────────────────────────────────
  registerCommands(context, {
    docs,
    favorites,
    history,
    webview,
    treeProvider,
    favoritesProvider,
    historyProvider,
  });
}

export function deactivate(): void {
  // Nothing to clean up
}
