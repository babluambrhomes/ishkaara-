import { create } from 'zustand'

import { Cart, CartItem, OrderItem, ShippingAddress } from '@/types'
import { calcDeliveryDateAndPrice } from '@/lib/actions/order.actions'

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: undefined,
  shippingPrice: undefined,
  totalPrice: 0,
  paymentMethod: undefined,
  shippingAddress: undefined,
}

interface CartState {
  cart: Cart
  applyItems: (items: CartItem[]) => Promise<void>
  loadCart: () => Promise<void>
  addItem: (item: CartItem, quantity: number) => Promise<string>
  updateItem: (item: OrderItem, quantity: number) => Promise<void>
  removeItem: (item: OrderItem) => Promise<void>
  clearCart: () => Promise<void>
  setShippingAddress: (shippingAddress: ShippingAddress) => Promise<void>
  setPaymentMethod: (paymentMethod: string) => void
  init: () => void
}

const useCartStore = create<CartState>((set, get) => ({
  cart: initialState,

  applyItems: async (items: CartItem[]) => {
    const { shippingAddress } = get().cart
    const pricing = await calcDeliveryDateAndPrice({
      items,
      shippingAddress,
    })
    set({
      cart: {
        ...get().cart,
        items,
        ...pricing,
      },
    })
  },

  loadCart: async () => {
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { cart?: CartItem[] | { items: CartItem[] } }
      const items = Array.isArray(data.cart)
        ? data.cart
        : ((data.cart?.items as CartItem[] | undefined) ?? [])
      await get().applyItems(items)
    } catch (error) {
      console.error('Failed to load cart:', error)
    }
  },

  addItem: async (item: CartItem, quantity: number) => {
    const res = await fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: item.product,
        variantId: item.variantId,
        size: item.size,
        quantity,
      }),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      throw new Error(data.message ?? 'Failed to add item to cart')
    }
    const data = (await res.json()) as { cart: Cart }
    await get().applyItems(data.cart.items)
    const foundItem = get().cart.items.find(
      (x) =>
        x.product === item.product &&
        (x.variantId ?? '') === (item.variantId ?? '') &&
        (x.size ?? '') === (item.size ?? '')
    )
    if (!foundItem) {
      throw new Error('Item not found in cart')
    }
    return foundItem.clientId
  },

  updateItem: async (item: OrderItem, quantity: number) => {
    const exist = get().cart.items.find((x) => x.clientId === item.clientId)
    if (!exist) return
    const res = await fetch(`/api/cart/items/${item.clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    if (!res.ok) return
    const data = (await res.json()) as { cart: Cart }
    await get().applyItems(data.cart.items)
  },

  removeItem: async (item: OrderItem) => {
    const res = await fetch(`/api/cart/items/${item.clientId}`, {
      method: 'DELETE',
    })
    if (!res.ok) return
    const data = (await res.json()) as { cart: Cart }
    await get().applyItems(data.cart.items)
  },

  clearCart: async () => {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
    })
    if (!res.ok) return
    const data = (await res.json()) as { cart: Cart }
    await get().applyItems(data.cart.items)
  },

  setShippingAddress: async (shippingAddress: ShippingAddress) => {
    const { items } = get().cart
    set({
      cart: {
        ...get().cart,
        shippingAddress,
        ...(await calcDeliveryDateAndPrice({
          items,
          shippingAddress,
        })),
      },
    })
  },
  setPaymentMethod: (paymentMethod: string) => {
    set({
      cart: {
        ...get().cart,
        paymentMethod,
      },
    })
  },
  init: () => set({ cart: initialState }),
}))
export default useCartStore