export type Product = {
  id: string
  category?: string
  name: string
  unitPrice?: number
  boxPrice?: number
  taxPct: number
  imageUrl?: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CartItem = {
  productId: string
  variant: 'unit' | 'box'
  name: string
  unitPrice: number
  taxPct: number
  qty: number
}

export type OrderTotals = {
  subtotal: number
  discount: number
  tax: number
  total: number
}

export type OrderStatus = 'new' | 'confirmed' | 'packed' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  items: CartItem[]
  totals: OrderTotals
  customer: {
    name: string
    phone: string
    address?: string
  }
  status: OrderStatus
  createdAt: string
}

