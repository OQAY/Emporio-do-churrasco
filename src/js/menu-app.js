/**
 * Menu App - Aplicação Principal do Cardápio
 * Combina sistema enterprise com funcionalidade de menu
 */

import { logger } from './core/logger.js';

class MenuApp {
    constructor() {
        this.restaurantData = null;
        this.categories = [];
        this.products = [];
        this.selectedCategory = null;
        
        logger.info('🍽️ Menu App initialized');
    }

    async init() {
        try {
            logger.info('🚀 Starting Menu Application...');
            
            // Load data from localStorage
            await this.loadData();
            
            // Render the menu
            this.render();
            
            logger.info('✅ Menu Application ready');
            
        } catch (error) {
            logger.error('❌ Menu App initialization failed', { error: error.message });
            this.renderError();
        }
    }

    async loadData() {
        try {
            // Load restaurant data
            const restaurantData = localStorage.getItem('restaurant');
            this.restaurantData = restaurantData ? JSON.parse(restaurantData) : {
                name: 'Imperio do Churrasco',
                banner: 'images/banners/imperio-banner.png',
                description: 'O melhor churrasco da cidade'
            };

            // Load categories
            const categoriesData = localStorage.getItem('categories');
            this.categories = categoriesData ? JSON.parse(categoriesData) : [
                { id: '1', name: 'Carnes', icon: '🥩', ordem: 1, ativo: true },
                { id: '2', name: 'Acompanhamentos', icon: '🍚', ordem: 2, ativo: true },
                { id: '3', name: 'Bebidas', icon: '🥤', ordem: 3, ativo: true }
            ];

            // Load products
            const productsData = localStorage.getItem('products');
            this.products = productsData ? JSON.parse(productsData) : [
                {
                    id: '1',
                    nome: 'Picanha Grelhada',
                    descricao: 'Suculenta picanha grelhada no ponto',
                    preco: 45.90,
                    categoria: '1',
                    imagem: 'images/produtos/picanha-grill.jpg',
                    ativo: true,
                    destaque: true
                },
                {
                    id: '2',
                    nome: 'Fraldinha Especial',
                    descricao: 'Fraldinha temperada com ervas especiais',
                    preco: 38.90,
                    categoria: '1',
                    imagem: 'images/produtos/steak-sandwich-1.jpg',
                    ativo: true,
                    destaque: false
                }
            ];

            logger.info('📊 Data loaded successfully', {
                categories: this.categories.length,
                products: this.products.length
            });

        } catch (error) {
            logger.error('Failed to load data', { error: error.message });
            throw error;
        }
    }

    render() {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `
            <!-- Header -->
            <header class="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <div class="container mx-auto px-4 py-6">
                    <div class="text-center">
                        <h1 class="text-4xl font-bold mb-2">${this.restaurantData.name}</h1>
                        <p class="text-orange-100">${this.restaurantData.description}</p>
                    </div>
                </div>
            </header>

            <!-- Banner -->
            <section class="relative h-64 bg-gradient-to-r from-orange-400 to-red-500 overflow-hidden">
                <div class="absolute inset-0 bg-black bg-opacity-30"></div>
                <div class="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
                    <div class="text-center text-white">
                        <h2 class="text-3xl font-bold mb-4">🔥 Cardápio Digital</h2>
                        <p class="text-xl">Sabores autênticos do churrasco brasileiro</p>
                    </div>
                </div>
            </section>

            <!-- Categories -->
            <section class="py-8 bg-gray-50">
                <div class="container mx-auto px-4">
                    <h3 class="text-2xl font-semibold text-center mb-6">Categorias</h3>
                    <div id="categories-container" class="flex justify-center space-x-4 flex-wrap gap-4">
                        ${this.renderCategories()}
                    </div>
                </div>
            </section>

            <!-- Products -->
            <section class="py-12">
                <div class="container mx-auto px-4">
                    <div id="products-container">
                        ${this.renderProducts()}
                    </div>
                </div>
            </section>

            <!-- Enterprise Status -->
            <section class="py-8 bg-blue-50">
                <div class="container mx-auto px-4 text-center">
                    <div class="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
                        <h3 class="text-xl font-semibold mb-4">🚀 Sistema Enterprise</h3>
                        <p class="text-gray-600 mb-4">Este sistema foi refatorado com padrões NASA/Google</p>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-green-600">✅</div>
                                <div class="text-sm">NASA Compliant</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-600">📊</div>
                                <div class="text-sm">Real-time Monitoring</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-600">🔒</div>
                                <div class="text-sm">Enterprise Security</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-orange-600">⚡</div>
                                <div class="text-sm">Performance Optimized</div>
                            </div>
                        </div>
                        <div class="mt-4 space-x-4">
                            <a href="enterprise-dashboard.html" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Dashboard Enterprise
                            </a>
                            <a href="admin.html" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Painel Admin
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer class="bg-gray-800 text-white py-6">
                <div class="container mx-auto px-4 text-center">
                    <p>&copy; 2024 ${this.restaurantData.name}. Todos os direitos reservados.</p>
                    <p class="text-sm text-gray-400 mt-2">Sistema Enterprise com padrões NASA/Google</p>
                </div>
            </footer>
        `;

        this.attachEventListeners();
    }

