// View do painel administrativo
export class AdminView {
    constructor(database = null) {
        this.currentSection = 'dashboard';
        this.database = database;
    }

    render() {
        const app = document.getElementById('admin-app');
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Mobile menu button -->
                <button id="mobileMenuBtn" class="lg:hidden fixed top-4 left-4 z-30 p-2 bg-orange-600 text-white rounded-lg shadow-lg">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                
                <!-- Sidebar -->
                <aside id="sidebar" class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform -translate-x-full lg:translate-x-0 transition-transform duration-300 z-40">
                    <div class="flex items-center justify-between h-16 bg-orange-600 px-4">
                        <span class="text-white text-xl font-bold">Admin Panel</span>
                        <button id="closeSidebarBtn" class="lg:hidden text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <nav class="mt-5">
                        <a href="#" data-section="dashboard" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            Dashboard
                        </a>
                        
                        <a href="#" data-section="products" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            Produtos
                        </a>
                        
                        <a href="#" data-section="categories" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                            Categorias
                        </a>
                        
                        <a href="#" data-section="gallery" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Galeria de Imagens
                        </a>
                        
                        <a href="#" data-section="settings" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            Configuracoes
                        </a>
                        
                        <hr class="my-4 mx-6 border-gray-200">
                        
                        <a href="#" id="logoutBtn" class="flex items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                            Sair
                        </a>
                    </nav>
                </aside>

                <!-- Overlay for mobile menu -->
                <div id="sidebarOverlay" class="fixed inset-0 bg-black bg-opacity-50 z-30 hidden lg:hidden"></div>
                
                <!-- Main Content -->
                <main class="lg:ml-64 transition-all duration-300">
                    <!-- Top Bar -->
                    <header class="bg-white shadow-sm">
                        <div class="px-4 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h1 id="sectionTitle" class="text-xl lg:text-2xl font-semibold text-gray-800 ml-12 lg:ml-0">Dashboard</h1>
                            
                            <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                <button id="exportBtn" class="px-3 py-2 text-xs lg:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center flex-1 sm:flex-initial justify-center">
                                    <svg class="w-4 h-4 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    <span class="hidden sm:inline">Exportar</span> Dados
                                </button>
                                
                                <button id="viewSiteBtn" class="px-3 py-2 text-xs lg:text-sm bg-orange-600 text-white hover:bg-orange-700 rounded-lg flex items-center flex-1 sm:flex-initial justify-center">
                                    <svg class="w-4 h-4 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                    Ver Site
                                </button>
                            </div>
                        </div>
                    </header>

                    <!-- Content Area -->
                    <div id="contentArea" class="p-4 lg:p-8">
                        <!-- Content will be loaded here -->
                    </div>
                </main>
            </div>

            <!-- Modal Container -->
            <div id="modalContainer"></div>
        `;
    }

    showLoadingSkeleton() {
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="animate-pulse">
                <!-- Stats skeleton -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                    ${[1,2,3,4].map(() => `
                        <div class="bg-white rounded-lg shadow p-4 lg:p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <div class="h-3 bg-gray-200 rounded w-24 mb-3"></div>
                                    <div class="h-8 bg-gray-300 rounded w-16"></div>
                                </div>
                                <div class="bg-gray-200 p-2 lg:p-3 rounded-full w-10 h-10 lg:w-12 lg:h-12"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Main content skeleton -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div class="h-6 bg-gray-200 rounded w-48"></div>
                        <div class="h-10 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div class="space-y-4">
                        ${[1,2,3,4,5].map(() => `
                            <div class="flex items-center space-x-4 p-4 border border-gray-100 rounded">
                                <div class="w-16 h-16 bg-gray-200 rounded"></div>
                                <div class="flex-1">
                                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div class="flex space-x-2">
                                    <div class="h-8 bg-gray-200 rounded w-16"></div>
                                    <div class="h-8 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Loading text -->
                <div class="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                    <div class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Carregando dashboard...
                    </div>
                </div>
            </div>
        `;
    }

    showDashboard(stats) {
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <div class="dashboard-card bg-white rounded-lg shadow p-4 lg:p-6 cursor-pointer hover:shadow-lg transition-shadow" data-action="goto-products">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs lg:text-sm text-gray-600">Total de Produtos</p>
                            <p class="text-2xl lg:text-3xl font-bold text-gray-800">${stats.totalProducts}</p>
                        </div>
                        <div class="bg-blue-100 p-2 lg:p-3 rounded-full">
                            <svg class="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card bg-white rounded-lg shadow p-4 lg:p-6 cursor-pointer hover:shadow-lg transition-shadow" data-action="goto-products-active">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs lg:text-sm text-gray-600">Produtos Ativos</p>
                            <p class="text-2xl lg:text-3xl font-bold text-gray-800">${stats.activeProducts}</p>
                        </div>
                        <div class="bg-green-100 p-2 lg:p-3 rounded-full">
                            <svg class="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card bg-white rounded-lg shadow p-4 lg:p-6 cursor-pointer hover:shadow-lg transition-shadow" data-action="goto-categories">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs lg:text-sm text-gray-600">Categorias</p>
                            <p class="text-2xl lg:text-3xl font-bold text-gray-800">${stats.totalCategories}</p>
                        </div>
                        <div class="bg-purple-100 p-2 lg:p-3 rounded-full">
                            <svg class="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card bg-white rounded-lg shadow p-4 lg:p-6 cursor-pointer hover:shadow-lg transition-shadow" data-action="goto-products-featured">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs lg:text-sm text-gray-600">Em Destaque</p>
                            <p class="text-2xl lg:text-3xl font-bold text-gray-800">${stats.featuredProducts}</p>
                        </div>
                        <div class="bg-orange-100 p-2 lg:p-3 rounded-full">
                            <svg class="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Botão de Refresh -->
            <div class="mb-4 flex justify-end">
                <button id="refreshDataBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Atualizar Dados
                </button>
            </div>

            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-800">Acoes Rapidas</h2>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button class="quick-action-btn p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors" data-action="add-product">
                        <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span class="text-sm text-gray-600">Adicionar Produto</span>
                    </button>
                    
                    <button class="quick-action-btn p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors" data-action="add-category">
                        <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <span class="text-sm text-gray-600">Nova Categoria</span>
                    </button>
                    
                    <button class="quick-action-btn p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors" data-action="backup">
                        <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                        </svg>
                        <span class="text-sm text-gray-600">Backup de Dados</span>
                    </button>
                </div>
            </div>
        `;
    }

    showProducts(products, categories) {
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-gray-800">Gerenciar Produtos</h2>
                    <button id="addProductBtn" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Adicionar Produto
                    </button>
                </div>
                
                <div class="p-3 lg:p-6">
                    <div class="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <input 
                            type="text" 
                            id="productSearch" 
                            placeholder="Buscar produtos..." 
                            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                        <div class="relative">
                            <select id="categoryFilter" class="w-full sm:w-auto px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none bg-white">
                                <option value="">Todas</option>
                                ${categories.map(cat => `<option value="${cat.id}">${cat.name.length > 15 ? cat.name.substring(0, 15) + '...' : cat.name}</option>`).join('')}
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-2 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 60%;">Produto</th>
                                    <th class="px-2 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 18%;">Preço</th>
                                    <th class="px-2 lg:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 18%;">Status</th>
                                    <th class="w-4 px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style="width: 4%;">↕</th>
                                </tr>
                            </thead>
                            <tbody id="productsTableBody" class="bg-white divide-y divide-gray-200">
                                ${products.map(product => this.createProductRow(product, categories)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    createProductRow(product, categories) {
        const category = categories.find(c => c.id === product.categoryId);
        const priceFormatted = product.price ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : 'N/A';
        
        // Debug log for product
        console.log(`📦 Creating row for product: ${product.name}`, { 
            featured: product.featured, 
            tags: product.tags 
        });
        
        return `
            <tr class="hover:bg-gray-50 product-row group cursor-pointer edit-product-row" data-id="${product.id}" data-category-id="${product.categoryId}">
                <td class="px-2 lg:px-4 py-3 whitespace-nowrap" style="width: 60%;">
                    <div class="flex items-center">
                        <div class="h-10 w-10 lg:h-12 lg:w-12 flex-shrink-0">
                            ${product.image ? 
                                `<img class="h-10 w-10 lg:h-12 lg:w-12 object-cover" style="border-radius: 10px;" src="${product.image}" alt="">` :
                                `<div class="h-10 w-10 lg:h-12 lg:w-12 bg-gray-200 flex items-center justify-center" style="border-radius: 10px;">
                                    <svg class="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>`
                            }
                        </div>
                        <div class="ml-2 min-w-0 flex-1">
                            ${this.renderProductTags(product.tags, product.featured)}
                            <div class="text-base font-semibold text-gray-900 leading-tight truncate ${product.tags && product.tags.length > 0 ? 'mt-1' : ''}" title="${product.name}">${product.name}</div>
                            <div class="text-xs text-gray-500 leading-tight truncate" title="${category ? category.name : 'N/A'}">${category ? category.name : 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-2 lg:px-4 py-3 whitespace-nowrap" style="width: 18%;">
                    <span class="text-sm font-medium text-gray-900">${priceFormatted}</span>
                </td>
                <td class="px-2 lg:px-4 py-3 whitespace-nowrap text-center" style="width: 18%;">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${product.active ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="w-4 px-1 py-3 whitespace-nowrap" style="width: 4%;">
                    <div class="drag-handle cursor-move opacity-50 group-hover:opacity-100 transition-all duration-200 flex justify-center items-center h-full">
                        <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
                        </svg>
                    </div>
                </td>
            </tr>
        `;
    }

    showCategories(categories) {
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-gray-800">Gerenciar Categorias</h2>
                    <button id="addCategoryBtn" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Adicionar Categoria
                    </button>
                </div>
                
                <div class="p-6">
                    <div class="space-y-4">
                        ${categories.map(category => `
                            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 category-row group cursor-pointer" data-id="${category.id}">
                                <div class="flex items-center">
                                    <span class="text-gray-400 mr-4">#${category.order}</span>
                                    <div>
                                        <h3 class="font-medium text-gray-900">${category.name}</h3>
                                        <span class="text-sm ${category.active ? 'text-green-600' : 'text-red-600'}">
                                            ${category.active ? 'Ativa' : 'Inativa'}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button class="p-2 text-gray-400 hover:text-orange-600 edit-category-btn" data-id="${category.id}">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button class="p-2 text-gray-400 hover:text-red-600 delete-category-btn" data-id="${category.id}">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                    <div class="drag-handle cursor-move opacity-50 group-hover:opacity-100 transition-all duration-200 flex justify-center items-center h-full p-2">
                                        <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    showGallery(images, showLoading = false) {
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-gray-800">Galeria de Imagens</h2>
                    <div class="flex gap-2">
                        <button id="uploadImagesBtn" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Upload Imagens
                        </button>
                        <button id="uploadFromUrlBtn" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                            </svg>
                            Adicionar por URL
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <input 
                            type="text" 
                            id="gallerySearch" 
                            placeholder="Buscar imagens..." 
                            class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                        
                        <div class="flex items-center gap-4">
                            <div class="text-sm text-gray-500">
                                ${images.length} ${images.length === 1 ? 'imagem' : 'imagens'}
                                ${showLoading ? '<span class="text-blue-500 ml-2">🔄 Atualizando...</span>' : ''}
                            </div>
                        </div>
                    </div>
                    
                    ${images.length === 0 ? `
                        <div class="text-center py-12">
                            <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-gray-500 text-lg mb-4">Nenhuma imagem na galeria</p>
                            <p class="text-gray-400">Comece adicionando imagens usando os botões acima</p>
                        </div>
                    ` : `
                        <div id="galleryGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            ${images.map(image => this.createGalleryImageCard(image)).join('')}
                        </div>
                    `}
                </div>
            </div>
            
            <!-- CSS adicional para mobile -->
            <style>
                /* Desabilitar zoom por double-tap na galeria */
                #galleryGrid {
                    touch-action: manipulation;
                    -ms-touch-action: manipulation;
                }
                
                /* Mobile active state - mostra botões quando clicado */
                .gallery-image-card.mobile-active .action-buttons {
                    background-color: rgba(0, 0, 0, 0.3);
                }
                
                .gallery-image-card.mobile-active .mobile-active-buttons {
                    opacity: 1 !important;
                }
                
                /* Melhora o long press no mobile e desabilita zoom */
                .gallery-image-card {
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    user-select: none;
                    touch-action: manipulation;
                    -ms-touch-action: manipulation;
                }
                
                /* Desabilitar zoom em toda a área da galeria */
                .gallery-image-card img {
                    touch-action: manipulation;
                    -ms-touch-action: manipulation;
                    pointer-events: none; /* Evita zoom na imagem */
                }
                
                /* Re-abilitar pointer events apenas nos botões */
                .gallery-image-card button {
                    pointer-events: auto;
                }
            </style>
        `;
    }

    updateGalleryImages(images) {
        const galleryGrid = document.getElementById('galleryGrid');
        const imageCounter = document.querySelector('.text-sm.text-gray-500');
        
        if (galleryGrid) {
            galleryGrid.innerHTML = images.map(image => this.createGalleryImageCard(image)).join('');
        }
        
        if (imageCounter) {
            imageCounter.innerHTML = `${images.length} ${images.length === 1 ? 'imagem' : 'imagens'} <span class="text-green-500">✅ Atualizado</span>`;
        }
        
        console.log('✅ Gallery images updated in UI');
    }

    createGalleryImageCard(image) {
        return `
            <div class="gallery-image-card relative group bg-gray-100 rounded-lg overflow-hidden aspect-square" data-image-id="${image.id}">
                <!-- Overlay de seleção -->
                <div class="selection-overlay absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 z-10"></div>
                
                <!-- Checkbox circular no centro (30% da imagem, só aparece quando há seleção ativa) -->
                <div class="selection-checkbox absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 z-20">
                    <div class="w-12 h-12 rounded-full border-2 border-white bg-white bg-opacity-70 shadow-xl flex items-center justify-center transition-all duration-300">
                        <!-- Checkmark que aparece quando selecionado -->
                        <div class="selected-indicator opacity-0 transform scale-0 transition-all duration-300">
                            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <!-- Hidden checkbox for state tracking -->
                <input type="checkbox" class="image-checkbox hidden" data-image-id="${image.id}">
                
                <img 
                    src="${image.url}" 
                    alt="${image.name || 'Imagem da galeria'}"
                    class="w-full h-full object-cover cursor-pointer"
                    onclick="window.showImagePreview('${image.id}')"
                >
                
                <div class="action-buttons absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center z-30">
                    <div class="opacity-0 group-hover:opacity-100 mobile-active-buttons transition-opacity flex gap-2 relative z-40">
                        <button 
                            class="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 select-image-btn relative z-50"
                            data-image-id="${image.id}"
                            title="Selecionar imagem"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </button>
                        <button 
                            class="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 edit-image-btn relative z-50"
                            data-image-id="${image.id}"
                            title="Editar imagem"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                        </button>
                        <button 
                            class="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 delete-image-btn relative z-50"
                            data-image-id="${image.id}"
                            title="Excluir imagem"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <p class="text-white text-xs truncate">${image.name || 'Sem nome'}</p>
                    <p class="text-gray-300 text-xs">${this.formatFileSize(image.size || 0)}</p>
                </div>
            </div>
        `;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showSettings(restaurant) {
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="text-lg font-semibold text-gray-800">Informacoes do Restaurante</h2>
                    </div>
                    <div class="p-6">
                        <form id="restaurantForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Restaurante</label>
                                <input 
                                    type="text" 
                                    id="restaurantName" 
                                    value="${restaurant.name}"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                >
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Logo (Iniciais)</label>
                                <input 
                                    type="text" 
                                    id="restaurantLogo" 
                                    value="${restaurant.logo}"
                                    maxlength="2"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                >
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">URL do Banner</label>
                                <input 
                                    type="text" 
                                    id="restaurantBanner" 
                                    value="${restaurant.banner}"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                >
                            </div>
                            
                            <button type="submit" class="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                                Salvar Alteracoes
                            </button>
                        </form>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="text-lg font-semibold text-gray-800">Backup e Restauracao</h2>
                    </div>
                    <div class="p-6 space-y-4">
                        <button id="exportDataBtn" class="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            Exportar Dados
                        </button>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Importar Dados</label>
                            <input 
                                type="file" 
                                id="importFile" 
                                accept=".json"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                        </div>
                        
                        <button id="importDataBtn" class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                            </svg>
                            Importar Dados
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showModal(title, content, isNested = false) {
        const modal = document.getElementById('modalContainer');
        console.log('showModal chamado - isNested:', isNested, 'modalContainer:', modal);
        
        if (isNested) {
            // For nested modals, preserve parent modal scroll
            const parentModal = modal.querySelector('.modal-content');
            if (parentModal) {
                parentModal.classList.add('modal-preserve-scroll');
            }
            
            console.log('Criando modal aninhado...');
            const nestedModal = document.createElement('div');
            nestedModal.className = 'nested-modal';
            nestedModal.innerHTML = `
                <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center sm:p-4 p-2" style="z-index: 60;">
                    <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-lg sm:max-w-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        <div class="sm:p-6 p-4">
                            <div class="flex items-center justify-center relative mb-4">
                                <button 
                                    type="button" 
                                    id="closePreviewBtn"
                                    class="absolute left-0 w-8 h-8 bg-gray-200 bg-opacity-80 hover:bg-gray-300 hover:bg-opacity-90 text-gray-600 rounded-full flex items-center justify-center transition-all"
                                    title="Fechar preview"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </button>
                                <h3 class="text-lg leading-6 font-medium text-gray-900 text-center">${title}</h3>
                            </div>
                            <div class="mt-2">
                                ${content}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            modal.appendChild(nestedModal);
            console.log('Modal aninhado adicionado:', nestedModal);
        } else {
            // Regular modal - prevent body scroll
            document.body.classList.add('modal-open');
            
            modal.innerHTML = `
                <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4" style="z-index: 50;">
                    <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div class="p-6">
                            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">${title}</h3>
                            <div class="mt-2">
                                ${content}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    closeModal(onlyNested = false) {
        const modal = document.getElementById('modalContainer');
        
        if (onlyNested) {
            // Close only the nested modal and restore parent scroll
            const nestedModal = modal.querySelector('.nested-modal');
            if (nestedModal) {
                nestedModal.remove();
            }
            
            const parentModal = modal.querySelector('.modal-content');
            if (parentModal) {
                parentModal.classList.remove('modal-preserve-scroll');
            }
        } else {
            // Close all modals and restore body scroll
            modal.innerHTML = '';
            document.body.classList.remove('modal-open');
        }
    }

    renderProductTags(productTags = [], isFeatured = false) {
        // Debug log
        console.log('🏷️ renderProductTags called with:', { productTags, isFeatured });
        
        // Get available tags from database first
        const availableTags = this.database?.getProductTags() || [
            { id: "destaque", name: "Destaque", color: "#f59e0b", icon: "⭐" },
            { id: "mais-vendido", name: "Mais Vendido", color: "#ef4444", icon: "🔥" },
            { id: "especial-chef", name: "Especial do Chef", color: "#8b5cf6", icon: "👨‍🍳" },
            { id: "novo", name: "Novo", color: "#10b981", icon: "✨" },
            { id: "promocao", name: "Promoção", color: "#f97316", icon: "💰" }
        ];
        
        console.log('📋 Available tags from database:', availableTags.map(t => ({id: t.id, name: t.name})));
        
        // Always show Destaque tag for featured products
        const tagsToShow = [...(productTags || [])];
        if (isFeatured) {
            // Find the real "Destaque" tag UUID from database
            const destaqueTag = availableTags.find(t => t.name === 'Destaque' || t.name === 'destaque');
            const destaqueId = destaqueTag ? destaqueTag.id : 'destaque';
            
            console.log('🔍 Found destaque tag:', destaqueTag, 'using ID:', destaqueId);
            
            if (!tagsToShow.includes(destaqueId)) {
                tagsToShow.unshift(destaqueId); // Add destaque at the beginning
                console.log('✅ Added destaque tag for featured product with ID:', destaqueId);
            }
        }
        
        console.log('🔍 Final tags to show:', tagsToShow);
        
        if (tagsToShow.length === 0) {
            return '';
        }
        
        return `
            <div class="flex flex-wrap gap-1 mt-1">
                ${tagsToShow.slice(0, 2).map(tagId => {
                    const tag = availableTags.find(t => t.id === tagId);
                    console.log(`🎯 Looking for tag: ${tagId}, found:`, tag);
                    if (!tag) {
                        console.log(`❌ Tag not found: ${tagId}, available tags:`, availableTags.map(t => t.id));
                        return '';
                    }
                    return `<span class="inline-flex items-center text-xs px-1.5 py-0.5 rounded-full font-medium" 
                              style="background-color: ${tag.color}20; color: ${tag.color};">
                              ${tag.icon} ${tag.name}
                            </span>`;
                }).join('')}
                ${tagsToShow.length > 2 ? `<span class="text-xs text-gray-400">+${tagsToShow.length - 2}</span>` : ''}
            </div>
        `;
    }

    showNotification(message, type = 'success') {
        // Remove any existing notifications to prevent stacking
        document.querySelectorAll('.admin-notification').forEach(n => n.remove());
        
        const icons = {
            success: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>',
            error: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>',
            warning: '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>'
        };
        
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600', 
            warning: 'bg-yellow-600'
        };
        
        const notification = document.createElement('div');
        notification.className = `admin-notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl text-white transition-all duration-500 transform translate-x-full ${colors[type] || colors.success}`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    ${icons[type] || icons.success}
                </svg>
                <span class="font-medium">${message}</span>
                <button class="ml-4 hover:opacity-70 transition-opacity" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto-hide after 4 seconds for success, 6 seconds for errors
        const hideDelay = type === 'error' ? 6000 : 4000;
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 500);
            }
        }, hideDelay);
    }
}