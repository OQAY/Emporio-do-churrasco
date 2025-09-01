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

  const loadData = async () => {
    console.log('🔄 useData: Função loadData iniciando!')
    try {
      console.log('🔄 useData: Dentro do try principal')
      setLoading(true)
      setError(null)
      
      console.log('🔄 useData: Iniciando carregamento...')
      
      // Try Supabase first - PRESERVING original behavior
      try {
        console.log('🔄 useData: Tentando carregar do Supabase...')
        const data = await database.loadPublicData()
        
        console.log('✅ useData: Dados carregados do Supabase:', {
          categories: data?.categories?.length || 0,
          products: data?.products?.length || 0
        })
        
        if (data && data.categories?.length > 0) {
          console.log('✅ useData: Setando dados reais')
          setCategories(data.categories)
          setProducts(data.products)
          return
        }
      } catch (supabaseErr) {
        console.warn('❌ useData: Supabase connection failed:', supabaseErr)
        console.warn('🔄 useData: Usando fallback data')
      }
      
      // Use cached data as fallback - SAME logic
      const cached = database.getCachedData()
      if (cached && cached.categories?.length > 0) {
        setCategories(cached.categories)
        setProducts(cached.products)
        return
      }
      
      // NO MOCK DATA - Only real Supabase data
      console.log('❌ No fallback data - waiting for Supabase only')
      setCategories([])
      setProducts([])
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // No emergency fallback - show error state
      console.log('❌ Emergency: No mock data fallback')
      
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🎯 useData: useEffect executando!')
    loadData()
  }, [])

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