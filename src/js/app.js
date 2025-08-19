// Aplicacao principal do cardapio digital com Enterprise Integration
import database from './database-nasa.js';
import { MenuView } from './views/MenuView.js';
import { ProductController } from './controllers/ProductController.js';
import enterpriseSystemLite from './enterprise-system-lite.js';

class App {
    constructor() {
        this.database = database;
        this.view = new MenuView();
        this.controller = new ProductController(this.database, this.view);
        this.enterpriseSystem = enterpriseSystemLite;
        this.init();
    }

    async init() {
        // Renderizar estrutura inicial
        this.render();
        
        // CRÍTICO: Carregar apenas dados essenciais do Supabase para o cardápio público
        console.log('🔄 Carregando dados PÚBLICOS do Supabase (otimizado)...');
        await this.database.loadPublicData();
        console.log('✅ Dados PÚBLICOS do Supabase carregados (mais rápido)!');
        
        // Inicializar sistema enterprise (não-bloqueante)
        await this.initializeEnterpriseFeatures();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Carregar dados iniciais na interface
        this.loadInitialData();
    }

    /**
     * Initialize enterprise features (NASA: enterprise integration)
     * Function size: 25 lines (NASA compliant)
     */
    async initializeEnterpriseFeatures() {
        try {
            console.log('🚀 Initializing enterprise features...');
            
            const initResult = await this.enterpriseSystem.initialize();
            
            if (initResult.success) {
                console.log('✅ Enterprise features active:', {
                    initTime: initResult.initializationTime,
                    components: initResult.componentsLoaded
                });
                
                // Add enterprise status indicator to UI
                this.addEnterpriseStatusIndicator();
            } else {
                console.warn('⚠️ Enterprise features unavailable:', initResult.error);
            }
        } catch (error) {
            console.warn('⚠️ Enterprise initialization failed:', error.message);
            // App continues normally without enterprise features
        }
    }

    /**
     * Add enterprise status indicator (NASA: status display)
     * Function size: 20 lines (NASA compliant)
     */
    addEnterpriseStatusIndicator() {
        const header = document.querySelector('header .max-w-4xl');
        if (!header) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'enterprise-status';
        indicator.innerHTML = `
            <div class="flex items-center gap-2 text-xs">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-gray-500">Enterprise Active</span>
            </div>
        `;
        
        // Insert enterprise indicator
        header.appendChild(indicator);
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
                        class="w-full h-48 sm:h-64 md:h-80 object-cover opacity-0 transition-opacity duration-500"
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
                <!-- Seção de Destaques -->
                <section id="featuredSection" class="mb-5">
                    <h2 class="text-xl font-bold text-gray-800 mb-3">Destaques</h2>
                    <div id="featuredGrid" class="featured-grid gap-2"></div>
                </section>
                
                <!-- Seção de Todos os Produtos -->
                <section id="allProductsSection">
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
    }

    loadInitialData() {
        // Carregar informacoes do restaurante
        const restaurant = this.database.getRestaurant();
        document.getElementById('restaurantLogo').textContent = restaurant.logo;
        document.getElementById('restaurantName').textContent = restaurant.name;
        document.getElementById('restaurantBanner').src = restaurant.banner;
        document.getElementById('footerText').textContent = `${restaurant.name} - Cardapio Digital`;

        // Aplicar tema
        if (restaurant.theme) {
            document.documentElement.style.setProperty('--primary-color', restaurant.theme.primaryColor);
        }

        // Carregar categorias e produtos
        this.controller.loadCategories();
        this.controller.loadProducts();
    }
}

// Inicializar app quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new App();
});