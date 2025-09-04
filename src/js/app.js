// Aplicacao principal do cardapio digital com Enterprise Integration
import database from './database-nasa.js';
import { MenuView } from './views/MenuView.js';
import { ProductController } from './controllers/ProductController.js';
import enterpriseSystemLite from './enterprise-system-lite.js';
import lazyLoader from './services/lazy-loader.js';
import imageService from './services/image-service.js';
import versionManager from './core/version-manager.js';

class App {
    constructor() {
        this.database = database;
        this.view = new MenuView(this.database); // ✅ CRITICAL FIX: Pass database for tag resolution
        this.controller = new ProductController(this.database, this.view);
        this.enterpriseSystem = enterpriseSystemLite;
        
        
        this.init();
    }

    async init() {
        // 🚀 CRITICAL: Check version first - force update if needed
        const canContinue = await versionManager.initialize();
        if (!canContinue) {
            console.log('🔄 App stopping for version update...');
            return; // Version manager will handle reload
        }
        
        // Renderizar estrutura inicial
        this.render();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Carregamento otimizado
        this.loadCriticalEssentialsFirst();
    }


    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                <div class="max-w-4xl mx-auto px-3 py-4">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div class="h-12 w-12 rounded-xl bg-orange-500 text-white grid place-items-center font-bold text-lg">
                                <span id="restaurantLogo"></span>
                            </div>
                            <div>
                                <div id="restaurantName" class="font-semibold text-lg"></div>
                                <div class="text-sm text-gray-500">Cardapio digital</div>
                            </div>
                        </div>
                        
                        <button id="searchToggle" class="p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div id="searchBar" class="hidden">
                        <input 
                            type="text" 
                            id="searchInput"
                            placeholder="Buscar produtos..." 
                            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-base"
                        >
                    </div>
                </div>
            </header>

            <section id="banner" class="max-w-4xl mx-auto px-3 pt-2">
                <div class="rounded-2xl overflow-hidden border border-gray-100 relative">
                    <!-- Banner skeleton loading -->
                    <div id="bannerSkeleton" class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                        <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <img 
                        id="restaurantBanner" 
                        alt="Banner" 
                        class="w-full h-48 sm:h-64 md:h-80 restaurant-banner opacity-0 transition-opacity duration-500"
                        loading="eager"
                        onload="this.style.opacity='1'; document.getElementById('bannerSkeleton').style.display='none';"
                        onerror="document.getElementById('bannerSkeleton').classList.remove('animate-pulse');"
                    >
                </div>
            </section>

            <!-- Menu Bar de Categorias -->
            <nav class="max-w-4xl mx-auto sticky top-[88px] bg-white border-b border-gray-200 z-20">
                <div class="flex items-center px-3 py-2">
                    <!-- Botão Menu (para abrir modal de categorias) -->
                    <button id="categoriesMenuBtn" class="p-2 mr-3" title="Ver todas as categorias">
                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    
                    <!-- Menu Bar Horizontal -->
                    <div id="categoryMenuBar" class="flex-1 overflow-x-auto scrollbar-hide">
                        <div class="flex whitespace-nowrap">
                            <!-- Categorias serão renderizadas aqui -->
                        </div>
                    </div>
                </div>
            </nav>

            <main class="max-w-4xl mx-auto px-3 py-4">
                <!-- Indicador de Carregamento Global -->
                <div id="globalLoader" class="flex flex-col items-center justify-center py-16">
                    <div class="relative">
                        <!-- Spinner animado -->
                        <div class="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                        <!-- Ícone de prato no centro -->
                        <div class="absolute inset-0 flex items-center justify-center">
                            <svg class="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                            </svg>
                        </div>
                    </div>
                    <p class="mt-4 text-gray-600 text-sm animate-pulse">Carregando cardápio...</p>
                </div>
                
                <!-- Seção de Destaques -->
                <section id="featuredSection" class="mb-5 hidden">
                    <h2 class="text-xl font-bold text-gray-800 mb-3">Destaques</h2>
                    <div id="featuredGrid" class="featured-grid gap-2"></div>
                </section>
                
                <!-- Seção de Todos os Produtos -->
                <section id="allProductsSection" class="hidden">
                    <div id="productsGrid" class="products-grid gap-2"></div>
                    
