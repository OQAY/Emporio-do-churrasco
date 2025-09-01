// Tipos TypeScript baseados na estrutura EXATA do projeto original

export interface Category {
  id: string
  name: string
  slug: string
  active: boolean
  icon?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category_id: string  // Matching DB structure
  image_url: string | null  // Supabase field name
  original_price?: number | null  // Supabase field name
  is_on_sale?: boolean  // Supabase field name
  
  // Keep compatibility with original code
  image?: string | null
  promotionPrice?: number
  featured?: boolean
  active?: boolean
  tags?: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Restaurant {
  id: string
  name: string
  logo: string
  banner: string
  description: string
  address: string
  phone: string
  whatsapp: string
  openingHours: string
  deliveryFee: number
  minOrder: number
  estimatedDelivery: string
  paymentMethods: string[]
}

export interface DatabaseData {
  categories: Category[]
  products: Product[]
  restaurant?: Restaurant
}