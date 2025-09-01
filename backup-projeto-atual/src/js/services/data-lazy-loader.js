/**
 * Data Lazy Loading Service - iFood Style
 * NASA Standards: Functions <60 lines, Single Responsibility
 * Performance: Progressive data loading inspired by iFood architecture
 */

export class DataLazyLoader {
    constructor(database) {
        this.database = database;
        this.loadedChunks = new Set();
        this.isLoading = false;
        this.queue = [];
        this.batchSize = 8; // iFood-style: 8 products per batch
        this.categoryCache = new Map();
        
        // Performance metrics
        this.metrics = {
            totalRequests: 0,
            cacheHits: 0,
            loadTime: 0,
            startTime: Date.now()
        };
        
        console.log('📦 DataLazyLoader initialized - iFood style batching');
    }

    /**
     * Load categories with priority (NASA: 30 lines)
     * iFood pattern: Categories first, then products on-demand
     */
    async loadCategoriesFirst() {
        if (this.categoryCache.has('all')) {
            this.metrics.cacheHits++;
            return this.categoryCache.get('all');
        }

        // Loading categories
        const startTime = Date.now();
        
        try {
            // Load only active categories for public menu
            const categories = await this.database.getCategories(true);
            
            // Sort by display order (iFood style)
            const sortedCategories = categories.sort((a, b) => {
                const orderA = a.displayOrder || a.order || 999;
                const orderB = b.displayOrder || b.order || 999;
                return orderA - orderB;
            });

            this.categoryCache.set('all', sortedCategories);
            this.metrics.totalRequests++;
            this.metrics.loadTime += Date.now() - startTime;
            
            
            return sortedCategories;
            
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
            return [];
        }
    }

    /**
     * Load products by category (NASA: 40 lines)
     * iFood pattern: Load products when category is viewed
     */
    async loadProductsByCategory(categoryId, forceRefresh = false) {
        const cacheKey = categoryId ? `category_${categoryId}` : 'all_products';
        
        if (!forceRefresh && this.categoryCache.has(cacheKey)) {
            this.metrics.cacheHits++;
            console.log(`💾 Products cache hit for: ${categoryId || 'all'}`);
            return this.categoryCache.get(cacheKey);
        }

        console.log(`🍽️ Loading products for: ${categoryId || 'all'} (iFood lazy pattern)...`);
        const startTime = Date.now();
        
        try {
            // Get products - all if no categoryId specified
            const filters = { activeOnly: true };
            if (categoryId) {
                filters.categoryId = categoryId;
            }
            
            const products = await this.database.getProducts(filters);

            // Sort products (featured first, then by order)
            const sortedProducts = products.sort((a, b) => {
                // Featured products first
                if (a.featured !== b.featured) {
                    return b.featured ? 1 : -1;
                }
                
                // Then by order
                const orderA = a.order || a.displayOrder || 999;
                const orderB = b.order || b.displayOrder || 999;
                
                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                
                // Finally by creation date
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            });

            this.categoryCache.set(cacheKey, sortedProducts);
            this.metrics.totalRequests++;
            this.metrics.loadTime += Date.now() - startTime;
            
            
            return sortedProducts;
            
        } catch (error) {
            console.error(`❌ Failed to load products for category ${categoryId}:`, error);
            return [];
        }
    }

    /**
     * Load featured products first (NASA: 25 lines)
     * iFood pattern: Show featured/promoted content immediately
     */
    async loadFeaturedFirst() {
        const cacheKey = 'featured_products';
        
        if (this.categoryCache.has(cacheKey)) {
            this.metrics.cacheHits++;
            return this.categoryCache.get(cacheKey);
        }

        
        const startTime = Date.now();
        
        try {
            const products = await this.database.getProducts({
                activeOnly: true,
                featured: true
            });

            const featured = products.filter(p => p.featured).slice(0, 6); // Max 6 featured
            
            this.categoryCache.set(cacheKey, featured);
            this.metrics.totalRequests++;
            this.metrics.loadTime += Date.now() - startTime;
            
            
            return featured;
            
        } catch (error) {
            console.error('❌ Failed to load featured products:', error);
            return [];
        }
    }

