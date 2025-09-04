# Conteúdo do Modal que FUNCIONAVA no commit c8be04f5

## setupCategoriesModal() do MenuView.js (FUNCIONAVA)

```javascript
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
                
                if (categoryId === 'all') {
                    this.scrollToTop();
                } else {
                    this.scrollToCategory(categoryId);
                }
                
                closeModal();
            });
        });
    });
}
```

## CHAVE DO FUNCIONAMENTO:

1. **HTML Container**: 
   ```html
   <div id="categoriesModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
   ```
   - `fixed inset-0` = cobre toda viewport
   - `flex items-end` = empurra conteúdo para baixo da VIEWPORT ATUAL

2. **Modal Content**:
   ```html 
   <div class="bg-white rounded-t-2xl w-full max-h-[70vh] overflow-hidden">
   ```
   - É o bottom sheet propriamente dito
   - 70% da altura máxima da viewport

3. **JavaScript**:
   - Sem cálculos de posicionamento
   - Event listeners simples
   - `modal.remove()` para fechar

## Estado do CSS (só tinha estas classes básicas):
- Sem CSS customizado para modal
- Tudo via Tailwind classes inline
- Zero animações complexas
- Zero conflitos de estilo