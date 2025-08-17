// View para o menu do cliente
export class MenuView {
    constructor() {
        this.selectedCategory = null;
    }

    renderCategories(categories, onCategoryClick) {
        const container = document.getElementById('categoryTabs');
        container.innerHTML = '';

        // Adicionar botao "Todos" primeiro
        const allButton = document.createElement('button');
        allButton.className = 'px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 hover:bg-gray-100 active:bg-gray-200 whitespace-nowrap transition-all touch-manipulation';
        allButton.textContent = 'Todos';
        allButton.dataset.categoryId = 'all';
        
        allButton.addEventListener('click', () => {
            this.selectCategory('all');
            onCategoryClick(null); // null = mostrar todos
        });

        // Selecionar "Todos" por padrao
        if (!this.selectedCategory) {
            this.selectCategory('all');
            setTimeout(() => onCategoryClick(null), 0);
        }

        container.appendChild(allButton);

        categories.forEach((category) => {
            const button = document.createElement('button');
            button.className = 'px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 hover:bg-gray-100 active:bg-gray-200 whitespace-nowrap transition-all touch-manipulation';
            button.textContent = category.name;
            button.dataset.categoryId = category.id;
            
            button.addEventListener('click', () => {
                this.selectCategory(category.id);
                onCategoryClick(category.id);
            });

            container.appendChild(button);
        });
    }

    selectCategory(categoryId) {
        this.selectedCategory = categoryId;
        
        // Atualizar visual dos botoes
        document.querySelectorAll('#categoryTabs button').forEach(btn => {
            if (btn.dataset.categoryId === categoryId) {
                btn.classList.add('ring-2', 'ring-orange-300', 'bg-orange-50');
                btn.classList.remove('bg-gray-50');
            } else {
                btn.classList.remove('ring-2', 'ring-orange-300', 'bg-orange-50');
                btn.classList.add('bg-gray-50');
            }
        });
    }

    renderProducts(products) {
        const container = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (products.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = '';

        products.forEach(product => {
            const card = this.createProductCard(product);
            container.appendChild(card);
        });
    }

    createProductCard(product) {
        const card = document.createElement('article');
        card.className = 'rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer touch-manipulation';
        
        const priceFormatted = product.price ? 
            `R$ ${product.price.toFixed(2).replace('.', ',')}` : 
            'Consulte';

        card.innerHTML = `
            <div class="relative">
                ${product.featured ? `
                    <span class="absolute top-3 left-3 bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full z-10 shadow-lg">
                        ⭐ Destaque
                    </span>
                ` : ''}
                <div class="h-52 sm:h-48 w-full bg-gray-100">
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