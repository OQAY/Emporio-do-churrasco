/**
 * Data Transformer - NASA Standard Data Transformation
 * Single Responsibility: Transform Supabase data to app format
 * File size: <150 lines (NASA compliant)
 * ALL FUNCTIONS < 60 lines (NASA compliant)
 */

class DataTransformer {
  /**
   * Transform restaurant data (NASA: pure function)
   * Function size: 20 lines (NASA compliant)
   */
  transformRestaurant(supabaseRestaurant) {
    if (!supabaseRestaurant) {
      return this.getDefaultRestaurant();
    }

    return {
      name: supabaseRestaurant.name,
      logo: supabaseRestaurant.logo,
      banner: supabaseRestaurant.banner,
      theme: supabaseRestaurant.theme || {
        primaryColor: "#fb923c",
        secondaryColor: "#f97316"
      }
    };
  }

  /**
   * Transform categories (NASA: pure function)
   * Function size: 15 lines (NASA compliant)
   */
  transformCategories(supabaseCategories) {
    if (!Array.isArray(supabaseCategories)) {
      return [];
    }

    return supabaseCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      order: cat.display_order,
      active: cat.active
    }));
  }

  /**
   * Transform products (NASA: pure function)
   * Function size: 25 lines (NASA compliant)
   */
  transformProducts(supabaseProducts) {
    if (!Array.isArray(supabaseProducts)) {
      return [];
    }

    return supabaseProducts.map(prod => ({
      id: prod.id,
      categoryId: prod.category_id,
      name: prod.name,
      description: prod.description,
      price: parseFloat(prod.price),
      originalPrice: prod.original_price ? 
        parseFloat(prod.original_price) : null,
      isOnSale: prod.is_on_sale,
      image: prod.image_url,
      active: prod.active,
      featured: prod.featured
    }));
  }

  /**
   * Transform gallery images (NASA: pure function)
   * Function size: 15 lines (NASA compliant)
   */
  transformGalleryImages(supabaseGalleryImages) {
    if (!Array.isArray(supabaseGalleryImages)) {
      return [];
    }

    return supabaseGalleryImages.map(img => ({
      id: img.id,
      name: img.name,
      url: img.url,
      size: img.size || 0,
      type: img.type || 'image/jpeg',
      tags: img.tags || []
    }));
  }

  /**
   * Transform all data (NASA: orchestration)
   * Function size: 30 lines (NASA compliant)
   */
  transformAllData(rawData) {
    const { restaurant, categories, products, galleryImages, productTags } = rawData;

    return {
      restaurant: this.transformRestaurant(restaurant),
      categories: this.transformCategories(categories),
      products: this.transformProducts(products),
      galleryImages: this.transformGalleryImages(galleryImages),
      productTags: productTags || [] // ✅ CRITICAL FIX: Include productTags
    };
  }

  /**
   * Get default restaurant (NASA: fallback)
   * Function size: 15 lines (NASA compliant)
   */
  getDefaultRestaurant() {
    return {
      name: "Imperio do Churrasco",
      logo: "IC",
      banner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80",
      theme: {
        primaryColor: "#fb923c",
        secondaryColor: "#f97316"
      }
    };
  }
}

export { DataTransformer };