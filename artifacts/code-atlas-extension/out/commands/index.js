"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode = __importStar(require("vscode"));
function registerCommands(context, { docs, favorites, history, webview, treeProvider, favoritesProvider, historyProvider, }) {
    const refreshAll = () => {
        treeProvider.refresh();
        favoritesProvider.refresh();
        historyProvider.refresh();
    };
    // Open documentation panel
    context.subscriptions.push(vscode.commands.registerCommand('codeAtlas.openEntry', async (id) => {
        await webview.open(id);
        historyProvider.refresh();
    }));
    // Insert first example of an entry (from tree item context)
    context.subscriptions.push(vscode.commands.registerCommand('codeAtlas.insertExample', async (node) => {
        const entry = node?.entry ?? (await pickEntry(docs));
        if (!entry)
            return;
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
    }));
    // Copy first example to clipboard
    context.subscriptions.push(vscode.commands.registerCommand('codeAtlas.copyExample', async (node) => {
        const entry = node?.entry ?? (await pickEntry(docs));
        if (!entry)
            return;
        const code = entry.examples[0]?.code;
        if (!code) {
            vscode.window.showWarningMessage(`No example available for ${entry.name}.`);
            return;
        }
        await vscode.env.clipboard.writeText(code);
        vscode.window.showInformationMessage(`Copied ${entry.name} example to clipboard.`);
    }));
    // Open official docs URL
    context.subscriptions.push(vscode.commands.registerCommand('codeAtlas.openDocs', async (node) => {
        const entry = node?.entry ?? (await pickEntry(docs));
        if (!entry)
            return;
        await vscode.env.openExternal(vscode.Uri.parse(entry.docs));
    }));
    // Add to favorites
    context.subscriptions.push(vscode.commands.registerCommand('codeAtlas.addFavorite', async (node) => {
        const entry = node?.entry ?? (await pickEntry(docs));
        if (!entry)
            return;
        await favorites.add(entry.id);
        refreshAll();
        vscode.window.showInformationMessage(`Added ${entry.name} to Favorites.`);
    }));
    // Remove from favorites
    context.subscriptions.push(vscode.commands.registerCommand('codeAtlas.removeFavorite', async (node) => {
        const entry = node?.entry ?? (await pickEntry(docs));
        if (!entry)
            return;
        await favorites.remove(entry.id);
        refreshAll();
        vscode.window.showInformationMessage(`Removed ${entry.name} from Favorites.`);
    }));
    // Clear history
    context.subscriptions.push(vscode.commands.registerCommand('codeAtlas.clearHistory', async () => {
        await history.clear();
        historyProvider.refresh();
    }));
    // Refresh tree
    context.subscriptions.push(vscode.commands.registerCommand('codeAtlas.refresh', () => {
        refreshAll();
    }));
}
exports.registerCommands = registerCommands;
async function pickEntry(docs) {
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
//# sourceMappingURL=index.js.map