// View para o menu do cliente
export class MenuView {
    constructor() {
        this.selectedCategory = null;
    }

    renderCategories(categories, onCategoryClick) {
        const menuBarContainer = document.querySelector('#categoryMenuBar > div');
        menuBarContainer.innerHTML = '';

        const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);
        
        // Adicionar "Todos" primeiro
        const allButton = document.createElement('button');
        allButton.className = 'category-menu-item relative py-3 text-sm font-medium transition-colors whitespace-nowrap';
        allButton.innerHTML = `
            Todos
            <div class="category-underline absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 transform scale-x-0 transition-transform"></div>
        `;
        allButton.dataset.categoryId = 'all';
        
        allButton.addEventListener('click', () => {
            this.selectCategory('all');
            onCategoryClick(null);
        });

        // Selecionar "Todos" por padrão
        if (!this.selectedCategory) {
            this.selectCategory('all');
            setTimeout(() => onCategoryClick(null), 0);
        }

        menuBarContainer.appendChild(allButton);

        categories.forEach((category) => {
            const button = document.createElement('button');
            button.className = 'category-menu-item relative py-3 text-sm font-medium transition-colors whitespace-nowrap';
            
            button.innerHTML = `
                ${category.name}
                <div class="category-underline absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 transform scale-x-0 transition-transform"></div>
            `;
            button.dataset.categoryId = category.id;
            
            button.addEventListener('click', () => {
                this.selectCategory(category.id);
                onCategoryClick(category.id);
            });

            menuBarContainer.appendChild(button);
        });
        
