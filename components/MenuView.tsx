'use client'

import { useState, useEffect, useCallback } from 'react'
import { Category, Product } from '@/lib/types'

interface MenuViewProps {
  categories: Category[]
  products: Product[]
  onCategorySelect: (categoryId: string | null) => void
  onProductClick: (product: Product) => void
}

export function MenuView({ 
  categories = [], 
  products = [], 
  onCategorySelect, 
  onProductClick 
}: MenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Loading baseado na presença de dados reais
  const isLoading = categories.length === 0 && products.length === 0
  
  console.log('🎯 MenuView:', { 
    isLoading, 
    categoriesCount: categories.length, 
    productsCount: products.length,
    categories: categories.map(c => c.name).join(', ')
  })

  // Função para selecionar categoria - MANTENDO LÓGICA ORIGINAL
  const selectCategory = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    
    // Atualizar visual das categorias
    document.querySelectorAll('.category-menu-item').forEach(btn => {
      const underline = btn.querySelector('.category-underline') as HTMLElement
      if (underline) {
        if (btn.getAttribute('data-category-id') === categoryId) {
          btn.classList.add('text-red-600')
          btn.classList.remove('text-gray-700')
          underline.style.transform = 'scaleX(1)'
        } else {
          btn.classList.remove('text-red-600')
          btn.classList.add('text-gray-700')
          underline.style.transform = 'scaleX(0)'
        }
      }
    })

    // Callback para o parent
    onCategorySelect(categoryId === 'all' ? null : categoryId)
  }, [onCategorySelect])

  // Scroll to top - FUNÇÃO ORIGINAL
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Criar imagem otimizada - MANTENDO LÓGICA ORIGINAL
  const createOptimizedImage = (
    src: string, 
    alt: string, 
    className = "w-full h-full object-cover"
  ) => {
    if (!src) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )
    }

    return (
      <img 
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
      />
    )
  }

  // Skeleton loading - MANTENDO VISUAL ORIGINAL
  if (isLoading) {
    return (
      <div>
        {/* Categories skeleton */}
        <div id="categoryMenuBar" className="sticky top-0 z-30 bg-white border-b">
          <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="skeleton skeleton-category" />
            ))}
          </div>
        </div>

        {/* Products skeleton */}
        <div id="productsGrid" className="p-4">
          <div className="skeleton-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton-product">
                <div className="p-4">
                  <div className="skeleton skeleton-text title" />
                  <div className="skeleton skeleton-text subtitle" />
                  <div className="skeleton skeleton-text price" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Filtrar produtos por categoria
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  return (
    <div>
      {/* Category Bar - ESTRUTURA IDÊNTICA */}
      <div id="categoryMenuBar" className="sticky top-0 z-30 bg-white border-b">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide px-4">
          {/* Botão Todos */}
          <button
            className="category-menu-item relative py-3 text-sm font-medium transition-colors whitespace-nowrap text-red-600"
            data-category-id="all"
            onClick={() => {
              selectCategory('all')
              scrollToTop()
            }}
          >
            Todos
            <div className="category-underline absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 transform scale-x-100 transition-transform" />
          </button>

          {/* Categorias */}
          {categories.map(category => (
            <button
              key={category.id}
              className="category-menu-item relative py-3 text-sm font-medium transition-colors whitespace-nowrap text-gray-700"
              data-category-id={category.id}
              onClick={() => {
                selectCategory(category.id)
                scrollToTop()
              }}
            >
              <span className="mr-1.5">{category.icon}</span>
              {category.name}
              <div className="category-underline absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 transform scale-x-0 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid - MANTENDO ESTRUTURA */}
      <div id="productsGrid" className="p-4">
        <div className="products-grid gap-3">
          {filteredProducts.map(product => (
            <article 
              key={product.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              onClick={() => onProductClick(product)}
            >
              {/* Mobile Layout */}
              <div className="mobile-horizontal flex gap-3 p-3">
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {createOptimizedImage(product.image, product.name, "w-full h-full object-cover")}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      {product.promotionPrice ? (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            R$ {product.price.toFixed(2)}
                          </span>
                          <span className="text-sm font-bold text-green-600 ml-1">
                            R$ {product.promotionPrice.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">
                          R$ {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button className="w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="desktop-vertical">
                <div className="aspect-square bg-gray-100">
                  {createOptimizedImage(product.image, product.name, "w-full h-full object-cover")}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      {product.promotionPrice ? (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            R$ {product.price.toFixed(2)}
                          </span>
                          <span className="text-base font-bold text-green-600 ml-1">
                            R$ {product.promotionPrice.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-bold text-gray-900">
                          R$ {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}