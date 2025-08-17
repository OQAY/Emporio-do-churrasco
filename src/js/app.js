// Aplicacao principal do cardapio digital
import database from './database.js';
import { MenuView } from './views/MenuView.js';
import { ProductController } from './controllers/ProductController.js';

class App {
    constructor() {
        this.database = database;
        this.view = new MenuView();
        this.controller = new ProductController(this.database, this.view);
        this.init();
    }

    init() {
        // Renderizar estrutura inicial
        this.render();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Carregar dados iniciais
        this.loadInitialData();
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
                <div class="rounded-2xl overflow-hidden border border-gray-100">
                    <img id="restaurantBanner" alt="Banner" class="w-full h-48 sm:h-64 md:h-80 object-cover">
                </div>
            </section>

            <nav class="max-w-4xl mx-auto px-3 py-4 sticky top-[120px] bg-white/95 backdrop-blur-sm z-20 border-b border-gray-50">
                <div class="relative">
                    <!-- Gradient fade para indicar scroll -->
                    <div class="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white/95 to-transparent z-10 pointer-events-none"></div>
                    <div class="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/95 to-transparent z-10 pointer-events-none"></div>
                    
                    <!-- Container dos filtros -->
                    <div id="categoryTabs" class="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide" style="scroll-behavior: smooth; scrollbar-width: none; -ms-overflow-style: none;">
                        <!-- Tabs will be rendered here -->
                    </div>
                </div>
                
                <!-- Indicador de scroll (mobile) -->
                <div class="sm:hidden flex justify-center mt-2">
                    <div class="flex gap-1">
                        <div class="w-2 h-1 bg-gray-300 rounded-full"></div>
                        <div class="w-2 h-1 bg-gray-300 rounded-full"></div>
                        <div class="w-2 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                </div>
            </nav>

            <main class="max-w-4xl mx-auto px-3 py-4">
                <div id="productsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
                
                <div id="emptyState" class="hidden text-center py-12">
                    <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    <p class="text-gray-500 text-base">Nenhum produto encontrado</p>
                </div>
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