        // Setup do modal de categorias
        this.setupCategoriesModal(categories, totalProducts, onCategoryClick);
    }

    selectCategory(categoryId) {
        this.selectedCategory = categoryId;
        
        // Atualizar visual do menu bar
        document.querySelectorAll('.category-menu-item').forEach(btn => {
            const underline = btn.querySelector('.category-underline');
            if (btn.dataset.categoryId === categoryId) {
                // Ativar categoria
                btn.classList.add('text-red-500');
                btn.classList.remove('text-gray-700');
                underline.classList.add('scale-x-100');
                underline.classList.remove('scale-x-0');
            } else {
                // Desativar categoria
                btn.classList.remove('text-red-500');
                btn.classList.add('text-gray-700');
                underline.classList.remove('scale-x-100');
                underline.classList.add('scale-x-0');
            }
        });
        
        // Scroll suave para o botão selecionado
        const selectedBtn = document.querySelector(`button[data-category-id="${categoryId}"]`);
        if (selectedBtn) {
            selectedBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }

    setupCategoriesModal(categories, totalProducts, onCategoryClick) {
        const menuBtn = document.getElementById('categoriesMenuBtn');
        
        menuBtn.addEventListener('click', () => {
            // Criar modal HTML
            const modalHtml = `
                <div id="categoriesModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                    <div class="bg-white rounded-t-2xl w-full max-h-[70vh] overflow-hidden">
                        <!-- Header -->
                        <div class="px-4 py-4 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold text-gray-800">Cardápio completo</h3>
                                <button id="closeModalBtn" class="p-2 text-gray-500 hover:text-gray-700">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Lista de categorias -->
                        <div class="overflow-y-auto max-h-[50vh] py-2">
                            <!-- Todos -->
                            <button class="category-modal-item w-full px-4 py-4 text-left hover:bg-gray-50 flex items-center justify-between" data-category-id="all">
                                <span class="text-base text-gray-800">Todos</span>
                                <span class="text-gray-500 font-medium">${totalProducts}</span>
                            </button>
                            
                            ${categories.map(category => `
                                <button class="category-modal-item w-full px-4 py-4 text-left hover:bg-gray-50 flex items-center justify-between" data-category-id="${category.id}">
                                    <span class="text-base text-gray-800">${category.name}</span>
                                    <span class="text-gray-500 font-medium">${category.productCount || 0}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            // Adicionar modal ao body
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Event listeners do modal
            const modal = document.getElementById('categoriesModal');
            const closeBtn = document.getElementById('closeModalBtn');
            
            // Fechar modal
            const closeModal = () => {
                modal.remove();
            };
            
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            
            // Clique nas categorias
            document.querySelectorAll('.category-modal-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    const categoryId = btn.dataset.categoryId;
                    this.selectCategory(categoryId);
                    onCategoryClick(categoryId === 'all' ? null : categoryId);
                    closeModal();
                });
            });
        });
    }

    renderProducts(products) {
        // Separar produtos em destaque e normais
        const featuredProducts = products.filter(product => product.featured);
        const regularProducts = products.filter(product => !product.featured);
        
        // Renderizar destaques
        this.renderFeaturedProducts(featuredProducts);
        
        // Renderizar produtos normais
        this.renderRegularProducts(regularProducts);
    }
    
    renderFeaturedProducts(featuredProducts) {
        const featuredContainer = document.getElementById('featuredGrid');
        const featuredSection = document.getElementById('featuredSection');
        
        if (featuredProducts.length === 0) {
            featuredSection.classList.add('hidden');
            return;
        }
        
        featuredSection.classList.remove('hidden');
        featuredContainer.innerHTML = '';
        
        featuredProducts.forEach((product, index) => {
            const card = this.createFeaturedCard(product, index);
            featuredContainer.appendChild(card);
        });
    }
    
    renderRegularProducts(regularProducts) {
        const container = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (regularProducts.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = '';

        regularProducts.forEach(product => {
            const card = this.createProductCard(product);
            container.appendChild(card);
        });
    }

    createFeaturedCard(product, index) {
        const card = document.createElement('article');
        card.className = 'featured-card rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer touch-manipulation';
        
        const priceFormatted = product.price ? 
            `R$ ${product.price.toFixed(2).replace('.', ',')}` : 
            'Consulte';
            
        // Simular preço original (20-50% maior) e desconto para demonstração
        const originalPrice = product.price ? product.price * (1 + Math.random() * 0.5 + 0.2) : null;
        const originalPriceFormatted = originalPrice ? 
            `R$ ${originalPrice.toFixed(2).replace('.', ',')}` : null;
        const discount = originalPrice ? 
            Math.round(((originalPrice - product.price) / originalPrice) * 100) : null;

        card.innerHTML = `
            <div class="relative aspect-square">
                <!-- Badge "Mais pedido" apenas no primeiro item -->
                ${index === 0 ? `
                    <span class="absolute top-3 left-3 bg-orange-600 text-white text-xs font-medium px-2 py-1 rounded-md z-10 flex items-center gap-1">
                        🔥 Mais pedido
                    </span>
                ` : ''}
                
                <!-- Badge de desconto -->
                ${discount ? `
                    <span class="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                        -${discount}%
                    </span>
                ` : ''}
                
                <!-- Imagem do produto -->
                <div class="w-full h-full bg-gray-100">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" loading="lazy">` :
                        `<div class="w-full h-full flex items-center justify-center">
                            <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>`
                    }
                </div>
            </div>
            
            <!-- Conteúdo embaixo da imagem -->
            <div class="p-3">
                <!-- Preços -->
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-lg font-bold text-gray-900">${priceFormatted}</span>
                    ${originalPriceFormatted ? `
                        <span class="text-sm text-gray-400 line-through">${originalPriceFormatted}</span>
                    ` : ''}
                </div>
                
                <!-- Nome do produto -->
                <h3 class="font-medium text-sm text-gray-800 leading-tight">${product.name}</h3>
            </div>
        `;

        return card;
    }

    createProductCard(product) {
        const card = document.createElement('article');
        // Layout responsivo: horizontal no mobile, vertical no desktop
        card.className = 'rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer touch-manipulation sm:block';
        
        const priceFormatted = product.price ? 
            `R$ ${product.price.toFixed(2).replace('.', ',')}` : 
            'Consulte';

        // Layout mobile horizontal (até 742px) - layout desktop vertical (743px+)
        card.innerHTML = `
            <!-- Layout Mobile Horizontal (até 742px) -->
            <div class="mobile-horizontal items-center p-4 gap-4">
                <!-- Conteúdo à esquerda -->
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-base leading-tight mb-2">${product.name}</h3>
                    ${product.description ? 
                        `<p class="text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">${product.description}</p>` : 
                        ''
                    }
                    <span class="text-orange-600 font-bold text-lg">${priceFormatted}</span>
                </div>
                
                <!-- Imagem à direita -->
                <div class="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" loading="lazy">` :
                        `<div class="w-full h-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>`
                    }
                </div>
            </div>

            <!-- Layout Desktop Vertical (743px+) -->
            <div class="desktop-vertical">
                <div class="relative">
                    <div class="h-48 w-full bg-gray-100">
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" loading="lazy">` :
                            `<div class="w-full h-full flex items-center justify-center">
                                <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>`
                        }
                    </div>
                </div>
                <div class="p-4">
                    <div class="flex justify-between items-start mb-3 gap-3">
                        <h3 class="font-semibold text-lg leading-tight flex-1 min-w-0">${product.name}</h3>
                        <span class="text-orange-600 font-bold text-lg whitespace-nowrap flex-shrink-0">${priceFormatted}</span>
                    </div>
                    ${product.description ? 
                        `<p class="text-sm text-gray-600 leading-relaxed line-clamp-3">${product.description}</p>` : 
                        ''
                    }
                </div>
            </div>
        `;

        return card;
    }

    showLoading() {
        const container = document.getElementById('productsGrid');
        container.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p class="text-gray-500 mt-2">Carregando...</p>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('productsGrid');
        container.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
    }
}