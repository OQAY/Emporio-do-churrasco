/**
 * Image Lazy Loader - True Lazy Loading
 * Loads images individually on-demand with Intersection Observer
 */

export class ImageLazyLoader {
    constructor(dataFetcher) {
        this.dataFetcher = dataFetcher;
        this.imageCache = new Map();
        this.loadingQueue = new Set();
        this.maxConcurrent = 3; // Limit simultaneous requests
        this.currentLoading = 0;
        
        // Create Intersection Observer
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                rootMargin: '50px', // Start loading 50px before visible
                threshold: 0.1
            }
        );
        
        console.log('🖼️ ImageLazyLoader initialized');
    }

    /**
     * Start observing image containers
     */
    observeImages() {
        // Find all product cards with data-product-id
        const productCards = document.querySelectorAll('[data-product-id]');
        
        productCards.forEach(card => {
            this.observer.observe(card);
        });
        
        console.log(`👁️ Observing ${productCards.length} product images`);
    }

    /**
     * Handle intersection - load image when visible
     */
    async handleIntersection(entries) {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const productId = entry.target.getAttribute('data-product-id');
                
                if (productId && !this.imageCache.has(productId)) {
                    // Stop observing this element
                    this.observer.unobserve(entry.target);
                    
                    // Add to queue
                    this.loadingQueue.add(productId);
                    
                    // Process queue
                    this.processQueue();
                }
            }
        }
    }

    /**
     * Process loading queue with concurrency control
     */
    async processQueue() {
        if (this.currentLoading >= this.maxConcurrent || this.loadingQueue.size === 0) {
            return;
        }

        const productId = this.loadingQueue.values().next().value;
        this.loadingQueue.delete(productId);
        this.currentLoading++;

        try {
            await this.loadImageOnDemand(productId);
        } catch (error) {
            console.warn(`Failed to load image for ${productId}:`, error);
        } finally {
            this.currentLoading--;
            
            // Process next item in queue
            if (this.loadingQueue.size > 0) {
                setTimeout(() => this.processQueue(), 100);
            }
        }
    }

    /**
     * Load individual image on demand
     */
    async loadImageOnDemand(productId) {
        // Check cache first
        if (this.imageCache.has(productId)) {
            this.updateImageInDOM(productId, this.imageCache.get(productId));
            return;
        }

        console.log(`🖼️ Loading image for product: ${productId}`);
        
        try {
            // Make individual request for this image only
            const imageUrl = await this.dataFetcher.fetchProductImage(productId);
            
            if (imageUrl) {
                // Cache the image
                this.imageCache.set(productId, imageUrl);
                
                // Update DOM immediately
                this.updateImageInDOM(productId, imageUrl);
                
                console.log(`✅ Image loaded: ${productId}`);
            } else {
                console.log(`⚠️ No image found for: ${productId}`);
                this.imageCache.set(productId, null); // Cache null to avoid retrying
            }
            
        } catch (error) {
            console.error(`❌ Failed to load image for ${productId}:`, error);
            this.imageCache.set(productId, null); // Cache null to avoid retrying
        }
    }

    /**
     * Update image in DOM with smooth animation
     */
    updateImageInDOM(productId, imageUrl) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (!productCard) return;

        const imageContainers = productCard.querySelectorAll('.image-container');
        
        imageContainers.forEach(container => {
            const img = container.querySelector('img');
            const skeleton = container.querySelector('[id^="skeleton-"]');
            
            if (img && imageUrl) {
                // Update image source
                img.src = imageUrl;
                
                // Trigger load animation
                img.onload = () => {
                    img.style.opacity = '1';
                    img.style.transform = 'scale(1)';
                    
                    if (skeleton) {
                        skeleton.style.opacity = '0';
                        setTimeout(() => skeleton.remove(), 300);
                    }
                };
            } else if (!imageUrl) {
                // Handle no image case
                if (skeleton) {
                    skeleton.innerHTML = '<div class="text-xs text-gray-400">Sem imagem</div>';
                    skeleton.classList.remove('animate-pulse');
                }
            }
        });
    }

    /**
     * Preload critical images (above the fold)
     */
    async preloadCriticalImages(productIds) {
        console.log(`⚡ Preloading ${productIds.length} critical images`);
        
        const criticalIds = productIds.slice(0, 3); // First 3 products
        
        for (const productId of criticalIds) {
            if (!this.imageCache.has(productId)) {
                this.loadingQueue.add(productId);
            }
        }
        
        this.processQueue();
    }

    /**
     * Get loading statistics
     */
    getStats() {
        return {
            cached: this.imageCache.size,
            loading: this.currentLoading,
            queued: this.loadingQueue.size,
            cacheHitRate: this.imageCache.size > 0 ? 
                Math.round((this.imageCache.size / (this.imageCache.size + this.loadingQueue.size)) * 100) : 0
        };
    }

    /**
     * Cleanup observer
     */
    destroy() {
        this.observer.disconnect();
        this.loadingQueue.clear();
        console.log('🗑️ ImageLazyLoader destroyed');
    }
}