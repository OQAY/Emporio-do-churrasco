'use client'

import { useEffect, useState } from 'react'
import { MenuView } from '@/components/MenuView'
import { ProductModal } from '@/components/ProductModal'
import { Product } from '@/lib/types'
import { useData } from '@/hooks/useData'
import { useCartStore } from '@/lib/store'

export default function Home() {
  console.log('🏠 Home component renderizando')
  
  const { categories, products, loading } = useData()
  const { getTotalItems, openCart } = useCartStore()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const totalItems = getTotalItems()
  
  console.log('🏠 Home useData result:', { categories: categories.length, products: products.length, loading })

  useEffect(() => {
    // Prevent layout shifts during load - MANTENDO COMPORTAMENTO ORIGINAL
    document.body.classList.add('no-transition')
    
    setTimeout(() => {
      document.body.classList.remove('no-transition')
    }, 100)
  }, [])

  const handleCategorySelect = (categoryId: string | null) => {
    console.log('Categoria selecionada:', categoryId || 'all')
  }

  const handleProductClick = (product: Product) => {
    console.log('Produto clicado:', product)
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <>
      {/* Header - ESTRUTURA EXATA DO ORIGINAL */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-3 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-orange-500 text-white grid place-items-center font-bold text-lg">
                <span>🥩</span>
              </div>
              <div>
                <div className="font-semibold text-lg">Império do Churrasco</div>
                <div className="text-sm text-gray-500">Cardapio digital</div>
              </div>
            </div>
            
            <button 
              className="p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
              onClick={() => {
                const searchBar = document.getElementById('searchBar')
                searchBar?.classList.toggle('hidden')
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
          
          <div id="searchBar" className="hidden">
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-base"
            />
          </div>
        </div>
      </header>

      {/* Banner - SEÇÃO QUE ESTAVA FALTANDO */}
      <section className="max-w-4xl mx-auto px-3 pt-2">
        <div className="rounded-2xl overflow-hidden border border-gray-100 relative">
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <img 
            src="/images/banners/imperio-banner.png"
            alt="Banner do Império do Churrasco" 
            className="w-full h-48 sm:h-64 md:h-80 restaurant-banner opacity-0 transition-opacity duration-500"
            loading="eager"
            onLoad={(e) => {
              e.currentTarget.style.opacity = '1'
              const skeleton = e.currentTarget.previousElementSibling as HTMLElement
              if (skeleton) skeleton.style.display = 'none'
            }}
            onError={(e) => {
              // Fallback: hide skeleton even if image fails to load
              const skeleton = e.currentTarget.previousElementSibling as HTMLElement
              if (skeleton) skeleton.style.display = 'none'
            }}
          />
        </div>
      </section>

      {/* MenuView Component - RENDERIZA TUDO (categorias + produtos) */}
      <MenuView 
        categories={categories}
        products={products}
        onCategorySelect={handleCategorySelect}
        onProductClick={handleProductClick}
      />

      {/* Footer - ESTRUTURA ORIGINAL */}
      <footer className="max-w-4xl mx-auto px-4 pb-8 pt-4 text-center text-xs text-gray-500 border-t border-gray-100">
        <span>Cardápio Digital - Império do Churrasco</span>
      </footer>

      {/* Product Modal - PRESERVANDO ANIMAÇÕES ORIGINAIS */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}