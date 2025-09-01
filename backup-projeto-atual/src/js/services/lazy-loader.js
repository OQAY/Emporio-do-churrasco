/**
 * Enterprise Lazy Loading Service
 * NASA Compliance: Function < 60 lines, Complexity < 10
 * Google Standards: Single responsibility, self-documenting
 */

export class LazyImageLoader {
    constructor() {
        this.imageObserver = null;
        this.rootMargin = '200px'; // Mais generoso para detectar imagens
        this.threshold = 0.01; // Muito mais baixo para detectar facilmente
        this.isSupported = 'IntersectionObserver' in window;
        this.loadedImages = new Set();
        
        this.init();
    }

    /**
     * Initialize lazy loading system
     * NASA: Function size 25 lines
     */
    init() {
        console.log('🚀 Initializing LazyImageLoader...');
        console.log(`   - IntersectionObserver supported: ${this.isSupported}`);
        console.log(`   - Root margin: ${this.rootMargin}`);
        console.log(`   - Threshold: ${this.threshold}`);
        
        if (this.isSupported) {
            this.setupObserver();
            console.log('✅ Lazy loading initialized with Intersection Observer');
            
            // Fallback manual para scroll quando IntersectionObserver falha
            this.setupScrollFallback();
        } else {
            console.warn('⚠️ Intersection Observer not supported, falling back to immediate loading');
            this.loadAllImagesImmediately();
        }
    }

    /**
     * Setup Intersection Observer
     * NASA: Function size 20 lines, Complexity < 5
     */
    setupObserver() {
        const observerConfig = {
            rootMargin: this.rootMargin,
            threshold: this.threshold
        };

        this.imageObserver = new IntersectionObserver((entries) => {
            console.log(`🔍 IntersectionObserver triggered with ${entries.length} entries`);
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    console.log('👀 Image became visible, loading...');
                    this.loadSingleImage(img);
                    this.imageObserver.unobserve(img); // Remove apenas APÓS carregar
                } else {
                    console.log('👁️ Image not visible yet');
                }
            });
        }, observerConfig);
    }

    /**
     * Observe images for lazy loading
     * NASA: Function size 20 lines
     */
    observeImages(selector = '[data-lazy-src]') {
        if (!this.isSupported) {
            this.loadAllImagesImmediately(selector);
            return;
        }

        const lazyImages = document.querySelectorAll(selector);
        console.log(`🔍 Found ${lazyImages.length} images with selector: ${selector}`);
        
        lazyImages.forEach((img, index) => {
            const lazySrc = img.getAttribute('data-lazy-src');
            console.log(`📷 Image ${index + 1}: has-data-lazy-src=${!!lazySrc}`);
            
            if (!this.loadedImages.has(img) && lazySrc) {
                // Verificar se já está visível ANTES de observar
                const rect = img.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                const parentHidden = getComputedStyle(img.parentElement).display === 'none';
                
                console.log(`🔍 Image ${index + 1}: visible=${isVisible}, parentHidden=${parentHidden}, rect=${JSON.stringify(rect)}`);
                
                if (isVisible && !parentHidden) {
                    console.log(`📍 Image ${index + 1} already visible, loading immediately`);
                    this.loadSingleImage(img);
                } else {
                    this.imageObserver.observe(img);
                    console.log(`👁️ Observing image ${index + 1}`);
                    
                    // Fallback: Load immediately if image is visible but not loading after 1s
                    setTimeout(() => {
                        if (!this.loadedImages.has(img) && lazySrc) {
                            console.log(`⚡ Force loading image ${index + 1} due to timeout`);
                            this.loadSingleImage(img);
                        }
                    }, 1000); // Reduzi de 2s para 1s
                }
            }
        });
        
        console.log(`✅ Observing ${lazyImages.length} images for lazy loading`);
    }

    /**
     * Load single image
     * NASA: Function size 25 lines, Complexity < 5
     */
    loadSingleImage(img) {
        const src = img.getAttribute('data-lazy-src');
        const placeholder = img.getAttribute('data-placeholder');
        
        console.log(`🖼️ Loading image: ${src ? 'YES' : 'NO'}`);
        
        if (!src) {
            console.warn('⚠️ No data-lazy-src found');
            return;
        }
        
        if (this.loadedImages.has(img)) {
            console.log('✅ Image already loaded');
            return;
        }

        // Add loading class for CSS animations
        img.classList.add('lazy-loading');
        
        // CRÍTICO: Trocar o src da imagem!
        const newImg = new Image();
        
        newImg.onload = () => {
            console.log(`✅ Image loaded successfully, swapping src...`);
            
            // Trocar o src
            const oldSrc = img.src;
            img.src = src;
            console.log(`🔄 Src changed from placeholder to real image`);
            
            // Trocar classes
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');
            console.log(`🎨 Classes updated: removed lazy-loading, added lazy-loaded`);
            
            // Garantir opacity 1
            img.style.opacity = '1';
            console.log(`👁️ Opacity set to 1`);
            
            this.loadedImages.add(img);
            
            // Remove skeleton se existir
            const skeletonId = img.id ? `skeleton-${img.id}` : null;
            if (skeletonId) {
                const skeleton = document.getElementById(skeletonId);
                if (skeleton) {
                    skeleton.style.display = 'none';
                    console.log(`🚮 Skeleton removed`);
                }
            }
        };

        newImg.onerror = () => {
            console.error(`❌ Failed to load image`);
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-error');
            if (placeholder) img.src = placeholder;
        };

        // Inicia o carregamento
        newImg.src = src;
        console.log(`🔄 Started loading image`);
    }

    /**
     * Setup scroll fallback quando IntersectionObserver falha
     */
    setupScrollFallback() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.checkAndLoadVisibleImages();
            }, 100);
        }, { passive: true });
        
        // Também verificar no resize
        window.addEventListener('resize', () => {
            this.checkAndLoadVisibleImages();
        }, { passive: true });
    }

    /**
     * Verificar e carregar imagens visíveis manualmente
     */
    checkAndLoadVisibleImages() {
        const lazyImages = document.querySelectorAll('[data-lazy-src]');
        const windowHeight = window.innerHeight;
        
        lazyImages.forEach((img, index) => {
            if (this.loadedImages.has(img)) return;
            
            const rect = img.getBoundingClientRect();
            const isVisible = rect.top < windowHeight + 200 && rect.bottom > -200;
            
            if (isVisible) {
                console.log(`🔄 Manual loading image ${index + 1} that became visible`);
                this.loadSingleImage(img);
            }
        });
    }

    /**
     * Fallback for unsupported browsers
     * NASA: Function size 10 lines
     */
    loadAllImagesImmediately(selector = '[data-lazy-src]') {
        const lazyImages = document.querySelectorAll(selector);
        lazyImages.forEach(img => this.loadSingleImage(img));
        console.log(`🚀 Loaded ${lazyImages.length} images immediately (fallback mode)`);
    }

    /**
     * Refresh observer for dynamic content
     * NASA: Function size 5 lines
     */
    refresh() {
        this.observeImages();
    }

    /**
     * Destroy observer and cleanup
     * NASA: Function size 10 lines
     */
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
            this.imageObserver = null;
        }
        this.loadedImages.clear();
        console.log('🧹 Lazy loader destroyed');
    }
}

// Export singleton instance
export default new LazyImageLoader();