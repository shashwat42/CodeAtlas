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
exports.EntryNode = exports.CategoryNode = exports.LanguageNode = void 0;
const vscode = __importStar(require("vscode"));
class LanguageNode extends vscode.TreeItem {
    constructor(language) {
        super(language, vscode.TreeItemCollapsibleState.Collapsed);
        this.language = language;
        this.kind = 'language';
        this.iconPath = new vscode.ThemeIcon('book');
        this.contextValue = 'language';
        this.tooltip = `Browse ${language} APIs`;
    }
}
exports.LanguageNode = LanguageNode;
class CategoryNode extends vscode.TreeItem {
    constructor(category, language) {
        super(category, vscode.TreeItemCollapsibleState.Collapsed);
        this.category = category;
        this.language = language;
        this.kind = 'category';
        this.iconPath = new vscode.ThemeIcon('folder');
        this.contextValue = 'category';
        this.tooltip = `${language} → ${category}`;
    }
}
exports.CategoryNode = CategoryNode;
class EntryNode extends vscode.TreeItem {
    constructor(entry, isFavorite = false) {
        super(entry.name, vscode.TreeItemCollapsibleState.None);
        this.entry = entry;
        this.isFavorite = isFavorite;
        this.kind = 'entry';
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
exports.EntryNode = EntryNode;
//# sourceMappingURL=CodeAtlasTreeItem.js.map