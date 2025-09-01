import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: 'Painel Administrativo - Imperio do Churrasco',
  description: 'Painel administrativo para gerenciamento do cardápio digital',
  themeColor: '#fb923c',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  icons: {
    icon: '/favicon.ico'
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <head>
        {/* Tailwind Config - EXATAMENTE como no admin.html original */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.tailwindConfig = {
              theme: { extend: { colors: { 'brand-orange': '#fb923c' } } }
            }
          `
        }} />
        <script
          src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio"
          defer
        />
      </head>
      <body>
        {/* Global loading overlay - MESMO estilo do original */}
        <div id="global-loading" className="fixed top-0 left-0 w-full h-full bg-white flex items-center justify-center z-[9999] transition-opacity duration-500 ease-out">
          <div className="loading-content text-center text-gray-700">
            <div className="loading-spinner w-10 h-10 border-3 border-gray-200 border-t-brand-orange rounded-full animate-spin mx-auto mb-5"></div>
            <p className="text-lg font-medium">Carregando painel administrativo...</p>
            <p className="text-sm text-gray-500 mt-2">Conectando com banco de dados</p>
          </div>
        </div>

        <div id="admin-app">
          {children}
        </div>
      </body>
    </html>
  )
}