'use client'

import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento inicial - MESMO comportamento do admin.html original
    setTimeout(() => {
      setIsLoading(false)
      
      // Hide loading overlay - MESMO efeito do original
      const loadingElement = document.getElementById('global-loading')
      if (loadingElement) {
        loadingElement.classList.add('fade-out')
        setTimeout(() => {
          loadingElement.style.display = 'none'
        }, 500)
      }
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin - ESTRUTURA PRESERVADA */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Painel Administrativo
                </h1>
                <p className="text-sm text-gray-500">
                  Império do Churrasco
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Configurações
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cards de estatísticas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categorias</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-green-600">Online</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder para futuras funcionalidades admin */}
        {!isLoading && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-colors">
                <div className="text-brand-orange mb-2">📦</div>
                <div className="font-medium text-gray-900">Gerenciar Produtos</div>
                <div className="text-sm text-gray-500">Adicionar, editar produtos</div>
              </button>
              
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-colors">
                <div className="text-brand-orange mb-2">🏷️</div>
                <div className="font-medium text-gray-900">Categorias</div>
                <div className="text-sm text-gray-500">Organizar cardápio</div>
              </button>
              
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-colors">
                <div className="text-brand-orange mb-2">📊</div>
                <div className="font-medium text-gray-900">Relatórios</div>
                <div className="text-sm text-gray-500">Análise de vendas</div>
              </button>
              
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-brand-orange hover:bg-orange-50 transition-colors">
                <div className="text-brand-orange mb-2">⚙️</div>
                <div className="font-medium text-gray-900">Configurações</div>
                <div className="text-sm text-gray-500">Dados do restaurante</div>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}