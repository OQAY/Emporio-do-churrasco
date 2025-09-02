/**
 * Image Service - Gerenciamento inteligente de imagens com fallbacks
 */
class ImageService {
    constructor() {
        this.defaultImages = {
            banner: 'images/banners/imd_dia.jpeg', // Banner padrão
            productPlaceholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtZmFtaWx5OkFyaWFsLHNhbnMtc2VyaWY7Zm9udC1zaXplOjI0cHgiPkltYWdlbSBuw6NvIGRpc3BvbsOtdmVsPC90ZXh0Pjwvc3ZnPg=='
        };
        
        this.imageCache = new Map();
        this.loadingImages = new Set();
    }

    /**
     * Processa URL de imagem com fallbacks inteligentes
     */
    processImageUrl(url, type = 'product') {
        // Se não tem URL, retorna placeholder
        if (!url || url === 'null' || url === 'undefined') {
            return type === 'banner' 
                ? this.defaultImages.banner
                : this.defaultImages.productPlaceholder;
        }

        // Se é uma URL completa (http/https), retorna direto
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // Se é base64, retorna direto
        if (url.startsWith('data:image')) {
            return url;
        }

        // Se é caminho relativo (images/products/...), usa o caminho local
        if (url.startsWith('images/products/')) {
            // As imagens estão salvas localmente, usa o caminho direto
            return url;
        }

        // Se é caminho relativo com barra, normaliza
        if (url.startsWith('/')) {
            return url.substring(1);
        }

        // Se é caminho relativo local, tenta usar como está
        if (url.startsWith('images/')) {
            return url;
        }

        return url;
    }

    /**
     * Carrega imagem com fallback automático
     */
    async loadImageWithFallback(imgElement, src, fallbackSrc = null) {
        const processedSrc = this.processImageUrl(src, 'product');
        const fallback = fallbackSrc || this.defaultImages.productPlaceholder;

        return new Promise((resolve) => {
            // Se já está em cache, usa direto
            if (this.imageCache.has(processedSrc)) {
                imgElement.src = this.imageCache.get(processedSrc);
                resolve(true);
                return;
            }

            // Cria nova imagem para testar
            const testImg = new Image();
            
            testImg.onload = () => {
                this.imageCache.set(processedSrc, processedSrc);
                imgElement.src = processedSrc;
                imgElement.classList.add('loaded');
                resolve(true);
            };

            testImg.onerror = () => {
                console.warn(`Imagem falhou: ${processedSrc}, usando fallback`);
                imgElement.src = fallback;
                imgElement.classList.add('fallback');
                resolve(false);
            };

            testImg.src = processedSrc;
        });
    }

    /**
     * Pré-carrega imagens em batch
     */
    async preloadImages(urls) {
        const promises = urls.map(url => {
            return new Promise((resolve) => {
                if (this.imageCache.has(url)) {
                    resolve({ url, success: true, cached: true });
                    return;
                }

                const img = new Image();
                img.onload = () => {
                    this.imageCache.set(url, url);
                    resolve({ url, success: true, cached: false });
                };
                img.onerror = () => {
                    resolve({ url, success: false, cached: false });
                };
                img.src = this.processImageUrl(url);
            });
        });

        const results = await Promise.all(promises);
        const stats = {
            total: results.length,
            loaded: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            cached: results.filter(r => r.cached).length
        };

        console.log('📸 Preload completo:', stats);
        return results;
    }

    /**
     * Limpa cache de imagens
     */
    clearCache() {
        this.imageCache.clear();
        console.log('🗑️ Cache de imagens limpo');
    }

    /**
     * Obtém estatísticas do cache
     */
    getCacheStats() {
        return {
            size: this.imageCache.size,
            loading: this.loadingImages.size
        };
    }
}

// Singleton
const imageService = new ImageService();
export default imageService;