    /**
     * Progressive search with debouncing (NASA: 35 lines)
     * iFood pattern: Real-time search with performance optimization
     */
    async searchProducts(query, debounceMs = 300) {
        return new Promise((resolve) => {
            // Clear previous search timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }

            this.searchTimeout = setTimeout(async () => {
                if (!query || query.length < 2) {
                    resolve([]);
                    return;
                }

                const cacheKey = `search_${query.toLowerCase()}`;
                
                if (this.categoryCache.has(cacheKey)) {
                    this.metrics.cacheHits++;
                    resolve(this.categoryCache.get(cacheKey));
                    return;
                }

                console.log(`🔍 Searching products: "${query}" (iFood search pattern)...`);
                const startTime = Date.now();
                
                try {
                    const products = await this.database.getProducts({
                        activeOnly: true,
                        search: query
                    });

                    // Limit search results (iFood style)
                    const searchResults = products.slice(0, 20);
                    
                    this.categoryCache.set(cacheKey, searchResults);
                    this.metrics.totalRequests++;
                    this.metrics.loadTime += Date.now() - startTime;
                    
                    console.log(`✅ Search results for "${query}": ${searchResults.length} (${Date.now() - startTime}ms)`);
                    resolve(searchResults);
                    
                } catch (error) {
                    console.error(`❌ Search failed for "${query}":`, error);
                    resolve([]);
                }
            }, debounceMs);
        });
    }

    /**
     * Preload next category (NASA: 20 lines)
     * iFood pattern: Anticipatory loading for better UX
     */
    async preloadNextCategory(currentCategoryId, categories) {
        const currentIndex = categories.findIndex(cat => cat.id === currentCategoryId);
        const nextCategory = categories[currentIndex + 1];
        
        if (!nextCategory) return;

        // Preload in background
        setTimeout(async () => {
            console.log(`🔮 Preloading next category: ${nextCategory.name}`);
            await this.loadProductsByCategory(nextCategory.id);
        }, 1000); // 1 second delay for non-blocking preload
    }

    /**
     * Clear cache selectively (NASA: 15 lines)
     * iFood pattern: Smart cache invalidation
     */
    clearCache(pattern = null) {
        if (!pattern) {
            this.categoryCache.clear();
            console.log('🗑️ All cache cleared');
            return;
        }

        const keysToDelete = Array.from(this.categoryCache.keys())
            .filter(key => key.includes(pattern));
        
        keysToDelete.forEach(key => this.categoryCache.delete(key));
        console.log(`🗑️ Cache cleared for pattern: ${pattern} (${keysToDelete.length} entries)`);
    }

    /**
     * Get performance metrics (NASA: 15 lines)
     * iFood pattern: Performance monitoring
     */
    getMetrics() {
        const uptime = Date.now() - this.metrics.startTime;
        const cacheHitRate = this.metrics.totalRequests > 0 
            ? Math.round((this.metrics.cacheHits / this.metrics.totalRequests) * 100) 
            : 0;

        return {
            uptime: Math.round(uptime / 1000),
            totalRequests: this.metrics.totalRequests,
            cacheHits: this.metrics.cacheHits,
            cacheHitRate: `${cacheHitRate}%`,
            avgLoadTime: this.metrics.totalRequests > 0 
                ? Math.round(this.metrics.loadTime / this.metrics.totalRequests) 
                : 0,
            cacheSize: this.categoryCache.size
        };
    }

    /**
     * Reset metrics (NASA: 10 lines)
     */
    resetMetrics() {
        this.metrics = {
            totalRequests: 0,
            cacheHits: 0,
            loadTime: 0,
            startTime: Date.now()
        };
        console.log('📊 Metrics reset');
    }
}

// Export factory function
export function createDataLazyLoader(database) {
    return new DataLazyLoader(database);
}