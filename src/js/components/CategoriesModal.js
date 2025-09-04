/**
 * CategoriesModal - RECRIADO BASEADO NO COMMIT c8be04f5 QUE FUNCIONAVA
 * 
 * Usando exatamente a mesma lógica e estrutura HTML que funcionava
 */

class CategoriesModal {
    constructor() {
        // Singleton
        if (CategoriesModal.instance) {
            return CategoriesModal.instance;
        }
        
        this.isOpen = false;
        CategoriesModal.instance = this;
    }

    /**
     * Mostrar modal - EXATAMENTE como funcionava no MenuView.js
     */
    show(categories, totalProducts, callbacks = {}) {
        if (this.isOpen) {
            return; // Evitar múltiplos modais
        }

        // Criar modal HTML - CSS PURO SEM TAILWIND
        const modalHtml = `
            <div id="categoriesModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: flex-end;">
                <div style="background: white; border-radius: 16px 16px 0 0; width: 100%; max-height: 70vh; overflow: hidden;">
                    <!-- Header -->
                    <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin: 0;">Cardápio completo</h3>
                            <button id="closeModalBtn" style="padding: 8px; color: #6b7280; background: none; border: none; cursor: pointer;">
                                <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Lista de categorias -->
                    <div style="overflow-y: auto; max-height: 50vh; padding: 8px 0;">
                        <!-- Todos -->
                        <button class="category-modal-item" style="width: 100%; padding: 16px; text-align: left; background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between;" data-category-id="all">
                            <span style="font-size: 16px; color: #374151;">Todos</span>
                            <span style="color: #6b7280; font-weight: 500;">${totalProducts}</span>
                        </button>
                        
                        ${categories.map(category => `
                            <button class="category-modal-item" style="width: 100%; padding: 16px; text-align: left; background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between;" data-category-id="${category.id}">
                                <span style="font-size: 16px; color: #374151;">${category.name}</span>
                                <span style="color: #6b7280; font-weight: 500;">${category.productCount || 0}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Inserir modal diretamente no body (fora do #app)
        document.body.insertAdjacentHTML('afterbegin', modalHtml);
        
        // Adicionar hover effects via CSS
        const style = document.createElement('style');
        style.textContent = `
            .category-modal-item:hover {
                background-color: #f9fafb !important;
            }
        `;
        document.head.appendChild(style);
        
        document.body.style.overflow = 'hidden';
        
        // Event listeners do modal - EXATAMENTE como funcionava
        const modal = document.getElementById('categoriesModal');
        const closeBtn = document.getElementById('closeModalBtn');
        
        // Fechar modal
        const closeModal = () => {
            modal.remove();
            // Reabilitar scroll da página
            document.body.style.overflow = '';
            this.isOpen = false;
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Clique nas categorias - EXATAMENTE como funcionava
        document.querySelectorAll('.category-modal-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const categoryId = btn.dataset.categoryId;
                
                // Chamar callbacks se fornecidos
                if (callbacks.onCategorySelect) {
                    callbacks.onCategorySelect(categoryId);
                }
                
                if (categoryId === 'all') {
                    if (callbacks.onScrollToTop) {
                        callbacks.onScrollToTop();
                    }
                } else {
                    if (callbacks.onScrollToCategory) {
                        callbacks.onScrollToCategory(categoryId);
                    }
                }
                
                closeModal();
            });
        });

        this.isOpen = true;
    }

    /**
     * Singleton getter
     */
    static getInstance() {
        if (!CategoriesModal.instance) {
            new CategoriesModal();
        }
        return CategoriesModal.instance;
    }
}

export default CategoriesModal;