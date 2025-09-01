/**
 * Cart Store with Zustand - Preserving EXACT original cart logic
 * Simple state management for cart functionality
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from './types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  
  // Actions - SAME behavior as original
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  
  // Computed values - SAME calculations
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemQuantity: (productId: string) => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Add item - SAME logic as original cart
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id)
          
          if (existingItem) {
            // Update quantity if item exists
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          } else {
            // Add new item
            return {
              items: [...state.items, { product, quantity }]
            }
          }
        })
      },

      // Remove item - SAME logic
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }))
      },

      // Update quantity - SAME logic
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        }))
      },

      // Clear cart - SAME functionality
      clearCart: () => {
        set({ items: [] })
      },

      // Open/close cart - NEW for mobile drawer
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Get total items - SAME calculation
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      // Get total price - SAME calculation
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.promotionPrice || item.product.price
          return total + (price * item.quantity)
        }, 0)
      },

      // Get item quantity - SAME logic
      getItemQuantity: (productId: string) => {
        const item = get().items.find(item => item.product.id === productId)
        return item ? item.quantity : 0
      }
    }),
    {
      name: 'cart-storage', // localStorage key - same pattern as original
    }
  )
)