/**
 * Data hooks - Preserving EXACT original logic
 * Replacing DOM manipulation with React state
 */

import { useState, useEffect } from 'react'
import { Category, Product, DatabaseData } from '@/lib/types'
import database from '@/lib/supabase'

/**
 * Use products and categories - SAME logic as original
 */
export function useData() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use SAME method as original app.js
      const data = await database.loadPublicData()
      
      setCategories(data.categories)
      setProducts(data.products)
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Use cached data as fallback - SAME logic
      const cached = database.getCachedData()
      setCategories(cached.categories)
      setProducts(cached.products)
      
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    return database.forceReload().then(data => {
      setCategories(data.categories)
      setProducts(data.products)
      return data
    })
  }

  return {
    categories,
    products,
    loading,
    error,
    refetch
  }
}

/**
 * Use products by category - SAME filtering logic
 */
export function useProductsByCategory(categoryId: string | null) {
  const { products, loading, error } = useData()
  
  const filteredProducts = categoryId 
    ? products.filter(p => p.category === categoryId)
    : products

  return {
    products: filteredProducts,
    loading,
    error
  }
}