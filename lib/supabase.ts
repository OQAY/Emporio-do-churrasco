/**
 * Supabase Client - TypeScript version preserving EXACT original logic
 * Converted from database-nasa.js - SAME functionality, SAME behavior
 */

import { createClient } from '@supabase/supabase-js'
import { Category, Product, DatabaseData } from './types'

// Configuração Supabase - MESMAS URLs e chaves
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

class DatabaseNASA {
  private adminMode: boolean
  private isLoading: boolean
  private cache: Map<string, any>

  constructor(adminMode = false) {
    this.adminMode = adminMode
    this.isLoading = false
    this.cache = new Map()
    
    console.log(
      `🚀 DatabaseNASA initialized - Mode: ${
        adminMode ? "ADMIN (full data)" : "PUBLIC (optimized)"
      }`
    )
  }

  /**
   * Load public data only - SAME logic as original
   * Function size: <50 lines (NASA compliant)
   */
  async loadPublicData(): Promise<DatabaseData> {
    if (this.isLoading) {
      console.log('⏳ Data loading already in progress...')
      return this.getCachedData()
    }

    this.isLoading = true
    
    try {
      console.log('🔄 Loading PUBLIC data from Supabase...')
      
      // Categories - SAME query
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('displayOrder', { ascending: true })

      if (catError) throw catError

      // Products - SAME query  
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('inStock', true)
        .order('displayOrder', { ascending: true })

      if (prodError) throw prodError

      const data: DatabaseData = {
        categories: categories || [],
        products: products || []
      }

      // Cache the data - SAME caching logic
      this.cache.set('publicData', data)
      
      console.log('✅ PUBLIC data loaded successfully:', {
        categories: data.categories.length,
        products: data.products.length
      })

      return data

    } catch (error) {
      console.error('❌ Error loading data:', error)
      
      // Return cached data or empty - SAME fallback logic
      const cached = this.cache.get('publicData')
      if (cached) {
        console.log('📦 Using cached data as fallback')
        return cached
      }
      
      return { categories: [], products: [] }
      
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Get cached data - SAME logic
   */
  getCachedData(): DatabaseData {
    return this.cache.get('publicData') || { categories: [], products: [] }
  }

  /**
   * Get categories - SAME interface
   */
  getCategories(): Category[] {
    const data = this.getCachedData()
    return data.categories
  }

  /**
   * Get products - SAME interface
   */
  getProducts(): Product[] {
    const data = this.getCachedData()
    return data.products
  }

  /**
   * Get products by category - SAME logic
   */
  getProductsByCategory(categoryId: string): Product[] {
    const products = this.getProducts()
    return products.filter(p => p.category === categoryId)
  }

  /**
   * Get product tags - SAME logic (preserved from original)
   */
  getProductTags() {
    // Return default tags for now - SAME as original
    return [
      { id: 'novo', name: 'Novo', icon: '🆕', color: '#10b981' },
      { id: 'promocao', name: 'Promoção', icon: '🏷️', color: '#f59e0b' },
      { id: 'destaque', name: 'Destaque', icon: '⭐', color: '#ef4444' }
    ]
  }

  /**
   * Force reload - SAME logic
   */
  async forceReload(): Promise<DatabaseData> {
    console.log('🔄 Force reloading data...')
    this.cache.clear()
    const data = await this.loadPublicData()
    console.log('✅ Data force reloaded:', data)
    return data
  }
}

// Export instance - SAME pattern as original
const database = new DatabaseNASA(false) // Public mode by default
export default database

// Export class for admin usage
export { DatabaseNASA }