// Controller administrativo principal
export class AdminController {
    constructor(database, view) {
        this.database = database;
        this.view = view;
        this.currentSection = 'dashboard';
    }

    init() {
        this.setupNavigation();
        this.setupGlobalActions();
        this.setupMobileMenu();
        this.setupDragAndDrop();
        this.showDashboard();
    }
    
    setupMobileMenu() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.remove('-translate-x-full');
                sidebarOverlay.classList.remove('hidden');
            });
        }
        
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                sidebarOverlay.classList.add('hidden');
            });
        }
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                sidebarOverlay.classList.add('hidden');
            });
        }
        
        // Close sidebar on mobile when selecting a menu item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    sidebar.classList.add('-translate-x-full');
                    sidebarOverlay.classList.add('hidden');
                }
            });
        });
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
    }

    setupGlobalActions() {
        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.database.exportData();
            this.view.showNotification('Dados exportados com sucesso!');
        });

        // View site button
        document.getElementById('viewSiteBtn').addEventListener('click', () => {
            window.open('/index.html', '_blank');
        });
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Update navigation active state
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.section === section) {
                item.classList.add('bg-orange-50', 'text-orange-600');
            } else {
                item.classList.remove('bg-orange-50', 'text-orange-600');
            }
        });

        // Update section title
        const titles = {
            dashboard: 'Dashboard',
            products: 'Produtos',
            categories: 'Categorias',
            gallery: 'Galeria de Imagens',
            settings: 'Configurações'
        };
        document.getElementById('sectionTitle').textContent = titles[section];

        // Load section content
        switch(section) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'products':
                this.showProducts();
                break;
            case 'categories':
                this.showCategories();
                break;
            case 'gallery':
                this.showGallery();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }

    async showDashboard() {
        // Show loading skeleton immediately
        this.view.showLoadingSkeleton();
        
        try {
            // Ensure data is loaded
            await this.database.loadData();
            
            // Get fresh statistics
            const stats = this.database.getStatistics();
            console.log('📊 Dashboard stats loaded:', stats);
            
            // Show dashboard immediately after loading
            this.view.showDashboard(stats);
            this.setupDashboardClickListeners();
            
        } catch (error) {
            console.error('❌ Dashboard load failed:', error);
            this.view.showNotification('Erro ao carregar dashboard', 'error');
            
            // Show dashboard with fallback data
            const fallbackStats = {
                totalProducts: 0,
                totalCategories: 0, 
                activeProducts: 0,
                onSaleProducts: 0,
                totalImages: 0,
                restaurantName: 'Menu Online'
            };
            
            this.view.showDashboard(fallbackStats);
            this.setupDashboardClickListeners();
        }
    }
        
    setupDashboardClickListeners() {
        // Setup refresh button
        const refreshBtn = document.getElementById('refreshDataBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = `
                    <svg class="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Atualizando...
                `;
                
                await this.database.forceReload();
                this.view.showNotification('Dados atualizados com sucesso!', 'success');
                this.showDashboard();
            });
        }
        
        // Setup dashboard card navigation
        document.querySelectorAll('.dashboard-card').forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                if (action === 'goto-products') {
                    this.switchSection('products');
                } else if (action === 'goto-products-active') {
                    this.switchSection('products');
                    // Apply active filter after loading
                    setTimeout(() => {
                        const statusFilter = document.getElementById('statusFilter');
                        if (statusFilter) {
                            statusFilter.value = 'active';
                            statusFilter.dispatchEvent(new Event('change'));
                        }
                    }, 100);
                } else if (action === 'goto-categories') {
                    this.switchSection('categories');
                } else if (action === 'goto-products-featured') {
                    this.switchSection('products');
                    // Apply featured filter after loading
                    setTimeout(() => {
                        const featuredFilter = document.getElementById('featuredFilter');
                        if (featuredFilter) {
                            featuredFilter.value = 'featured';
                            featuredFilter.dispatchEvent(new Event('change'));
                        }
                    }, 100);
                }
            });
        });
        
        // Setup quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'add-product') {
                    this.switchSection('products');
                    setTimeout(() => this.showProductForm(), 100);
                } else if (action === 'add-category') {
                    this.switchSection('categories');
                    setTimeout(() => this.showCategoryForm(), 100);
                } else if (action === 'backup') {
                    this.database.exportData();
                    this.view.showNotification('Backup realizado com sucesso!');
                }
            });
        });
    }

    showProducts() {
        const products = this.database.getProducts();
        const categories = this.database.getCategories();
        
        // DEBUG: Log para verificar dados
        console.log('📊 AdminController.showProducts() DEBUG:');
        console.log('  - Products:', products.length, products);
        console.log('  - Categories:', categories.length, categories);
        
        this.view.showProducts(products, categories);
        
        
        // Add product button
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showProductForm();
        });
        
        // Edit rows - entire row is clickable
        document.querySelectorAll('.edit-product-row').forEach(row => {
            row.addEventListener('click', () => {
                const productId = row.dataset.id;
                const product = this.database.getProductById(productId);
                this.showProductForm(product);
            });
        });
        
        
        // Search
        let searchTimeout;
        document.getElementById('productSearch').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterProducts(e.target.value);
            }, 300);
        });
        
        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterProducts(null, e.target.value);
        });
    }

    filterProducts(search, categoryId) {
        const filters = {};
        if (search) filters.search = search;
        if (categoryId) filters.categoryId = categoryId;
        
        const products = this.database.getProducts(filters);
        const categories = this.database.getCategories();
        
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = products.map(product => this.view.createProductRow(product, categories)).join('');
        
        // Re-attach event listeners for filtered results
        document.querySelectorAll('.edit-product-row').forEach(row => {
            row.addEventListener('click', () => {
                const productId = row.dataset.id;
                const product = this.database.getProductById(productId);
                this.showProductForm(product);
            });
        });
    }

    showProductForm(product = null) {
        const categories = this.database.getCategories();
        const isEdit = product !== null;
        
        const formHtml = `
            <form id="productForm" class="space-y-3">
                <!-- Preview da Imagem -->
                <div class="flex justify-center mb-4">
                    <div class="relative">
                        <div id="imagePreviewContainer" class="w-36 h-36 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-orange-300 transition-colors"
                             title="Clique para adicionar/alterar imagem">
                            ${product?.image ? 
                                `<img id="currentImagePreview" src="${product.image}" alt="Preview" class="w-full h-full object-cover">` :
                                `<div id="placeholderPreview" class="text-center">
                                    <svg class="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <p class="text-xs text-gray-500">Sem imagem</p>
                                </div>`
                            }
                        </div>
                        <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                    <input 
                        type="text" 
                        id="productName" 
                        value="${product?.name || ''}"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                    <div class="relative">
                        <select 
                            id="productCategory" 
                            required
                            class="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white text-sm"
                        >
                            <option value="">Selecione uma categoria</option>
                            ${categories.map(cat => `
                                <option value="${cat.id}" ${product?.categoryId === cat.id ? 'selected' : ''}>
                                    ${cat.name}
                                </option>
                            `).join('')}
                            <option value="__create_new__" class="text-orange-600 font-medium">+ Criar nova categoria</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <!-- Campo para criar nova categoria (inicialmente escondido) -->
                    <div id="newCategorySection" class="hidden mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <div class="flex items-center space-x-2">
                            <input 
                                type="text" 
                                id="newCategoryName" 
                                placeholder="Nome da nova categoria"
                                class="flex-1 px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                            >
                            <button 
                                type="button" 
                                id="confirmCreateCategory"
                                class="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm flex items-center"
                                title="Criar categoria (Enter)"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </button>
                            <button 
                                type="button" 
                                id="cancelCreateCategory"
                                class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                                title="Cancelar"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <p class="text-xs text-orange-600 mt-1">Digite o nome e pressione Enter ou clique em ✓</p>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea 
                        id="productDescription" 
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >${product?.description || ''}</textarea>
                </div>
                
                <!-- Seção de Preços Melhorada -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-semibold text-gray-800 flex items-center">
                            <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                            Precificação
                        </h3>
                        
                        <!-- Toggle Promoção -->
                        <label class="flex items-center cursor-pointer">
                            <div class="relative">
                                <input 
                                    type="checkbox" 
                                    id="productIsOnSale" 
                                    ${product?.isOnSale ? 'checked' : ''}
                                    class="sr-only"
                                >
                                <div class="toggle-track w-12 h-6 bg-gray-300 rounded-full shadow-inner transition-colors duration-300 ${product?.isOnSale ? 'bg-green-500' : ''}"></div>
                                <div class="toggle-thumb absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform ${product?.isOnSale ? 'translate-x-6' : 'translate-x-0'}" style="top: 2px; left: 2px;"></div>
                            </div>
                            <span class="ml-3 text-sm font-medium text-gray-700">
                                Oferta Especial
                            </span>
                        </label>
                    </div>
                    
                    <!-- Campo Principal de Preço -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <span id="priceLabel">Preço de Venda (R$)</span> *
                            </label>
                            <input 
                                type="number" 
                                id="productPrice" 
                                value="${product?.isOnSale ? product?.originalPrice || '' : product?.price || ''}"
                                step="0.01"
                                min="0"
                                required
                                class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                                placeholder="0,00"
                            >
                        </div>
                        
                        <!-- Campo Preço Promocional (dentro do card azul) -->
                        <div id="promotionFields" class="transition-all duration-300 ${product?.isOnSale ? 'block' : 'hidden'}">
                            <label class="block text-sm font-medium text-green-700 mb-2">
                                Preço Promocional (R$) *
                            </label>
                            <input 
                                type="number" 
                                id="productPromotionalPrice" 
                                value="${product?.isOnSale ? product?.price || '' : ''}"
                                step="0.01"
                                min="0"
                                class="w-full px-3 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold bg-green-50"
                                placeholder="0,00"
                            >
                        </div>
                    </div>
                    
                    <!-- Preview da Economia -->
                    <div id="discountPreview" class="mt-3 p-3 bg-white border border-green-300 rounded-lg shadow-sm hidden">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-gray-500">Cliente pagará:</span>
                                <span class="line-through text-gray-400 text-sm">R$ 0,00</span>
                                <span class="text-green-600 font-bold text-lg">R$ 0,00</span>
                            </div>
                            <span class="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                -0% OFF
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Hidden inputs for image handling -->
                <input type="hidden" id="selectedGalleryImageId" value="">
                <input type="file" id="productImage" accept="image/*" class="hidden">
                
                <!-- Opções do Produto -->
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-5">
                    <h3 class="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <svg class="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Configurações
                    </h3>
                    
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <!-- Toggle Ativo -->
                        <label class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                            <div class="flex items-center">
                                <div class="w-5 h-5 mr-3 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <span class="text-sm font-medium text-gray-700">Ativo</span>
                            </div>
                            <input 
                                type="checkbox" 
                                id="productActive" 
                                ${product?.active !== false ? 'checked' : ''}
                                class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            >
                        </label>
                        
                        <!-- Toggle Destaque -->
                        <label class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition-colors">
                            <div class="flex items-center">
                                <div class="w-5 h-5 mr-3 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                    </svg>
                                </div>
                                <span class="text-sm font-medium text-gray-700">Destaque</span>
                            </div>
                            <input 
                                type="checkbox" 
                                id="productFeatured" 
                                ${product?.featured ? 'checked' : ''}
                                class="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            >
                        </label>
                    </div>
                    
                    <!-- Tags do Produto -->
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tags do Produto</label>
                        <div id="productTagsContainer">
                            ${this.renderTagsSelector(product?.tags || [])}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between gap-3 mt-4">
                        <button 
                            type="button" 
                            id="previewProductBtn"
                            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center transition-colors"
                        >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            Visualizar
                        </button>
                        
                        ${isEdit ? `
                            <button 
                                type="button" 
                                id="deleteProductBtn"
                                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center transition-colors"
                                data-product-id="${product.id}"
                            >
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                Deletar
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="flex flex-col space-y-2 pt-4">
                    <button 
                        type="button" 
                        id="cancelBtn"
                        class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        class="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        ${isEdit ? 'Atualizar' : 'Adicionar'} Produto
                    </button>
                </div>
            </form>
        `;
        
        this.view.showModal(isEdit ? 'Editar Produto' : 'Adicionar Produto', formHtml);
        
        // CRITICAL: Set selectedGalleryImageId if editing product with existing image
        if (product && product.image) {
            const galleryImages = this.database.getGalleryImages();
            const existingImage = galleryImages.find(img => img.url === product.image);
            
            if (existingImage) {
                const selectedGalleryImageId = document.getElementById('selectedGalleryImageId');
                if (selectedGalleryImageId) {
                    selectedGalleryImageId.value = existingImage.id;
                    console.log('✅ Found image in gallery, set selectedGalleryImageId:', existingImage.id);
                } else {
                    console.error('❌ selectedGalleryImageId field not found!');
                }
            } else {
                console.warn('⚠️ Product image not found in gallery:', product.image);
                // The image exists in product but not in gallery
                // This is OK - user can still edit product and image will remain unchanged
            }
        } else {
            console.log('🆕 New product or no image - selectedGalleryImageId remains empty');
        }
        
        // Handle form submission
        document.getElementById('productForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProduct(product?.id);
        });
        
        // Handle cancel
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.view.closeModal();
        });

        // Handle delete button (only in edit mode)
        if (product) {
            const deleteBtn = document.getElementById('deleteProductBtn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.showDeleteConfirmation(product);
                });
            }
        }
        
        // Handle promotion toggle
        const promotionCheckbox = document.getElementById('productIsOnSale');
        const promotionFields = document.getElementById('promotionFields');
        const priceLabel = document.getElementById('priceLabel');
        const toggleTrack = document.querySelector('.toggle-track');
        const toggleThumb = document.querySelector('.toggle-thumb');
        
        promotionCheckbox.addEventListener('change', () => {
            if (promotionCheckbox.checked) {
                // Ativar promoção
                promotionFields.style.display = 'block';
                promotionFields.classList.remove('hidden');
                priceLabel.textContent = 'Preço Original (R$)';
                toggleTrack.classList.add('bg-green-500');
                toggleTrack.classList.remove('bg-gray-300');
                toggleThumb.classList.add('translate-x-6');
                toggleThumb.classList.remove('translate-x-0');
            } else {
                // Desativar promoção
                promotionFields.style.display = 'none';
                promotionFields.classList.add('hidden');
                priceLabel.textContent = 'Preço de Venda (R$)';
                document.getElementById('productPromotionalPrice').value = '';
                document.getElementById('discountPreview').classList.add('hidden');
                toggleTrack.classList.remove('bg-green-500');
                toggleTrack.classList.add('bg-gray-300');
                toggleThumb.classList.remove('translate-x-6');
                toggleThumb.classList.add('translate-x-0');
            }
        });
        
        // Handle price preview calculation
        const normalPriceInput = document.getElementById('productPrice');
        const promotionalPriceInput = document.getElementById('productPromotionalPrice');
        const discountPreview = document.getElementById('discountPreview');
        
        const updatePreview = () => {
            const normalPrice = parseFloat(normalPriceInput.value) || 0;
            const promotionalPrice = parseFloat(promotionalPriceInput.value) || 0;
            
            if (normalPrice > 0 && promotionalPrice > 0 && promotionalPrice < normalPrice) {
                const discount = Math.round(((normalPrice - promotionalPrice) / normalPrice) * 100);
                const savings = normalPrice - promotionalPrice;
                const normalFormatted = `R$ ${normalPrice.toFixed(2).replace('.', ',')}`;
                const promotionalFormatted = `R$ ${promotionalPrice.toFixed(2).replace('.', ',')}`;
                const savingsFormatted = `R$ ${savings.toFixed(2).replace('.', ',')}`;
                
                discountPreview.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <span class="text-sm text-gray-600">Cliente pagará:</span>
                            <span class="line-through text-gray-400 text-sm">${normalFormatted}</span>
                            <span class="text-green-600 font-bold text-lg">${promotionalFormatted}</span>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-bold">
                                ${discount}% OFF
                            </span>
                            <span class="text-xs text-green-600 font-medium mt-1">Economia ${savingsFormatted}</span>
                        </div>
                    </div>
                `;
                discountPreview.classList.remove('hidden');
            } else {
                discountPreview.classList.add('hidden');
            }
        };
        
        normalPriceInput.addEventListener('input', updatePreview);
        promotionalPriceInput.addEventListener('input', updatePreview);
        
        // Initial preview if editing
        if (product?.isOnSale) {
            updatePreview();
        }
        
        // Setup tags events
        this.setupTagsEvents();
        
        // Image handling is now done through the preview click overlay
        
        // Handle image upload - UPLOAD IMMEDIATELY TO SUPABASE
        document.getElementById('productImage').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file && file.size > 5000000) {
                alert('Imagem muito grande! Máximo 5MB.');
                e.target.value = '';
            } else if (file) {
                // Clear gallery selection when uploading new file
                document.getElementById('selectedGalleryImageId').value = '';
                
                // Update main preview immediately
                this.updateImagePreview(file);
                
                // Upload to Supabase immediately in background
                try {
                    console.log('📤 Uploading image to Supabase immediately...');
                    this.view.showNotification('Enviando imagem...', 'info');
                    
                    const imageData = await this.database.saveImage(file);
                    
                    // Save to gallery automatically
                    const categorySelect = document.getElementById('productCategory');
                    const categoryName = categorySelect?.options[categorySelect.selectedIndex]?.text || 'Produto';
                    const productName = document.getElementById('productName')?.value || 'Nova Imagem';
                    
                    const galleryImageData = {
                        name: `${productName} - ${categoryName}`,
                        url: imageData.url,
                        size: file.size,
                        type: file.type,
                        tags: this.generateAutoTags(productName, categoryName)
                    };
                    
                    // Check if image already exists
                    if (!this.database.imageExistsInGallery(imageData.url)) {
                        const savedImage = await this.database.addGalleryImage(galleryImageData);
                        
                        // Store the gallery image ID to use when saving product
                        const selectedGalleryImageId = document.getElementById('selectedGalleryImageId');
                        if (selectedGalleryImageId && savedImage) {
                            // Store the ID returned from Supabase
                            selectedGalleryImageId.value = savedImage.id || imageData.id;
                            console.log('✅ Image uploaded to Supabase and gallery:', savedImage);
                            this.view.showNotification('Imagem enviada com sucesso!', 'success');
                        }
                    } else {
                        // Image already exists, find its ID
                        const images = this.database.getGalleryImages();
                        const existingImage = images.find(img => img.url === imageData.url);
                        if (existingImage) {
                            document.getElementById('selectedGalleryImageId').value = existingImage.id;
                            console.log('✅ Using existing image from gallery:', existingImage.id);
                        }
                    }
                } catch (error) {
                    console.error('❌ Failed to upload image:', error);
                    this.view.showNotification('Erro ao enviar imagem. Tente novamente.', 'error');
                }
            }
        });
        
        // Image removal is handled through the overlay interface
        
        // Handle image preview click for overlay effect
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        if (imagePreviewContainer) {
            imagePreviewContainer.addEventListener('click', () => {
                this.showImageUploadOverlay();
            });
        }
        
        // Handle category selection for creating new category
        const categorySelect = document.getElementById('productCategory');
        const newCategorySection = document.getElementById('newCategorySection');
        const newCategoryName = document.getElementById('newCategoryName');
        const confirmCreateCategory = document.getElementById('confirmCreateCategory');
        const cancelCreateCategory = document.getElementById('cancelCreateCategory');
        
        categorySelect.addEventListener('change', () => {
            if (categorySelect.value === '__create_new__') {
                newCategorySection.classList.remove('hidden');
                newCategoryName.focus();
                categorySelect.value = ''; // Reset select to required state
            } else {
                newCategorySection.classList.add('hidden');
                newCategoryName.value = '';
            }
        });
        
        // Create category on Enter
        newCategoryName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.createCategoryInline();
            }
        });
        
        // Create category on button click
        confirmCreateCategory.addEventListener('click', () => {
            this.createCategoryInline();
        });
        
        // Cancel category creation
        cancelCreateCategory.addEventListener('click', () => {
            newCategorySection.classList.add('hidden');
            newCategoryName.value = '';
            categorySelect.value = '';
        });
        
        // Handle product preview
        const previewProductBtn = document.getElementById('previewProductBtn');
        if (previewProductBtn) {
            previewProductBtn.addEventListener('click', () => {
                this.showProductPreview();
            });
        }
    }

    createCategoryInline() {
        const newCategoryName = document.getElementById('newCategoryName');
        const categoryName = newCategoryName.value.trim();
        
        if (!categoryName) {
            this.view.showNotification('Digite um nome para a categoria', 'error');
            newCategoryName.focus();
            return;
        }
        
        // Check if category already exists
        const existingCategories = this.database.getCategories();
        const duplicateExists = existingCategories.some(cat => 
            cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if (duplicateExists) {
            this.view.showNotification('Categoria já existe', 'error');
            newCategoryName.focus();
            return;
        }
        
        // Create new category
        const newCategory = this.database.addCategory({
            name: categoryName,
            active: true
        });
        
        if (newCategory) {
            // Update the select options
            const categorySelect = document.getElementById('productCategory');
            const createNewOption = categorySelect.querySelector('option[value="__create_new__"]');
            
            // Add new option before "Create new" option
            const newOption = document.createElement('option');
            newOption.value = newCategory.id;
            newOption.textContent = newCategory.name;
            newOption.selected = true;
            
            categorySelect.insertBefore(newOption, createNewOption);
            
            // Hide the creation section
            const newCategorySection = document.getElementById('newCategorySection');
            newCategorySection.classList.add('hidden');
            newCategoryName.value = '';
            
            this.view.showNotification(`Categoria "${categoryName}" criada com sucesso!`, 'success');
        } else {
            this.view.showNotification('Erro ao criar categoria', 'error');
        }
    }

    showProductPreview() {
        // Collect current form data to create preview
        const productName = document.getElementById('productName').value || 'Nome do Produto';
        const productDescription = document.getElementById('productDescription').value || 'Descrição do produto';
        const categoryId = document.getElementById('productCategory').value;
        const isOnSale = document.getElementById('productIsOnSale').checked;
        const normalPrice = parseFloat(document.getElementById('productPrice').value) || 0;
        const promotionalPrice = parseFloat(document.getElementById('productPromotionalPrice').value) || null;
        const featured = document.getElementById('productFeatured').checked;
        
        // Get image from preview or selected gallery/upload
        let productImage = './images/produtos/placeholder.svg'; // Default
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        const imgElement = imagePreviewContainer.querySelector('img');
        if (imgElement) {
            productImage = imgElement.src;
        }
        
        // Get category name
        const categorySelect = document.getElementById('productCategory');
        const selectedCategoryOption = categorySelect.options[categorySelect.selectedIndex];
        const categoryName = selectedCategoryOption && selectedCategoryOption.value !== '' ? 
            selectedCategoryOption.textContent : 'Sem categoria';
        
        // Create temporary product object for preview
        const previewProduct = {
            id: 'preview',
            name: productName,
            description: productDescription,
            price: isOnSale ? promotionalPrice : normalPrice,
            originalPrice: isOnSale ? normalPrice : null,
            isOnSale: isOnSale,
            image: productImage,
            categoryId: categoryId,
            featured: featured,
            active: true
        };
        
        // Create preview modal content
        const previewHtml = `
            <div class="space-y-4">
                <div class="text-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Preview do Produto</h3>
                    <p class="text-sm text-gray-600">Como o produto aparecerá no cardápio digital</p>
                    <div class="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs inline-block">
                        Categoria: ${categoryName}
                    </div>
                </div>
                
                <!-- Card na lista do cardápio -->
                <div class="mb-6">
                    <h4 class="text-sm font-medium text-gray-900 mb-2">Lista do Cardápio</h4>
                    <div class="border border-gray-200 rounded-lg p-1 bg-gray-50">
                        ${this.createProductCardPreview(previewProduct, 'small')}
                    </div>
                </div>
                
                <!-- Card expandido ao clicar -->
                <div class="mb-6">
                    <h4 class="text-sm font-medium text-gray-900 mb-2">Ao Clicar no Item do Cardápio</h4>
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        ${this.createProductCardPreview(previewProduct, 'large')}
                    </div>
                </div>
                
                <div class="flex justify-center pt-4">
                    <button 
                        type="button" 
                        id="closePreviewBtn"
                        class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Fechar Preview
                    </button>
                </div>
            </div>
        `;
        
        this.view.showModal('Preview do Produto', previewHtml, true);
        
        // Handle close
        document.getElementById('closePreviewBtn').addEventListener('click', () => {
            this.view.closeModal(true); // Close only nested modal
        });
    }

    createProductCardPreview(product, size = 'small') {
        const formatPrice = (price) => {
            return `R$ ${price.toFixed(2).replace('.', ',')}`;
        };
        
        const getDiscountPercentage = (originalPrice, currentPrice) => {
            return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        };

        // Get available tags for preview
        const renderPreviewTags = (tagIds = []) => {
            if (!tagIds || tagIds.length === 0) return '';
            
            const availableTags = this.database.getProductTags() || [
                { id: "destaque", name: "Destaque", color: "#f59e0b", icon: "⭐" },
                { id: "mais-vendido", name: "Mais Vendido", color: "#ef4444", icon: "🔥" },
                { id: "especial-chef", name: "Especial do Chef", color: "#8b5cf6", icon: "👨‍🍳" },
                { id: "novo", name: "Novo", color: "#10b981", icon: "✨" },
                { id: "promocao", name: "Promoção", color: "#f97316", icon: "💰" }
            ];
            
            return tagIds.slice(0, 2).map(tagId => {
                const tag = availableTags.find(t => t.id === tagId);
                if (!tag) return '';
                return `<span class="inline-flex items-center text-xs px-2 py-1 rounded-md font-medium text-white" 
                          style="background-color: ${tag.color};">
                          ${tag.icon} ${tag.name}
                        </span>`;
            }).join(' ');
        };
        
        if (size === 'small') {
            // Card Mobile Horizontal (exatamente como no site)
            return `
                <div class="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                    <!-- Layout Mobile Horizontal -->
                    <div class="flex items-center p-4 gap-4">
                        <!-- Conteúdo à esquerda -->
                        <div class="flex-1 min-w-0">
                            <!-- Tags do produto -->
                            ${renderPreviewTags(product.tags)}
                            <h3 class="font-semibold text-base leading-tight mb-2 ${product.tags && product.tags.length > 0 ? 'mt-2' : ''}">${product.name}</h3>
                            ${product.description ? 
                                `<p class="text-xs text-gray-600 leading-relaxed mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${product.description}</p>` : 
                                ''
                            }
                            <!-- Preços com promoção (mobile) -->
                            <div class="flex items-center gap-2">
                                <span class="text-orange-600 font-bold text-lg">${formatPrice(product.price)}</span>
                                ${product.isOnSale && product.originalPrice ? `
                                    <span class="text-sm text-gray-400 line-through">${formatPrice(product.originalPrice)}</span>
                                    <span class="text-xs bg-green-600 text-white px-2 py-1 rounded-md font-bold">-${getDiscountPercentage(product.originalPrice, product.price)}%</span>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Imagem à direita -->
                        <div class="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                            ${product.image ? 
                                `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">` :
                                `<div class="w-full h-full flex items-center justify-center">
                                    <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>`
                            }
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Modal expandido (exatamente como no site)
            return `
                <div class="bg-white rounded-t-3xl w-full max-w-md mx-auto shadow-2xl">
                    <!-- Botão fechar (círculo com seta para baixo) -->
                    <div class="relative">
                        <button class="absolute top-4 left-4 w-10 h-10 bg-black bg-opacity-40 text-white rounded-full flex items-center justify-center z-20">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                            </svg>
                        </button>
                        
                        <!-- Imagem grande -->
                        <div class="w-full h-64 bg-gray-100">
                            ${product.image ? 
                                `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">` :
                                `<div class="w-full h-full flex items-center justify-center">
                                    <svg class="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>`
                            }
                        </div>
                    </div>
                    
                    <!-- Conteúdo -->
                    <div class="p-6">
                        <!-- Tags do produto -->
                        ${renderPreviewTags(product.tags) ? 
                            `<div class="mb-3">${renderPreviewTags(product.tags)}</div>` : 
                            ''
                        }
                        
                        <!-- Nome do produto -->
                        <h2 class="text-2xl font-bold text-gray-900 mb-3">${product.name}</h2>
                        
                        <!-- Descrição -->
                        ${product.description ? 
                            `<p class="text-gray-600 text-base leading-relaxed mb-4">${product.description}</p>` : 
                            ''
                        }
                        
                        <!-- Preço -->
                        <div class="mb-6">
                            ${product.isOnSale && product.originalPrice ? `
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="text-gray-400 line-through text-lg">${formatPrice(product.originalPrice)}</span>
                                    <span class="text-xs bg-green-600 text-white px-2 py-1 rounded-md font-bold">-${getDiscountPercentage(product.originalPrice, product.price)}%</span>
                                </div>
                                <div class="text-3xl font-bold text-green-600">${formatPrice(product.price)}</div>
                            ` : `
                                <div class="text-3xl font-bold text-gray-900">${formatPrice(product.price)}</div>
                            `}
                        </div>
                        
                        <!-- Botão (simulado, não funcional) -->
                        <button class="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold" disabled style="cursor: default;">
                            Adicionar ao Pedido
                        </button>
                    </div>
                </div>
            `;
        }
    }

    showImageUploadOverlay() {
        // Create dark overlay with highlight on image upload section
        const overlay = document.createElement('div');
        overlay.id = 'imageUploadOverlay';
        overlay.className = 'fixed inset-0 z-50 flex items-center justify-center';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        
        const messageContainer = document.createElement('div');
        messageContainer.className = 'bg-white rounded-lg p-6 mx-4 max-w-md text-center shadow-2xl';
        messageContainer.innerHTML = `
            <div class="mb-4">
                <svg class="w-12 h-12 text-orange-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Adicionar Imagem</h3>
                <p class="text-sm text-gray-600">Escolha uma das opções abaixo para adicionar uma imagem ao produto:</p>
            </div>
            
            <div class="space-y-3">
                <button id="overlayGalleryBtn" class="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Escolher da Galeria
                </button>
                
                <button id="overlayUploadBtn" class="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    Enviar Arquivo
                </button>
                
                <button id="overlayCloseBtn" class="w-full px-4 py-2 text-gray-500 hover:text-gray-700 text-sm">
                    Cancelar
                </button>
            </div>
        `;
        
        overlay.appendChild(messageContainer);
        document.body.appendChild(overlay);
        
        // Add highlight to image upload section
        const imageUploadSection = document.getElementById('imageUploadSection');
        if (imageUploadSection) {
            imageUploadSection.style.position = 'relative';
            imageUploadSection.style.zIndex = '51';
            imageUploadSection.style.backgroundColor = 'white';
            imageUploadSection.style.padding = '1rem';
            imageUploadSection.style.borderRadius = '0.5rem';
            imageUploadSection.style.boxShadow = '0 0 0 4px rgba(251, 146, 60, 0.5)';
        }
        
        // Handle gallery button
        document.getElementById('overlayGalleryBtn').addEventListener('click', () => {
            this.closeImageUploadOverlay();
            this.showGallerySelector();
        });
        
        // Handle upload button
        document.getElementById('overlayUploadBtn').addEventListener('click', () => {
            this.closeImageUploadOverlay();
            document.getElementById('productImage').click();
        });
        
        // Handle close
        document.getElementById('overlayCloseBtn').addEventListener('click', () => {
            this.closeImageUploadOverlay();
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeImageUploadOverlay();
            }
        });
    }

    closeImageUploadOverlay() {
        const overlay = document.getElementById('imageUploadOverlay');
        const imageUploadSection = document.getElementById('imageUploadSection');
        
        if (overlay) {
            overlay.remove();
        }
        
        if (imageUploadSection) {
            imageUploadSection.style.position = '';
            imageUploadSection.style.zIndex = '';
            imageUploadSection.style.backgroundColor = '';
            imageUploadSection.style.padding = '';
            imageUploadSection.style.borderRadius = '';
            imageUploadSection.style.boxShadow = '';
        }
    }

    showGallerySelector() {
        console.log('showGallerySelector chamado!');
        const images = this.database.getGalleryImages();
        console.log('Imagens encontradas na galeria:', images.length);
        
        if (images.length === 0) {
            alert('Nenhuma imagem na galeria. Adicione imagens primeiro na seção Galeria.');
            return;
        }
        
        const galleryHtml = `
            <div class="space-y-4">
                <div>
                    <input 
                        type="text" 
                        id="gallerySelectorSearch" 
                        placeholder="Buscar imagens..." 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div id="gallerySelectorGrid" class="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    ${images.map(image => `
                        <div class="gallery-selector-item relative cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-300 rounded-lg overflow-hidden" data-image-id="${image.id}">
                            <img src="${image.url}" alt="${image.name}" class="w-full h-24 object-cover">
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                                <p class="text-white text-xs truncate">${image.name}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelGallerySelection"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        console.log('Criando modal da galeria...');
        this.view.showModal('Selecionar da Galeria', galleryHtml, true);
        console.log('Modal da galeria criado!');
        
        // Handle image selection
        document.querySelectorAll('.gallery-selector-item').forEach(item => {
            item.addEventListener('click', () => {
                console.log('Clique na imagem detectado!');
                
                // Add visual feedback immediately
                document.querySelectorAll('.gallery-selector-item').forEach(el => {
                    el.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-100');
                });
                item.classList.add('ring-2', 'ring-orange-500', 'bg-orange-100');
                
                const imageId = item.dataset.imageId;
                console.log('Image ID:', imageId);
                const image = this.database.getGalleryImageById(imageId);
                console.log('Imagem encontrada:', image);
                
                if (image) {
                    // Small delay to show selection feedback
                    setTimeout(() => {
                        this.selectImageFromGallery(image);
                        this.view.closeModal(true); // Close only nested modal
                        // Show success notification
                        this.view.showNotification(`Imagem "${image.name}" selecionada!`, 'success');
                    }, 300);
                } else {
                    console.error('Imagem não encontrada no database!');
                    this.view.showNotification('Erro ao selecionar imagem!', 'error');
                }
            });
        });
        
        // Handle search
        document.getElementById('gallerySelectorSearch').addEventListener('input', (e) => {
            this.filterGallerySelectorImages(e.target.value);
        });
        
        // Handle cancel
        document.getElementById('cancelGallerySelection').addEventListener('click', () => {
            this.view.closeModal(true); // Close only nested modal
        });
    }

    selectImageFromGallery(image) {
        console.log('selectImageFromGallery chamado com:', image);
        
        const selectedGalleryImageId = document.getElementById('selectedGalleryImageId');
        const previewImage = document.getElementById('previewImage');
        const selectedImageName = document.getElementById('selectedImageName');
        const selectedImagePreview = document.getElementById('selectedImagePreview');
        const productImage = document.getElementById('productImage');
        
        console.log('Elementos encontrados:', {
            selectedGalleryImageId: !!selectedGalleryImageId,
            previewImage: !!previewImage,
            selectedImageName: !!selectedImageName,
            selectedImagePreview: !!selectedImagePreview,
            productImage: !!productImage
        });
        
        if (!selectedGalleryImageId) {
            console.error('selectedGalleryImageId não encontrado!');
            return;
        }
        
        selectedGalleryImageId.value = image.id;
        
        // Clear file input
        if (productImage) {
            productImage.value = '';
        }
        
        console.log('Imagem selecionada com sucesso!');
        
        // Update main preview
        this.updateImagePreview(null, image.url);
    }

    updateImagePreview(file = null, imageUrl = null) {
        const container = document.getElementById('imagePreviewContainer');
        
        if (file) {
            // Preview from uploaded file
            const reader = new FileReader();
            reader.onload = function(e) {
                container.innerHTML = `<img src="${e.target.result}" alt="Preview" class="w-full h-full object-cover">`;
            };
            reader.readAsDataURL(file);
        } else if (imageUrl) {
            // Preview from gallery selection
            container.innerHTML = `<img src="${imageUrl}" alt="Preview" class="w-full h-full object-cover">`;
        } else {
            // Reset to placeholder
            container.innerHTML = `
                <div class="text-center">
                    <svg class="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p class="text-xs text-gray-500">Sem imagem</p>
                </div>
            `;
        }
    }

    showDeleteConfirmation(product) {
        const confirmationHtml = `
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Deletar Produto</h3>
                <p class="text-sm text-gray-500 mb-6">
                    Tem certeza que deseja deletar o produto <strong>"${product.name}"</strong>?<br>
                    Esta ação não pode ser desfeita.
                </p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                        id="confirmDeleteBtn"
                        class="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                        Sim, deletar
                    </button>
                    <button 
                        id="cancelDeleteBtn"
                        class="w-full sm:w-auto px-4 py-2 text-sm text-white bg-orange-600 rounded-md hover:bg-orange-700 font-medium"
                    >
                        Não, cancelar
                    </button>
                </div>
            </div>
        `;

        this.view.showModal('Confirmar Exclusão', confirmationHtml, true);

        // Handle confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.database.deleteProduct(product.id);
            this.view.showNotification('Produto excluído com sucesso!');
            this.view.closeModal(); // Close confirmation modal
            this.view.closeModal(); // Close edit modal  
            this.showProducts();
        });

        // Handle cancel
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.view.closeModal(true); // Close only nested modal
        });
    }

    filterGallerySelectorImages(search) {
        const images = this.database.getGalleryImages(search);
        const grid = document.getElementById('gallerySelectorGrid');
        
        grid.innerHTML = images.map(image => `
            <div class="gallery-selector-item relative cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-300 rounded-lg overflow-hidden" data-image-id="${image.id}">
                <img src="${image.url}" alt="${image.name}" class="w-full h-24 object-cover">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                    <p class="text-white text-xs truncate">${image.name}</p>
                </div>
            </div>
        `).join('');
        
        // Re-attach event listeners
        document.querySelectorAll('.gallery-selector-item').forEach(item => {
            item.addEventListener('click', () => {
                // Add visual feedback immediately
                document.querySelectorAll('.gallery-selector-item').forEach(el => {
                    el.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-100');
                });
                item.classList.add('ring-2', 'ring-orange-500', 'bg-orange-100');
                
                const imageId = item.dataset.imageId;
                const image = this.database.getGalleryImageById(imageId);
                
                if (image) {
                    // Small delay to show selection feedback
                    setTimeout(() => {
                        this.selectImageFromGallery(image);
                        this.view.closeModal(true); // Close only nested modal
                        // Show success notification
                        this.view.showNotification(`Imagem "${image.name}" selecionada!`, 'success');
                    }, 300);
                } else {
                    this.view.showNotification('Erro ao selecionar imagem!', 'error');
                }
            });
        });
    }

    async saveProduct(productId = null) {
        const isOnSale = document.getElementById('productIsOnSale').checked;
        const normalPrice = parseFloat(document.getElementById('productPrice').value) || 0;
        const promotionalPrice = parseFloat(document.getElementById('productPromotionalPrice').value) || null;
        
        const productData = {
            name: document.getElementById('productName').value,
            categoryId: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value,
            price: isOnSale ? promotionalPrice : normalPrice, // Preço que será exibido
            active: document.getElementById('productActive').checked,
            featured: document.getElementById('productFeatured').checked,
            isOnSale: isOnSale,
            originalPrice: isOnSale ? normalPrice : null, // Preço original (normal) quando em promoção
            tags: this.getSelectedTags()
        };
        
        // Handle image - Image was already uploaded to Supabase when selected
        const selectedGalleryImageId = document.getElementById('selectedGalleryImageId').value;
        
        if (selectedGalleryImageId) {
            // Use image from gallery (either selected from gallery or uploaded just now)
            const galleryImage = this.database.getGalleryImageById(selectedGalleryImageId);
            if (galleryImage) {
                productData.image = galleryImage.url;
                console.log('📸 Using gallery image for product:', galleryImage.name);
            }
        }
        
        // Note: If no selectedGalleryImageId, product will be saved without image
        // The image upload already happened when file was selected
        
        console.log('🔍 DEBUG - ProductData before save:', productData);
        
        if (productId) {
            await this.database.updateProduct(productId, productData);
            this.view.showNotification('Produto atualizado com sucesso!');
        } else {
            await this.database.addProduct(productData);
            this.view.showNotification('Produto adicionado com sucesso!');
        }
        
        // Force reload data from Supabase to ensure sync
        console.log('🔄 Forcing data reload after product save...');
        await this.database.forceReload();
        
        this.view.closeModal();
        this.showProducts();
    }

    generateAutoTags(productName, categoryName) {
        const tags = [];
        
        // Add category tag
        tags.push(categoryName.toLowerCase());
        
        // Generate tags based on product name
        const productLower = productName.toLowerCase();
        
        // Meat/protein tags
        if (productLower.includes('picanha')) tags.push('picanha', 'carne', 'churrasco');
        if (productLower.includes('filé') || productLower.includes('file')) tags.push('file', 'carne', 'premium');
        if (productLower.includes('frango')) tags.push('frango', 'ave', 'empanado');
        if (productLower.includes('camarão') || productLower.includes('camarao')) tags.push('camarao', 'frutos-do-mar', 'premium');
        if (productLower.includes('calabresa')) tags.push('calabresa', 'linguiça', 'defumado');
        
        // Food type tags
        if (productLower.includes('pão') || productLower.includes('sanduiche')) tags.push('sanduiche', 'lanche');
        if (productLower.includes('executivo')) tags.push('executivo', 'prato-individual', 'completo');
        if (productLower.includes('chapa')) tags.push('chapa', 'grelhado', 'quente');
        if (productLower.includes('empanado')) tags.push('empanado', 'crocante', 'frito');
        if (productLower.includes('queijo')) tags.push('queijo', 'laticinio');
        if (productLower.includes('bebida') || productLower.includes('refrigerante') || productLower.includes('cerveja')) {
            tags.push('bebida', 'gelado', 'refrescante');
        }
        
        // Preparation tags
        if (productLower.includes('grill') || productLower.includes('grelhado')) tags.push('grelhado');
        if (productLower.includes('frito')) tags.push('frito');
        if (productLower.includes('assado')) tags.push('assado');
        
        // Remove duplicates and return
        return [...new Set(tags)];
    }

    showCategories() {
        const categories = this.database.getCategories();
        this.view.showCategories(categories);
        
        // Add category button
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.showCategoryForm();
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = this.database.getCategoryById(btn.dataset.id);
                this.showCategoryForm(category);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showCategoryDeleteConfirmation(btn.dataset.id);
            });
        });
        
        // Setup drag and drop for categories
        this.setupCategoryDragAndDrop();
    }

    showCategoryDeleteConfirmation(categoryId) {
        const category = this.database.getCategoryById(categoryId);
        const products = this.database.getProducts({ categoryId: categoryId });
        
        if (!category) return;
        
        const confirmationHtml = `
            <div class="text-center space-y-4">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Deletar Categoria</h3>
                <p class="text-sm text-gray-600 mb-4">Você está prestes a deletar a categoria:</p>
                
                <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p class="font-semibold text-red-800">"${category.name}"</p>
                </div>
                
                ${products.length > 0 ? `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                            <div class="text-left">
                                <p class="text-sm font-medium text-yellow-800 mb-2">⚠️ Atenção!</p>
                                <p class="text-sm text-yellow-700 mb-2">
                                    Ao deletar esta categoria, <strong>${products.length} produto${products.length > 1 ? 's' : ''}</strong> 
                                    ficar${products.length > 1 ? 'ão' : 'á'} sem categoria e você deverá colocá-l${products.length > 1 ? 'os' : 'o'} 
                                    novamente dentro de uma nova categoria.
                                </p>
                                <div class="text-xs text-yellow-600 space-y-1">
                                    ${products.slice(0, 3).map(p => `<div>• ${p.name}</div>`).join('')}
                                    ${products.length > 3 ? `<div>• ... e mais ${products.length - 3} produto${products.length - 3 > 1 ? 's' : ''}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p class="text-sm text-green-700">✅ Esta categoria não possui produtos. Pode ser deletada com segurança.</p>
                    </div>
                `}
                
                <p class="text-sm text-gray-600 mb-6">Você tem certeza?</p>
                
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                        id="confirmCategoryDeleteBtn" 
                        class="px-6 py-2 text-sm text-white bg-gray-600 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                        data-category-id="${categoryId}"
                    >
                        Sim, deletar
                    </button>
                    <button 
                        id="cancelCategoryDeleteBtn" 
                        class="px-6 py-2 text-sm text-white bg-orange-600 rounded-md hover:bg-orange-700 font-medium transition-colors"
                    >
                        Não, cancelar
                    </button>
                </div>
            </div>
        `;
        
        this.view.showModal('Confirmar Deleção', confirmationHtml);
        
        // Handle confirm deletion
        document.getElementById('confirmCategoryDeleteBtn').addEventListener('click', (e) => {
            const categoryId = e.target.dataset.categoryId;
            this.database.deleteCategory(categoryId);
            this.view.showNotification('Categoria excluída com sucesso!', 'success');
            this.view.closeModal();
            this.showCategories();
        });
        
        // Handle cancel
        document.getElementById('cancelCategoryDeleteBtn').addEventListener('click', () => {
            this.view.closeModal();
        });
    }

    showCategoryForm(category = null) {
        const isEdit = category !== null;
        
        const formHtml = `
            <form id="categoryForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria *</label>
                    <input 
                        type="text" 
                        id="categoryName" 
                        value="${category?.name || ''}"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ordem de Exibicao</label>
                    <input 
                        type="number" 
                        id="categoryOrder" 
                        value="${category?.order || ''}"
                        min="1"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div class="flex items-center">
                    <input 
                        type="checkbox" 
                        id="categoryActive" 
                        ${category?.active !== false ? 'checked' : ''}
                        class="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    >
                    <label for="categoryActive" class="ml-2 text-sm text-gray-700">
                        Categoria ativa
                    </label>
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelBtn"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        ${isEdit ? 'Atualizar' : 'Adicionar'} Categoria
                    </button>
                </div>
            </form>
        `;
        
        this.view.showModal(isEdit ? 'Editar Categoria' : 'Adicionar Categoria', formHtml);
        
        // Handle form submission
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory(category?.id);
        });
        
        // Handle cancel
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.view.closeModal();
        });
    }

    saveCategory(categoryId = null) {
        const categoryData = {
            name: document.getElementById('categoryName').value,
            order: parseInt(document.getElementById('categoryOrder').value) || 999,
            active: document.getElementById('categoryActive').checked
        };
        
        if (categoryId) {
            this.database.updateCategory(categoryId, categoryData);
            this.view.showNotification('Categoria atualizada com sucesso!');
        } else {
            this.database.addCategory(categoryData);
            this.view.showNotification('Categoria adicionada com sucesso!');
        }
        
        this.view.closeModal();
        this.showCategories();
    }

    showSettings() {
        const restaurant = this.database.getRestaurant();
        this.view.showSettings(restaurant);
        
        // Restaurant form
        document.getElementById('restaurantForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRestaurantSettings();
        });
        
        // Export data
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.database.exportData();
            this.view.showNotification('Dados exportados com sucesso!');
        });
        
        // Import data
        document.getElementById('importDataBtn').addEventListener('click', () => {
            const fileInput = document.getElementById('importFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Selecione um arquivo para importar');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    if (this.database.importData(e.target.result)) {
                        this.view.showNotification('Dados importados com sucesso!');
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        this.view.showNotification('Erro ao importar dados', 'error');
                    }
                } catch (error) {
                    this.view.showNotification('Arquivo inválido', 'error');
                }
            };
            reader.readAsText(file);
        });
    }

    async showGallery() {
        console.log('🎨 Showing gallery with progressive loading...');
        
        // Always check if cache is valid (includes cross-browser modification check)
        const cacheValid = this.database.cache.isValid();
        
        if (!cacheValid) {
            console.log('🔄 Cache invalid or modified by another browser - refreshing...');
            await this.database.loadData();
        }
        
        // Show current data
        const images = this.database.getGalleryImages();
        console.log(`📸 Showing ${images.length} gallery images`);
        
        this.view.showGallery(images, false);
        this.selectedImages = new Set();
        this.isSelectionMode = false; // Controla se está em modo seleção
        this.hadSelections = false; // Controla se já teve seleções para evitar auto-exit prematuro
        this.setupGalleryEventListeners();
    }
    
    setupGalleryEventListeners() {
        // Upload multiple images
        const uploadBtn = document.getElementById('uploadImagesBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                this.showImageUploadForm();
            });
        }
        
        // Upload from URL
        const uploadUrlBtn = document.getElementById('uploadFromUrlBtn');
        if (uploadUrlBtn) {
            uploadUrlBtn.addEventListener('click', () => {
                this.showUrlUploadForm();
            });
        }
        
        // Search functionality
        const searchInput = document.getElementById('gallerySearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterGalleryImages(e.target.value);
                }, 300);
            });
        }
        
        // Image selection checkboxes (hidden, only for state)
        document.querySelectorAll('.image-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleImageSelection(e.target.dataset.imageId, e.target.checked);
            });
        });
        
        
        // Gallery image card clicks - só seleciona se já estiver em modo seleção
        document.querySelectorAll('.gallery-image-card').forEach(card => {
            let longPressTimer;
            let startPosition = { x: 0, y: 0 };
            let hasMoved = false;
            let wasLongPress = false;
            let longPressActive = false; // Nova flag para controlar se long press está ativo
            let isCurrentlyPressed = false; // Flag para verificar se ainda está pressionando
            const moveThreshold = 10; // pixels - igual ao iPhone
            
            // Long press para entrar em modo seleção (iPhone-style) - Mouse events
            card.addEventListener('mousedown', (e) => {
                // Long press funciona em qualquer lugar da imagem (inclusive sobre botões)
                startPosition = { x: e.clientX, y: e.clientY };
                hasMoved = false;
                wasLongPress = false;
                longPressActive = true; // Ativa o long press
                isCurrentlyPressed = true; // Marca que está pressionando
                
                longPressTimer = setTimeout(() => {
                    // Só executa se long press ativo, não moveu E ainda está pressionando
                    if (longPressActive && !hasMoved && isCurrentlyPressed) {
                        wasLongPress = true;
                        const imageId = card.dataset.imageId;
                        const checkbox = card.querySelector('.image-checkbox');
                        if (checkbox) {
                            console.log('✅ Long press completado (mouse) - entrando em modo seleção');
                            // Primeiro entra em modo seleção
                            this.enterSelectionMode();
                            // Depois seleciona a imagem
                            checkbox.checked = true;
                            this.toggleImageSelection(imageId, true);
                        }
                    } else {
                        console.log('❌ Long press cancelado (mouse) - não executando, ativo:', longPressActive, 'moveu:', hasMoved, 'pressionando:', isCurrentlyPressed);
                    }
                }, 350); // 350ms mais responsivo como iPhone real
            });
            
            card.addEventListener('mousemove', (e) => {
                if (longPressTimer) {
                    const distance = Math.sqrt(
                        Math.pow(e.clientX - startPosition.x, 2) + 
                        Math.pow(e.clientY - startPosition.y, 2)
                    );
                    
                    if (distance > moveThreshold) {
                        hasMoved = true;
                        longPressActive = false; // Desativa o long press
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                        wasLongPress = false; // Reset flag se cancelou por movimento
                    }
                }
            });
            
            card.addEventListener('mouseup', () => {
                isCurrentlyPressed = false; // Não está mais pressionando
                if (longPressTimer) {
                    longPressActive = false; // Desativa o long press
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                    wasLongPress = false; // Reset flag se cancelou
                }
            });
            
            card.addEventListener('mouseleave', () => {
                isCurrentlyPressed = false; // Não está mais pressionando
                if (longPressTimer) {
                    longPressActive = false; // Desativa o long press
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                    wasLongPress = false; // Reset flag se cancelou
                }
            });
            
            // Long press para mobile - Touch events com detecção de movimento
            card.addEventListener('touchstart', (e) => {
                // Long press funciona em qualquer lugar da imagem (inclusive sobre botões)
                const touch = e.touches[0];
                startPosition = { x: touch.clientX, y: touch.clientY };
                hasMoved = false;
                wasLongPress = false;
                longPressActive = true; // Ativa o long press
                isCurrentlyPressed = true; // Marca que está pressionando
                
                longPressTimer = setTimeout(() => {
                    // Só executa se long press ativo, não moveu E ainda está pressionando
                    if (longPressActive && !hasMoved && isCurrentlyPressed) {
                        wasLongPress = true;
                        const imageId = card.dataset.imageId;
                        const checkbox = card.querySelector('.image-checkbox');
                        if (checkbox) {
                            console.log('✅ Long press completado (mobile) - entrando em modo seleção');
                            // Primeiro entra em modo seleção
                            this.enterSelectionMode();
                            // Depois seleciona a imagem
                            checkbox.checked = true;
                            this.toggleImageSelection(imageId, true);
                        }
                        
                        // Vibração no mobile (se disponível)
                        if (navigator.vibrate) {
                            navigator.vibrate(50);
                        }
                    } else {
                        console.log('❌ Long press cancelado (mobile) - não executando, ativo:', longPressActive, 'moveu:', hasMoved, 'pressionando:', isCurrentlyPressed);
                    }
                }, 350); // 350ms mais responsivo como iPhone real
            });
            
            card.addEventListener('touchmove', (e) => {
                if (longPressTimer) {
                    const touch = e.touches[0];
                    const distance = Math.sqrt(
                        Math.pow(touch.clientX - startPosition.x, 2) + 
                        Math.pow(touch.clientY - startPosition.y, 2)
                    );
                    
                    if (distance > moveThreshold) {
                        hasMoved = true;
                        longPressActive = false; // Desativa o long press
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                        wasLongPress = false; // Reset flag se cancelou por movimento
                    }
                }
            });
            
            card.addEventListener('touchend', () => {
                isCurrentlyPressed = false; // Marca que não está mais pressionando
                if (longPressTimer) {
                    longPressActive = false; // Desativa o long press
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                    wasLongPress = false; // Reset flag se cancelou
                }
            });
            
            card.addEventListener('touchcancel', () => {
                isCurrentlyPressed = false; // Marca que não está mais pressionando
                if (longPressTimer) {
                    longPressActive = false; // Desativa o long press
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                    wasLongPress = false; // Reset flag se cancelou
                }
            });
            
            // Clique normal - só seleciona se já estiver em modo seleção
            card.addEventListener('click', (e) => {
                // Se foi long press, não executa clique normal
                if (wasLongPress) {
                    wasLongPress = false; // Reset para próximo clique
                    return;
                }
                
                // Cancela qualquer timer pendente
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                
                return this.handleNormalClick(e, card);
            });
        });
        
        // Método separado para lidar com clique normal
        this.handleNormalClick = (e, card) => {
            // Don't trigger if clicking on buttons inside the card
            if (e.target.closest('button')) {
                return;
            }
            
            // Só seleciona se já estiver em modo seleção
            if (this.isSelectionMode) {
                const imageId = card.dataset.imageId;
                const checkbox = card.querySelector('.image-checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    this.toggleImageSelection(imageId, checkbox.checked);
                }
            } else {
                // Clique normal - mostra botões no mobile (simulando hover)
                this.showMobileButtons(card);
            }
        };
        
        
        // Select image buttons - entra em modo seleção
        document.querySelectorAll('.select-image-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const imageId = btn.dataset.imageId;
                
                // Entra em modo seleção
                this.enterSelectionMode();
                
                // Seleciona a imagem clicada
                const checkbox = document.querySelector(`input[data-image-id="${imageId}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    this.toggleImageSelection(imageId, true);
                }
            });
        });
        
        // Edit image buttons
        console.log('Configurando botões de editar...'); // Debug
        const editButtons = document.querySelectorAll('.edit-image-btn');
        console.log('Encontrados', editButtons.length, 'botões de editar'); // Debug
        
        editButtons.forEach((btn, index) => {
            console.log(`Configurando botão ${index + 1}:`, btn); // Debug
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                console.log('Botão editar clicado!'); // Debug
                const imageId = btn.dataset.imageId;
                console.log('Image ID:', imageId); // Debug
                const image = this.database.getGalleryImageById(imageId);
                console.log('Imagem encontrada:', image); // Debug
                if (image) {
                    console.log('Abrindo modal de edição...'); // Debug
                    this.showImageEditForm(image);
                } else {
                    console.error('Imagem não encontrada com ID:', imageId);
                }
            });
        });
        
        // Delete image buttons
        document.querySelectorAll('.delete-image-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent event bubbling
                if (confirm('Tem certeza que deseja excluir esta imagem?')) {
                    try {
                        const imageId = btn.dataset.imageId;
                        const imageCard = btn.closest('.gallery-image-card');
                        
                        console.log('🗑️ Deletando imagem:', imageId);
                        
                        // Immediate visual feedback
                        if (imageCard) {
                            imageCard.style.opacity = '0.5';
                            imageCard.style.pointerEvents = 'none';
                            imageCard.style.transform = 'scale(0.95)';
                            imageCard.style.transition = 'all 0.3s ease';
                            
                            // Add deleting indicator
                            const overlay = document.createElement('div');
                            overlay.className = 'delete-overlay absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center text-white font-semibold z-50 rounded';
                            overlay.innerHTML = `
                                <div class="text-center">
                                    <svg class="animate-spin mx-auto mb-2 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <div class="text-xs">Excluindo...</div>
                                </div>
                            `;
                            imageCard.appendChild(overlay);
                        }
                        
                        // Perform actual delete in background
                        await this.database.deleteGalleryImage(imageId);
                        
                        // Smooth removal animation
                        if (imageCard) {
                            imageCard.style.transform = 'scale(0)';
                            imageCard.style.opacity = '0';
                            
                            setTimeout(() => {
                                imageCard.remove();
                                this.view.showNotification('Imagem excluída com sucesso!', 'success');
                                
                                // Update counters
                                const remainingImages = document.querySelectorAll('.gallery-image-card').length;
                                const counterElement = document.querySelector('.text-sm.text-gray-500');
                                if (counterElement) {
                                    counterElement.textContent = `${remainingImages} ${remainingImages === 1 ? 'imagem' : 'imagens'}`;
                                }
                            }, 300);
                        }
                        
                        console.log('✅ Delete completo');
                        
                    } catch (error) {
                        console.error('❌ Erro ao deletar imagem:', error);
                        this.view.showNotification('Erro ao excluir imagem', 'error');
                    }
                }
            });
        });
    }
    
    toggleImageSelection(imageId, isSelected) {
        const card = document.querySelector(`[data-image-id="${imageId}"]`);
        const overlay = card.querySelector('.selection-overlay');
        const indicator = card.querySelector('.selected-indicator');
        
        const checkbox = card.querySelector('.selection-checkbox');
        const checkboxCircle = checkbox.querySelector('div');
        
        if (isSelected) {
            this.selectedImages.add(imageId);
            // Apply orange selection visual effects
            overlay.classList.add('bg-opacity-20');
            overlay.classList.add('bg-orange-500');
            checkboxCircle.classList.remove('bg-white', 'border-white');
            checkboxCircle.classList.add('bg-orange-500', 'border-orange-500');
            indicator.classList.remove('opacity-0', 'scale-0');
            indicator.classList.add('opacity-100', 'scale-100');
            card.classList.add('ring-2', 'ring-orange-500');
        } else {
            this.selectedImages.delete(imageId);
            // Remove orange selection visual effects
            overlay.classList.remove('bg-opacity-20', 'bg-orange-500');
            checkboxCircle.classList.remove('bg-orange-500', 'border-orange-500');
            checkboxCircle.classList.add('bg-white', 'border-white');
            indicator.classList.add('opacity-0', 'scale-0');
            indicator.classList.remove('opacity-100', 'scale-100');
            card.classList.remove('ring-2', 'ring-orange-500');
        }
        
        this.updateSelectionCounter();
        this.updateNonSelectedImagesVisual();
        
        // Mostra menu contextual quando há imagens selecionadas
        if (this.selectedImages.size > 0) {
            // Pequeno delay para mostrar o menu após a seleção
            setTimeout(() => {
                this.showSelectionContextMenu();
            }, 200);
        }
    }
    
    updateSelectionCounter() {
        const selectedCount = this.selectedImages.size;
        
        // Só faz auto-exit se o usuário realmente desmarcou todas as seleções
        // Evita auto-exit imediato quando entra no modo através de long press
        if (this.isSelectionMode && selectedCount === 0 && this.hadSelections) {
            // Evita auto-exit se acabou de entrar no modo seleção (debounce)
            if (this.lastSelectionModeEntry && (Date.now() - this.lastSelectionModeEntry) < 350) {
                console.log('⏸️ Auto-exit cancelado - acabou de entrar no modo seleção');
                return;
            }
            
            // Delay para evitar conflito com toggleImageSelection
            setTimeout(() => {
                if (this.selectedImages.size === 0 && this.isSelectionMode && this.hadSelections) {
                    console.log('🚪 Saindo do modo seleção automaticamente - usuário desmarcou todas');
                    this.exitSelectionMode();
                }
            }, 100); // Delay menor mas suficiente
            return;
        }
        
        // Marca que já teve seleções para controlar o auto-exit
        if (selectedCount > 0) {
            this.hadSelections = true;
        }
        
        if (this.isSelectionMode || selectedCount > 0) {
            // Mostrar todas as checkboxes quando em modo seleção
            document.querySelectorAll('.selection-checkbox').forEach(checkbox => {
                checkbox.classList.remove('opacity-0');
                checkbox.classList.add('opacity-100');
            });
            
            // Esconder botões de hover quando em modo seleção  
            document.querySelectorAll('.action-buttons').forEach(btnGroup => {
                btnGroup.classList.add('hidden');
            });
            
        } else {
            // Esconder todas as checkboxes quando não está em modo seleção
            document.querySelectorAll('.selection-checkbox').forEach(checkbox => {
                checkbox.classList.remove('opacity-100');
                checkbox.classList.add('opacity-0');
            });
            
            // Mostrar botões de hover quando não está em modo seleção
            document.querySelectorAll('.action-buttons').forEach(btnGroup => {
                btnGroup.classList.remove('hidden');
            });
        }
    }
    
    updateNonSelectedImagesVisual() {
        const hasSelection = this.selectedImages.size > 0;
        
        document.querySelectorAll('.gallery-image-card').forEach(card => {
            const imageId = card.dataset.imageId;
            const overlay = card.querySelector('.selection-overlay');
            
            if (hasSelection && !this.selectedImages.has(imageId)) {
                // Darken non-selected images
                overlay.classList.add('bg-opacity-40', 'bg-gray-800');
                card.classList.add('opacity-60');
            } else if (!this.selectedImages.has(imageId)) {
                // Remove darkening if no selection
                overlay.classList.remove('bg-opacity-40', 'bg-gray-800');
                card.classList.remove('opacity-60');
            }
        });
    }
    
    selectAllImages() {
        const allImages = document.querySelectorAll('.gallery-image-card');
        const isAllSelected = this.selectedImages.size === allImages.length;
        
        if (isAllSelected) {
            // Deselect all if all are selected
            allImages.forEach(card => {
                const imageId = card.dataset.imageId;
                const checkbox = card.querySelector('.image-checkbox');
                if (checkbox) {
                    checkbox.checked = false;
                    this.toggleImageSelection(imageId, false);
                }
            });
            
        } else {
            // Select all images
            allImages.forEach(card => {
                const imageId = card.dataset.imageId;
                const checkbox = card.querySelector('.image-checkbox');
                if (checkbox && !this.selectedImages.has(imageId)) {
                    checkbox.checked = true;
                    this.toggleImageSelection(imageId, true);
                }
            });
            
        }
    }
    
    enterSelectionMode() {
        this.isSelectionMode = true;
        this.lastSelectionModeEntry = Date.now(); // Marca timestamp de entrada
        console.log('🎯 Entrando em modo seleção');
        
        // Força atualização visual para mostrar checkboxes
        this.updateSelectionCounter();
    }
    
    exitSelectionMode() {
        this.isSelectionMode = false;
        this.selectedImages.clear();
        this.hadSelections = false; // Reset para próxima vez
        console.log('🚪 Saindo do modo seleção');
        
        
        // Limpa todas as seleções visuais
        document.querySelectorAll('.image-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Limpa efeitos visuais de seleção
        document.querySelectorAll('.gallery-image-card').forEach(card => {
            const overlay = card.querySelector('.selection-overlay');
            const checkboxCircle = card.querySelector('.selection-checkbox div');
            const indicator = card.querySelector('.selected-indicator');
            
            if (overlay) overlay.classList.remove('bg-opacity-20', 'bg-orange-500');
            if (checkboxCircle) {
                checkboxCircle.classList.remove('bg-orange-500', 'border-orange-500');
                checkboxCircle.classList.add('bg-white', 'border-white');
            }
            if (indicator) {
                indicator.classList.add('opacity-0', 'scale-0');
                indicator.classList.remove('opacity-100', 'scale-100');
            }
            card.classList.remove('ring-2', 'ring-orange-500');
        });
        
        // Atualiza visual
        this.updateSelectionCounter();
        this.updateNonSelectedImagesVisual();
    }
    
    showMobileButtons(card) {
        // Remove active state de outros cards
        document.querySelectorAll('.gallery-image-card').forEach(c => {
            c.classList.remove('mobile-active');
        });
        
        // Adiciona state ativo para mostrar botões no mobile
        card.classList.add('mobile-active');
        
        // Remove depois de alguns segundos
        setTimeout(() => {
            card.classList.remove('mobile-active');
        }, 3000);
    }
    
    showSelectionContextMenu() {
        // Remove menu anterior se existir
        const existingMenu = document.getElementById('selection-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const selectedCount = this.selectedImages.size;
        if (selectedCount === 0) return;
        
        // Cria menu contextual mais leve com transparência
        const menu = document.createElement('div');
        menu.id = 'selection-context-menu';
        menu.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 border-opacity-50 z-50 p-2 flex gap-2';
        
        // Botão Cancelar (sempre presente)
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'flex items-center gap-2 px-4 py-3 hover:bg-gray-50 hover:bg-opacity-60 rounded-lg transition-all duration-200';
        cancelBtn.innerHTML = `
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span class="text-sm font-medium text-gray-600">Cancelar</span>
        `;
        
        // Botão Selecionar Todas (só aparece se nem todas estão selecionadas)
        const selectAllBtn = document.createElement('button');
        const totalImages = document.querySelectorAll('.gallery-image-card').length;
        const allSelected = selectedCount === totalImages;
        
        if (!allSelected) {
            selectAllBtn.className = 'flex items-center gap-2 px-4 py-3 hover:bg-orange-50 hover:bg-opacity-60 rounded-lg transition-all duration-200';
            selectAllBtn.innerHTML = `
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm font-medium text-orange-600">Selecionar Todas</span>
            `;
        }
        
        // Botão Excluir
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'flex items-center gap-2 px-4 py-3 hover:bg-red-50 hover:bg-opacity-60 rounded-lg transition-all duration-200';
        deleteBtn.innerHTML = `
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            <span class="text-sm font-medium text-red-600">Excluir (${selectedCount})</span>
        `;
        
        // Event listeners
        cancelBtn.addEventListener('click', () => {
            this.exitSelectionMode();
            menu.remove();
        });
        
        if (!allSelected) {
            selectAllBtn.addEventListener('click', () => {
                this.selectAllImages();
                menu.remove();
            });
        }
        
        deleteBtn.addEventListener('click', () => {
            this.deleteSelectedImages();
            menu.remove();
        });
        
        // Adiciona botões ao menu
        menu.appendChild(cancelBtn);
        if (!allSelected) {
            menu.appendChild(selectAllBtn);
        }
        menu.appendChild(deleteBtn);
        
        // Adiciona ao DOM
        document.body.appendChild(menu);
        
        // Remove menu ao clicar fora
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                }
            }, { once: true });
        }, 100);
        
        // Auto-remove após 8 segundos
        setTimeout(() => {
            if (menu.parentNode) {
                menu.remove();
            }
        }, 8000);
    }
    
    shareSelectedImages() {
        // Implementar compartilhamento
        this.view.showNotification(`Compartilhando ${this.selectedImages.size} imagens...`, 'success');
    }
    
    copySelectedImages() {
        // Implementar cópia
        this.view.showNotification(`${this.selectedImages.size} imagens copiadas!`, 'success');
    }
    
    async deleteSelectedImages() {
        if (this.selectedImages.size === 0) return;
        
        const count = this.selectedImages.size;
        const message = count === 1 ? 
            'Tem certeza que deseja excluir esta imagem?' : 
            `Tem certeza que deseja excluir ${count} imagens?`;
            
        if (confirm(message)) {
            // Mostrar feedback visual durante exclusão
            this.showDeletionProgress(count);
            
            let deletedCount = 0;
            
            // Delete all selected images (await each one)
            for (const imageId of this.selectedImages) {
                try {
                    // Adicionar overlay de "excluindo" na imagem específica
                    this.addDeletingOverlay(imageId);
                    
                    await this.database.deleteGalleryImage(imageId);
                    deletedCount++;
                    
                    // Atualizar progresso
                    this.updateDeletionProgress(deletedCount, count);
                    
                } catch (error) {
                    console.error(`❌ Erro ao deletar imagem ${imageId}:`, error);
                }
            }
            
            // Remover overlay de progresso
            this.hideDeletionProgress();
            
            this.view.showNotification(`${deletedCount} imagem(ns) excluída(s) com sucesso!`);
            this.showGallery(); // Refresh gallery
        }
    }
    
    showDeletionProgress(totalCount) {
        // Criar overlay global de progresso de exclusão
        const overlay = document.createElement('div');
        overlay.id = 'deletion-progress-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        overlay.innerHTML = `
            <div class="bg-white rounded-lg p-6 mx-4 max-w-sm text-center shadow-2xl">
                <div class="mb-4">
                    <svg class="w-12 h-12 text-red-600 mx-auto mb-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Excluindo imagens</h3>
                    <p class="text-sm text-gray-600" id="deletion-status">Preparando exclusão...</p>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                    <div id="deletion-progress-bar" class="bg-red-600 h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <p class="text-xs text-gray-500 mt-2" id="deletion-counter">0 de ${totalCount}</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    updateDeletionProgress(deletedCount, totalCount) {
        const statusElement = document.getElementById('deletion-status');
        const progressBar = document.getElementById('deletion-progress-bar');
        const counterElement = document.getElementById('deletion-counter');
        
        if (statusElement) {
            statusElement.textContent = `Excluindo imagem ${deletedCount} de ${totalCount}...`;
        }
        
        if (progressBar) {
            const percentage = (deletedCount / totalCount) * 100;
            progressBar.style.width = `${percentage}%`;
        }
        
        if (counterElement) {
            counterElement.textContent = `${deletedCount} de ${totalCount}`;
        }
    }
    
    hideDeletionProgress() {
        const overlay = document.getElementById('deletion-progress-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    addDeletingOverlay(imageId) {
        const imageCard = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageCard) {
            // Remove overlay existente se houver
            const existingOverlay = imageCard.querySelector('.deleting-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Adicionar overlay de "excluindo"
            const overlay = document.createElement('div');
            overlay.className = 'deleting-overlay absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center text-white font-semibold z-50 rounded';
            overlay.innerHTML = `
                <div class="text-center">
                    <svg class="animate-spin mx-auto mb-2 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div class="text-xs">Excluindo...</div>
                </div>
            `;
            imageCard.appendChild(overlay);
        }
    }
    
    showImageEditForm(image) {
        console.log('showImageEditForm chamado com:', image); // Debug
        const currentTags = image.tags || [];
        const allTags = this.database.getAllTags();
        
        const formHtml = `
            <form id="imageEditForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nome da Imagem</label>
                    <input 
                        type="text" 
                        id="imageName" 
                        value="${image.name || ''}"
                        placeholder="Nome descritivo da imagem"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    
                    <!-- Selected tags -->
                    <div id="selectedTags" class="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 border border-gray-300 rounded-md">
                        ${currentTags.map(tag => `
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                ${tag}
                                <button type="button" class="ml-1 text-orange-600 hover:text-orange-800" onclick="removeTag('${tag}')">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                    </svg>
                                </button>
                            </span>
                        `).join('')}
                    </div>
                    
                    <!-- Tag input with autocomplete -->
                    <div class="relative">
                        <input 
                            type="text" 
                            id="tagInput" 
                            placeholder="Digite para adicionar tags..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        >
                        <div id="tagSuggestions" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg hidden max-h-48 overflow-y-auto">
                            ${allTags.map(tag => `
                                <button type="button" class="tag-suggestion w-full text-left px-3 py-2 hover:bg-orange-50 text-sm" data-tag="${tag}">
                                    ${tag}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <p class="text-xs text-gray-500 mt-1">Clique nas sugestoes ou digite e pressione Enter</p>
                    
                    <!-- Hidden input to store tags -->
                    <input type="hidden" id="imageTags" value="${currentTags.join(',')}">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <img src="${image.url}" alt="${image.name}" class="w-full h-48 object-cover rounded-md border border-gray-300">
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelBtn"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        Salvar Alteracoes
                    </button>
                </div>
            </form>
        `;
        
        this.view.showModal('Editar Imagem', formHtml);
        
        // Setup tag functionality
        this.setupTagSystem();
        
        document.getElementById('imageEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateGalleryImage(image.id);
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.view.closeModal();
        });
    }
    
    setupTagSystem() {
        const tagInput = document.getElementById('tagInput');
        const tagSuggestions = document.getElementById('tagSuggestions');
        const selectedTags = document.getElementById('selectedTags');
        const imageTagsInput = document.getElementById('imageTags');
        
        // Show suggestions on focus
        tagInput.addEventListener('focus', () => {
            tagSuggestions.classList.remove('hidden');
        });
        
        // Hide suggestions on blur (with delay for click)
        tagInput.addEventListener('blur', () => {
            setTimeout(() => {
                tagSuggestions.classList.add('hidden');
            }, 200);
        });
        
        // Filter suggestions as user types
        tagInput.addEventListener('input', (e) => {
            const filter = e.target.value.toLowerCase();
            const suggestions = tagSuggestions.querySelectorAll('.tag-suggestion');
            
            suggestions.forEach(suggestion => {
                const tag = suggestion.dataset.tag;
                if (tag.includes(filter)) {
                    suggestion.style.display = 'block';
                } else {
                    suggestion.style.display = 'none';
                }
            });
            
            if (filter) {
                tagSuggestions.classList.remove('hidden');
            }
        });
        
        // Add tag on Enter
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = tagInput.value.trim().toLowerCase();
                if (tag) {
                    this.addTag(tag);
                    tagInput.value = '';
                }
            }
        });
        
        // Handle suggestion clicks
        document.querySelectorAll('.tag-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addTag(btn.dataset.tag);
                tagInput.value = '';
            });
        });
        
        // Make removeTag function global for onclick
        window.removeTag = (tag) => {
            this.removeTag(tag);
        };
    }
    
    addTag(tag) {
        const selectedTags = document.getElementById('selectedTags');
        const imageTagsInput = document.getElementById('imageTags');
        
        // Get current tags
        let tags = imageTagsInput.value ? imageTagsInput.value.split(',') : [];
        
        // Add if not already present
        if (!tags.includes(tag)) {
            tags.push(tag);
            imageTagsInput.value = tags.join(',');
            
            // Add visual tag
            const tagElement = document.createElement('span');
            tagElement.className = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800';
            tagElement.innerHTML = `
                ${tag}
                <button type="button" class="ml-1 text-orange-600 hover:text-orange-800" onclick="removeTag('${tag}')">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            `;
            selectedTags.appendChild(tagElement);
        }
    }
    
    removeTag(tag) {
        const selectedTags = document.getElementById('selectedTags');
        const imageTagsInput = document.getElementById('imageTags');
        
        // Update hidden input
        let tags = imageTagsInput.value.split(',').filter(t => t !== tag);
        imageTagsInput.value = tags.join(',');
        
        // Remove visual element
        const tagElements = selectedTags.querySelectorAll('span');
        tagElements.forEach(el => {
            if (el.textContent.trim().startsWith(tag)) {
                el.remove();
            }
        });
    }
    
    updateGalleryImage(imageId) {
        const name = document.getElementById('imageName').value;
        const tagsInput = document.getElementById('imageTags').value;
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        this.database.updateGalleryImage(imageId, { name, tags });
        this.view.showNotification('Imagem atualizada com sucesso!');
        this.view.closeModal();
        this.showGallery();
    }

    showImageUploadForm() {
        const formHtml = `
            <form id="imageUploadForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Selecionar Imagens</label>
                    <input 
                        type="file" 
                        id="imageFiles" 
                        multiple
                        accept="image/*"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                    <p class="text-xs text-gray-500 mt-1">Pode selecionar múltiplas imagens (máx 5MB cada)</p>
                </div>
                
                <!-- Preview area for selected images -->
                <div id="imagePreviewArea" class="hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Imagens Selecionadas</label>
                    <div id="imagePreviewList" class="grid grid-cols-4 gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md max-h-32 overflow-y-auto">
                        <!-- Preview thumbnails will be added here -->
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Clique no ✕ para remover uma imagem</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tags (opcional)</label>
                    <input 
                        type="text" 
                        id="imageTags" 
                        placeholder="comida, bebida, sobremesa (separado por vírgula)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelBtn"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        id="uploadSubmitBtn"
                        class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled
                    >
                        Upload Imagens
                    </button>
                </div>
            </form>
        `;
        
        this.view.showModal('Upload de Imagens', formHtml);
        
        // Initialize selected files storage
        this.selectedFiles = [];
        
        // Handle file selection
        document.getElementById('imageFiles').addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });
        
        document.getElementById('imageUploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.uploadImages();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.clearSelectedFiles();
            this.view.closeModal();
        });
    }
    
    handleFileSelection(files) {
        // Add new files to selected files array
        Array.from(files).forEach(file => {
            // Check file size
            if (file.size > 5000000) {
                alert(`Imagem ${file.name} muito grande! Máximo 5MB.`);
                return;
            }
            
            // Check if file already selected
            const alreadySelected = this.selectedFiles.some(f => 
                f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
            );
            
            if (!alreadySelected) {
                this.selectedFiles.push(file);
            }
        });
        
        this.updateUploadImagePreview();
    }
    
    updateUploadImagePreview() {
        const previewArea = document.getElementById('imagePreviewArea');
        const previewList = document.getElementById('imagePreviewList');
        const submitBtn = document.getElementById('uploadSubmitBtn');
        
        if (this.selectedFiles.length === 0) {
            previewArea.classList.add('hidden');
            submitBtn.disabled = true;
            return;
        }
        
        previewArea.classList.remove('hidden');
        submitBtn.disabled = false;
        
        // Clear existing previews
        previewList.innerHTML = '';
        
        // Create preview for each file
        this.selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'relative group';
                previewItem.innerHTML = `
                    <div class="aspect-square bg-gray-100 rounded border overflow-hidden">
                        <img src="${e.target.result}" alt="${file.name}" class="w-full h-full object-cover">
                    </div>
                    <button 
                        type="button" 
                        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 flex items-center justify-center"
                        data-file-index="${index}"
                        title="Remover ${file.name}"
                    >
                        ✕
                    </button>
                    <p class="text-xs text-gray-600 mt-1 truncate" title="${file.name}">${file.name}</p>
                `;
                
                // Add remove functionality
                const removeBtn = previewItem.querySelector('button');
                removeBtn.addEventListener('click', () => {
                    this.removeSelectedFile(index);
                });
                
                previewList.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    }
    
    removeSelectedFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateUploadImagePreview();
        
        // Update file input to reflect removed files
        this.updateFileInput();
    }
    
    updateFileInput() {
        const fileInput = document.getElementById('imageFiles');
        if (this.selectedFiles.length === 0) {
            fileInput.value = '';
        }
    }
    
    clearSelectedFiles() {
        this.selectedFiles = [];
        this.updateUploadImagePreview();
        this.updateFileInput();
    }

    showUrlUploadForm() {
        const formHtml = `
            <form id="urlUploadForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                    <input 
                        type="url" 
                        id="imageUrl" 
                        placeholder="https://exemplo.com/imagem.jpg"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nome da Imagem</label>
                    <input 
                        type="text" 
                        id="imageName" 
                        placeholder="Nome descritivo da imagem"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tags (opcional)</label>
                    <input 
                        type="text" 
                        id="imageTags" 
                        placeholder="comida, bebida, sobremesa (separado por vírgula)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelBtn"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        Adicionar Imagem
                    </button>
                </div>
            </form>
        `;
        
        this.view.showModal('Adicionar Imagem por URL', formHtml);
        
        document.getElementById('urlUploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadFromUrl();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.view.closeModal();
        });
    }

    async uploadImages() {
        const files = this.selectedFiles; // Use selected files from preview
        const tags = document.getElementById('imageTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (!files.length) {
            alert('Selecione pelo menos uma imagem');
            return;
        }
        
        const uploadPromises = [];
        const previewCards = [];
        
        for (let file of files) {
            if (file.size > 5000000) {
                alert(`Imagem ${file.name} muito grande! Máximo 5MB.`);
                continue;
            }
            
            // Create immediate preview card
            const tempId = 'temp_' + Date.now() + '_' + Math.random();
            const previewCard = this.createUploadPreviewCard(file, tempId);
            previewCards.push({card: previewCard, file: file, tempId: tempId});
            
            // Add to gallery grid immediately
            const galleryGrid = document.getElementById('galleryGrid');
            if (galleryGrid) {
                galleryGrid.insertAdjacentHTML('afterbegin', previewCard);
            }
            
            // Start upload in background
            const uploadPromise = this.processImageUpload(file, tags, tempId);
            uploadPromises.push(uploadPromise);
        }
        
        // Wait for all uploads to complete
        try {
            await Promise.all(uploadPromises);
            this.view.showNotification('Todas as imagens foram adicionadas!', 'success');
        } catch (error) {
            console.error('❌ Alguns uploads falharam:', error);
        }
        
        this.view.closeModal();
    }
    
    createUploadPreviewCard(file, tempId) {
        // Create file URL for immediate preview
        const objectURL = URL.createObjectURL(file);
        
        return `
            <div class="gallery-image-card upload-preview relative group bg-gray-100 rounded-lg overflow-hidden aspect-square" data-temp-id="${tempId}">
                <!-- Upload progress overlay -->
                <div class="upload-overlay absolute inset-0 bg-blue-500 bg-opacity-75 flex items-center justify-center text-white font-semibold z-50 rounded">
                    <div class="text-center">
                        <svg class="animate-spin mx-auto mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div class="text-sm">Enviando...</div>
                        <div class="text-xs opacity-75 mt-1">${file.name}</div>
                    </div>
                </div>
                
                <img src="${objectURL}" alt="Upload preview" class="w-full h-full object-cover">
            </div>
        `;
    }
    
    async processImageUpload(file, tags, tempId) {
        try {
            const imageData = await this.database.saveImage(file);
            const result = await this.database.addGalleryImage({
                name: file.name,
                url: imageData.url,
                size: file.size,
                type: file.type,
                tags: tags
            });
            
            // Replace preview card with real gallery card
            const previewCard = document.querySelector(`[data-temp-id="${tempId}"]`);
            if (previewCard && result) {
                // Create real gallery card
                const realCard = this.view.createGalleryImageCard({
                    id: result.id,
                    name: result.name,
                    url: result.url,
                    size: result.size,
                    type: result.type
                });
                
                // Replace with animation
                previewCard.style.transform = 'scale(0.9)';
                previewCard.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    previewCard.outerHTML = realCard;
                    // Re-attach event listeners for new card
                    this.setupGalleryEventListeners();
                }, 300);
            }
            
            console.log('✅ Upload completo:', file.name);
            return result;
            
        } catch (error) {
            console.error('❌ Upload falhou:', file.name, error);
            
            // Show error on preview card
            const previewCard = document.querySelector(`[data-temp-id="${tempId}"]`);
            if (previewCard) {
                const overlay = previewCard.querySelector('.upload-overlay');
                if (overlay) {
                    overlay.className = 'upload-overlay absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center text-white font-semibold z-50 rounded';
                    overlay.innerHTML = `
                        <div class="text-center">
                            <svg class="mx-auto mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            <div class="text-sm">Erro</div>
                            <div class="text-xs opacity-75">${error.message}</div>
                        </div>
                    `;
                }
                
                // Remove failed card after delay
                setTimeout(() => {
                    previewCard.style.transform = 'scale(0)';
                    previewCard.style.opacity = '0';
                    setTimeout(() => previewCard.remove(), 300);
                }, 2000);
            }
            
            throw error;
        }
    }

    async uploadFromUrl() {
        const url = document.getElementById('imageUrl').value;
        const name = document.getElementById('imageName').value || 'Imagem da URL';
        const tags = document.getElementById('imageTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        try {
            await this.database.addGalleryImage({
                name: name,
                url: url,
                size: 0,
                type: 'image/jpeg',
                tags: tags
            });
            
            this.view.showNotification('Imagem adicionada com sucesso!');
            console.log('✅ Imagem URL adicionada:', name);
        } catch (error) {
            console.error('❌ Erro ao adicionar imagem URL:', error);
            this.view.showNotification(`Erro ao adicionar imagem: ${error.message}`, 'error');
        }
        this.view.closeModal();
        await this.showGallery(); // Force refresh gallery
    }

    filterGalleryImages(search) {
        const images = this.database.getGalleryImages(search);
        const grid = document.getElementById('galleryGrid');
        
        if (grid) {
            grid.innerHTML = images.map(image => this.view.createGalleryImageCard(image)).join('');
            
            // Re-attach all event listeners
            
            // Image selection checkboxes (hidden, only for state)
            document.querySelectorAll('.image-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.toggleImageSelection(e.target.dataset.imageId, e.target.checked);
                });
            });
            
            
            // Edit buttons
            document.querySelectorAll('.edit-image-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    const imageId = btn.dataset.imageId;
                    const image = this.database.getGalleryImageById(imageId);
                    if (image) {
                        this.showImageEditForm(image);
                    }
                });
            });
            
            // Delete buttons
            document.querySelectorAll('.delete-image-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    if (confirm('Tem certeza que deseja excluir esta imagem?')) {
                        this.database.deleteGalleryImage(btn.dataset.imageId);
                        this.view.showNotification('Imagem excluída com sucesso!');
                        this.showGallery();
                    }
                });
            });
        }
    }

    saveRestaurantSettings() {
        const restaurantData = {
            name: document.getElementById('restaurantName').value,
            logo: document.getElementById('restaurantLogo').value,
            banner: document.getElementById('restaurantBanner').value
        };
        
        this.database.updateRestaurant(restaurantData);
        this.view.showNotification('Configurações salvas com sucesso!');
    }

    setupDragAndDrop() {
        // Variáveis para controlar o drag
        let isDragging = false;
        let draggedElement = null;
        let startY = 0;
        let startX = 0;
        let placeholder = null;
        
        // Função para criar placeholder
        const createPlaceholder = () => {
            const placeholder = document.createElement('tr');
            placeholder.className = 'drag-placeholder';
            placeholder.innerHTML = `
                <td colspan="6" class="py-2 px-4">
                    <div class="border-2 border-dashed border-orange-400 bg-orange-50 rounded-lg p-2 text-center text-orange-600 text-sm">
                        ↕ Solte aqui para reordenar
                    </div>
                </td>
            `;
            return placeholder;
        };
        
        // Função para encontrar a linha mais próxima
        const findClosestRow = (y) => {
            const rows = document.querySelectorAll('.product-row:not(.dragging)');
            let closest = null;
            let closestDistance = Infinity;
            
            rows.forEach(row => {
                const rect = row.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closest = row;
                }
            });
            
            return closest;
        };
        
        // Mouse down no drag handle
        document.addEventListener('mousedown', (e) => {
            const dragHandle = e.target.closest('.drag-handle');
            if (!dragHandle) return;
            
            const row = dragHandle.closest('.product-row');
            if (!row) return;
            
            e.preventDefault();
            
            // Configurar drag após 200ms
            setTimeout(() => {
                if (e.buttons === 1) { // Verifica se ainda está pressionado
                    startDrag(row, e.clientY, e.clientX);
                }
            }, 200);
        });
        
        // Touch support
        document.addEventListener('touchstart', (e) => {
            const dragHandle = e.target.closest('.drag-handle');
            if (!dragHandle) return;
            
            const row = dragHandle.closest('.product-row');
            if (!row) return;
            
            e.preventDefault();
            
            const touch = e.touches[0];
            setTimeout(() => {
                startDrag(row, touch.clientY, touch.clientX);
            }, 200);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging || !draggedElement) return;
            
            e.preventDefault();
            
            const touch = e.touches[0];
            
            // Calcular nova posição baseada no movimento do touch
            const deltaY = touch.clientY - startY;
            const deltaX = touch.clientX - startX;
            
            const rect = draggedElement.getBoundingClientRect();
            const initialTop = parseInt(draggedElement.style.top) || rect.top;
            const initialLeft = parseInt(draggedElement.style.left) || rect.left;
            
            draggedElement.style.top = (initialTop + deltaY) + 'px';
            draggedElement.style.left = (initialLeft + deltaX) + 'px';
            
            startY = touch.clientY;
            startX = touch.clientX;
            
            // Encontrar linha mais próxima
            const closest = findClosestRow(touch.clientY);
            if (closest && closest.dataset.categoryId === draggedElement.dataset.categoryId) {
                const rect = closest.getBoundingClientRect();
                if (touch.clientY < rect.top + rect.height / 2) {
                    closest.parentNode.insertBefore(placeholder, closest);
                } else {
                    closest.parentNode.insertBefore(placeholder, closest.nextSibling);
                }
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (!isDragging || !draggedElement) return;
            finishDrag();
        });
        
        // Função para iniciar o drag
        const startDrag = (row, y, x) => {
            isDragging = true;
            draggedElement = row;
            
            // Pegar posição original da linha
            const rect = row.getBoundingClientRect();
            startY = y;
            startX = x;
            
            // Criar placeholder
            placeholder = createPlaceholder();
            
            // Estilo da linha sendo arrastada
            row.classList.add('dragging');
            row.style.position = 'fixed';
            row.style.top = (rect.top) + 'px';
            row.style.left = (rect.left) + 'px';
            row.style.width = rect.width + 'px';
            row.style.zIndex = '1000';
            row.style.pointerEvents = 'none';
            row.style.transform = 'rotate(2deg)';
            row.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            row.style.backgroundColor = '#fff7ed';
            row.style.border = '2px solid #fb923c';
            
            // Inserir placeholder
            row.parentNode.insertBefore(placeholder, row.nextSibling);
            
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        };
        
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !draggedElement) return;
            
            e.preventDefault();
            
            // Calcular nova posição baseada no movimento do mouse
            const deltaY = e.clientY - startY;
            const deltaX = e.clientX - startX;
            
            // Pegar posição inicial e somar o delta
            const rect = draggedElement.getBoundingClientRect();
            const initialTop = parseInt(draggedElement.style.top) || rect.top;
            const initialLeft = parseInt(draggedElement.style.left) || rect.left;
            
            draggedElement.style.top = (initialTop + deltaY) + 'px';
            draggedElement.style.left = (initialLeft + deltaX) + 'px';
            
            // Atualizar as coordenadas de início para o próximo movimento
            startY = e.clientY;
            startX = e.clientX;
            
            // Encontrar linha mais próxima
            const closest = findClosestRow(e.clientY);
            if (closest && closest.dataset.categoryId === draggedElement.dataset.categoryId) {
                const rect = closest.getBoundingClientRect();
                if (e.clientY < rect.top + rect.height / 2) {
                    closest.parentNode.insertBefore(placeholder, closest);
                } else {
                    closest.parentNode.insertBefore(placeholder, closest.nextSibling);
                }
            }
        });
        
        // Função para finalizar o drag
        const finishDrag = () => {
            if (!isDragging || !draggedElement) return;
            
            isDragging = false;
            
            // Inserir elemento na posição do placeholder
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(draggedElement, placeholder);
                placeholder.remove();
            }
            
            // Resetar estilos
            draggedElement.classList.remove('dragging');
            draggedElement.style.position = '';
            draggedElement.style.zIndex = '';
            draggedElement.style.pointerEvents = '';
            draggedElement.style.transform = '';
            draggedElement.style.boxShadow = '';
            draggedElement.style.backgroundColor = '';
            draggedElement.style.border = '';
            draggedElement.style.top = '';
            draggedElement.style.left = '';
            draggedElement.style.width = '';
            
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            // Salvar nova ordem
            const categoryId = draggedElement.dataset.categoryId;
            const tbody = draggedElement.closest('tbody');
            const categoryRows = Array.from(tbody.querySelectorAll(`[data-category-id="${categoryId}"]`));
            const productIds = categoryRows.map(row => row.dataset.id);
            
            this.database.reorderProducts(categoryId, productIds);
            this.view.showNotification('Ordem atualizada!', 'success');
            
            draggedElement = null;
            placeholder = null;
        };
        
        // Mouse up
        document.addEventListener('mouseup', (e) => {
            if (!isDragging || !draggedElement) return;
            finishDrag();
        });
    }

    setupCategoryDragAndDrop() {
        // Variáveis para controlar o drag
        let isDragging = false;
        let draggedElement = null;
        let startY = 0;
        let startX = 0;
        let placeholder = null;
        
        // Função para criar placeholder
        const createPlaceholder = () => {
            const placeholder = document.createElement('div');
            placeholder.className = 'drag-placeholder p-4 border border-gray-200 rounded-lg';
            placeholder.innerHTML = `
                <div class="border-2 border-dashed border-orange-400 bg-orange-50 rounded-lg p-2 text-center text-orange-600 text-sm">
                    ↕ Solte aqui para reordenar
                </div>
            `;
            return placeholder;
        };
        
        // Função para encontrar a linha mais próxima
        const findClosestRow = (y) => {
            const rows = document.querySelectorAll('.category-row:not(.dragging)');
            let closest = null;
            let closestDistance = Infinity;
            
            rows.forEach(row => {
                const rect = row.getBoundingClientRect();
                const distance = Math.abs(rect.top + rect.height / 2 - y);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closest = row;
                }
            });
            
            return closest;
        };
        
        // Mouse down no drag handle
        document.addEventListener('mousedown', (e) => {
            const dragHandle = e.target.closest('.drag-handle');
            if (!dragHandle) return;
            
            const row = dragHandle.closest('.category-row');
            if (!row) return;
            
            e.preventDefault();
            
            // Configurar drag após 200ms
            setTimeout(() => {
                if (e.buttons === 1) { // Verifica se ainda está pressionado
                    startDrag(row, e.clientY, e.clientX);
                }
            }, 200);
        });
        
        // Touch support
        document.addEventListener('touchstart', (e) => {
            const dragHandle = e.target.closest('.drag-handle');
            if (!dragHandle) return;
            
            const row = dragHandle.closest('.category-row');
            if (!row) return;
            
            e.preventDefault();
            
            const touch = e.touches[0];
            setTimeout(() => {
                startDrag(row, touch.clientY, touch.clientX);
            }, 200);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging || !draggedElement) return;
            
            e.preventDefault();
            
            const touch = e.touches[0];
            
            // Calcular nova posição baseada no movimento do touch
            const deltaY = touch.clientY - startY;
            const deltaX = touch.clientX - startX;
            
            const rect = draggedElement.getBoundingClientRect();
            const initialTop = parseInt(draggedElement.style.top) || rect.top;
            const initialLeft = parseInt(draggedElement.style.left) || rect.left;
            
            draggedElement.style.top = (initialTop + deltaY) + 'px';
            draggedElement.style.left = (initialLeft + deltaX) + 'px';
            
            startY = touch.clientY;
            startX = touch.clientX;
            
            // Encontrar linha mais próxima
            const closest = findClosestRow(touch.clientY);
            if (closest) {
                const rect = closest.getBoundingClientRect();
                if (touch.clientY < rect.top + rect.height / 2) {
                    closest.parentNode.insertBefore(placeholder, closest);
                } else {
                    closest.parentNode.insertBefore(placeholder, closest.nextSibling);
                }
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (!isDragging || !draggedElement) return;
            finishDrag();
        });
        
        // Função para iniciar o drag
        const startDrag = (row, y, x) => {
            isDragging = true;
            draggedElement = row;
            
            // Pegar posição original da linha
            const rect = row.getBoundingClientRect();
            startY = y;
            startX = x;
            
            // Criar placeholder
            placeholder = createPlaceholder();
            
            // Estilo da linha sendo arrastada
            row.classList.add('dragging');
            row.style.position = 'fixed';
            row.style.top = (rect.top) + 'px';
            row.style.left = (rect.left) + 'px';
            row.style.width = rect.width + 'px';
            row.style.zIndex = '1000';
            row.style.pointerEvents = 'none';
            row.style.transform = 'rotate(2deg)';
            row.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            row.style.backgroundColor = '#fff7ed';
            row.style.border = '2px solid #fb923c';
            
            // Inserir placeholder
            row.parentNode.insertBefore(placeholder, row.nextSibling);
            
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        };
        
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !draggedElement) return;
            
            e.preventDefault();
            
            // Calcular nova posição baseada no movimento do mouse
            const deltaY = e.clientY - startY;
            const deltaX = e.clientX - startX;
            
            // Pegar posição inicial e somar o delta
            const rect = draggedElement.getBoundingClientRect();
            const initialTop = parseInt(draggedElement.style.top) || rect.top;
            const initialLeft = parseInt(draggedElement.style.left) || rect.left;
            
            draggedElement.style.top = (initialTop + deltaY) + 'px';
            draggedElement.style.left = (initialLeft + deltaX) + 'px';
            
            // Atualizar as coordenadas de início para o próximo movimento
            startY = e.clientY;
            startX = e.clientX;
            
            // Encontrar linha mais próxima
            const closest = findClosestRow(e.clientY);
            if (closest) {
                const rect = closest.getBoundingClientRect();
                if (e.clientY < rect.top + rect.height / 2) {
                    closest.parentNode.insertBefore(placeholder, closest);
                } else {
                    closest.parentNode.insertBefore(placeholder, closest.nextSibling);
                }
            }
        });
        
        // Função para finalizar o drag
        const finishDrag = () => {
            if (!isDragging || !draggedElement) return;
            
            isDragging = false;
            
            // Inserir elemento na posição do placeholder
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(draggedElement, placeholder);
                placeholder.remove();
            }
            
            // Resetar estilos
            draggedElement.classList.remove('dragging');
            draggedElement.style.position = '';
            draggedElement.style.zIndex = '';
            draggedElement.style.pointerEvents = '';
            draggedElement.style.transform = '';
            draggedElement.style.boxShadow = '';
            draggedElement.style.backgroundColor = '';
            draggedElement.style.border = '';
            draggedElement.style.top = '';
            draggedElement.style.left = '';
            draggedElement.style.width = '';
            
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            // Salvar nova ordem
            const container = draggedElement.closest('.space-y-4');
            const categoryRows = Array.from(container.querySelectorAll('.category-row'));
            const categoryIds = categoryRows.map(row => row.dataset.id);
            
            // Atualizar números dinamicamente
            categoryRows.forEach((row, index) => {
                const orderSpan = row.querySelector('span.text-gray-400');
                if (orderSpan) {
                    orderSpan.textContent = `#${index + 1}`;
                }
            });
            
            this.database.reorderCategories(categoryIds);
            this.view.showNotification('Ordem atualizada!', 'success');
            
            draggedElement = null;
            placeholder = null;
        };
        
        // Mouse up
        document.addEventListener('mouseup', (e) => {
            if (!isDragging || !draggedElement) return;
            finishDrag();
        });
    }

    renderTagsSelector(selectedTags = []) {
        const availableTags = this.database.getProductTags();
        
        // Debug log to see what tags are available
        console.log('🏷️ Available tags for selector:', availableTags);
        
        // If no tags from database, use fallback tags
        const tagsToShow = availableTags.length > 0 ? availableTags : [
            { id: "destaque", name: "Destaque", color: "#f59e0b", icon: "⭐" },
            { id: "mais-vendido", name: "Mais Vendido", color: "#ef4444", icon: "🔥" },
            { id: "especial-chef", name: "Especial do Chef", color: "#8b5cf6", icon: "👨‍🍳" },
            { id: "novo", name: "Novo", color: "#10b981", icon: "✨" },
            { id: "promocao", name: "Promoção", color: "#f97316", icon: "💰" }
        ];
        
        return `
            <div class="space-y-4">
                <!-- Section Header -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <span class="text-sm font-medium text-gray-700">Tags Disponíveis</span>
                        <span class="text-xs text-gray-400">(${selectedTags.length} selecionada${selectedTags.length !== 1 ? 's' : ''})</span>
                    </div>
                </div>

                <!-- Tags Grid - Modern Layout -->
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    ${tagsToShow.map(tag => {
                        const isSelected = selectedTags.includes(tag.id);
                        return `
                            <label class="group relative cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                                <input 
                                    type="checkbox" 
                                    name="productTags" 
                                    value="${tag.id}"
                                    ${isSelected ? 'checked' : ''}
                                    class="hidden tag-checkbox"
                                >
                                <div class="tag-card relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                    isSelected 
                                        ? 'border-transparent shadow-lg transform' 
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }" 
                                style="${isSelected ? `background: linear-gradient(135deg, ${tag.color}ee, ${tag.color});` : 'background: linear-gradient(135deg, #ffffff, #f8fafc);'}"
                                data-color="${tag.color}">
                                    
                                    <!-- Delete Button - Always visible, top left -->
                                    <button 
                                        type="button" 
                                        class="delete-tag-btn absolute top-1 left-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-md"
                                        data-tag-id="${tag.id}"
                                        title="Deletar tag"
                                    >
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                    
                                    <!-- Selection Indicator - Top right -->
                                    <div class="absolute top-1 right-1 w-5 h-5 rounded-full border-2 transition-all duration-200 z-10 ${
                                        isSelected 
                                            ? 'bg-green-600 border-green-600 shadow-lg' 
                                            : 'border-gray-300 bg-white'
                                    }"${isSelected ? '' : ' style="background-color: rgba(255,255,255,0.9);"'}>
                                        ${isSelected ? `
                                            <div class="w-full h-full flex items-center justify-center">
                                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                                </svg>
                                            </div>
                                        ` : ''}
                                    </div>

                                    <!-- Tag Content -->
                                    <div class="p-3 text-center">
                                        <div class="text-2xl mb-1 filter ${isSelected ? 'drop-shadow-sm' : ''}">${tag.icon}</div>
                                        <div class="text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-700'} truncate">${tag.name}</div>
                                    </div>

                                    <!-- Hover Overlay -->
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                                </div>
                            </label>
                        `;
                    }).join('')}
                    
                    <!-- Add Custom Tag Card -->
                    <div class="tag-add-card group cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" id="addCustomTagCard">
                        <div class="h-full rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-3 text-center transition-all duration-300 group-hover:border-orange-400 group-hover:bg-gradient-to-br group-hover:from-orange-50 group-hover:to-orange-100 group-hover:shadow-md">
                            <div class="flex flex-col items-center justify-center h-full space-y-1">
                                <div class="w-8 h-8 rounded-full bg-gray-200 group-hover:bg-orange-200 transition-colors duration-200 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                </div>
                                <span class="text-xs font-medium text-gray-500 group-hover:text-orange-600 transition-colors duration-200">Nova Tag</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Custom Tag Creation Panel -->
                <div id="customTagSection" class="hidden">
                    <div class="bg-gradient-to-r from-orange-50 via-orange-50 to-yellow-50 rounded-2xl border border-orange-200 p-6 shadow-sm">
                        <!-- Header -->
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800">Criar Tag Personalizada</h3>
                                    <p class="text-sm text-gray-600">Defina um nome, emoji e cor para sua nova tag</p>
                                </div>
                            </div>
                            <button type="button" id="cancelCreateTag" class="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <!-- Form Fields -->
                        <div class="space-y-4 mb-6">
                            <!-- Name Field -->
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">
                                    Nome da Tag *
                                </label>
                                <div class="relative">
                                    <input 
                                        type="text" 
                                        id="customTagName" 
                                        placeholder="Ex: Super Especial, Favorito dos Clientes..."
                                        class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                                        maxlength="20"
                                    >
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span class="text-xs text-gray-400" id="nameCounter">0/20</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Icon and Color Row -->
                            <div class="grid grid-cols-2 gap-4">
                                <!-- Icon Field -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium text-gray-700">
                                        Emoji
                                    </label>
                                    <div class="relative">
                                        <input 
                                            type="text" 
                                            id="customTagIcon" 
                                            placeholder="🔥"
                                            maxlength="2"
                                            class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-center text-lg placeholder-gray-400"
                                        >
                                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <button type="button" class="text-xs text-orange-600 hover:text-orange-700 font-medium" onclick="document.getElementById('customTagIcon').value = ['🔥','⭐','✨','👑','💎','🎯','🚀','❤️','🌟','🏆'][Math.floor(Math.random()*10)]">
                                                Aleatório
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Color Field -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium text-gray-700">
                                        Cor
                                    </label>
                                    <div class="relative">
                                        <input 
                                            type="color" 
                                            id="customTagColor" 
                                            value="#6366f1"
                                            class="w-full h-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                                        >
                                        <!-- Color Presets -->
                                        <div class="absolute top-full mt-2 flex space-x-1">
                                            ${['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'].map(color => `
                                                <button type="button" class="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform" 
                                                        style="background-color: ${color}" 
                                                        onclick="document.getElementById('customTagColor').value = '${color}'"></button>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Preview -->
                            <div class="space-y-2 mb-5">
                                <label class="block text-sm font-medium text-gray-700">
                                    Preview
                                </label>
                                <div class="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
                                    <span class="text-sm text-gray-600">Sua tag ficará assim:</span>
                                    <div id="tagPreview" class="px-3 py-1.5 text-sm font-medium rounded-full border-2 border-gray-300 text-gray-700">
                                        🏷️ Nova Tag
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center justify-end space-x-3">
                            <button 
                                type="button" 
                                id="cancelCreateTagAlt"
                                class="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                id="confirmCreateTag"
                                class="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled
                            >
                                <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Criar Tag
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupTagsEvents() {
        // Toggle tag selection with improved visual feedback
        document.querySelectorAll('.tag-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const tagCard = e.target.nextElementSibling;
                const color = tagCard.dataset.color;
                const isSelected = e.target.checked;
                
                // Update card background
                if (isSelected) {
                    tagCard.style.background = `linear-gradient(135deg, ${color}ee, ${color})`;
                    tagCard.classList.add('border-transparent', 'shadow-lg');
                    tagCard.classList.remove('border-gray-200');
                } else {
                    tagCard.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)';
                    tagCard.classList.remove('border-transparent', 'shadow-lg');
                    tagCard.classList.add('border-gray-200');
                }
                
                // Update selection indicator circle
                const selectionIndicator = tagCard.querySelector('.absolute.top-1.right-1');
                if (selectionIndicator) {
                    if (isSelected) {
                        selectionIndicator.className = 'absolute top-1 right-1 w-5 h-5 rounded-full border-2 transition-all duration-200 z-10 bg-green-600 border-green-600 shadow-lg';
                        selectionIndicator.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center">
                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                        `;
                    } else {
                        selectionIndicator.className = 'absolute top-1 right-1 w-5 h-5 rounded-full border-2 transition-all duration-200 z-10 border-gray-300 bg-white';
                        selectionIndicator.style.backgroundColor = 'rgba(255,255,255,0.9)';
                        selectionIndicator.innerHTML = '';
                    }
                }
                
                // Update counter
                this.updateTagCounter();
            });
        });
        
        // Delete tag buttons
        document.querySelectorAll('.delete-tag-btn').forEach(deleteBtn => {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent tag selection when clicking delete
                
                const tagId = deleteBtn.dataset.tagId;
                this.confirmDeleteTag(tagId);
            });
        });
        
        // Add custom tag card click
        const addCustomTagCard = document.getElementById('addCustomTagCard');
        if (addCustomTagCard) {
            addCustomTagCard.addEventListener('click', () => {
                const customTagSection = document.getElementById('customTagSection');
                customTagSection.classList.remove('hidden');
                
                // Smooth scroll to the form
                setTimeout(() => {
                    customTagSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    document.getElementById('customTagName').focus();
                }, 100);
            });
        }
        
        // Create custom tag
        const confirmCreateTag = document.getElementById('confirmCreateTag');
        if (confirmCreateTag) {
            confirmCreateTag.addEventListener('click', async () => {
                await this.createCustomTag();
            });
        }
        
        // Cancel custom tag (multiple buttons)
        ['cancelCreateTag', 'cancelCreateTagAlt'].forEach(id => {
            const cancelBtn = document.getElementById(id);
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    document.getElementById('customTagSection').classList.add('hidden');
                    this.clearCustomTagForm();
                });
            }
        });
        
        // ✅ SIMPLE DIRECT TAG PREVIEW (no complex components)
        this.setupSimpleTagPreview();
        
        // Enter key handlers
        const customTagName = document.getElementById('customTagName');
        const customTagIcon = document.getElementById('customTagIcon');
        
        if (customTagName && customTagIcon) {
            [customTagName, customTagIcon].forEach(input => {
                input.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter') {
                        const confirmBtn = document.getElementById('confirmCreateTag');
                        if (confirmBtn && !confirmBtn.disabled) {
                            await this.createCustomTag();
                        }
                    }
                });
            });
        }
    }
    
    /**
     * Setup simple tag preview that ALWAYS works (NASA: simple solution)
     * Function size: 35 lines (NASA compliant)
     */
    setupSimpleTagPreview() {
        const nameField = document.getElementById('customTagName');
        const emojiField = document.getElementById('customTagIcon');
        const colorField = document.getElementById('customTagColor');
        const preview = document.getElementById('tagPreview');
        const confirmBtn = document.getElementById('confirmCreateTag');
        
        if (!nameField || !emojiField || !colorField || !preview) {
            return;
        }
        
        // Simple update function that ALWAYS works
        const updatePreview = () => {
            const name = nameField.value.trim() || 'Nova Tag';
            const emoji = emojiField.value.trim() || '🏷️';
            const color = colorField.value || '#3b82f6';
            
            // Update preview with current values
            preview.innerHTML = `
                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" 
                      style="background-color: ${color}; color: white;">
                    <span>${emoji}</span>
                    <span class="font-medium">${name}</span>
                </span>
            `;
            
            // Update button state
            if (confirmBtn) {
                confirmBtn.disabled = !nameField.value.trim();
            }
        };
        
        // Bind ALL events to ALL fields
        [nameField, emojiField, colorField].forEach(field => {
            field.addEventListener('input', updatePreview);
            field.addEventListener('change', updatePreview);
            field.addEventListener('keyup', updatePreview);
            field.addEventListener('blur', updatePreview);
        });
        
        // ✅ DIRECT CLICK DETECTION: Detectar cliques nos pickers específicos
        this.setupDirectClickDetection(updatePreview);
        
        // Initial update
        updatePreview();
    }
    
    /**
     * Setup direct click detection (NASA: simple solution)
     * Function size: 25 lines (NASA compliant)
     */
    setupDirectClickDetection(updateCallback) {
        // NASA Standard: Single responsibility - apenas detectar cliques
        document.addEventListener('click', (event) => {
            const target = event.target;
            const tagSection = document.getElementById('customTagSection');
            
            // Verificar se clique foi dentro da seção de tags
            if (!tagSection || !tagSection.contains(target)) {
                return; // NASA: Early return para reduzir complexidade
            }
            
            // Detectar cliques nos pickers específicos
            const emojiContainer = target.closest('#customTagSection > div > div.space-y-4.mb-6 > div.grid.grid-cols-2.gap-4 > div:nth-child(1) > div > div');
            const colorContainer = target.closest('#customTagSection > div > div.space-y-4.mb-6 > div.grid.grid-cols-2.gap-4 > div:nth-child(2) > div > div');
            
            if (emojiContainer || colorContainer) {
                setTimeout(updateCallback, 50); // NASA: Minimal delay
            }
        });
    }
    
    /**
     * Clear custom tag form (NASA: form management)
     * Function size: 15 lines (NASA compliant)
     */
    clearCustomTagForm() {
        const nameField = document.getElementById('customTagName');
        const emojiField = document.getElementById('customTagIcon');
        const colorField = document.getElementById('customTagColor');
        
        if (nameField) nameField.value = '';
        if (emojiField) emojiField.value = '🏷️';
        if (colorField) colorField.value = '#3b82f6';
        
        // Trigger preview update
        this.setupSimpleTagPreview();
    }
    
    updateTagCounter() {
        const selectedCount = document.querySelectorAll('.tag-checkbox:checked').length;
        const counterElement = document.querySelector('.text-xs.text-gray-400');
        if (counterElement) {
            counterElement.textContent = `(${selectedCount} selecionada${selectedCount !== 1 ? 's' : ''})`;
        }
    }

    async createCustomTag() {
        const name = document.getElementById('customTagName').value.trim();
        const icon = document.getElementById('customTagIcon').value.trim() || '🏷️';
        const color = document.getElementById('customTagColor').value;
        
        if (!name) {
            this.view.showNotification('Nome da tag é obrigatório', 'error');
            return;
        }
        
        try {
            console.log('🏷️ Creating custom tag:', { name, icon, color });
            
            // Show loading state
            const confirmBtn = document.getElementById('confirmCreateTag');
            const originalText = confirmBtn.textContent;
            confirmBtn.textContent = 'Criando...';
            confirmBtn.disabled = true;
            
            const newTag = await this.database.addProductTag({ name, icon, color });
            console.log('✅ Tag created successfully:', newTag);
            
            // Try to refresh tags container safely
            try {
                const container = document.getElementById('productTagsContainer');
                if (container) {
                    const currentTags = this.getSelectedTags();
                    container.innerHTML = this.renderTagsSelector(currentTags);
                    this.setupTagsEvents();
                    console.log('✅ Tags UI refreshed successfully');
                }
            } catch (uiError) {
                console.warn('⚠️ Failed to refresh tags UI, but tag was created:', uiError);
                // Don't throw - tag was created successfully in database
            }
            
            // Hide custom tag section and clear form
            document.getElementById('customTagSection').classList.add('hidden');
            this.clearCustomTagForm();
            
            this.view.showNotification(`Tag "${name}" criada com sucesso!`);
            
        } catch (error) {
            console.error('❌ Error creating tag:', error);
            this.view.showNotification(`Erro ao criar tag: ${error.message}`, 'error');
            
            // Restore button state
            const confirmBtn = document.getElementById('confirmCreateTag');
            if (confirmBtn) {
                confirmBtn.textContent = 'Criar Tag';
                confirmBtn.disabled = false;
            }
        }
    }

    getSelectedTags() {
        const checkboxes = document.querySelectorAll('.tag-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    confirmDeleteTag(tagId) {
        const tag = this.database.getProductTags().find(t => t.id === tagId);
        if (!tag) return;
        
        // Check how many products use this tag
        const products = this.database.getProducts();
        const productsWithTag = products.filter(p => p.tags && p.tags.includes(tagId));
        
        const warningMessage = productsWithTag.length > 0 
            ? `Esta tag será removida de ${productsWithTag.length} produto${productsWithTag.length > 1 ? 's' : ''}.` 
            : '';
        
        const confirmMessage = `
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Deletar Tag</h3>
                    <p class="text-gray-600 mb-2">
                        Tem certeza que deseja deletar a tag 
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium text-white" 
                              style="background-color: ${tag.color};">
                            ${tag.icon} ${tag.name}
                        </span>?
                    </p>
                    ${warningMessage ? `<p class="text-orange-600 text-sm font-medium">${warningMessage}</p>` : ''}
                </div>
                
                <div class="flex justify-center space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="confirmDeleteTagBtn"
                        class="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        data-tag-id="${tagId}"
                    >
                        Sim, Deletar
                    </button>
                    <button 
                        type="button" 
                        id="cancelDeleteTag"
                        class="px-6 py-2 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        this.view.showModal('Confirmar Exclusão', confirmMessage, true);
        
        // Handle confirmation
        document.getElementById('confirmDeleteTagBtn').addEventListener('click', () => {
            this.deleteTag(tagId);
        });
        
        document.getElementById('cancelDeleteTag').addEventListener('click', () => {
            this.view.closeModal(true);
        });
    }

    deleteTag(tagId) {
        try {
            this.database.deleteProductTag(tagId);
            
            // Refresh tags container
            const container = document.getElementById('productTagsContainer');
            const currentTags = this.getSelectedTags().filter(t => t !== tagId); // Remove deleted tag from selection
            container.innerHTML = this.renderTagsSelector(currentTags);
            this.setupTagsEvents();
            
            this.view.closeModal(true);
            this.view.showNotification('Tag deletada com sucesso!');
        } catch (error) {
            this.view.showNotification('Erro ao deletar tag: ' + error.message, 'error');
        }
    }
}