                    <div id="emptyState" class="hidden text-center py-12">
                        <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <p class="text-gray-500 text-base">Nenhum produto encontrado</p>
                    </div>
                </section>
            </main>

            <footer class="max-w-4xl mx-auto px-4 pb-8 pt-4 text-center text-xs text-gray-500 border-t border-gray-100">
                <span id="footerText"></span>
            </footer>
        `;
    }

    setupEventListeners() {
        // Toggle search bar
        document.getElementById('searchToggle').addEventListener('click', () => {
            const searchBar = document.getElementById('searchBar');
            searchBar.classList.toggle('hidden');
            if (!searchBar.classList.contains('hidden')) {
                document.getElementById('searchInput').focus();
            }
        });

        // Search functionality
        let searchTimeout;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.controller.searchProducts(e.target.value);
            }, 300);
        });

        // Listen for database updates
        window.addEventListener('databaseUpdated', () => {
            this.loadInitialData();
        });

        // Setup mobile gestures
        this.setupMobileGestures();

    }


    /**
     * Load restaurant info
     */
    loadRestaurantInfo() {
        const restaurant = this.database.getRestaurant() || {};
        
        // Usar dados padrão se não conseguir carregar do banco
        const restaurantName = restaurant.name || 'Império do Churrasco';
        const restaurantLogo = restaurant.logo || 'IC';
        
        document.getElementById('restaurantLogo').textContent = restaurantLogo;
        document.getElementById('restaurantName').textContent = restaurantName;
        
        // SEMPRE usar banner local (ignorar qualquer banner do Supabase)
        const bannerElement = document.getElementById('restaurantBanner');
        bannerElement.src = 'images/banners/imd_dia.jpeg';
        
        document.getElementById('footerText').textContent = `Seu Négocio Online - Bora Digital ® | Deploy automático testado!`;

        // Aplicar tema se disponível
        if (restaurant && restaurant.theme) {
            document.documentElement.style.setProperty('--primary-color', restaurant.theme.primaryColor);
        } else {
            // Tema padrão
            document.documentElement.style.setProperty('--primary-color', '#fb923c');
        }
    }





    /**
     * Setup mobile gestures (NASA: 30 lines)
     * Swipe navigation for better mobile UX
     */
    setupMobileGestures() {
        let startX, startY, startTime;
        const categoryMenuBar = document.getElementById('categoryMenuBar');
        
        if (!categoryMenuBar) return;

        categoryMenuBar.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });

        categoryMenuBar.addEventListener('touchmove', (e) => {
            // Allow horizontal scroll
            if (Math.abs(e.touches[0].clientX - startX) > Math.abs(e.touches[0].clientY - startY)) {
                e.stopPropagation();
            }
        }, { passive: false });

        categoryMenuBar.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endTime = Date.now();
            const deltaX = endX - startX;
            const deltaTime = endTime - startTime;
            
            // Fast swipe detection
            if (Math.abs(deltaX) > 50 && deltaTime < 300) {
                console.log('🏃‍♂️ Fast swipe detected for better mobile UX');
            }
        }, { passive: true });
    }


    /**
     * Load essentials - simplified approach
     */
    async loadCriticalEssentialsFirst() {
        try {
            // Load restaurant info (sempre funciona, usa fallback)
            this.loadRestaurantInfo();
            
            // Carregar tudo direto - mais simples e rápido
            setTimeout(async () => {
                await this.loadEverythingDirect();
            }, 100);
            
        } catch (error) {
            console.error('Erro no carregamento:', error);
            this.loadRestaurantInfo();
        }
    }
    
    /**
     * Load everything directly without complex caching
     */
    async loadEverythingDirect() {
        try {
            // Mostrar loader está visível por padrão no HTML
            
            // Carregar dados do Supabase direto
            await this.database.loadPublicData();
            
            // Renderizar tudo
            const categories = this.database.getCategories(true);
            const products = this.database.getProducts({ activeOnly: true });
            
            if (products.length === 0) {
                console.log('⚠️ Nenhum produto carregado, usando dados locais de fallback');
                // Esconder loader mesmo sem produtos
                this.hideLoader();
                return;
            }
            
            // Data loaded successfully
            
            const categoriesWithCount = categories.map(category => ({
                ...category,
                productCount: products.filter(product => product.categoryId === category.id).length
            }));
            
            // Renderizar categorias
            this.view.renderCategories(categoriesWithCount, () => {});
            
            // Renderizar produtos nas categorias
            this.view.renderProducts(products, categoriesWithCount);
            
            // Esconder loader após renderizar tudo
            this.hideLoader();
            
        } catch (error) {
            console.error('Erro no carregamento direto:', error);
            // Esconder loader mesmo com erro
            this.hideLoader();
        }
    }
    
    /**
     * Hide loader and show content sections
     */
    hideLoader() {
        const loader = document.getElementById('globalLoader');
        const featuredSection = document.getElementById('featuredSection');
        const allProductsSection = document.getElementById('allProductsSection');
        
        if (loader) {
            loader.style.display = 'none';
        }
        
        // Mostrar as seções de conteúdo
        if (featuredSection) {
            featuredSection.classList.remove('hidden');
        }
        
        if (allProductsSection) {
            allProductsSection.classList.remove('hidden');
        }
    }
    
    /**
     * Load all products and categories
     */
    async loadAllProducts() {
        try {
            // FORÇAR carregamento completo - limpar cache se necessário
            const cachedData = this.database.cache?.getCache();
            
            // Se só tem produtos featured, forçar reload completo
            if (cachedData && cachedData.isCritical) {
                console.log('🔄 Cache só tem produtos featured, forçando reload completo...');
                await this.database.forceReload();
            } else {
                // Carregar todos os dados normalmente
                await this.database.loadPublicData();
            }
            
            // Renderizar tudo
            const categories = this.database.getCategories(true);
            const products = this.database.getProducts({ activeOnly: true });
            
            console.log(`📊 Carregando: ${products.length} produtos, ${categories.length} categorias`);
            
            const categoriesWithCount = categories.map(category => ({
                ...category,
                productCount: products.filter(product => product.categoryId === category.id).length
            }));
            
            // Renderizar categorias
            this.view.renderCategories(categoriesWithCount, () => {});
            
            // Renderizar produtos nas categorias
            this.view.renderProducts(products, categoriesWithCount);
            
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    /**
     * Load products in chunks
     */
    async loadChunkedProductsInBackground() {
        try {
            let offset = 0;
            const limit = 15;
            let hasMore = true;

            // Load products in chunks
            while (hasMore) {
                const result = await this.database.loadChunkedProducts(offset, limit);
                hasMore = result.hasMore;
                offset += limit;
                
                if (hasMore) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
            
            // Renderizar produtos nas categorias após carregar todos
            const categories = this.database.getCategories(true);
            const products = this.database.getProducts({ activeOnly: true });
            
            const categoriesWithCount = categories.map(category => ({
                ...category,
                productCount: products.filter(product => product.categoryId === category.id).length
            }));
            
            // PROBLEMA: renderCategorySections não existe na view
            // Vamos usar renderProducts que já existe
            this.view.renderProducts(products, categoriesWithCount);
            
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    /**
     * FALLBACK: Load instant structural data (kept for compatibility)
     * Function size: 25 lines (NASA compliant)
     */
    async loadInstantDataFirst() {
        console.log('⚡ FALLBACK: Using instant loading approach...');
        
        // Load restaurant info immediately
        this.loadRestaurantInfo();

        // Load categories and ALL products (with skeletons for images)
        this.controller.loadCategories();
        await this.controller.loadInstantProducts(); // Load ALL products with text, skeletons for images
        
        console.log('⚡ Instant content rendered - starting progressive image loading...');
        
        // Start progressive image loading (non-blocking, immediate)
        this.loadProgressiveImagesInBackground();
    }

    /**
     * Load progressive images in background without blocking UI
     * Function size: 20 lines (NASA compliant)
     */
    async loadProgressiveImagesInBackground() {
        console.log('🖼️ PROGRESSIVE: Loading product images...');
        
        try {
            // Load all product images progressively
            await this.database.loadProgressiveImages();
            
            // Images will be updated via event system - no re-render needed
            console.log('✅ PROGRESSIVE: All images loaded and updating cards!');
        } catch (error) {
            console.warn('⚠️ Progressive image loading failed:', error);
        }
    }

    /**
     * LEGACY: Load all data at once (kept for fallback)
     */
    loadInitialData() {
        console.log('📊 FALLBACK: Loading all data at once...');
        
        this.loadRestaurantInfo();
        this.controller.loadCategories();
        this.controller.loadProducts();
    }
}

// Inicializar app quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new App();
});