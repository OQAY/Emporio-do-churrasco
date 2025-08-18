// Cliente Supabase com fallback para localStorage
// Permite funcionar offline e migração gradual

class SupabaseDatabase {
    constructor() {
        // Configurações do Supabase (substituir com suas credenciais)
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.supabase = null;
        this.isOnline = false;
        this.currentRestaurant = null;
        
        // Fallback para localStorage
        this.useLocalStorage = true;
        this.storageKey = "restaurantData";
        
        this.init();
    }
    
    init() {
        // Detectar configuração do Supabase
        this.supabaseUrl = this.getConfig('SUPABASE_URL');
        this.supabaseKey = this.getConfig('SUPABASE_ANON_KEY');
        
        if (this.supabaseUrl && this.supabaseKey) {
            this.initSupabase();
        } else {
            console.log('Modo offline: usando localStorage');
            this.initLocalStorage();
        }
        
        // Detectar restaurante pelo domínio/subdomínio
        this.detectRestaurant();
    }
    
    getConfig(key) {
        // Primeiro tenta variáveis de ambiente
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
        
        // Depois tenta window (para configuração via script)
        if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
            return window.ENV[key];
        }
        
        // Por último, tenta localStorage
        return localStorage.getItem(key);
    }
    
    async initSupabase() {
        try {
            // Importar Supabase dinamicamente
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            
            this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
            this.isOnline = true;
            this.useLocalStorage = false;
            
            console.log('Conectado ao Supabase');
            
            // Sincronizar dados locais com Supabase se necessário
            await this.syncLocalToSupabase();
        } catch (error) {
            console.error('Erro ao conectar com Supabase:', error);
            this.initLocalStorage();
        }
    }
    
    initLocalStorage() {
        // Garantir que dados locais existem
        const existingData = localStorage.getItem(this.storageKey);
        if (!existingData) {
            const initialData = this.getInitialData();
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
    }
    
    detectRestaurant() {
        const hostname = window.location.hostname;
        
        // Desenvolvimento local
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            this.currentRestaurant = {
                id: 'local-dev',
                subdomain: 'demo',
                name: 'Restaurante Demo'
            };
            return;
        }
        
        // Detectar subdomínio
        const parts = hostname.split('.');
        if (parts.length >= 3) {
            // Ex: pizzaria.seucardapio.com.br
            this.currentRestaurant = {
                subdomain: parts[0]
            };
        } else {
            // Domínio customizado, precisa buscar no banco
            this.currentRestaurant = {
                custom_domain: hostname
            };
        }
        
        // Se online, buscar dados completos do restaurante
        if (this.isOnline) {
            this.loadRestaurantData();
        }
    }
    
    async loadRestaurantData() {
        if (!this.supabase || !this.currentRestaurant) return;
        
        let query = this.supabase
            .from('restaurants')
            .select('*')
            .eq('active', true)
            .single();
        
        if (this.currentRestaurant.subdomain) {
            query = query.eq('subdomain', this.currentRestaurant.subdomain);
        } else if (this.currentRestaurant.custom_domain) {
            query = query.eq('custom_domain', this.currentRestaurant.custom_domain);
        }
        
        const { data, error } = await query;
        
        if (!error && data) {
            this.currentRestaurant = data;
            console.log('Restaurante carregado:', data.name);
        }
    }
    
    // ============ MÉTODOS DE PRODUTOS ============
    
    async getProducts(filters = {}) {
        if (this.isOnline && this.supabase) {
            return this.getProductsFromSupabase(filters);
        }
        return this.getProductsFromLocalStorage(filters);
    }
    
    async getProductsFromSupabase(filters) {
        let query = this.supabase
            .from('products')
            .select(`
                *,
                category:categories(id, name)
            `)
            .eq('restaurant_id', this.currentRestaurant.id);
        
        if (filters.categoryId) {
            query = query.eq('category_id', filters.categoryId);
        }
        
        if (filters.activeOnly) {
            query = query.eq('active', true);
        }
        
        if (filters.featured) {
            query = query.eq('featured', true);
        }
        
        if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }
        
        query = query.order('featured', { ascending: false })
                     .order('display_order')
                     .order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Erro ao buscar produtos:', error);
            return this.getProductsFromLocalStorage(filters);
        }
        
        return data || [];
    }
    
    getProductsFromLocalStorage(filters) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        let products = data.products || [];
        
        if (filters.categoryId) {
            products = products.filter(p => p.categoryId === filters.categoryId);
        }
        
        if (filters.activeOnly) {
            products = products.filter(p => p.active);
        }
        
        if (filters.featured) {
            products = products.filter(p => p.featured);
        }
        
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchLower) ||
                p.description?.toLowerCase().includes(searchLower)
            );
        }
        
        return products.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (a.display_order || 0) - (b.display_order || 0);
        });
    }
    
    async addProduct(product) {
        if (this.isOnline && this.supabase) {
            const { data, error } = await this.supabase
                .from('products')
                .insert({
                    ...product,
                    restaurant_id: this.currentRestaurant.id
                })
                .select()
                .single();
            
            if (error) {
                console.error('Erro ao adicionar produto:', error);
                return this.addProductToLocalStorage(product);
            }
            
            return data;
        }
        
        return this.addProductToLocalStorage(product);
    }
    
    addProductToLocalStorage(product) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        const newProduct = {
            id: 'prod' + Date.now(),
            ...product,
            created_at: new Date().toISOString()
        };
        
        data.products = data.products || [];
        data.products.push(newProduct);
        
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        window.dispatchEvent(new Event('databaseUpdated'));
        
        return newProduct;
    }
    
    async updateProduct(id, updates) {
        if (this.isOnline && this.supabase) {
            const { data, error } = await this.supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .eq('restaurant_id', this.currentRestaurant.id)
                .select()
                .single();
            
            if (error) {
                console.error('Erro ao atualizar produto:', error);
                return this.updateProductInLocalStorage(id, updates);
            }
            
            return data;
        }
        
        return this.updateProductInLocalStorage(id, updates);
    }
    
    updateProductInLocalStorage(id, updates) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        const index = data.products?.findIndex(p => p.id === id);
        
        if (index !== -1) {
            data.products[index] = { ...data.products[index], ...updates };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            window.dispatchEvent(new Event('databaseUpdated'));
            return data.products[index];
        }
        
        return null;
    }
    
    async deleteProduct(id) {
        if (this.isOnline && this.supabase) {
            const { error } = await this.supabase
                .from('products')
                .delete()
                .eq('id', id)
                .eq('restaurant_id', this.currentRestaurant.id);
            
            if (error) {
                console.error('Erro ao deletar produto:', error);
                return this.deleteProductFromLocalStorage(id);
            }
            
            return true;
        }
        
        return this.deleteProductFromLocalStorage(id);
    }
    
    deleteProductFromLocalStorage(id) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        data.products = data.products?.filter(p => p.id !== id) || [];
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        window.dispatchEvent(new Event('databaseUpdated'));
        return true;
    }
    
    // ============ MÉTODOS DE CATEGORIAS ============
    
    async getCategories(activeOnly = false) {
        if (this.isOnline && this.supabase) {
            let query = this.supabase
                .from('categories')
                .select('*')
                .eq('restaurant_id', this.currentRestaurant.id);
            
            if (activeOnly) {
                query = query.eq('active', true);
            }
            
            query = query.order('display_order').order('name');
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Erro ao buscar categorias:', error);
                return this.getCategoriesFromLocalStorage(activeOnly);
            }
            
            return data || [];
        }
        
        return this.getCategoriesFromLocalStorage(activeOnly);
    }
    
    getCategoriesFromLocalStorage(activeOnly) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        let categories = data.categories || [];
        
        if (activeOnly) {
            categories = categories.filter(cat => cat.active);
        }
        
        return categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }
    
    // ============ UPLOAD DE IMAGENS ============
    
    async uploadImage(file) {
        if (this.isOnline && this.supabase) {
            const fileName = `${this.currentRestaurant.id}/${Date.now()}_${file.name}`;
            
            const { data, error } = await this.supabase.storage
                .from('products')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) {
                console.error('Erro no upload:', error);
                return this.uploadImageToLocalStorage(file);
            }
            
            // Retornar URL pública
            const { data: { publicUrl } } = this.supabase.storage
                .from('products')
                .getPublicUrl(fileName);
            
            return publicUrl;
        }
        
        return this.uploadImageToLocalStorage(file);
    }
    
    uploadImageToLocalStorage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onloadend = () => {
                resolve(reader.result); // Retorna base64
            };
            
            reader.onerror = () => {
                reject(new Error('Erro ao ler arquivo'));
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // ============ SINCRONIZAÇÃO ============
    
    async syncLocalToSupabase() {
        if (!this.isOnline || !this.supabase) return;
        
        const localData = localStorage.getItem(this.storageKey);
        if (!localData) return;
        
        const data = JSON.parse(localData);
        
        // Verificar se há dados para sincronizar
        if (data.needsSync) {
            console.log('Sincronizando dados locais com Supabase...');
            
            // Sincronizar categorias
            for (const category of data.categories || []) {
                if (category.localOnly) {
                    await this.supabase
                        .from('categories')
                        .upsert({
                            ...category,
                            restaurant_id: this.currentRestaurant.id,
                            localOnly: undefined
                        });
                }
            }
            
            // Sincronizar produtos
            for (const product of data.products || []) {
                if (product.localOnly) {
                    await this.supabase
                        .from('products')
                        .upsert({
                            ...product,
                            restaurant_id: this.currentRestaurant.id,
                            localOnly: undefined
                        });
                }
            }
            
            // Marcar como sincronizado
            data.needsSync = false;
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            
            console.log('Sincronização concluída');
        }
    }
    
    // ============ MÉTODOS AUXILIARES ============
    
    getInitialData() {
        return {
            restaurant: {
                name: "Restaurante Demo",
                logo: "RD",
                banner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
            },
            categories: [],
            products: [],
            needsSync: false
        };
    }
    
    // Método para configurar credenciais do Supabase
    async configureSupabase(url, anonKey) {
        localStorage.setItem('SUPABASE_URL', url);
        localStorage.setItem('SUPABASE_ANON_KEY', anonKey);
        
        // Reinicializar com as novas credenciais
        this.supabaseUrl = url;
        this.supabaseKey = anonKey;
        await this.initSupabase();
        
        return this.isOnline;
    }
    
    // Verificar status da conexão
    getConnectionStatus() {
        return {
            isOnline: this.isOnline,
            useLocalStorage: this.useLocalStorage,
            currentRestaurant: this.currentRestaurant,
            hasSupabaseConfig: !!(this.supabaseUrl && this.supabaseKey)
        };
    }
}

// Exportar instância única
const supabaseDatabase = new SupabaseDatabase();
export default supabaseDatabase;