'use client'

import { useEffect, useState } from 'react'
import { MenuView } from '@/components/MenuView'
import { Category, Product } from '@/lib/types'

// Dados temporários - serão substituídos pelo Supabase
const mockCategories: Category[] = [
  { id: 'sanduiches', name: 'Sanduíches Gourmet', icon: '🥪', displayOrder: 0 },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤', displayOrder: 1 },
  { id: 'sobremesas', name: 'Sobremesas', icon: '🍰', displayOrder: 2 }
]

const mockProducts: Product[] = [
  {
    id: 'sandwich_1',
    name: 'Steak Sandwich Premium',
    description: 'Suculento steak grelhado com salada fresca, queijo derretido e nosso molho especial',
    price: 38.90,
    category: 'sanduiches',
    image: '/images/produtos/steak-sandwich-2.jpg',
    inStock: true,
    highlight: true,
    promotionPrice: 34.90,
    createdAt: '2025-08-18T03:03:52.238Z',
    displayOrder: 0
  }
]

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Prevent layout shifts during load - MANTENDO COMPORTAMENTO ORIGINAL
    document.body.classList.add('no-transition')
    
    // Simular carregamento de dados
    setTimeout(() => {
      setCategories(mockCategories)
      setProducts(mockProducts)
      setLoading(false)
      document.body.classList.remove('no-transition')
    }, 100)
  }, [])

  const handleCategorySelect = (categoryId: string | null) => {
    console.log('Categoria selecionada:', categoryId || 'all')
  }

  const handleProductClick = (product: Product) => {
    console.log('Produto clicado:', product)
    // TODO: Abrir modal do produto
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header - ESTRUTURA ORIGINAL */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brand-orange">
              🥩 Império do Churrasco
            </h1>
            <div className="flex items-center gap-4">
              <button className="p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu View Component */}
      <MenuView 
        categories={categories}
        products={products}
        onCategorySelect={handleCategorySelect}
        onProductClick={handleProductClick}
      />
    </main>
  )
}