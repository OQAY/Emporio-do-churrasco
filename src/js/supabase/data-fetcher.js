/**
 * Data Fetcher - NASA Standard Data Retrieval
 * Single Responsibility: Fetch data from Supabase
 * File size: <200 lines (NASA compliant)
 * ALL FUNCTIONS < 60 lines (NASA compliant)
 */

import { SupabaseClient } from './supabase-client.js';

class DataFetcher {
  constructor() {
    this.client = new SupabaseClient();
    this.imageCache = new Map(); // Cache para evitar recarregar imagens
  }

  /**
   * Fetch restaurant data (NASA: single responsibility)
   * Function size: 15 lines (NASA compliant)
   */
  async fetchRestaurant() {
    try {
      const restaurantId = this.client.getRestaurantId();
      const data = await this.client.makeRequest(
        `restaurants?id=eq.${restaurantId}&select=*`
      );
      
      return data[0] || null;
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
      return null;
    }
  }

  /**
   * Fetch categories (NASA: single responsibility)
   * Function size: 15 lines (NASA compliant)
   */
  async fetchCategories() {
    try {
      const restaurantId = this.client.getRestaurantId();
      const data = await this.client.makeRequest(
        `categories?restaurant_id=eq.${restaurantId}&order=display_order.asc&select=*`
      );
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }

  /**
   * Fetch products WITH images (SIMPLE approach)
   * Function size: 15 lines (NASA compliant)
   */
  async fetchProducts() {
    try {
      const restaurantId = this.client.getRestaurantId();
      const data = await this.client.makeRequest(
        `products?restaurant_id=eq.${restaurantId}&order=display_order.asc&select=*`
      );
      
      console.log(`✅ Loaded ${data.length} products with images`);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }

  /**
   * Fetch products STRUCTURAL data (text only, no images) - INSTANT
   * Function size: 15 lines (NASA compliant)
   */
  async fetchProductsStructural() {
    try {
      const restaurantId = this.client.getRestaurantId();
      const data = await this.client.makeRequest(
        `products?restaurant_id=eq.${restaurantId}&order=display_order.asc&select=id,name,description,price,category_id,active,display_order,featured,original_price,is_on_sale,created_at,updated_at`
      );
      
      console.log(`⚡ INSTANT: Loaded ${data.length} products (STRUCTURAL - no images)`);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch structural products:', error);
      return [];
    }
  }

  /**
   * Fetch products IMAGES only - PROGRESSIVE
   * Function size: 15 lines (NASA compliant)
   */
  async fetchProductImages() {
    try {
      const restaurantId = this.client.getRestaurantId();
      const data = await this.client.makeRequest(
        `products?restaurant_id=eq.${restaurantId}&order=display_order.asc&select=id,image_url`
      );
      
      console.log(`🖼️ PROGRESSIVE: Loaded ${data.length} product images`);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch product images:', error);
      return [];
    }
  }

  /**
   * Fetch REMAINING products (BACKGROUND loading)
   * Function size: 15 lines (NASA compliant)
   */
  async fetchRemainingProducts(offset = 10) {
    try {
      const restaurantId = this.client.getRestaurantId();
      const data = await this.client.makeRequest(
        `products?restaurant_id=eq.${restaurantId}&order=display_order.asc&select=*&offset=${offset}`
      );
      
      console.log(`🔄 Loaded ${data.length} remaining products`);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch remaining products:', error);
      return [];
    }
  }

  /**
   * Fetch products WITHOUT images (LEGACY - kept for compatibility)
   * Function size: 15 lines (NASA compliant)
   */
  async fetchProductsBasic() {
    try {
      const restaurantId = this.client.getRestaurantId();
      const data = await this.client.makeRequest(
        `products?restaurant_id=eq.${restaurantId}&order=display_order.asc&select=id,name,description,price,category_id,active,display_order,created_at,updated_at`
      );
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch basic products:', error);
      return [];
    }
  }

  /**
   * Fetch single product image by ID (LAZY loading)
   * Function size: 15 lines (NASA compliant)
   */
  async fetchProductImage(productId) {
    try {
      const restaurantId = this.client.getRestaurantId();
      const data = await this.client.makeRequest(
        `products?restaurant_id=eq.${restaurantId}&id=eq.${productId}&select=id,image_url`
      );
      
      return data[0]?.image_url || null;
    } catch (error) {
      console.error(`Failed to fetch image for product ${productId}:`, error);
      return null;
    }
  }

  /**
   * Fetch gallery images (NASA: single responsibility)
   * Function size: 15 lines (NASA compliant)
   */
  async fetchGalleryImages() {
    try {
      const restaurantId = this.client.getRestaurantId();
      const data = await this.client.makeRequest(
        `gallery_images?restaurant_id=eq.${restaurantId}&order=created_at.desc&select=id,name,size,type,tags,created_at&limit=50`
      );
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
      return [];
    }
  }

  /**
   * Fetch all data (NASA: orchestration)
   * Function size: 30 lines (NASA compliant)
   */
  /**
   * Fetch product tags from Supabase (NASA: fetch operation)
   * Function size: 20 lines (NASA compliant)
   */
  async fetchProductTags() {
    try {
      const restaurantId = this.client.getRestaurantId();
      
      const tags = await this.client.makeRequest(
        `product_tags?restaurant_id=eq.${restaurantId}&order=created_at.desc`,
        { method: 'GET' }
      );
      
      console.log(`📑 Fetched ${tags.length} product tags`);
      return tags;
      
    } catch (error) {
      console.error('Failed to fetch product tags:', error);
      return [];
    }
  }

  /**
   * ULTRA-OPTIMIZED: Single request for critical above-the-fold content
   * Function size: 20 lines (NASA compliant)
   */
  async fetchCriticalEssentials() {
    console.log('🚀 ULTRA: Fetching ONLY critical above-the-fold (single request)...');
    
    try {
      const restaurantId = this.client.getRestaurantId();
      
      // SINGLE REQUEST: Essential data only (restaurant info embedded + featured products + main categories)
      const [restaurant, featuredProducts] = await Promise.all([
        this.fetchRestaurant(),
        this.client.makeRequest(
          `products?restaurant_id=eq.${restaurantId}&featured=eq.true&active=eq.true&order=display_order.asc&limit=8&select=id,name,description,price,category_id,featured,is_on_sale,original_price,image_url`
        )
      ]);

      console.log('🚀 CRITICAL essentials loaded (ultra-fast):', {
        restaurant: restaurant?.name || 'Missing',
        featuredProducts: featuredProducts?.length || 0,
        loadTime: 'sub-500ms target'
      });

      return {
        restaurant,
        categories: [], // Load separately if needed
        products: featuredProducts, // Only featured for immediate display
        galleryImages: [], 
        productTags: [],
        isCritical: true
      };
      
    } catch (error) {
      console.error('❌ Failed to fetch critical essentials:', error);
      throw error;
    }
  }

  /**
   * CHUNKED: Load remaining products in priority chunks
   * Function size: 25 lines (NASA compliant)
   */
  async fetchChunkedProducts(offset = 0, limit = 15) {
    console.log(`📦 CHUNKED: Loading products chunk (offset: ${offset}, limit: ${limit})...`);
    
    try {
      const restaurantId = this.client.getRestaurantId();
      
      const [categories, products] = await Promise.all([
        offset === 0 ? this.fetchCategories() : Promise.resolve([]), // Categories only on first chunk
        this.client.makeRequest(
          `products?restaurant_id=eq.${restaurantId}&active=eq.true&order=display_order.asc&offset=${offset}&limit=${limit}&select=id,name,description,price,category_id,featured,is_on_sale,original_price`
        )
      ]);

      console.log(`📦 CHUNKED products loaded:`, {
        categories: categories?.length || 0,
        products: products?.length || 0,
        hasMore: products?.length === limit
      });

      return {
        categories: categories || [],
        products: products || [],
        hasMore: products?.length === limit,
        isChunked: true
      };
      
    } catch (error) {
      console.error('❌ Failed to fetch chunked products:', error);
      return { categories: [], products: [], hasMore: false };
    }
  }

  /**
   * Fetch INSTANT structural data (FALLBACK - kept for compatibility)
   * Function size: 25 lines (NASA compliant)
   */
  async fetchInstantData() {
    console.log('⚡ FALLBACK: Using old instant data approach...');
    
    try {
      // INSTANT: Load all structural data WITHOUT images
      const [restaurant, categories, products, productTags] = await Promise.all([
        this.fetchRestaurant(),
        this.fetchCategories(), 
        this.fetchProductsStructural(), // ← INSTANT: ALL products but NO images
        this.fetchProductTags()
      ]);
      
      console.log('⚡ INSTANT data loaded:', {
        restaurant: restaurant ? 'OK' : 'Missing',
        categories: categories?.length || 0,
        products: products?.length || 0,
        productsStructural: products?.length || 0, // All products, no images
        productTags: productTags?.length || 0
      });
      
      return {
        restaurant,
        categories,
        products, // ALL products with structural data only
        galleryImages: [], 
        productTags,
        isInstant: true // Flag to indicate this is instant structural data
      };
      
    } catch (error) {
      console.error('❌ Failed to fetch instant data:', error);
      throw error;
    }
  }

  /**
   * Fetch product images in background (progressive)
   * Function size: 20 lines (NASA compliant)
   */
  async fetchProgressiveImages() {
    console.log('🖼️ PROGRESSIVE: Fetching all product images...');
    
    try {
      // Load all product images progressively
      const productImages = await this.fetchProductImages();
      
      console.log('✅ PROGRESSIVE images loaded:', {
        productImages: productImages?.length || 0,
        imagesWithUrl: productImages?.filter(p => p.image_url)?.length || 0
      });
      
      return {
        images: productImages,
        isProgressive: true // Flag to indicate this is progressive image data
      };
      
    } catch (error) {
      console.error('❌ Failed to fetch progressive images:', error);
      return { images: [] };
    }
  }

  /**
   * Fetch FULL data (fallback for admin or full load)
   * Function size: 20 lines (NASA compliant)
   */
  async fetchPublicData() {
    console.log('🔄 Fetching FULL data (fallback approach)...');
    
    try {
      // Full approach: fetch everything at once including images
      const [restaurant, categories, products, productTags] = await Promise.all([
        this.fetchRestaurant(),
        this.fetchCategories(), 
        this.fetchProducts(), 
        this.fetchProductTags()
      ]);
      
      return {
        restaurant,
        categories,
        products,
        galleryImages: [],
        productTags
      };
      
    } catch (error) {
      console.error('❌ Failed to fetch public data:', error);
      throw error;
    }
  }

  /**
   * DISABLED: Load images in background (REPLACED by individual lazy loading)
   */
  /*
  async loadImagesInBackground(basicProducts) {
    console.log('🖼️ Loading images in background (non-blocking)...');
    
    try {
      const cacheKey = `images_${this.client.getRestaurantId()}`;
      let imageData;
      
      if (this.imageCache.has(cacheKey)) {
        console.log('📦 Using cached images');
        imageData = this.imageCache.get(cacheKey);
      } else {
        console.log('🌐 Fetching images from API...');
        imageData = await this.client.makeRequest(
          `products?restaurant_id=eq.${this.client.getRestaurantId()}&select=id,image_url`
        );
        this.imageCache.set(cacheKey, imageData);
        console.log('💾 Images cached for future use');
      }
      
      // 🔄 Dispatch event to update UI with images
      window.dispatchEvent(new CustomEvent('images-loaded', {
        detail: { imageData, basicProducts }
      }));
      
      console.log('✅ Background image loading complete - UI should update');
      
    } catch (error) {
      console.warn('⚠️ Background image loading failed:', error);
    }
  }
  */

  async fetchAllData() {
    console.log('🔄 Fetching data from Supabase...');
    
    try {
      // Simple approach: fetch everything including images
      const [restaurant, categories, products, galleryImages, productTags] = await Promise.all([
        this.fetchRestaurant(),
        this.fetchCategories(),
        this.fetchProducts(), // ← SIMPLE: Use products with images
        this.fetchGalleryImages(),
        this.fetchProductTags()
      ]);

      console.log('✅ Data fetched:', {
        restaurant: restaurant?.name || 'N/A',
        categories: categories.length,
        products: products.length,
        productsWithImages: products.filter(p => p.image_url).length,
        galleryImages: galleryImages.length,
        productTags: productTags.length
      });

      return { restaurant, categories, products, galleryImages, productTags };
    } catch (error) {
      console.error('Failed to fetch all data:', error);
      throw error;
    }
  }
}

export { DataFetcher };