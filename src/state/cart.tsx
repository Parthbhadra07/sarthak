/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState } from 'react'
import type { CartItem, Product } from '../types'

type CartState = {
  items: CartItem[]
  add: (product: Product, variant: CartItem['variant'], qty?: number) => void
  setQty: (productId: string, variant: CartItem['variant'], qty: number) => void
  remove: (productId: string, variant: CartItem['variant']) => void
  clear: () => void
  subtotal: number
  tax: number
  total: number
  count: number
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const add = (product: Product, variant: CartItem['variant'], qty: number = 1) => {
    const unitPrice =
      variant === 'unit' ? product.unitPrice ?? 0 : product.boxPrice ?? 0
    const taxPct = product.taxPct ?? 0

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.variant === variant,
      )
      if (!existing) {
        return [
          ...prev,
          {
            productId: product.id,
            variant,
            name: product.name,
            unitPrice,
            taxPct,
            qty,
          },
        ]
      }
      return prev.map((i) =>
        i.productId === product.id && i.variant === variant
          ? { ...i, qty: i.qty + qty }
          : i,
      )
    })
  }

  const setQty = (productId: string, variant: CartItem['variant'], qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId && i.variant === variant ? { ...i, qty } : i))
        .filter((i) => i.qty > 0),
    )
  }

  const remove = (productId: string, variant: CartItem['variant']) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)))
  }

  const clear = () => setItems([])

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    [items],
  )
  const tax = useMemo(
    () => items.reduce((sum, i) => sum + (i.unitPrice * i.qty * (i.taxPct || 0)) / 100, 0),
    [items],
  )
  const total = useMemo(() => subtotal + tax, [subtotal, tax])
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  const value: CartState = { items, add, setQty, remove, clear, subtotal, tax, total, count }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

