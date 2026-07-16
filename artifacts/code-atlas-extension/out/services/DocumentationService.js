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
exports.DocumentationService = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const DATA_FILES = ['javascript.json', 'typescript.json', 'nodejs.json'];
class DocumentationService {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
        this.entries = new Map();
        this.languageData = [];
        this.loadAll();
    }
    loadAll() {
        for (const file of DATA_FILES) {
            try {
                const filePath = path.join(this.extensionUri.fsPath, 'docs', 'data', file);
                const raw = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(raw);
                this.languageData.push(data);
                for (const entry of data.entries) {
                    this.entries.set(entry.id, entry);
                }
            }
            catch (err) {
                // Log silently — data file may not exist in dev
            }
        }
    }
    getAllEntries() {
        return Array.from(this.entries.values());
    }
    getEntry(id) {
        return this.entries.get(id);
    }
    getLanguages() {
        return this.languageData.map((d) => d.language);
    }
    getCategories(language) {
        const entries = this.getEntriesForLanguage(language);
        const categories = new Set(entries.map((e) => e.category));
        return Array.from(categories).sort();
    }
    getEntriesForLanguage(language) {
        return this.getAllEntries().filter((e) => e.language === language);
    }
    getEntriesForCategory(language, category) {
        return this.getAllEntries()
            .filter((e) => e.language === language && e.category === category)
            .sort((a, b) => a.name.localeCompare(b.name));
    }
    resolveRelated(ids) {
        return ids.map((id) => this.entries.get(id)).filter((e) => e !== undefined);
    }
}
exports.DocumentationService = DocumentationService;
//# sourceMappingURL=DocumentationService.js.map