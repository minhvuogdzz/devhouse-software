class MemoryCache {
  constructor() {
    this.store = new Map();
    this.tagMap = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.invalidateKey(key);
      return null;
    }

    return entry.value;
  }

  set(key, value, options = {}) {
    const { ttlMs = 60000, tags = [] } = options;
    const expiresAt = Date.now() + ttlMs;

    this.store.set(key, { value, expiresAt, tags });

    for (const tag of tags) {
      if (!this.tagMap.has(tag)) {
        this.tagMap.set(tag, new Set());
      }
      this.tagMap.get(tag).add(key);
    }
  }

  invalidateKey(key) {
    const entry = this.store.get(key);
    if (entry && entry.tags) {
      for (const tag of entry.tags) {
        const keys = this.tagMap.get(tag);
        if (keys) {
          keys.delete(key);
          if (keys.size === 0) {
            this.tagMap.delete(tag);
          }
        }
      }
    }
    this.store.delete(key);
  }

  invalidateTag(tag) {
    const keys = this.tagMap.get(tag);
    if (keys) {
      for (const key of keys) {
        this.store.delete(key);
      }
      this.tagMap.delete(tag);
    }
  }

  clear() {
    this.store.clear();
    this.tagMap.clear();
  }
}

export const cache = new MemoryCache();
