'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Prevent layout shifts during load - MANTENDO COMPORTAMENTO ORIGINAL
    document.body.classList.add('no-transition')
    
    setTimeout(() => {
      document.body.classList.remove('no-transition')
    }, 100)
  }, [])

  return (
    <main>
      {/* Estrutura temporária - será substituída pelo MenuView */}
      <div className="min-h-screen">
        <h1 className="text-2xl font-bold text-center py-8">
          Império do Churrasco
        </h1>
        <p className="text-center text-gray-600">
          Migrando para Next.js...
        </p>
      </div>
    </main>
  )
}