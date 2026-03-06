/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState } from 'react'
import type { CartItem, Product } from '../types'

type CartState = {
  items: CartItem[]
  add: (product: Product, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  remove: (productId: string) => void
  clear: () => void
  subtotal: number
  count: number
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const add = (product: Product, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (!existing) {
        return [
          ...prev,
          { productId: product.id, name: product.name, price: product.price, qty },
        ]
      }
      return prev.map((i) =>
        i.productId === product.id ? { ...i, qty: i.qty + qty } : i,
      )
    })
  }

  const setQty = (productId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty } : i))
        .filter((i) => i.qty > 0),
    )
  }

  const remove = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const clear = () => setItems([])

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  )
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  const value: CartState = { items, add, setQty, remove, clear, subtotal, count }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

