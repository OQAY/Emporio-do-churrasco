/**
 * CategoriesModal - Component dedicado para modal de categorias
 * 
 * Corrige problemas de performance e implementa UX mobile premium:
 * - Singleton pattern (modal único, sem memory leaks)
 * - Animações suaves e swipe gestures
 * - Acessibilidade completa (ARIA, ESC, foco)
 * - Gestão adequada de event listeners
 */

class CategoriesModal {
    constructor() {
        // Singleton pattern - só permite uma instância
        if (CategoriesModal.instance) {
            return CategoriesModal.instance;
        }
        
        this.modal = null;
        this.isOpen = false;
        this.categories = [];
        this.totalProducts = 0;
        this.callbacks = {};
        this.previousFocus = null;
        
        // Touch/swipe handling
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isScrolling = false;
        
        CategoriesModal.instance = this;
        
        // Bind methods to preserve context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    /**
     * Exibir modal com dados atualizados
     */
    show(categories, totalProducts, callbacks = {}) {
        // Evitar duplicação - fechar modal existente
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

        this.previousFocus = document.activeElement;
        this.render();
        this.setupEventListeners();
        this.setupAccessibility();
        this.addAnimations();

        // Prevenir scroll da página
        document.body.style.overflow = 'hidden';
        
        this.isOpen = true;
    }

    /**
     * Fechar modal e limpar recursos
     */
    hide() {
        if (!this.modal || !this.isOpen) return;

        // Animação de saída
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.classList.add('modal-slide-out');
        this.modal.classList.add('modal-fade-out');

        // Aguardar animação terminar
        setTimeout(() => {
            this.destroy();
        }, 300);
    }

    /**
     * Renderizar HTML do modal
     */
    render() {
        const modalHtml = `
            <div class="categories-modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end modal-fade-in" 
                 role="dialog" 
                 aria-modal="true" 
                 aria-labelledby="modal-title">
                
                <div class="modal-content bg-white rounded-t-2xl w-full max-h-[70vh] overflow-hidden modal-slide-in">
                    <!-- Header -->
                    <div class="modal-header px-4 py-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h3 id="modal-title" class="text-lg font-semibold text-gray-800">
                                Cardápio completo
                            </h3>
                            <button class="close-btn p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg" 
                                    aria-label="Fechar modal">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Lista de categorias -->
                    <div class="modal-list overflow-y-auto max-h-[50vh] py-2" role="list">
                        <!-- Todos -->
                        <button class="category-item w-full px-4 py-4 text-left hover:bg-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset flex items-center justify-between transition-colors" 
                                data-category-id="all" 
                                role="listitem"
                                tabindex="0">
                            <span class="text-base text-gray-800">Todos</span>
                            <span class="text-gray-500 font-medium">${this.totalProducts}</span>
                        </button>
                        
                        ${this.categories.map(category => `
                            <button class="category-item w-full px-4 py-4 text-left hover:bg-gray-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset flex items-center justify-between transition-colors" 
                                    data-category-id="${category.id}" 
                                    role="listitem"
                                    tabindex="0">
                                <span class="text-base text-gray-800">${category.name}</span>
                                <span class="text-gray-500 font-medium">${category.productCount || 0}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Adicionar ao DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.querySelector('.categories-modal');
    }

    /**
     * Configurar event listeners centralizados
     */
    setupEventListeners() {
        if (!this.modal) return;

        // Fechar modal
        const closeBtn = this.modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.hide());

        // Click fora do modal
        this.modal.addEventListener('click', this.handleClickOutside);

        // Clique nas categorias
        const categoryItems = this.modal.querySelectorAll('.category-item');
        categoryItems.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCategoryClick(e));
        });

        // Touch/swipe gestures para mobile
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        modalContent.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        modalContent.addEventListener('touchend', this.handleTouchEnd, { passive: true });

        // Teclado (ESC key)
        document.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Configurar acessibilidade (ARIA, foco)
     */
    setupAccessibility() {
        if (!this.modal) return;

        // Focus trap - focar no primeiro item
        const firstFocusable = this.modal.querySelector('.close-btn, .category-item');
        if (firstFocusable) {
            firstFocusable.focus();
        }

        // Trap de foco no modal
        this.setupFocusTrap();
    }

    /**
     * Configurar trap de foco
     */
    setupFocusTrap() {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    /**
     * Adicionar animações CSS suaves
     */
    addAnimations() {
        // Animações serão implementadas via CSS
        // Garantir que classes de animação sejam aplicadas
        const modalContent = this.modal.querySelector('.modal-content');
        
        // Force reflow para garantir animação
        modalContent.offsetHeight;
        
        // Remover classe de animação após completar
        setTimeout(() => {
            modalContent.classList.remove('modal-slide-in');
            this.modal.classList.remove('modal-fade-in');
        }, 300);
    }

    /**
     * Handle keyboard events (ESC key)
     */
    handleKeyDown(e) {
        if (e.key === 'Escape' && this.isOpen) {
            e.preventDefault();
            this.hide();
        }
    }

    /**
     * Handle click outside modal
     */
    handleClickOutside(e) {
        if (e.target === this.modal) {
            this.hide();
        }
    }

    /**
     * Handle category selection
     */
    handleCategoryClick(e) {
        const categoryId = e.currentTarget.dataset.categoryId;
        
        // Executar callback apropriado
        this.callbacks.onCategorySelect(categoryId);
        
        if (categoryId === 'all') {
            this.callbacks.onScrollToTop();
        } else {
            this.callbacks.onScrollToCategory(categoryId);
        }
        
        this.hide();
    }

    /**
     * Touch/Swipe gesture handling
     */
    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
        this.isScrolling = false;
    }

    handleTouchMove(e) {
        if (this.isScrolling) return;

        const currentY = e.touches[0].clientY;
        const diffY = currentY - this.touchStartY;
        
        // Se é um scroll vertical dentro do modal, permitir
        const modalList = this.modal.querySelector('.modal-list');
        if (modalList.scrollTop > 0 || diffY < 0) {
            this.isScrolling = true;
            return;
        }

        // Se é swipe down > 50px, preparar para fechar
        if (diffY > 50) {
            e.preventDefault();
            const modalContent = this.modal.querySelector('.modal-content');
            const progress = Math.min(diffY / 200, 1);
            
            // Feedback visual do swipe
            modalContent.style.transform = `translateY(${diffY}px)`;
            modalContent.style.opacity = 1 - (progress * 0.5);
        }
    }

    handleTouchEnd(e) {
        if (this.isScrolling) return;

        this.touchEndY = e.changedTouches[0].clientY;
        const diffY = this.touchEndY - this.touchStartY;

        const modalContent = this.modal.querySelector('.modal-content');
        
        // Reset visual feedback
        modalContent.style.transform = '';
        modalContent.style.opacity = '';

        // Se swipe down > 100px, fechar modal
        if (diffY > 100) {
            this.hide();
        }
    }

    /**
     * Destruir modal e limpar recursos completamente
     */
    destroy() {
        if (this.modal) {
            // Remover event listeners
            document.removeEventListener('keydown', this.handleKeyDown);
            
            // Remover do DOM
            this.modal.remove();
            this.modal = null;
        }

        // Restaurar scroll da página
        document.body.style.overflow = '';
        
        // Restaurar foco anterior
        if (this.previousFocus) {
            this.previousFocus.focus();
            this.previousFocus = null;
        }

        this.isOpen = false;
    }

    /**
     * Método estático para obter instância (Singleton)
     */
    static getInstance() {
        if (!CategoriesModal.instance) {
            new CategoriesModal();
        }
        return CategoriesModal.instance;
    }
}

export default CategoriesModal;