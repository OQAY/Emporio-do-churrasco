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
        `categories?restaurant_id=eq.${restaurantId}&active=eq.true&order=display_order.asc&select=*`
      );
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }

  /**
   * Fetch products (NASA: single responsibility)
   * Function size: 15 lines (NASA compliant)
   */
  async fetchProducts() {
    try {
      const restaurantId = this.client.getRestaurantId();
      const data = await this.client.makeRequest(
        `products?restaurant_id=eq.${restaurantId}&active=eq.true&order=display_order.asc&select=*`
      );
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
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
   * Fetch only essential data for public menu (NASA: public optimization)
   * Function size: 25 lines (NASA compliant)
   */
  async fetchPublicData() {
    console.log('🔄 Fetching PUBLIC data from Supabase (optimized)...');
    
    try {
      // Only fetch what's needed for public menu
      const [restaurant, categories, products, productTags] = await Promise.all([
        this.fetchRestaurant(),
        this.fetchCategories(), 
        this.fetchProducts(),
        this.fetchProductTags() // ✅ CRITICAL FIX: Include productTags for tag display
      ]);
      
      const result = {
        restaurant,
        categories,
        products,
        galleryImages: [], // Not needed for public menu
        productTags       // ✅ CRITICAL FIX: Include productTags
      };
      
      console.log('✅ PUBLIC data loaded:', {
        restaurant: restaurant ? 'OK' : 'Missing',
        categories: categories?.length || 0,
        products: products?.length || 0,
        productTags: productTags?.length || 0
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Failed to fetch public data:', error);
      throw error;
    }
  }

  async fetchAllData() {
    console.log('🔄 Fetching data from Supabase...');
    
    try {
      // Parallel fetch for performance
      const [restaurant, categories, products, galleryImages, productTags] = await Promise.all([
        this.fetchRestaurant(),
        this.fetchCategories(),
        this.fetchProducts(),
        this.fetchGalleryImages(),
        this.fetchProductTags()
      ]);

      console.log('✅ Data fetched:', {
        restaurant: restaurant?.name || 'N/A',
        categories: categories.length,
        products: products.length,
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