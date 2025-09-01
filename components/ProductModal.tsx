'use client'

import { useEffect } from 'react'
import { Product } from '@/lib/types'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  // Handle ESC key - SAME behavior as original
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent scroll on body - SAME as original
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      // Restore scroll when modal closes - SAME as original
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const priceFormatted = product.price 
    ? `R$ ${product.price.toFixed(2).replace('.', ',')}` 
    : 'Consulte'

  return (
    <div 
      id="productModal" 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden relative animate-slide-up sm:animate-fade-in">
        {/* Botão fechar - EXATAMENTE como original */}
        <button 
          id="closeProductModal"
          onClick={onClose}
          className="absolute top-4 left-4 w-10 h-10 bg-black bg-opacity-40 text-white rounded-full flex items-center justify-center z-20 hover:bg-opacity-60 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
        
        {/* Imagem grande - MESMA estrutura */}
        <div className="w-full h-56 sm:h-64 bg-gray-100 relative">
          <img 
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Conteúdo - ESTRUTURA IDÊNTICA */}
        <div className="p-6 overflow-y-auto">
          {/* Nome do produto */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {product.name}
          </h2>
          
          {/* Descrição */}
          {product.description && (
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              {product.description}
            </p>
          )}
          
          {/* Preço - MESMO formato */}
          <div className="text-3xl font-bold text-gray-900">
            {priceFormatted}
          </div>

          {/* Botão adicionar ao carrinho - será implementado depois */}
          <button className="w-full mt-6 bg-brand-orange text-white py-4 rounded-xl font-semibold text-lg hover:bg-brand-orange-dark transition-colors">
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  )
}