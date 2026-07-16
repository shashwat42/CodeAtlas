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
exports.HistoryService = void 0;
const vscode = __importStar(require("vscode"));
const StorageService_1 = require("../storage/StorageService");
const DEFAULT_MAX = 20;
class HistoryService {
    constructor(storage) {
        this.storage = storage;
    }
    maxSize() {
        return (vscode.workspace.getConfiguration('codeAtlas').get('historySize') ?? DEFAULT_MAX);
    }
    getAll() {
        return this.storage.get(StorageService_1.STORAGE_KEYS.HISTORY, []);
    }
    async push(id) {
        const current = this.getAll().filter((h) => h !== id);
        const updated = [id, ...current].slice(0, this.maxSize());
        await this.storage.set(StorageService_1.STORAGE_KEYS.HISTORY, updated);
    }
    async clear() {
        await this.storage.set(StorageService_1.STORAGE_KEYS.HISTORY, []);
    }
}
exports.HistoryService = HistoryService;
//# sourceMappingURL=HistoryService.js.map