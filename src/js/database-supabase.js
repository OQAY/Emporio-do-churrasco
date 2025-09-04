// Sistema de banco de dados usando Supabase
// Substitui o localStorage para dados persistentes na nuvem

class SupabaseDatabase {
  constructor() {
    // Credenciais do Supabase (via variáveis de ambiente)
    this.supabaseUrl = window.ENV?.SUPABASE_URL || 'https://lypmjnpbpvqkptgmdnnc.supabase.co';
    this.supabaseKey = window.ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cG1qbnBicHZxa3B0Z21kbm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg4NjcsImV4cCI6MjA3MTEyNDg2N30.naWda_QL5W9JLu87gO6LbFZmG3utyWJwFPvgh4V2i3g';
    
    // ID do restaurante "Imperio do Churrasco" (já existe no Supabase)
    this.restaurantId = 'b639641d-518a-4bb3-a2b5-f7927d6b6186';
    
    this.headers = {
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    
    console.log('🔗 SupabaseDatabase inicializado - Modo: Nuvem');
  }

  // Método auxiliar para fazer requisições HTTP
  async makeRequest(endpoint, options = {}) {
    const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase Error (${response.status}): ${error}`);
    }

    return response.json();
  }

  // Obter todos os dados do restaurante
  async getData() {
    try {
      // Buscar dados do restaurante
      const restaurant = await this.makeRequest(`restaurants?id=eq.${this.restaurantId}&select=*`);
      
      // Buscar categorias do restaurante
      const categories = await this.makeRequest(
        `categories?restaurant_id=eq.${this.restaurantId}&active=eq.true&order=display_order.asc&select=*`
      );
      
      // Buscar produtos do restaurante
      const products = await this.makeRequest(
        `products?restaurant_id=eq.${this.restaurantId}&active=eq.true&order=display_order.asc&select=*`
      );

      // Transformar dados para o formato esperado pelo app
      const data = {
        restaurant: restaurant[0] ? {
          name: restaurant[0].name,
          logo: restaurant[0].logo,
          banner: restaurant[0].banner,
          theme: restaurant[0].theme || {
            primaryColor: "#fb923c",
            secondaryColor: "#f97316"
          }
        } : {
          name: "Imperio do Churrasco",
          logo: "IC",
          banner: "images/banners/banner_imperio.jpeg",
          theme: {
            primaryColor: "#fb923c",
            secondaryColor: "#f97316"
          }
        },
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          order: cat.display_order,
          active: cat.active
        })),
        products: products.map(prod => ({
          id: prod.id,
          categoryId: prod.category_id,
          name: prod.name,
          description: prod.description,
          price: parseFloat(prod.price),
          originalPrice: prod.original_price ? parseFloat(prod.original_price) : null,
          isOnSale: prod.is_on_sale,
          image: prod.image_url,
          active: prod.active,
          featured: prod.featured
        }))
      };

      console.log('✅ Dados carregados do Supabase:', {
        categorias: data.categories.length,
        produtos: data.products.length
      });

      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar dados do Supabase:', error);
      // Fallback para localStorage se Supabase falhar
      return this.getLocalStorageFallback();
    }
  }

  // Salvar todos os dados
  async saveData(data) {
    try {
      console.log('💾 Salvando dados no Supabase...');
      
      // Atualizar dados do restaurante
      if (data.restaurant) {
        await this.makeRequest(`restaurants?id=eq.${this.restaurantId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: data.restaurant.name,
            logo: data.restaurant.logo,
            banner: data.restaurant.banner,
            theme: data.restaurant.theme,
            updated_at: new Date().toISOString()
          })
        });
      }

      console.log('✅ Dados salvos no Supabase com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar no Supabase:', error);
      // Fallback para localStorage se Supabase falhar
      localStorage.setItem("restaurantData", JSON.stringify(data));
      return false;
    }
  }

  // Adicionar categoria
  async addCategory(categoryData) {
    try {
      const newCategory = await this.makeRequest('categories', {
        method: 'POST',
        body: JSON.stringify({
          restaurant_id: this.restaurantId,
          name: categoryData.name,
          description: categoryData.description || null,
          display_order: categoryData.order || 999,
          active: true
        })
      });

      console.log('✅ Categoria adicionada:', newCategory[0]);
      return {
        id: newCategory[0].id,
        name: newCategory[0].name,
        order: newCategory[0].display_order,
        active: newCategory[0].active
      };
    } catch (error) {
      console.error('❌ Erro ao adicionar categoria:', error);
      throw error;
    }
  }

  // Atualizar categoria
  async updateCategory(id, categoryData) {
    try {
      const updated = await this.makeRequest(`categories?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: categoryData.name,
          description: categoryData.description || null,
          display_order: categoryData.order,
          updated_at: new Date().toISOString()
        })
      });

      console.log('✅ Categoria atualizada:', updated[0]);
      return updated[0];
    } catch (error) {
      console.error('❌ Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  // Deletar categoria
  async deleteCategory(id) {
    try {
      await this.makeRequest(`categories?id=eq.${id}`, {
        method: 'DELETE'
      });

      console.log('✅ Categoria deletada:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar categoria:', error);
      throw error;
    }
  }

  // Adicionar produto
  async addProduct(productData) {
    try {
      const newProduct = await this.makeRequest('products', {
        method: 'POST',
        body: JSON.stringify({
          restaurant_id: this.restaurantId,
          category_id: productData.categoryId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          original_price: productData.originalPrice || null,
          is_on_sale: productData.isOnSale || false,
          image_url: productData.image,
          active: true,
          featured: productData.featured || false,
          display_order: productData.order || 999
        })
      });

      console.log('✅ Produto adicionado:', newProduct[0]);
      return {
        id: newProduct[0].id,
        categoryId: newProduct[0].category_id,
        name: newProduct[0].name,
        description: newProduct[0].description,
        price: parseFloat(newProduct[0].price),
        originalPrice: newProduct[0].original_price ? parseFloat(newProduct[0].original_price) : null,
        isOnSale: newProduct[0].is_on_sale,
        image: newProduct[0].image_url,
        active: newProduct[0].active,
        featured: newProduct[0].featured
      };
    } catch (error) {
      console.error('❌ Erro ao adicionar produto:', error);
      throw error;
    }
  }

  // Atualizar produto
  async updateProduct(id, productData) {
    try {
      const updated = await this.makeRequest(`products?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          category_id: productData.categoryId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          original_price: productData.originalPrice || null,
          is_on_sale: productData.isOnSale || false,
          image_url: productData.image,
          featured: productData.featured || false,
          updated_at: new Date().toISOString()
        })
      });

      console.log('✅ Produto atualizado:', updated[0]);
      return updated[0];
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      throw error;
    }
  }

  // Deletar produto
  async deleteProduct(id) {
    try {
      await this.makeRequest(`products?id=eq.${id}`, {
        method: 'DELETE'
      });

      console.log('✅ Produto deletado:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      throw error;
    }
  }

  // Backup dos dados
  async backup() {
    try {
      const data = await this.getData();
      const backup = {
        timestamp: new Date().toISOString(),
        restaurantId: this.restaurantId,
        data: data
      };
      
      // Salvar backup no localStorage também
      localStorage.setItem('supabase_backup', JSON.stringify(backup));
      console.log('✅ Backup criado com sucesso');
      return backup;
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  // Restaurar backup
  async restore(backupData) {
    try {
      console.log('🔄 Restaurando backup...');
      await this.saveData(backupData.data);
      console.log('✅ Backup restaurado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      throw error;
    }
  }

  // Fallback para localStorage quando Supabase não funciona
  getLocalStorageFallback() {
    console.warn('⚠️ Usando fallback localStorage');
    const localData = localStorage.getItem("restaurantData");
    
    if (localData) {
      return JSON.parse(localData);
    }

    // Dados iniciais se não houver nada
    return {
      restaurant: {
        name: "Imperio do Churrasco",
        logo: "IC",
        banner: "images/banners/banner_imperio.jpeg",
        theme: {
          primaryColor: "#fb923c",
          secondaryColor: "#f97316"
        }
      },
      categories: [],
      products: []
    };
  }

  // Verificar status da conexão
  async getConnectionStatus() {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/restaurants?id=eq.${this.restaurantId}`, {
        method: 'HEAD',
        headers: this.headers
      });
      
      return {
        connected: response.ok,
        status: response.status,
        mode: 'Supabase (Nuvem)',
        restaurant: this.restaurantId
      };
    } catch (error) {
      return {
        connected: false,
        status: 'Error',
        mode: 'localStorage (Local)',
        error: error.message
      };
    }
  }

  // Métodos síncronos que o controller espera (com cache)
  getCategories(activeOnly = false) {
    if (!this.cachedData) {
      console.warn('⚠️ Dados não carregados ainda - use await database.loadData()');
      return [];
    }
    
    let categories = this.cachedData.categories || [];
    if (activeOnly) {
      categories = categories.filter(cat => cat.active);
    }
    return categories;
  }

  getProducts(filters = {}) {
    if (!this.cachedData) {
      console.warn('⚠️ Dados não carregados ainda - use await database.loadData()');
      return [];
    }
    
    let products = this.cachedData.products || [];
    
    if (filters.activeOnly) {
      products = products.filter(prod => prod.active);
    }
    
    if (filters.categoryId) {
      products = products.filter(prod => prod.categoryId === filters.categoryId);
    }
    
    if (filters.search) {
      const query = filters.search.toLowerCase();
      products = products.filter(prod => 
        prod.name.toLowerCase().includes(query) ||
        prod.description.toLowerCase().includes(query)
      );
    }
    
    return products;
  }

  getRestaurant() {
    if (!this.cachedData) {
      console.warn('⚠️ Dados não carregados ainda - use await database.loadData()');
      return null;
    }
    return this.cachedData.restaurant;
  }

  // Método para carregar dados e fazer cache para métodos síncronos
  async loadData() {
    console.log('🔄 Carregando dados do Supabase...');
    this.cachedData = await this.getData();
    console.log('✅ Dados carregados e em cache para uso síncrono');
    return this.cachedData;
  }

  // Métodos de autenticação (usando localStorage por enquanto)
  isAuthenticated() {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      const auth = JSON.parse(adminAuth);
      // Verifica se ainda está válido (24 horas)
      if (Date.now() - auth.timestamp < 24 * 60 * 60 * 1000) {
        return true;
      }
    }
    return false;
  }

  authenticate(username, password) {
    // Credenciais fixas por enquanto (migrar para Supabase Auth depois)
    if (username === 'admin' && password === 'admin123') {
      const authData = {
        username,
        timestamp: Date.now()
      };
      localStorage.setItem('adminAuth', JSON.stringify(authData));
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('adminAuth');
  }

  // Métodos de sessão admin
  saveSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getSession(key) {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  clearSession(key) {
    sessionStorage.removeItem(key);
  }

  // Método de estatísticas para o dashboard
  getStatistics() {
    if (!this.cachedData) {
      console.warn('⚠️ Dados não carregados ainda - use await database.loadData()');
      return {
        totalProducts: 0,
        totalCategories: 0,
        activeProducts: 0,
        onSaleProducts: 0,
        totalImages: 0,
        restaurantName: 'Carregando...'
      };
    }

    const products = this.cachedData.products || [];
    const categories = this.cachedData.categories || [];
    
    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      activeProducts: products.filter(p => p.active).length,
      onSaleProducts: products.filter(p => p.isOnSale).length,
      totalImages: products.filter(p => p.image).length,
      restaurantName: this.cachedData.restaurant?.name || 'Imperio do Churrasco'
    };
  }

  // Método para obter imagens da galeria
  getGalleryImages(search = '') {
    if (!this.cachedData) {
      return [];
    }
    
    // Por enquanto, retorna imagens dos produtos
    const products = this.cachedData.products || [];
    const images = products
      .filter(p => p.image)
      .map(p => ({
        id: p.id,
        name: p.name,
        url: p.image,
        size: 0,
        type: 'image/jpeg'
      }));
    
    if (search) {
      return images.filter(img => 
        img.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return images;
  }
}

// Exportar instância da classe
const database = new SupabaseDatabase();
export default database;