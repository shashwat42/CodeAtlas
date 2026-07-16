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
exports.HistoryTreeProvider = exports.FavoritesTreeProvider = exports.CodeAtlasTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const CodeAtlasTreeItem_1 = require("./CodeAtlasTreeItem");
// ─── Main Browse Tree ────────────────────────────────────────────────────────
class CodeAtlasTreeProvider {
    constructor(docs, favorites) {
        this.docs = docs;
        this.favorites = favorites;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return this.docs.getLanguages().map((lang) => new CodeAtlasTreeItem_1.LanguageNode(lang));
        }
        if (element instanceof CodeAtlasTreeItem_1.LanguageNode) {
            return this.docs
                .getCategories(element.language)
                .map((cat) => new CodeAtlasTreeItem_1.CategoryNode(cat, element.language));
        }
        if (element instanceof CodeAtlasTreeItem_1.CategoryNode) {
            return this.docs
                .getEntriesForCategory(element.language, element.category)
                .map((entry) => new CodeAtlasTreeItem_1.EntryNode(entry, this.favorites.isFavorite(entry.id)));
        }
        return [];
    }
}
exports.CodeAtlasTreeProvider = CodeAtlasTreeProvider;
// ─── Favorites Tree ──────────────────────────────────────────────────────────
class FavoritesTreeProvider {
    constructor(docs, favorites) {
        this.docs = docs;
        this.favorites = favorites;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        const ids = this.favorites.getAll();
        return ids
            .map((id) => this.docs.getEntry(id))
            .filter((e) => e !== undefined)
            .map((e) => new CodeAtlasTreeItem_1.EntryNode(e, true));
    }
}
exports.FavoritesTreeProvider = FavoritesTreeProvider;
// ─── History Tree ─────────────────────────────────────────────────────────────
class HistoryTreeProvider {
    constructor(docs, history, favorites) {
        this.docs = docs;
        this.history = history;
        this.favorites = favorites;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        const ids = this.history.getAll();
        return ids
            .map((id) => this.docs.getEntry(id))
            .filter((e) => e !== undefined)
            .map((e) => new CodeAtlasTreeItem_1.EntryNode(e, this.favorites.isFavorite(e.id)));
    }
}
exports.HistoryTreeProvider = HistoryTreeProvider;
//# sourceMappingURL=CodeAtlasTreeProvider.js.map