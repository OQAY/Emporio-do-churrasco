// View do painel administrativo
export class AdminView {
    constructor() {
        this.currentSection = 'dashboard';
    }

    render() {
        const app = document.getElementById('admin-app');
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Sidebar -->
                <aside class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
                    <div class="flex items-center justify-center h-16 bg-orange-600">
                        <span class="text-white text-xl font-bold">Admin Panel</span>
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

                <!-- Main Content -->
                <main class="ml-64">
                    <!-- Top Bar -->
                    <header class="bg-white shadow-sm">
                        <div class="px-8 py-4 flex justify-between items-center">
                            <h1 id="sectionTitle" class="text-2xl font-semibold text-gray-800">Dashboard</h1>
                            
                            <div class="flex items-center space-x-4">
                                <button id="exportBtn" class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    Exportar Dados
                                </button>
                                
                                <button id="viewSiteBtn" class="px-4 py-2 text-sm bg-orange-600 text-white hover:bg-orange-700 rounded-lg flex items-center">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                    Ver Site
                                </button>
                            </div>
                        </div>
                    </header>

                    <!-- Content Area -->
                    <div id="contentArea" class="p-8">
                        <!-- Content will be loaded here -->
                    </div>
                </main>
            </div>

            <!-- Modal Container -->
            <div id="modalContainer"></div>
        `;
    }

    showDashboard(stats) {
        const content = document.getElementById('contentArea');
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Total de Produtos</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.totalProducts}</p>
                        </div>
                        <div class="bg-blue-100 p-3 rounded-full">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Produtos Ativos</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.activeProducts}</p>
                        </div>
                        <div class="bg-green-100 p-3 rounded-full">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Categorias</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.totalCategories}</p>
                        </div>
                        <div class="bg-purple-100 p-3 rounded-full">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Em Destaque</p>
                            <p class="text-3xl font-bold text-gray-800">${stats.featuredProducts}</p>
                        </div>
                        <div class="bg-orange-100 p-3 rounded-full">
                            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
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
                
                <div class="p-6">
                    <div class="mb-4 flex gap-4">
                        <input 
                            type="text" 
                            id="productSearch" 
                            placeholder="Buscar produtos..." 
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                        <select id="categoryFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300">
                            <option value="">Todas as categorias</option>
                            ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preco</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acoes</th>
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
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                            ${product.image ? 
                                `<img class="h-10 w-10 rounded-full object-cover" src="${product.image}" alt="">` :
                                `<div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>`
                            }
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${product.name}</div>
                            ${product.featured ? '<span class="text-xs text-orange-600">Em destaque</span>' : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">${category ? category.name : 'N/A'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium text-gray-900">${priceFormatted}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${product.active ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-orange-600 hover:text-orange-900 mr-3 edit-product-btn" data-id="${product.id}">Editar</button>
                    <button class="text-red-600 hover:text-red-900 delete-product-btn" data-id="${product.id}">Excluir</button>
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
                            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
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
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    showGallery(images) {
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
                    <div class="mb-4">
                        <input 
                            type="text" 
                            id="gallerySearch" 
                            placeholder="Buscar imagens..." 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
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
        `;
    }

    createGalleryImageCard(image) {
        return `
            <div class="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-shadow">
                <img 
                    src="${image.url}" 
                    alt="${image.name || 'Imagem da galeria'}"
                    class="w-full h-full object-cover cursor-pointer"
                    onclick="window.showImagePreview('${image.id}')"
                >
                
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button 
                            class="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 select-image-btn"
                            data-image-id="${image.id}"
                            title="Selecionar imagem"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </button>
                        <button 
                            class="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 delete-image-btn"
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

    showModal(title, content) {
        const modal = document.getElementById('modalContainer');
        modal.innerHTML = `
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">${title}</h3>
                        <div class="mt-2">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    closeModal() {
        document.getElementById('modalContainer').innerHTML = '';
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}