type CacheRecord<T> = {
  expiresAt: number;
  value: T;
};

export class MemoryCache {
  private readonly store = new Map<string, CacheRecord<unknown>>();

  get<T>(key: string): T | null {
    const record = this.store.get(key);

    if (!record) {
      return null;
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return record.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): T {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    return value;
  }

  async withCache<T>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    const existing = this.get<T>(key);

    if (existing !== null) {
      return existing;
    }

    const value = await loader();
    return this.set(key, value, ttlSeconds);
  }

  delete(key: string) {
    this.store.delete(key);
  }
}

export const cache = new MemoryCache();

