import React, { createContext, useContext, useState, useCallback } from 'react'
import type { CatalogPhone } from '../data/catalog'

export interface CartItem {
  phone: CatalogPhone
  days: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (phone: CatalogPhone, days?: number) => void
  removeItem: (phoneId: number) => void
  updateDays: (phoneId: number, days: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((phone: CatalogPhone, days = 7) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.phone.id === phone.id)
      if (existing) return prev
      return [...prev, { phone, days }]
    })
  }, [])

  const removeItem = useCallback((phoneId: number) => {
    setItems((prev) => prev.filter((i) => i.phone.id !== phoneId))
  }, [])

  const updateDays = useCallback((phoneId: number, days: number) => {
    setItems((prev) =>
      prev.map((i) => (i.phone.id === phoneId ? { ...i, days: Math.max(1, days) } : i))
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.length
  const totalPrice = items.reduce((sum, i) => sum + i.phone.perDayPrice * i.days, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateDays, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
