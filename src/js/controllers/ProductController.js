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
        
        // NÃO carregar produtos aqui - será feito após chunked loading
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
     * Load featured products
     */
    async loadCriticalProducts() {
        try {
            const criticalData = await this.database.loadCriticalEssentials();
            
            if (criticalData && criticalData.products) {
                this.view.renderFeaturedProducts(criticalData.products);
            }
        } catch (error) {
            console.error('Erro ao carregar produtos críticos:', error);
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