"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesService = void 0;
const StorageService_1 = require("../storage/StorageService");
class FavoritesService {
    constructor(storage) {
        this.storage = storage;
    }
    getAll() {
        return this.storage.get(StorageService_1.STORAGE_KEYS.FAVORITES, []);
    }
    isFavorite(id) {
        return this.getAll().includes(id);
    }
    async add(id) {
        const current = this.getAll();
        if (!current.includes(id)) {
            await this.storage.set(StorageService_1.STORAGE_KEYS.FAVORITES, [...current, id]);
        }
    }
    async remove(id) {
        const current = this.getAll().filter((f) => f !== id);
        await this.storage.set(StorageService_1.STORAGE_KEYS.FAVORITES, current);
    }
    async toggle(id) {
        if (this.isFavorite(id)) {
            await this.remove(id);
            return false;
        }
        else {
            await this.add(id);
            return true;
        }
    }
}
exports.FavoritesService = FavoritesService;
//# sourceMappingURL=FavoritesService.js.map