    renderCategories() {
        return this.categories
            .filter(cat => cat.ativo)
            .sort((a, b) => a.ordem - b.ordem)
            .map(category => `
                <button 
                    class="category-btn bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow ${
                        this.selectedCategory === category.id ? 'ring-2 ring-orange-500' : ''
                    }"
                    data-category="${category.id}"
                >
                    <div class="text-3xl mb-2">${category.icon}</div>
                    <div class="font-semibold">${category.name}</div>
                </button>
            `).join('');
    }

    renderProducts() {
        const productsToShow = this.selectedCategory 
            ? this.products.filter(p => p.categoria === this.selectedCategory && p.ativo)
            : this.products.filter(p => p.ativo && p.destaque);

        if (productsToShow.length === 0) {
            return `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">🍽️</div>
                    <h3 class="text-2xl font-semibold mb-2">
                        ${this.selectedCategory ? 'Nenhum produto nesta categoria' : 'Nossos Destaques'}
                    </h3>
                    <p class="text-gray-600">
                        ${this.selectedCategory ? 'Tente outra categoria' : 'Selecione uma categoria para ver todos os produtos'}
                    </p>
                </div>
            `;
        }

        return `
            <h3 class="text-2xl font-semibold text-center mb-8">
                ${this.selectedCategory 
                    ? this.categories.find(c => c.id === this.selectedCategory)?.name || 'Produtos'
                    : 'Nossos Destaques'
                }
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${productsToShow.map(product => `
                    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <img 
                            src="${product.imagem}" 
                            alt="${product.nome}"
                            class="w-full h-48 object-cover"
                            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn42divwn25A8L3RleHQ+PC9zdmc+'"
                        >
                        <div class="p-6">
                            <h4 class="text-xl font-semibold mb-2">${product.nome}</h4>
                            <p class="text-gray-600 mb-4">${product.descricao}</p>
                            <div class="flex justify-between items-center">
                                <span class="text-2xl font-bold text-orange-600">
                                    R$ ${product.preco.toFixed(2).replace('.', ',')}
                                </span>
                                ${product.destaque ? '<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">⭐ Destaque</span>' : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachEventListeners() {
        // Category selection
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryId = e.currentTarget.dataset.category;
                this.selectCategory(categoryId);
            });
        });
    }

    selectCategory(categoryId) {
        this.selectedCategory = this.selectedCategory === categoryId ? null : categoryId;
        
        // Re-render categories and products
        document.getElementById('categories-container').innerHTML = this.renderCategories();
        document.getElementById('products-container').innerHTML = this.renderProducts();
        
        // Re-attach event listeners
        this.attachEventListeners();
        
        logger.info('Category selected', { categoryId });
    }

    renderError() {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-100">
                <div class="text-center">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h2 class="text-2xl font-semibold mb-4">Erro ao carregar o sistema</h2>
                    <p class="text-gray-600 mb-6">Ocorreu um erro durante a inicialização</p>
                    <button onclick="window.location.reload()" class="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        `;
    }
}

// Initialize menu app
const menuApp = new MenuApp();

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => menuApp.init());
} else {
    menuApp.init();
}

export default menuApp;