import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Império do Churrasco - Cardapio Digital',
  description: 'Cardápio digital do Império do Churrasco - Peça online com rapidez e facilidade',
  themeColor: '#fb923c',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Menu Online'
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <head>
        {/* Performance Critical Preloads - MANTENDO ESTRUTURA ORIGINAL */}
        <link rel="preconnect" href="https://cdn.tailwindcss.com" />
        <link rel="dns-prefetch" href="https://cdn.tailwindcss.com" />
        
        {/* PWA Support - IDÊNTICO AO ORIGINAL */}
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Tailwind Config - EXATAMENTE COMO NO ORIGINAL */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.tailwindConfig = {
              theme: {
                extend: {
                  colors: {
                    "brand-orange": "#fb923c",
                    "brand-orange-dark": "#f97316",
                  },
                },
              },
            };
          `
        }} />
        <script
          src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio"
          defer
        />
      </head>
      <body className="bg-white text-gray-900">
        <div id="app">
          {children}
        </div>
        
        {/* Service Worker Registration - MESMO do original */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                  console.log('✅ Service Worker registered:', registration.scope);
                  registration.addEventListener('updatefound', () => {
                    console.log('🔄 Service Worker update found');
                  });
                })
                .catch(error => {
                  console.warn('⚠️ Service Worker registration failed:', error);
                });
            } else {
              console.warn('⚠️ Service Worker not supported');
            }
          `
        }} />
      </body>
    </html>
  )
}