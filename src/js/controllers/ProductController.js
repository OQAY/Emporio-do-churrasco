// Controller para gerenciar produtos no menu
export class ProductController {
    constructor(database, view) {
        this.database = database;
        this.view = view;
        this.currentCategory = null;
        this.searchQuery = '';
    }

    loadCategories() {
        const categories = this.database.getCategories(true); // Apenas categorias ativas
        const products = this.database.getProducts({ activeOnly: true });
        
        // Adicionar contagem de produtos para cada categoria
        const categoriesWithCount = categories.map(category => ({
            ...category,
            productCount: products.filter(product => product.categoryId === category.id).length
        }));
        
        this.view.renderCategories(categoriesWithCount, () => {
            // Callback não mais usado para filtrar, apenas para setup inicial
        });
        
        // Carregar todos os produtos organizados por seção
        this.loadAllProducts(categoriesWithCount);
    }

    loadAllProducts(categories) {
        this.view.showLoading();
        
        setTimeout(() => {
            const products = this.database.getProducts({ activeOnly: true });
            this.view.renderProducts(products, categories);
        }, 100);
    }

    async loadProducts() {
        try {
            this.view.showLoading();
            
            const products = await this.database.getProducts({ activeOnly: true });
            const categories = await this.database.getCategories(true);
            
            this.view.renderProducts(products, categories);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            this.view.showError('Erro ao carregar produtos. Tente novamente.');
        }
    }

    /**
     * ULTRA-OPTIMIZED: Load ONLY critical/featured products (sub-500ms target)
     * Function size: 20 lines (NASA compliant)
     */
    async loadCriticalProducts() {
        try {
            console.log('🚀 Loading CRITICAL products (featured only, ultra-fast)...');
            
            // Load only critical essentials from database
            const criticalData = await this.database.loadCriticalEssentials();
            
            if (criticalData && criticalData.products) {
                // Render ONLY featured products immediately
                this.view.renderFeaturedProducts(criticalData.products);
                
                console.log(`🚀 CRITICAL products rendered: ${criticalData.products.length} featured products`);
                console.log('  - Target: sub-500ms render time for featured section');
            }
        } catch (error) {
            console.error('Erro ao carregar produtos críticos:', error);
            this.view.showError('Erro ao carregar destaques.');
        }
    }

    /**
     * Load INSTANT products (FALLBACK - all products with skeletons)
     * Function size: 15 lines (NASA compliant)
     */
    async loadInstantProducts() {
        try {
            console.log('⚡ FALLBACK: Loading INSTANT products (all products, skeleton images)...');
            
            const products = await this.database.getProducts({ activeOnly: true });
            const categories = await this.database.getCategories(true);
            
            // Render ALL products with skeleton images
            this.view.renderProducts(products, categories);
            
            console.log(`⚡ INSTANT products rendered: ${products.length} products with skeletons`);
        } catch (error) {
            console.error('Erro ao carregar produtos instantâneos:', error);
            this.view.showError('Erro ao carregar cardápio.');
        }
    }
    
    renderSearchResults(products) {
        const container = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');
        const featuredSection = document.getElementById('featuredSection');
        
        // Esconder seção de destaques durante busca
        featuredSection.classList.add('hidden');
        
        if (products.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = '';

        products.forEach(product => {
            const card = this.view.createProductCard(product);
            container.appendChild(card);
        });
    }

    searchProducts(query) {
        this.searchQuery = query;
        
        if (query) {
            // Durante busca, usar sistema de filtro antigo
            this.loadProducts();
        } else {
            // Se limpar busca, voltar para exibição por seções
            const categories = this.database.getCategories(true);
            const categoriesWithCount = categories.map(category => ({
                ...category,
                productCount: this.database.getProducts({ activeOnly: true }).filter(product => product.categoryId === category.id).length
            }));
            this.loadAllProducts(categoriesWithCount);
        }
    }
}