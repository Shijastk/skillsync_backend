// Simple in-memory cache for high-speed data access
// In production, use Redis for distributed caching

class CacheService {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map(); // Time to live
    }

    set(key, value, ttlSeconds = 300) {
        this.cache.set(key, value);

        if (ttlSeconds > 0) {
            const expiryTime = Date.now() + (ttlSeconds * 1000);
            this.ttl.set(key, expiryTime);

            // Auto-cleanup
            setTimeout(() => {
                this.delete(key);
            }, ttlSeconds * 1000);
        }
    }

    get(key) {
        // Check if expired
        if (this.ttl.has(key)) {
            const expiryTime = this.ttl.get(key);
            if (Date.now() > expiryTime) {
                this.delete(key);
                return null;
            }
        }

        return this.cache.get(key) || null;
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        this.cache.delete(key);
        this.ttl.delete(key);
    }

    clear() {
        this.cache.clear();
        this.ttl.clear();
    }

    // Cache patterns for common queries
    getCacheKey(type, ...params) {
        return `${type}:${params.join(':')}`;
    }
}

export const cache = new CacheService();

// Cache middleware for GET requests
export const cacheMiddleware = (ttlSeconds = 300) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = cache.getCacheKey('route', req.originalUrl);
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        // Override res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            cache.set(key, data, ttlSeconds);
            return originalJson(data);
        };

        next();
    };
};

// Invalidate cache by pattern
export const invalidateCache = (pattern) => {
    const keys = Array.from(cache.cache.keys());
    keys.forEach(key => {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    });
};
