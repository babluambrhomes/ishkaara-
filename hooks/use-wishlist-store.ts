import { create } from 'zustand'
import { IProductDisplay } from '@/types'

export type WishlistItem = {
  _id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
}

interface WishlistState {
  items: IProductDisplay[]
  loadWishlist: () => Promise<void>
  toggleItem: (productId: string) => Promise<'added' | 'removed' | 'error'>
  removeItem: (productId: string) => Promise<void>
  hasItem: (productId: string) => boolean
  clear: () => void
}

const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  loadWishlist: async () => {
    try {
      const res = await fetch('/api/wishlist', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { items: IProductDisplay[] }
      set({ items: data.items ?? [] })
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    }
  },

  toggleItem: async (productId) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.status === 401) return 'error'
      if (!res.ok) return 'error'
      const data = (await res.json()) as {
        added: boolean
        items: IProductDisplay[]
      }
      set({ items: data.items ?? [] })
      return data.added ? 'added' : 'removed'
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
      return 'error'
    }
  },

  removeItem: async (productId) => {
    const res = await fetch(`/api/wishlist/${productId}`, {
      method: 'DELETE',
    })
    if (!res.ok) return
    const data = (await res.json()) as { items: IProductDisplay[] }
    set({ items: data.items ?? [] })
  },

  hasItem: (productId) =>
    get().items.some((x) => x._id === productId),

  clear: () => set({ items: [] }),
}))
export default useWishlistStore