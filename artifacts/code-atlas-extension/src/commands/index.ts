import * as vscode from 'vscode';
import type { DocumentationService } from '../services/DocumentationService';
import type { FavoritesService } from '../services/FavoritesService';
import type { HistoryService } from '../services/HistoryService';
import type { WebviewProvider } from '../views/webview/WebviewProvider';
import type { CodeAtlasTreeProvider, FavoritesTreeProvider, HistoryTreeProvider } from '../views/tree/CodeAtlasTreeProvider';
import type { EntryNode } from '../views/tree/CodeAtlasTreeItem';

export function registerCommands(
  context: vscode.ExtensionContext,
  {
    docs,
    favorites,
    history,
    webview,
    treeProvider,
    favoritesProvider,
    historyProvider,
  }: {
    docs: DocumentationService;
    favorites: FavoritesService;
    history: HistoryService;
    webview: WebviewProvider;
    treeProvider: CodeAtlasTreeProvider;
    favoritesProvider: FavoritesTreeProvider;
    historyProvider: HistoryTreeProvider;
  }
): void {
  const refreshAll = () => {
    treeProvider.refresh();
    favoritesProvider.refresh();
    historyProvider.refresh();
  };

  // Open documentation panel
  context.subscriptions.push(
    vscode.commands.registerCommand('codeAtlas.openEntry', async (id: string) => {
      await webview.open(id);
      historyProvider.refresh();
    })
  );

  // Insert first example of an entry (from tree item context)
  context.subscriptions.push(
    vscode.commands.registerCommand('codeAtlas.insertExample', async (node?: EntryNode) => {
      const entry = node?.entry ?? (await pickEntry(docs));
      if (!entry) return;
      const code = entry.examples[0]?.code;
      if (!code) {
        vscode.window.showWarningMessage(`No example available for ${entry.name}.`);
        return;
      }
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('Open a file in the editor first.');
        return;
      }
      await editor.edit((eb) => eb.insert(editor.selection.active, code));
    })
  );

  // Copy first example to clipboard
  context.subscriptions.push(
    vscode.commands.registerCommand('codeAtlas.copyExample', async (node?: EntryNode) => {
      const entry = node?.entry ?? (await pickEntry(docs));
      if (!entry) return;
      const code = entry.examples[0]?.code;
      if (!code) {
        vscode.window.showWarningMessage(`No example available for ${entry.name}.`);
        return;
      }
      await vscode.env.clipboard.writeText(code);
      vscode.window.showInformationMessage(`Copied ${entry.name} example to clipboard.`);
    })
  );

  // Open official docs URL
  context.subscriptions.push(
    vscode.commands.registerCommand('codeAtlas.openDocs', async (node?: EntryNode) => {
      const entry = node?.entry ?? (await pickEntry(docs));
      if (!entry) return;
      await vscode.env.openExternal(vscode.Uri.parse(entry.docs));
    })
  );

  // Add to favorites
  context.subscriptions.push(
    vscode.commands.registerCommand('codeAtlas.addFavorite', async (node?: EntryNode) => {
      const entry = node?.entry ?? (await pickEntry(docs));
      if (!entry) return;
      await favorites.add(entry.id);
      refreshAll();
      vscode.window.showInformationMessage(`Added ${entry.name} to Favorites.`);
    })
  );

  // Remove from favorites
  context.subscriptions.push(
    vscode.commands.registerCommand('codeAtlas.removeFavorite', async (node?: EntryNode) => {
      const entry = node?.entry ?? (await pickEntry(docs));
      if (!entry) return;
      await favorites.remove(entry.id);
      refreshAll();
      vscode.window.showInformationMessage(`Removed ${entry.name} from Favorites.`);
    })
  );

  // Clear history
  context.subscriptions.push(
    vscode.commands.registerCommand('codeAtlas.clearHistory', async () => {
      await history.clear();
      historyProvider.refresh();
    })
  );

  // Refresh tree
  context.subscriptions.push(
    vscode.commands.registerCommand('codeAtlas.refresh', () => {
      refreshAll();
    })
  );
}

async function pickEntry(docs: DocumentationService) {
  const entries = docs.getAllEntries();
  const items = entries.map((e) => ({
    label: e.name,
    description: `${e.language} › ${e.category}`,
    detail: e.description.slice(0, 80),
    entry: e,
  }));
  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select an API entry…',
    matchOnDescription: true,
    matchOnDetail: true,
  });
  return picked?.entry;
}
