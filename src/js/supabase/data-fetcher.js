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
   * Fetch products WITHOUT images (FAST loading)
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
        `gallery_images?restaurant_id=eq.${restaurantId}&order=created_at.desc&select=*`
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
   * Fetch public data with images (SIMPLIFIED approach)
   * Function size: 20 lines (NASA compliant)
   */
  async fetchPublicData() {
    console.log('🔄 Fetching PUBLIC data with images (simple approach)...');
    
    try {
      // Simple approach: fetch everything at once including images
      const [restaurant, categories, products, productTags] = await Promise.all([
        this.fetchRestaurant(),
        this.fetchCategories(), 
        this.fetchProducts(), // ← SIMPLE: fetch products WITH images
        this.fetchProductTags()
      ]);
      
      console.log('✅ PUBLIC data loaded with images:', {
        restaurant: restaurant ? 'OK' : 'Missing',
        categories: categories?.length || 0,
        products: products?.length || 0,
        productsWithImages: products?.filter(p => p.image_url)?.length || 0,
        productTags: productTags?.length || 0
      });
      
      return {
        restaurant,
        categories,
        products,
        galleryImages: [], // Not needed for public menu
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