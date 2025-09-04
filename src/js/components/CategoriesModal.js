/**
 * CategoriesModal - Versão minimalista para corrigir posicionamento
 * 
 * Abordagem ZERO: Um elemento, CSS simples, sem JavaScript de posicionamento
 */

class CategoriesModal {
    constructor() {
        // Singleton
        if (CategoriesModal.instance) {
            return CategoriesModal.instance;
        }
        
        this.modal = null;
        this.isOpen = false;
        this.categories = [];
        this.totalProducts = 0;
        this.callbacks = {};
        
        CategoriesModal.instance = this;
    }

    /**
     * Mostrar modal - abordagem minimalista
     */
    show(categories, totalProducts, callbacks = {}) {
        if (this.isOpen) {
            this.hide();
        }

        this.categories = categories || [];
        this.totalProducts = totalProducts || 0;
        this.callbacks = {
            onCategorySelect: callbacks.onCategorySelect || (() => {}),
            onScrollToTop: callbacks.onScrollToTop || (() => {}),
            onScrollToCategory: callbacks.onScrollToCategory || (() => {})
        };

        this.render();
        this.setupEventListeners();
        
        // Bloquear scroll da página
        document.body.style.overflow = 'hidden';
        
        this.isOpen = true;
    }

    /**
     * Fechar modal
     */
    hide() {
        if (!this.isOpen || !this.modal) return;
        
        // Animação de saída
        this.modal.classList.add('modal-closing');
        
        setTimeout(() => {
            this.destroy();
        }, 300);
    }

    /**
     * Render - UM elemento simples, sem aninhamento
     */
    render() {
        const modalHtml = `
            <div class="simple-categories-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <!-- Header -->
                <div class="modal-header">
                    <h3 id="modal-title">Cardápio completo</h3>
                    <button class="close-btn" aria-label="Fechar modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <!-- Lista -->
                <div class="modal-list">
                    <button class="category-item" data-category-id="all">
                        <span>Todos</span>
                        <span class="count">${this.totalProducts}</span>
                    </button>
                    
                    ${this.categories.map(cat => `
                        <button class="category-item" data-category-id="${cat.id}">
                            <span>${cat.name}</span>
                            <span class="count">${cat.productCount || 0}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.querySelector('.simple-categories-modal');
    }

    /**
     * Event listeners simples
     */
    setupEventListeners() {
        // Fechar
        const closeBtn = this.modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.hide());

        // Clique fora (no próprio modal = fora do conteúdo)
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Categorias
        const categoryItems = this.modal.querySelectorAll('.category-item');
        categoryItems.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryId = e.currentTarget.dataset.categoryId;
                
                this.callbacks.onCategorySelect(categoryId);
                
                if (categoryId === 'all') {
                    this.callbacks.onScrollToTop();
                } else {
                    this.callbacks.onScrollToCategory(categoryId);
                }
                
                this.hide();
            });
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
            }
        });
    }

    /**
     * Limpar tudo
     */
    destroy() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
        
        document.body.style.overflow = '';
        this.isOpen = false;
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