// Sistema de banco de dados local usando localStorage

class Database {
  constructor() {
    this.storageKey = "restaurantData";
    this.initializeDatabase();
  }

  initializeDatabase() {
    const existingData = this.getData();
    if (!existingData) {
      const initialData = {
        restaurant: {
          name: "Imperio do Churrasco",
          logo: "IC",
          banner: "./images/banners/imperio-banner.png",
          theme: {
            primaryColor: "#fb923c",
            secondaryColor: "#f97316",
          },
        },
        categories: [
          { id: "cat1", name: "Especiais da Casa", order: 1, active: true },
          { id: "cat2", name: "Entradas", order: 2, active: true },
          { id: "cat3", name: "Petiscos", order: 3, active: true },
          {
            id: "cat4",
            name: "Pratos com Acompanhamento",
            order: 4,
            active: true,
          },
          {
            id: "cat5",
            name: "Executivos (Pratos Individuais)",
            order: 5,
            active: true,
          },
          { id: "cat6", name: "Porcoes Adicionais", order: 6, active: true },
          { id: "cat7", name: "Bebidas", order: 7, active: true },
        ],
        products: [
          // Especiais da Casa
          {
            id: "prod1",
            categoryId: "cat1",
            name: "Pao com Picanha",
            description:
              "Levemente tostado na chapa, recheado com suculentas fatias de picanha, queijo derretido e o exclusivo molho especial da casa.",
            price: 45.9,
            originalPrice: null, // Preço original (quando em promoção)
            isOnSale: false, // Se está em promoção
            image: "./images/produtos/steak-sandwich-1.jpg",
            active: true,
            featured: true,
            tags: ["destaque", "especial-chef"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod2",
            categoryId: "cat1",
            name: "Pao com File",
            description:
              "Levemente tostado na chapa, recheado com suculentas fatias de file, queijo derretido e o exclusivo molho especial da casa.",
            price: 32.9, // Preço promocional
            originalPrice: 42.9, // Preço original
            isOnSale: true, // Em promoção
            image: "./images/produtos/steak-sandwich-2.jpg",
            active: true,
            featured: true,
            tags: ["destaque", "promocao"],
            createdAt: new Date().toISOString(),
          },

          // Entradas
          {
            id: "prod3",
            categoryId: "cat2",
            name: "Tabua de Frios",
            description: "Queijos, salame, azeitonas e variacoes.",
            price: 38.0,
            image: "./images/produtos/steak-knife.jpg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod4",
            categoryId: "cat2",
            name: "Queijo com Goiabada",
            description:
              "Combinacao classica e deliciosa de queijo e goiabada.",
            price: 24.9,
            image: "./images/produtos/picanha-grill.jpg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod5",
            categoryId: "cat2",
            name: "Bolinho de Camarao",
            description:
              "Crocante por fora e macio por dentro, recheado com camarao.",
            price: 32.9,
            image: "./images/produtos/bolinho-camarao.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod6",
            categoryId: "cat2",
            name: "Batata com Queijo",
            description: "Batatas fritas cobertas com queijo derretido.",
            price: 26.9,
            image: "./images/produtos/batata-com-queijo.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },

          // Petiscos
          {
            id: "prod7",
            categoryId: "cat3",
            name: "Isca de Frango Empanado",
            description: "Frango crocante acompanhado de molho rose.",
            price: 28.9,
            image: "./images/produtos/frango-empanado.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod8",
            categoryId: "cat3",
            name: "Calabresa com Fritas",
            description: "Batata, cebola, molho rose e farofa.",
            price: 34.9,
            image: "./images/produtos/calabresa-fritas.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod9",
            categoryId: "cat3",
            name: "Camarao Empanado",
            description: "Camaroes crocantes servidos com molho rose.",
            price: 45.9,
            image: "./images/produtos/camarao-empanado.svg",
            active: true,
            featured: true,
            tags: ["destaque", "mais-vendido"],
            createdAt: new Date().toISOString(),
          },

          // Pratos com Acompanhamento
          {
            id: "prod10",
            categoryId: "cat4",
            name: "Picanha na Chapa",
            description:
              "Picanha, queijo, batata frita, farofa, vinagrete e baiao de dois.",
            price: 89.9,
            image: "./images/produtos/picanha-na-chapa.svg",
            active: true,
            featured: true,
            tags: ["destaque", "especial-chef"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod11",
            categoryId: "cat4",
            name: "File com Fritas",
            description:
              "File, batata, cebola, farofa, vinagrete e baiao de dois.",
            price: 78.9,
            image: "./images/produtos/file-com-fritas.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },

          // Executivos
          {
            id: "prod12",
            categoryId: "cat5",
            name: "Executivo de Picanha",
            description:
              "Picanha + baiao de dois, farofa, salada e pao de alho.",
            price: 52.9,
            image: "./images/produtos/executivo-picanha.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod13",
            categoryId: "cat5",
            name: "Executivo de File",
            description: "File + baiao de dois, farofa, salada e pao de alho.",
            price: 48.9,
            image: "./images/produtos/executivo-file.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },

          // Porcoes Adicionais
          {
            id: "prod14",
            categoryId: "cat6",
            name: "Baiao de Dois",
            description: "Porcao adicional de baiao de dois.",
            price: 18.9,
            image: "./images/produtos/baiao-de-dois.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod15",
            categoryId: "cat6",
            name: "Farofa",
            description: "Porcao adicional de farofa.",
            price: 12.9,
            image: "./images/produtos/placeholder.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod16",
            categoryId: "cat6",
            name: "Vinagrete",
            description: "Porcao adicional de vinagrete.",
            price: 8.9,
            image: "./images/produtos/placeholder.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },

          // Bebidas
          {
            id: "prod17",
            categoryId: "cat7",
            name: "Refrigerante 2L",
            description: "Coca-Cola, Guarana, Fanta - 2 litros.",
            price: 12.9,
            image: "./images/produtos/bebidas.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod18",
            categoryId: "cat7",
            name: "Cerveja Heineken",
            description: "Cerveja importada gelada - Long neck.",
            price: 8.9,
            image: "./images/produtos/bebidas.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod19",
            categoryId: "cat7",
            name: "Suco Natural",
            description: "Laranja, acerola, caju - 500ml.",
            price: 6.9,
            image: "./images/produtos/bebidas.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "prod20",
            categoryId: "cat7",
            name: "Agua Mineral",
            description: "Agua mineral gelada - 500ml.",
            price: 4.9,
            image: "./images/produtos/bebidas.svg",
            active: true,
            featured: false,
            createdAt: new Date().toISOString(),
          },
        ],
        gallery: [
          // Galeria de imagens reutilizáveis
          {
            id: "img1",
            name: "Pão com Picanha",
            url: "./images/produtos/pao-com-picanha.svg",
            size: 5120,
            type: "image/svg+xml",
            tags: ["sanduiche", "picanha", "especial"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img2",
            name: "Pão com Filé",
            url: "./images/produtos/pao-com-file.svg",
            size: 5120,
            type: "image/svg+xml",
            tags: ["sanduiche", "file", "especial"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img3",
            name: "Tábua de Frios",
            url: "./images/produtos/tabua-de-frios.svg",
            size: 5120,
            type: "image/svg+xml",
            tags: ["entrada", "queijo", "frios"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img4",
            name: "Queijo com Goiabada",
            url: "./images/produtos/queijo-com-goiabada.svg",
            size: 5120,
            type: "image/svg+xml",
            tags: ["sobremesa", "doce", "romeu-julieta"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img5",
            name: "Bolinho de Camarão",
            url: "./images/produtos/bolinho-camarao.svg",
            size: 287234,
            type: "image/jpeg",
            tags: ["entrada", "camarao", "bolinho"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img6",
            name: "Batata com Queijo",
            url: "./images/produtos/batata-com-queijo.svg",
            size: 256789,
            type: "image/jpeg",
            tags: ["entrada", "batata", "queijo"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img7",
            name: "Frango Empanado",
            url: "./images/produtos/frango-empanado.svg",
            size: 321654,
            type: "image/jpeg",
            tags: ["petisco", "frango", "empanado"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img8",
            name: "Calabresa com Fritas",
            url: "./images/produtos/calabresa-fritas.svg",
            size: 345123,
            type: "image/jpeg",
            tags: ["petisco", "calabresa", "batata"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img9",
            name: "Camarão Empanado",
            url: "./images/produtos/camarao-empanado.svg",
            size: 378456,
            type: "image/jpeg",
            tags: ["petisco", "camarao", "empanado", "destaque"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img10",
            name: "Picanha na Chapa",
            url: "./images/produtos/picanha-na-chapa.svg",
            size: 445789,
            type: "image/jpeg",
            tags: ["prato-principal", "picanha", "chapa", "destaque"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img11",
            name: "Filé com Fritas",
            url: "./images/produtos/file-com-fritas.svg",
            size: 412356,
            type: "image/jpeg",
            tags: ["prato-principal", "file", "batata"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img12",
            name: "Prato Executivo",
            url: "./images/produtos/executivo-picanha.svg",
            size: 367891,
            type: "image/jpeg",
            tags: ["executivo", "prato-completo", "individual"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img13",
            name: "Executivo com Salada",
            url: "./images/produtos/executivo-file.svg",
            size: 334567,
            type: "image/jpeg",
            tags: ["executivo", "salada", "saudavel"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img14",
            name: "Baião de Dois",
            url: "./images/produtos/baiao-de-dois.svg",
            size: 289123,
            type: "image/jpeg",
            tags: ["acompanhamento", "baiao", "feijao"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img15",
            name: "Farofa Especial",
            url: "./images/produtos/placeholder.svg",
            size: 198765,
            type: "image/jpeg",
            tags: ["acompanhamento", "farofa"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img16",
            name: "Vinagrete Fresh",
            url: "./images/produtos/placeholder.svg",
            size: 165432,
            type: "image/jpeg",
            tags: ["acompanhamento", "salada", "vinagrete"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img17",
            name: "Refrigerantes Variados",
            url: "./images/produtos/bebidas.svg",
            size: 223456,
            type: "image/jpeg",
            tags: ["bebida", "refrigerante", "gelado"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img18",
            name: "Cerveja Gelada",
            url: "./images/produtos/bebidas.svg",
            size: 312789,
            type: "image/jpeg",
            tags: ["bebida", "cerveja", "alcoolica"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img19",
            name: "Suco Natural",
            url: "./images/produtos/bebidas.svg",
            size: 187654,
            type: "image/jpeg",
            tags: ["bebida", "suco", "natural", "saudavel"],
            createdAt: new Date().toISOString(),
          },
          {
            id: "img20",
            name: "Água Mineral",
            url: "./images/produtos/bebidas.svg",
            size: 156789,
            type: "image/jpeg",
            tags: ["bebida", "agua", "mineral"],
            createdAt: new Date().toISOString(),
          },
        ],
        productTags: [
          { id: "destaque", name: "Destaque", color: "#f59e0b", icon: "⭐" },
          { id: "mais-vendido", name: "Mais Vendido", color: "#ef4444", icon: "🔥" },
          { id: "especial-chef", name: "Especial do Chef", color: "#8b5cf6", icon: "👨‍🍳" },
          { id: "novo", name: "Novo", color: "#10b981", icon: "✨" },
          { id: "promocao", name: "Promoção", color: "#f97316", icon: "💰" },
          { id: "vegano", name: "Vegano", color: "#22c55e", icon: "🌱" },
          { id: "vegetariano", name: "Vegetariano", color: "#84cc16", icon: "🥬" },
          { id: "sem-gluten", name: "Sem Glúten", color: "#06b6d4", icon: "🌾" }
        ],
        admin: {
          username: "admin",
          password: "admin123", // Em producao, usar hash
        },
      };
      this.saveData(initialData);
    }
  }

  getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    window.dispatchEvent(new Event("databaseUpdated"));
  }

  // Restaurant methods
  getRestaurant() {
    return this.getData().restaurant;
  }

  updateRestaurant(restaurantData) {
    const data = this.getData();
    data.restaurant = { ...data.restaurant, ...restaurantData };
    this.saveData(data);
    return data.restaurant;
  }

  // Category methods
  getCategories(activeOnly = false) {
    const data = this.getData();
    let categories = data.categories || [];
    if (activeOnly) {
      categories = categories.filter((cat) => cat.active);
    }
    return categories.sort((a, b) => a.order - b.order);
  }

  getCategoryById(id) {
    const categories = this.getCategories();
    return categories.find((cat) => cat.id === id);
  }

  addCategory(category) {
    const data = this.getData();
    const newCategory = {
      id: "cat" + Date.now(),
      order: data.categories.length + 1,
      active: true,
      ...category,
    };
    data.categories.push(newCategory);
    this.saveData(data);
    return newCategory;
  }

  updateCategory(id, updates) {
    const data = this.getData();
    const index = data.categories.findIndex((cat) => cat.id === id);
    if (index !== -1) {
      data.categories[index] = { ...data.categories[index], ...updates };
      this.saveData(data);
      return data.categories[index];
    }
    return null;
  }

  deleteCategory(id) {
    const data = this.getData();
    data.categories = data.categories.filter((cat) => cat.id !== id);
    // Remove produtos da categoria
    data.products = data.products.filter((prod) => prod.categoryId !== id);
    this.saveData(data);
    return true;
  }

  // Product methods
  getProducts(filters = {}) {
    const data = this.getData();
    let products = data.products || [];

    if (filters.categoryId) {
      products = products.filter(
        (prod) => prod.categoryId === filters.categoryId
      );
    }

    if (filters.activeOnly) {
      products = products.filter((prod) => prod.active);
    }

    if (filters.featured) {
      products = products.filter((prod) => prod.featured);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(
        (prod) =>
          prod.name.toLowerCase().includes(searchLower) ||
          prod.description?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar: primeiro em destaque, depois por ordem de categoria, depois por ordem do produto
    return products.sort((a, b) => {
      // Primeiro critério: featured (em destaque primeiro)
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      // Segundo critério: ordem da categoria
      const categoryA = this.getCategoryById(a.categoryId);
      const categoryB = this.getCategoryById(b.categoryId);
      const categoryOrderA = categoryA ? categoryA.order : 999;
      const categoryOrderB = categoryB ? categoryB.order : 999;

      if (categoryOrderA !== categoryOrderB) return categoryOrderA - categoryOrderB;

      // Terceiro critério: ordem do produto dentro da categoria
      const productOrderA = a.order || 999;
      const productOrderB = b.order || 999;
      
      if (productOrderA !== productOrderB) return productOrderA - productOrderB;

      // Quarto critério: data de criação (mais recente primeiro)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find((prod) => prod.id === id);
  }

  addProduct(product) {
    const data = this.getData();
    
    // Calculate next order for this category
    const categoryProducts = data.products.filter(p => p.categoryId === product.categoryId);
    const maxOrder = categoryProducts.length > 0 ? Math.max(...categoryProducts.map(p => p.order || 0)) : 0;
    
    const newProduct = {
      id: "prod" + Date.now(),
      active: true,
      featured: false,
      tags: [],
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      ...product,
    };
    data.products.push(newProduct);
    this.saveData(data);
    return newProduct;
  }

  updateProduct(id, updates) {
    const data = this.getData();
    const index = data.products.findIndex((prod) => prod.id === id);
    if (index !== -1) {
      data.products[index] = { ...data.products[index], ...updates };
      this.saveData(data);
      return data.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const data = this.getData();
    data.products = data.products.filter((prod) => prod.id !== id);
    this.saveData(data);
    return true;
  }

  // Reorder products within a category
  reorderProducts(categoryId, productIds) {
    const data = this.getData();
    
    // Update order for each product in the category
    productIds.forEach((productId, index) => {
      const productIndex = data.products.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        data.products[productIndex].order = index + 1;
      }
    });
    
    this.saveData(data);
    return true;
  }

  // Auth methods
  authenticate(username, password) {
    const data = this.getData();
    if (data.admin.username === username && data.admin.password === password) {
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("authTime", new Date().toISOString());
      return true;
    }
    return false;
  }

  isAuthenticated() {
    const auth = sessionStorage.getItem("isAuthenticated");
    const authTime = sessionStorage.getItem("authTime");

    if (auth === "true" && authTime) {
      // Sessao expira em 4 horas
      const fourHours = 4 * 60 * 60 * 1000;
      const timeDiff = new Date() - new Date(authTime);

      if (timeDiff < fourHours) {
        return true;
      } else {
        this.logout();
        return false;
      }
    }
    return false;
  }

  logout() {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("authTime");
  }

  // Statistics
  getStatistics() {
    const data = this.getData();
    return {
      totalProducts: data.products.length,
      activeProducts: data.products.filter((p) => p.active).length,
      totalCategories: data.categories.length,
      featuredProducts: data.products.filter((p) => p.featured).length,
    };
  }

  // Image handling
  saveImage(file) {
    return new Promise((resolve, reject) => {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        reject(new Error("Arquivo muito grande. Máximo 5MB permitido."));
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        reject(
          new Error("Tipo de arquivo não suportado. Use JPG, PNG, WebP ou SVG.")
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(
          `Imagem processada: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`
        );
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject(new Error("Erro ao ler arquivo de imagem"));
      };
      reader.readAsDataURL(file);
    });
  }

  // Gallery methods
  getGalleryImages(search = "") {
    const data = this.getData();
    let images = data.gallery || [];

    if (search) {
      const searchLower = search.toLowerCase();
      images = images.filter(
        (img) =>
          (img.name && img.name.toLowerCase().includes(searchLower)) ||
          (img.tags &&
            img.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
      );
    }

    return images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  getAllTags() {
    const data = this.getData();
    const images = data.gallery || [];
    const products = data.products || [];
    const allTags = new Set();
    
    // Collect tags from gallery
    images.forEach(img => {
      if (img.tags && Array.isArray(img.tags)) {
        img.tags.forEach(tag => allTags.add(tag.toLowerCase()));
      }
    });
    
    // Add common food tags
    const commonTags = [
      'picanha', 'file', 'churrasco', 'grelhado', 'carne', 
      'frango', 'camarao', 'peixe', 'bebida', 'sobremesa',
      'entrada', 'petisco', 'executivo', 'destaque', 'promoção',
      'vegetariano', 'vegano', 'sem-gluten', 'especial', 'chef',
      'tradicional', 'novo', 'quente', 'frio', 'doce', 'salgado'
    ];
    
    commonTags.forEach(tag => allTags.add(tag));
    
    return Array.from(allTags).sort();
  }

  addGalleryImage(imageData) {
    // Validate required fields
    if (!imageData.url) {
      throw new Error("URL da imagem é obrigatória");
    }

    // Check if image already exists
    if (this.imageExistsInGallery(imageData.url)) {
      console.log("Imagem já existe na galeria, pulando duplicata");
      return null;
    }

    const data = this.getData();

    // Ensure gallery array exists
    if (!data.gallery) {
      data.gallery = [];
    }

    // Generate smart name if not provided
    let imageName = imageData.name || "Imagem sem nome";

    // Ensure unique name
    const existingNames = data.gallery.map((img) => img.name);
    let counter = 1;
    let finalName = imageName;
    while (existingNames.includes(finalName)) {
      finalName = `${imageName} (${counter})`;
      counter++;
    }

    const newImage = {
      id: "img" + Date.now() + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      name: finalName,
      url: imageData.url,
      size: imageData.size || 0,
      type: imageData.type || "image/jpeg",
      tags: imageData.tags || [],
      // Additional metadata
      addedBy: "auto-upload", // Can be 'manual' or 'auto-upload'
      category: this.extractCategoryFromTags(imageData.tags),
    };

    data.gallery = data.gallery || [];
    data.gallery.push(newImage);
    this.saveData(data);

    console.log("Nova imagem adicionada à galeria:", finalName);
    return newImage;
  }

  extractCategoryFromTags(tags = []) {
    const categoryMap = {
      "especiais da casa": ["picanha", "file", "especial"],
      entradas: ["entrada", "frios", "queijo", "bolinho"],
      petiscos: ["petisco", "frango", "camarao", "empanado"],
      "pratos principais": ["chapa", "executivo", "prato-principal"],
      bebidas: ["bebida", "refrigerante", "cerveja", "gelado"],
    };

    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some((keyword) => tags.includes(keyword))) {
        return category;
      }
    }

    return "geral";
  }

  deleteGalleryImage(imageId) {
    const data = this.getData();
    data.gallery = data.gallery.filter((img) => img.id !== imageId);
    this.saveData(data);
    return true;
  }

  getGalleryImageById(imageId) {
    const images = this.getGalleryImages();
    return images.find((img) => img.id === imageId);
  }
  
  updateGalleryImage(imageId, updates) {
    const data = this.getData();
    const index = data.gallery.findIndex((img) => img.id === imageId);
    if (index !== -1) {
      data.gallery[index] = { ...data.gallery[index], ...updates };
      this.saveData(data);
      return data.gallery[index];
    }
    return null;
  }

  imageExistsInGallery(imageUrl) {
    const images = this.getGalleryImages();
    return images.some((img) => img.url === imageUrl);
  }

  // Product Tags methods
  getProductTags() {
    const data = this.getData();
    return data.productTags || [];
  }

  addProductTag(tag) {
    const data = this.getData();
    if (!data.productTags) {
      data.productTags = [];
    }
    
    const newTag = {
      id: tag.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name: tag.name,
      color: tag.color || '#6b7280',
      icon: tag.icon || '🏷️',
      createdAt: new Date().toISOString()
    };
    
    // Check if tag already exists
    const existingTag = data.productTags.find(t => t.id === newTag.id);
    if (existingTag) {
      throw new Error('Tag já existe');
    }
    
    data.productTags.push(newTag);
    this.saveData(data);
    return newTag;
  }

  updateProductTag(id, updates) {
    const data = this.getData();
    const index = data.productTags.findIndex(tag => tag.id === id);
    if (index !== -1) {
      data.productTags[index] = { ...data.productTags[index], ...updates };
      this.saveData(data);
      return data.productTags[index];
    }
    return null;
  }

  deleteProductTag(id) {
    const data = this.getData();
    data.productTags = data.productTags.filter(tag => tag.id !== id);
    
    // Remove tag from all products
    data.products.forEach(product => {
      if (product.tags && product.tags.includes(id)) {
        product.tags = product.tags.filter(tagId => tagId !== id);
      }
    });
    
    this.saveData(data);
    return true;
  }

  reorderCategories(categoryIds) {
    const data = this.getData();
    
    // Update display order for each category
    categoryIds.forEach((categoryId, index) => {
      const category = data.categories.find(cat => cat.id === categoryId);
      if (category) {
        category.displayOrder = index;
        category.order = index + 1; // Atualizar também o campo order
      }
    });
    
    this.saveData(data);
    return true;
  }

  // Export/Import data
  exportData() {
    const data = this.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      return false;
    }
  }
}

// Exportar instancia unica
const database = new Database();
export default database;
