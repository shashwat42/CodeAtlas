"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORAGE_KEYS = exports.StorageService = void 0;
class StorageService {
    constructor(context) {
        this.context = context;
    }
    get(key, defaultValue) {
        return this.context.globalState.get(key, defaultValue);
    }
    async set(key, value) {
        await this.context.globalState.update(key, value);
    }
    async delete(key) {
        await this.context.globalState.update(key, undefined);
    }
}
exports.StorageService = StorageService;
exports.STORAGE_KEYS = {
    FAVORITES: 'codeAtlas.favorites',
    HISTORY: 'codeAtlas.history',
};
//# sourceMappingURL=StorageService.js.map