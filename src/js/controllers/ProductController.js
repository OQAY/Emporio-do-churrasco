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
        this.view.renderCategories(categories, (categoryId) => {
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
            // Limpar selecao de categoria durante busca
            this.currentCategory = null;
            document.querySelectorAll('#categoryTabs button').forEach(btn => {
                btn.classList.remove('ring-2', 'ring-orange-300', 'bg-orange-50');
                btn.classList.add('bg-gray-50');
            });
        } else {
            // Se limpar busca, voltar para "Todos"
            this.currentCategory = null;
            document.querySelectorAll('#categoryTabs button').forEach(btn => {
                if (btn.dataset.categoryId === 'all') {
                    btn.classList.add('ring-2', 'ring-orange-300', 'bg-orange-50');
                    btn.classList.remove('bg-gray-50');
                } else {
                    btn.classList.remove('ring-2', 'ring-orange-300', 'bg-orange-50');
                    btn.classList.add('bg-gray-50');
                }
            });
        }
        
        this.loadProducts();
    }
}