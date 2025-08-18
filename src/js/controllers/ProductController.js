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
        
        this.view.renderCategories(categoriesWithCount, (categoryId) => {
            this.currentCategory = categoryId; // null = todos, string = categoria especifica
            this.loadProducts();
        });
    }

    loadProducts() {
        this.view.showLoading();
        
        setTimeout(() => {
            const filters = {
                activeOnly: true
            };

            if (this.searchQuery) {
                filters.search = this.searchQuery;
            } else if (this.currentCategory && this.currentCategory !== null) {
                // Se currentCategory for null, mostra todos os produtos
                filters.categoryId = this.currentCategory;
            }
            // Se currentCategory for null, nao adiciona filtro de categoria = mostra todos

            const products = this.database.getProducts(filters);
            this.view.renderProducts(products);
        }, 100);
    }

    searchProducts(query) {
        this.searchQuery = query;
        
        if (query) {
            // Limpar seleção de categoria durante busca
            this.currentCategory = null;
            document.querySelectorAll('.category-menu-item').forEach(btn => {
                const underline = btn.querySelector('.category-underline');
                btn.classList.remove('text-red-500');
                btn.classList.add('text-gray-700');
                underline.classList.remove('scale-x-100');
                underline.classList.add('scale-x-0');
            });
        } else {
            // Se limpar busca, voltar para "Todos"
            this.currentCategory = null;
            document.querySelectorAll('.category-menu-item').forEach(btn => {
                const underline = btn.querySelector('.category-underline');
                if (btn.dataset.categoryId === 'all') {
                    btn.classList.add('text-red-500');
                    btn.classList.remove('text-gray-700');
                    underline.classList.add('scale-x-100');
                    underline.classList.remove('scale-x-0');
                } else {
                    btn.classList.remove('text-red-500');
                    btn.classList.add('text-gray-700');
                    underline.classList.remove('scale-x-100');
                    underline.classList.add('scale-x-0');
                }
            });
        }
        
        this.loadProducts();
    }
}