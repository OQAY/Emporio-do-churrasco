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

    loadProducts() {
        this.view.showLoading();
        
        setTimeout(() => {
            const filters = {
                activeOnly: true
            };

            if (this.searchQuery) {
                filters.search = this.searchQuery;
            }

            const products = this.database.getProducts(filters);
            
            // Para busca, usar renderização simples
            if (this.searchQuery) {
                this.renderSearchResults(products);
            } else {
                // Para exibição normal, usar sistema de seções
                const categories = this.database.getCategories(true);
                this.view.renderProducts(products, categories);
            }
        }, 100);
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