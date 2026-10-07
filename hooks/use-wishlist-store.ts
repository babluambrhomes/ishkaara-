import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WishlistItem = {
  _id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
}

interface WishlistState {
  items: WishlistItem[]
  toggleItem: (item: WishlistItem) => boolean
  removeItem: (productId: string) => void
  hasItem: (productId: string) => boolean
  clear: () => void
}

const useWishlistStore = create(
  persist<WishlistState>(
    (set, get) => ({
      items: [],

      toggleItem: (item) => {
        const { items } = get()
        const exists = items.find((x) => x._id === item._id)
        if (exists) {
          set({
            items: items.filter((x) => x._id !== item._id),
          })
          return false
        }
        set({
          items: [item, ...items],
        })
        return true
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((x) => x._id !== productId),
        })
      },

      hasItem: (productId) => get().items.some((x) => x._id === productId),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-store',
    }
  )
)
export default useWishlistStore