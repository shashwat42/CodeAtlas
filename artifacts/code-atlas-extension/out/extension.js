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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const StorageService_1 = require("./storage/StorageService");
const DocumentationService_1 = require("./services/DocumentationService");
const SearchService_1 = require("./services/SearchService");
const FavoritesService_1 = require("./services/FavoritesService");
const HistoryService_1 = require("./services/HistoryService");
const CodeAtlasTreeProvider_1 = require("./views/tree/CodeAtlasTreeProvider");
const WebviewProvider_1 = require("./views/webview/WebviewProvider");
const SearchViewProvider_1 = require("./views/search/SearchViewProvider");
const index_1 = require("./commands/index");
function activate(context) {
    // ── Services ──────────────────────────────────────────────────────────────
    const storage = new StorageService_1.StorageService(context);
    const docs = new DocumentationService_1.DocumentationService(context.extensionUri);
    const searchService = new SearchService_1.SearchService(() => docs.getAllEntries());
    const favorites = new FavoritesService_1.FavoritesService(storage);
    const history = new HistoryService_1.HistoryService(storage);
    // ── Tree Providers ────────────────────────────────────────────────────────
    const treeProvider = new CodeAtlasTreeProvider_1.CodeAtlasTreeProvider(docs, favorites);
    const favoritesProvider = new CodeAtlasTreeProvider_1.FavoritesTreeProvider(docs, favorites);
    const historyProvider = new CodeAtlasTreeProvider_1.HistoryTreeProvider(docs, history, favorites);
    const refreshTrees = () => {
        treeProvider.refresh();
        favoritesProvider.refresh();
    };
    const refreshHistory = () => historyProvider.refresh();
    // ── Webview ───────────────────────────────────────────────────────────────
    const webview = new WebviewProvider_1.WebviewProvider(context.extensionUri, docs, favorites, history, refreshTrees, refreshHistory);
    // ── Search Sidebar View ───────────────────────────────────────────────────
    const searchViewProvider = new SearchViewProvider_1.SearchViewProvider(searchService, (id) => webview.open(id));
    // ── Register Views ────────────────────────────────────────────────────────
    context.subscriptions.push(vscode.window.registerTreeDataProvider('codeAtlasTree', treeProvider), vscode.window.registerTreeDataProvider('codeAtlasFavorites', favoritesProvider), vscode.window.registerTreeDataProvider('codeAtlasHistory', historyProvider), vscode.window.registerWebviewViewProvider('codeAtlasSearch', searchViewProvider));
    // ── Register Commands ─────────────────────────────────────────────────────
    (0, index_1.registerCommands)(context, {
        docs,
        favorites,
        history,
        webview,
        treeProvider,
        favoritesProvider,
        historyProvider,
    });
}
exports.activate = activate;
function deactivate() {
    // Nothing to clean up
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map