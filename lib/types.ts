// Tipos TypeScript baseados na estrutura EXATA do projeto original

export interface Category {
  id: string
  name: string
  icon: string
  displayOrder: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  inStock: boolean
  highlight?: boolean
  promotionPrice?: number
  createdAt: string
  displayOrder: number
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