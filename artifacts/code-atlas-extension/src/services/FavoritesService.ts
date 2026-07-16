import type { StorageService } from '../storage/StorageService';
import { STORAGE_KEYS } from '../storage/StorageService';

export class FavoritesService {
  constructor(private readonly storage: StorageService) {}

  getAll(): string[] {
    return this.storage.get<string[]>(STORAGE_KEYS.FAVORITES, []);
  }

  isFavorite(id: string): boolean {
    return this.getAll().includes(id);
  }

  async add(id: string): Promise<void> {
    const current = this.getAll();
    if (!current.includes(id)) {
      await this.storage.set(STORAGE_KEYS.FAVORITES, [...current, id]);
    }
  }

  async remove(id: string): Promise<void> {
    const current = this.getAll().filter((f) => f !== id);
    await this.storage.set(STORAGE_KEYS.FAVORITES, current);
  }

  async toggle(id: string): Promise<boolean> {
    if (this.isFavorite(id)) {
      await this.remove(id);
      return false;
    } else {
      await this.add(id);
      return true;
    }
  }
}
